import {
  DEFAULT_POLICY,
  STATUS_ORDER,
  type Selection,
} from "@/lib/compatibility/types";
import { evaluateBuild } from "@/lib/compatibility/engine";
import { buildContext, RULES } from "@/lib/compatibility/rules";
import { productById } from "./catalogue";
import { isCoreCategory, type BuilderCategory } from "./categories";
import type {
  BuilderEvaluation,
  BuilderFinding,
  BuilderProduct,
  BuilderSelection,
} from "./types";
const essential: BuilderCategory[] = [
  "case",
  "cpu",
  "motherboard",
  "memory",
  "gpu",
  "psu",
];
export function evaluateBuilder(
  selection: BuilderSelection,
): BuilderEvaluation {
  const core: Selection = {};
  for (const [category, id] of Object.entries(selection))
    if (isCoreCategory(category) && productById(id)?.origin === "original")
      core[category] = id;
  const baseline = evaluateBuild(core);
  const pcCase = productById(selection.case);
  const cpu = productById(selection.cpu);
  const cooler = productById(selection.cooler);
  const context = buildContext(core, DEFAULT_POLICY);
  if (pcCase?.caseSpecs) context.pcCase = pcCase.caseSpecs;
  const results: BuilderFinding[] = pcCase?.caseSpecs
    ? RULES.map((rule) => rule(context)).filter(
        (r): r is NonNullable<typeof r> => r !== null,
      )
    : [...baseline.results];
  const missing = essential.filter((c) => !productById(selection[c]));
  const boxed =
    cpu?.original &&
    "cooler_included" in cpu.original &&
    cpu.original.cooler_included;
  if (!boxed && !cooler) missing.push("cooler");
  if (!productById(selection.ssd) && !productById(selection.hdd))
    missing.push("ssd");
  const selected = Object.values(selection)
    .map(productById)
    .filter((p): p is BuilderProduct => Boolean(p));
  const add = (
    ruleId: string,
    title: string,
    categories: BuilderCategory[],
    message: string,
    action: string,
    status: BuilderFinding["status"] = "insufficient_data",
  ) =>
    results.push({
      ruleId,
      title,
      categories,
      message,
      action,
      status,
      partIds: categories
        .map((c) => selection[c])
        .filter((id): id is string => Boolean(id)),
    });
  if (
    selection.cpu &&
    selection.motherboard &&
    context.cpu?.socket === context.motherboard?.socket
  )
    add(
      "firmware_support",
      "CPU firmware support",
      ["cpu", "motherboard"],
      "The socket check is separate from BIOS support. The motherboard’s CPU support list and installed BIOS version are not captured.",
      "Confirm the exact CPU and required BIOS version with the motherboard manufacturer.",
      "needs_verification",
    );
  if (selection.memory && selection.motherboard)
    add(
      "memory_capacity",
      "Memory capacity and profile",
      ["memory", "motherboard"],
      "Memory generation and module format are checked. Maximum capacity, validated profiles and the board QVL are not captured.",
      "Confirm kit capacity, module count and profile support in the motherboard documentation.",
    );
  const storage = (["ssd", "hdd"] as const).filter((c) => selection[c]);
  if (storage.length)
    add(
      "storage_interfaces",
      "Storage interfaces and slots",
      [...storage, "motherboard", "case", "psu"],
      "The selected drive interfaces are published where available. Free motherboard slots, lane sharing, drive bays and power connections have not all been captured.",
      "Check M.2 keying, NVMe versus SATA support, available ports and bays. Do not assume that every M.2 socket accepts every M.2 drive.",
    );
  if (
    cooler?.original &&
    "type" in cooler.original &&
    cooler.original.type === "air" &&
    pcCase
  ) {
    const height =
      "height_mm" in cooler.original ? cooler.original.height_mm : null;
    const limit = context.pcCase?.cooler_max_mm;
    if (typeof height === "number" && typeof limit === "number")
      add(
        "air_cooler_height",
        "Air-cooler clearance",
        ["cooler", "case"],
        `${height} mm cooler height; ${limit} mm case limit.`,
        height <= limit
          ? "Published heights fit. Verify surrounding memory clearance."
          : "Choose a shorter cooler or a case with more clearance.",
        height <= limit ? "compatible" : "incompatible",
      );
    else
      add(
        "air_cooler_height",
        "Air-cooler clearance",
        ["cooler", "case"],
        "The cooler height or case limit is not published in this catalogue.",
        "Confirm the air cooler’s installed height against the case clearance.",
      );
  }
  if (selection.fans)
    add(
      "fan_mounting",
      "Fan mounts and headers",
      ["fans", "case", "motherboard"],
      "Fan size and control details are displayed where published. Free case mounts and available fan headers depend on the rest of the installation.",
      "Check mounting size, included fans, radiator occupancy, header count and splitter current limits.",
    );
  if (selection.wifi)
    add(
      "wireless_interface",
      "Wireless adapter connection",
      ["wifi", "motherboard", "gpu", "os"],
      "PCIe/USB interface, free expansion space and operating-system support need checking for the exact adapter. Built-in motherboard Wi-Fi may make an adapter unnecessary.",
      "Check the interface, any Bluetooth USB header requirement, antenna space and supported drivers.",
    );
  if (selection.cooling_accessories || selection.lighting || selection.cables)
    add(
      "customisation_connections",
      "Customisation connections",
      (
        [
          "cooling_accessories",
          "lighting",
          "cables",
          "psu",
          "motherboard",
        ] as BuilderCategory[]
      ).filter((c) => selection[c] !== undefined),
      "Controller ratings, lighting voltage and PSU-side cable pinouts must be explicitly verified.",
      "Use only the published connector type and exact manufacturer-approved cable compatibility.",
    );
  const peripherals: BuilderCategory[] = [
    "external_hdd",
    "external_ssd",
    "optical",
    "monitor",
    "keyboard",
    "mouse",
    "headset",
    "speakers",
    "sound",
    "capture",
    "expansion",
  ];
  const chosenPeripherals = peripherals.filter((c) => selection[c]);
  if (chosenPeripherals.length)
    add(
      "peripheral_interfaces",
      "Peripheral interfaces",
      chosenPeripherals,
      "The catalogue does not contain a complete inventory of free display outputs, USB/audio ports, bandwidth or drivers for this build.",
      "Confirm ports, cables, display modes and software support for your selected peripherals.",
    );
  if (selection.os)
    add(
      "os_requirements",
      "OS licence and installation",
      ["os", "motherboard", "ssd", "optical"],
      "A software selection is not a guarantee of firmware, driver or licence eligibility. DVD products may require an optical drive or another authorised installation method.",
      "Verify TPM/Secure Boot, the manufacturer support lists, licence terms and installation media.",
      "needs_verification",
    );
  if (
    selected.some(
      (p) => p.category === "accessories" && /enclosure/i.test(p.name),
    )
  )
    add(
      "empty_enclosure",
      "Storage enclosure contents",
      ["accessories"],
      "The selected enclosure is empty. It does not add an SSD or HDD to this build.",
      "Supply a compatible drive separately and verify its interface and dimensions.",
      "warning",
    );
  const blocking = results.filter((r) => r.status === "incompatible");
  const advisories = results.filter((r) =>
    ["warning", "needs_verification", "insufficient_data"].includes(r.status),
  );
  const aggregate = results.length
    ? (STATUS_ORDER.find((status) =>
        results.some((r) => r.status === status),
      ) ?? null)
    : null;
  const totalPence = selected.reduce(
    (sum, p) => sum + (p.price === null ? 0 : Math.round(p.price * 100)),
    0,
  );
  return {
    results,
    missing,
    blocking,
    advisories,
    aggregate,
    totalPence,
    unpriced: selected.filter((p) => p.price === null).map((p) => p.id),
    covered: 8 - missing.length,
    required: 8,
    readiness: missing.length
      ? "incomplete"
      : blocking.length
        ? "blocked"
        : advisories.length
          ? "ready_with_ack"
          : "ready",
  };
}
export function evaluateBuilderCandidate(
  selection: BuilderSelection,
  category: BuilderCategory,
  id: string,
) {
  const evaluation = evaluateBuilder({ ...selection, [category]: id });
  const relevant = evaluation.results.filter(
    (r) => r.partIds.includes(id) && r.ruleId !== "cooler_required",
  );
  const status = relevant.length
    ? (STATUS_ORDER.find((s) => relevant.some((r) => r.status === s)) ?? null)
    : null;
  return { status, reasons: relevant.filter((r) => r.status !== "compatible") };
}
