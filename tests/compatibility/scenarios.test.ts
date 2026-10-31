import { describe, expect, it } from "vitest";
import { CATALOG, categoryOf } from "@/lib/catalog/normalize";
import { evaluateBuild } from "@/lib/compatibility/engine";
import { formatPence } from "@/lib/pricing/currency";
import type { Selection } from "@/lib/compatibility/types";

/**
 * The dataset's demo_scenarios are mandatory regression fixtures, not samples
 * (brief 12). Expected outcomes are never relaxed to make a test pass.
 */
function selectionFrom(pick: string[]): Selection {
  const s: Selection = {};
  for (const id of pick) {
    const c = categoryOf(id);
    if (!c) throw new Error(`Unknown part id in scenario: ${id}`);
    s[c] = id;
  }
  return s;
}
const scenario = (name: string) => {
  const s = CATALOG.demo_scenarios.find((x) => x.name === name);
  if (!s) throw new Error(`Scenario not found: ${name}`);
  return s;
};
const statusOf = (results: { ruleId: string; status: string }[], id: string) =>
  results.find((r) => r.ruleId === id)?.status;

describe("dataset integrity", () => {
  it("matches the documented shape", () => {
    expect(Object.keys(CATALOG.parts)).toHaveLength(7);
    expect(Object.values(CATALOG.parts).flat()).toHaveLength(30);
    expect(CATALOG.rules).toHaveLength(12);
    expect(CATALOG.demo_scenarios).toHaveLength(11);
  });
  it("has unique part ids", () => {
    const ids = Object.values(CATALOG.parts).flat().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every scenario pick resolves to a real part", () => {
    for (const s of CATALOG.demo_scenarios) {
      for (const id of s.pick) expect(categoryOf(id), `${s.name}: ${id}`).toBeDefined();
    }
  });
});

describe("Scenario 1 — Happy path", () => {
  const { results, missing, readiness, totalPence } = evaluateBuild(
    selectionFrom(scenario("Happy path").pick),
  );
  it("totals exactly £2,448.69", () => {
    expect(totalPence).toBe(244869);
    expect(formatPence(totalPence)).toBe("£2,448.69");
  });
  it("is a complete build", () => expect(missing).toHaveLength(0));
  it("passes every hardware check except power connectors", () => {
    for (const r of results) {
      if (r.ruleId === "gpu_connectors") expect(r.status).toBe("insufficient_data");
      else expect(r.status, r.ruleId).toBe("compatible");
    }
  });
  it("still requires acknowledgement because connectors are unknown", () => {
    expect(readiness).toBe("ready_with_ack");
  });
  it("sold-out stock does not affect compatibility", () => {
    expect(results.filter((r) => r.status === "incompatible")).toHaveLength(0);
  });
});

describe("Scenario 2 — GPU too long", () => {
  const { results } = evaluateBuild(selectionFrom(scenario("GPU too long").pick));
  it("reports gpu_length incompatible", () => {
    expect(statusOf(results, "gpu_length")).toBe("incompatible");
  });
  it("explains with the actual measurements", () => {
    const r = results.find((x) => x.ruleId === "gpu_length");
    expect(r?.message).toContain("340");
    expect(r?.message).toContain("330");
  });
});

describe("Scenario 3 — ATX board in mATX case", () => {
  it("reports board_form_factor incompatible", () => {
    const { results } = evaluateBuild(selectionFrom(scenario("ATX board in mATX case").pick));
    expect(statusOf(results, "board_form_factor")).toBe("incompatible");
  });
});

describe("Scenario 4 — mATX board in KZ-ZE", () => {
  it("is incompatible by the source-supported list", () => {
    const { results } = evaluateBuild(selectionFrom(scenario("mATX board in KZ-ZE").pick));
    expect(statusOf(results, "board_form_factor")).toBe("incompatible");
  });
  it("suggests confirming with the supplier rather than overriding the data", () => {
    const { results } = evaluateBuild(selectionFrom(scenario("mATX board in KZ-ZE").pick));
    expect(results.find((r) => r.ruleId === "board_form_factor")?.action).toContain("supplier");
  });
});

describe("Scenario 5 — AM4 board with AM5 CPU", () => {
  const { results } = evaluateBuild(selectionFrom(scenario("AM4 board with AM5 CPU").pick));
  it("reports BOTH socket and memory failures", () => {
    expect(statusOf(results, "socket")).toBe("incompatible");
    expect(statusOf(results, "memory_type")).toBe("incompatible");
  });
  it("does not discard one failure because of the other", () => {
    expect(results.filter((r) => r.status === "incompatible").length).toBeGreaterThanOrEqual(2);
  });
});

describe("Scenario 6 — Laptop RAM", () => {
  it("reports dimm_type incompatible", () => {
    const { results } = evaluateBuild(selectionFrom(scenario("Laptop RAM").pick));
    expect(statusOf(results, "dimm_type")).toBe("incompatible");
  });
});

describe("Scenario 7 — PSU below recommendation", () => {
  const { results } = evaluateBuild(selectionFrom(scenario("PSU below recommendation").pick));
  it("is a warning, not an incompatibility", () => {
    expect(statusOf(results, "psu_wattage")).toBe("warning");
  });
  it("states both figures", () => {
    const r = results.find((x) => x.ruleId === "psu_wattage");
    expect(r?.message).toContain("850");
    expect(r?.message).toContain("750");
  });
});

describe("Scenario 8 — No cooler", () => {
  const { results, readiness, missing } = evaluateBuild(selectionFrom(scenario("No cooler").pick));
  it("blocks on missing cooling", () => {
    expect(statusOf(results, "cooler_required")).toBe("incompatible");
  });
  it("cannot be completed", () => {
    expect(readiness).toBe("incomplete");
    expect(missing).toContain("cooler");
  });
});

describe("Scenario 9 — Boxed cooler", () => {
  const { results } = evaluateBuild(selectionFrom(scenario("Boxed cooler").pick));
  it("passes the boxed-cooler rule with its own CPU", () => {
    expect(statusOf(results, "boxed_cooler")).toBe("compatible");
  });
  it("does NOT return insufficient_data for an air cooler's absent radiator", () => {
    // Rule I is gated on liquid coolers. Without that gate, an air cooler's
    // null radiator_mm would wrongly read as missing data.
    expect(statusOf(results, "radiator_fit")).toBeUndefined();
  });
  it("fails when the same boxed cooler is paired with a different CPU", () => {
    const { results: other } = evaluateBuild({
      cpu: "cpu-r7-7800x3d",
      cooler: "cool-wraith-stealth-boxed",
    });
    expect(statusOf(other, "boxed_cooler")).toBe("incompatible");
  });
});

describe("Scenario 10 — Unknown data", () => {
  const { results } = evaluateBuild(selectionFrom(scenario("Unknown data").pick));
  it("reports gpu_length insufficient_data", () => {
    expect(statusOf(results, "gpu_length")).toBe("insufficient_data");
  });
  it("reports cooler_socket insufficient_data even with no CPU selected", () => {
    expect(statusOf(results, "cooler_socket")).toBe("insufficient_data");
  });
  it("never reports unknown data as compatible", () => {
    for (const r of results) {
      if (r.missing?.length) expect(r.status).not.toBe("compatible");
    }
  });
});

describe("Scenario 11 — Conflicting data", () => {
  const { results } = evaluateBuild(selectionFrom(scenario("Conflicting data").pick));
  it("is needs_verification even though the card fits both figures", () => {
    expect(statusOf(results, "gpu_length")).toBe("needs_verification");
  });
  it("surfaces the conflict rather than silently resolving it", () => {
    const r = results.find((x) => x.ruleId === "gpu_length");
    expect(r?.message).toContain("380");
    expect(r?.message).toContain("410");
  });
});
