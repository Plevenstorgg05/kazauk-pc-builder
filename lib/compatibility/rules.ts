import {
  findPart,
  gpuClearance,
  radiatorSupport,
} from "@/lib/catalog/normalize";
import type {
  Cpu, Motherboard, Memory, Gpu, Cooler, Psu, PcCase,
} from "@/lib/catalog/schema";
import type { Policy, RuleResult, Selection } from "./types";

/**
 * The twelve compatibility rules.
 *
 * The `check` strings in the JSON are DOCUMENTATION. They are never evaluated —
 * no eval, no new Function (brief 11). Each rule below is an explicit, tested
 * function.
 *
 * Two invariants apply throughout:
 *  1. A rule only runs when its inputs are selected. A partial build produces
 *     "missing selections", not a wall of red (brief 11.2).
 *  2. `null` is never treated as a pass. Missing data yields insufficient_data.
 */

interface Ctx {
  cpu?: Cpu;
  motherboard?: Motherboard;
  memory?: Memory;
  gpu?: Gpu;
  cooler?: Cooler;
  psu?: Psu;
  pcCase?: PcCase;
  policy: Policy;
}

export function buildContext(selection: Selection, policy: Policy): Ctx {
  const get = <T>(id?: string) => (id ? (findPart(id) as T | undefined) : undefined);
  return {
    cpu: get<Cpu>(selection.cpu),
    motherboard: get<Motherboard>(selection.motherboard),
    memory: get<Memory>(selection.memory),
    gpu: get<Gpu>(selection.gpu),
    cooler: get<Cooler>(selection.cooler),
    psu: get<Psu>(selection.psu),
    pcCase: get<PcCase>(selection.case),
    policy,
  };
}

type Rule = (c: Ctx) => RuleResult | null;

// ---------------------------------------------------------------- A. socket
const socket: Rule = ({ cpu, motherboard }) => {
  if (!cpu || !motherboard) return null;
  const ok = cpu.socket === motherboard.socket;
  return {
    ruleId: "socket",
    title: "CPU socket",
    status: ok ? "compatible" : "incompatible",
    message: ok
      ? `Both the processor and motherboard use the ${cpu.socket} socket.`
      : `The processor uses an ${cpu.socket} socket but the motherboard provides ${motherboard.socket}. They cannot physically connect.`,
    categories: ["cpu", "motherboard"],
    partIds: [cpu.id, motherboard.id],
    evidence: { cpuSocket: cpu.socket, boardSocket: motherboard.socket },
    action: ok ? undefined : "Choose a motherboard with the same socket as your processor.",
  };
};

// --------------------------------------------------------- B. memory type
const memoryType: Rule = ({ memory, motherboard }) => {
  if (!memory || !motherboard) return null;
  const ok = memory.type === motherboard.memory_type;
  return {
    ruleId: "memory_type",
    title: "Memory generation",
    status: ok ? "compatible" : "incompatible",
    message: ok
      ? `The memory kit and motherboard are both ${memory.type}.`
      : `This is ${memory.type} memory but the motherboard accepts ${motherboard.memory_type}. Memory generations are not interchangeable.`,
    categories: ["memory", "motherboard"],
    partIds: [memory.id, motherboard.id],
    evidence: { memoryType: memory.type, boardMemoryType: motherboard.memory_type },
    action: ok ? undefined : `Choose a ${motherboard.memory_type} kit, or a motherboard that accepts ${memory.type}.`,
  };
};

// ---------------------------------------------------------- C. DIMM format
const dimmType: Rule = ({ memory, motherboard }) => {
  if (!memory || !motherboard) return null;
  const ok = memory.dimm_type === motherboard.dimm_type;
  return {
    ruleId: "dimm_type",
    title: "Memory form factor",
    status: ok ? "compatible" : "incompatible",
    message: ok
      ? `This is a desktop ${memory.dimm_type} kit, which matches the motherboard's slots.`
      : `This is a ${memory.dimm_type} module — laptop memory. The motherboard has full-size ${motherboard.dimm_type} slots, which are physically different.`,
    categories: ["memory", "motherboard"],
    partIds: [memory.id, motherboard.id],
    evidence: { memoryForm: memory.dimm_type, boardForm: motherboard.dimm_type },
    action: ok ? undefined : "Choose a desktop DIMM kit.",
  };
};

// ------------------------------------------------------- D. board vs case
const boardFormFactor: Rule = ({ motherboard, pcCase }) => {
  if (!motherboard || !pcCase) return null;
  const ok = pcCase.motherboard_support.includes(motherboard.form_factor);
  return {
    ruleId: "board_form_factor",
    title: "Motherboard fits the case",
    status: ok ? "compatible" : "incompatible",
    message: ok
      ? `The case supports ${motherboard.form_factor} motherboards.`
      : `This is an ${motherboard.form_factor} motherboard, but the case lists support for ${pcCase.motherboard_support.join(", ")} only.`,
    categories: ["motherboard", "case"],
    partIds: [motherboard.id, pcCase.id],
    evidence: {
      boardFormFactor: motherboard.form_factor,
      caseSupports: pcCase.motherboard_support.join(", "),
    },
    action: ok
      ? undefined
      : "Choose a case that lists this size, or a smaller motherboard. The supplier may be able to confirm additional sizes not shown on the spec sheet.",
  };
};

// ------------------------------------------------------- E. GPU clearance
const gpuLength: Rule = ({ gpu, pcCase }) => {
  if (!gpu || !pcCase) return null;
  const clearance = gpuClearance(pcCase);

  if (gpu.length_mm === null) {
    return {
      ruleId: "gpu_length", title: "Graphics card clearance", status: "insufficient_data",
      message: "The length of this graphics card is not published, so it cannot be checked against the case.",
      categories: ["gpu", "case"], partIds: [gpu.id, pcCase.id],
      missing: ["graphics card length"],
      action: "Confirm the card length with the supplier before ordering.",
    };
  }
  if (clearance.unknown || clearance.limitMm === null) {
    return {
      ruleId: "gpu_length", title: "Graphics card clearance", status: "insufficient_data",
      message: `This card is ${gpu.length_mm} mm long, but the case does not publish a maximum graphics card length.`,
      categories: ["gpu", "case"], partIds: [gpu.id, pcCase.id],
      evidence: { cardLengthMm: gpu.length_mm, caseLimitMm: null },
      missing: ["case graphics card clearance"],
      action: "Confirm the clearance with the supplier before ordering.",
    };
  }

  const fits = gpu.length_mm <= clearance.limitMm;
  if (clearance.conflicting) {
    // Sources disagree. We compare against the LOWEST figure to stay safe, but
    // the conflict is surfaced rather than quietly resolved (brief 11.5.E).
    return {
      ruleId: "gpu_length", title: "Graphics card clearance",
      status: fits ? "needs_verification" : "incompatible",
      message: fits
        ? `This card is ${gpu.length_mm} mm. Sources disagree on this case's limit (${clearance.conflicting.join(" mm and ")} mm). It fits either figure, but the conflict has not been resolved.`
        : `This card is ${gpu.length_mm} mm, which exceeds the lowest published limit for this case (${clearance.limitMm} mm). Sources quote ${clearance.conflicting.join(" mm and ")} mm.`,
      categories: ["gpu", "case"], partIds: [gpu.id, pcCase.id],
      evidence: { cardLengthMm: gpu.length_mm, conflictingLimits: clearance.conflicting.join(", ") },
      action: "Ask the supplier to confirm the actual clearance.",
    };
  }
  return {
    ruleId: "gpu_length", title: "Graphics card clearance",
    status: fits ? "compatible" : "incompatible",
    message: fits
      ? `This card is ${gpu.length_mm} mm and the case accepts up to ${clearance.limitMm} mm.`
      : `This card is ${gpu.length_mm} mm, but the case accepts a maximum of ${clearance.limitMm} mm. It is ${gpu.length_mm - clearance.limitMm} mm too long.`,
    categories: ["gpu", "case"], partIds: [gpu.id, pcCase.id],
    evidence: { cardLengthMm: gpu.length_mm, caseLimitMm: clearance.limitMm },
    action: fits ? undefined : "Choose a shorter card, or a case with more clearance.",
  };
};

// ------------------------------------------------------ F. cooling present
const coolerRequired: Rule = ({ cpu, cooler }) => {
  if (!cpu) return null;
  if (cpu.cooler_included) {
    return {
      ruleId: "cooler_required", title: "CPU cooling",
      status: "compatible",
      message: "This processor ships with a cooler included, so a separate cooler is optional.",
      categories: ["cpu", "cooler"], partIds: [cpu.id],
      evidence: { coolerIncluded: "yes" },
    };
  }
  if (!cooler) {
    return {
      ruleId: "cooler_required", title: "CPU cooling",
      status: "incompatible",
      message: "This processor does not include a cooler, and no cooler has been selected. The system has no CPU cooling.",
      categories: ["cpu", "cooler"], partIds: [cpu.id],
      evidence: { coolerIncluded: "no" },
      action: "Select a CPU cooler.",
    };
  }
  return {
    ruleId: "cooler_required", title: "CPU cooling", status: "compatible",
    message: "A CPU cooler has been selected.",
    categories: ["cpu", "cooler"], partIds: [cpu.id, cooler.id],
  };
};

// ------------------------------------------------------- G. boxed cooler
const boxedCooler: Rule = ({ cpu, cooler }) => {
  // Only applies to coolers that ship with a specific processor.
  if (!cooler?.only_with_cpu) return null;
  if (!cpu) {
    return {
      ruleId: "boxed_cooler", title: "Included cooler", status: "insufficient_data",
      message: "This cooler is only supplied boxed with a specific processor. Select a processor to check.",
      categories: ["cpu", "cooler"], partIds: [cooler.id],
      missing: ["processor selection"],
    };
  }
  const ok = cooler.only_with_cpu === cpu.id;
  return {
    ruleId: "boxed_cooler", title: "Included cooler",
    status: ok ? "compatible" : "incompatible",
    message: ok
      ? "This cooler is the one supplied in the box with the selected processor."
      : "This cooler is only supplied in the box with a different processor. It cannot be ordered separately for this build.",
    categories: ["cpu", "cooler"], partIds: [cpu.id, cooler.id],
    evidence: { suppliedWith: cooler.only_with_cpu, selectedCpu: cpu.id },
    action: ok ? undefined : "Choose a cooler that is sold separately.",
  };
};

// ------------------------------------------------------- H. cooler socket
const coolerSocket: Rule = ({ cpu, cooler }) => {
  if (!cooler) return null;
  // A missing socket list is a data gap in its own right, independent of
  // whether a processor has been chosen yet.
  if (cooler.sockets === null) {
    return {
      ruleId: "cooler_socket", title: "Cooler mounting",
      status: "insufficient_data",
      message: "This cooler's supported sockets are not listed, so mounting compatibility cannot be confirmed.",
      categories: ["cpu", "cooler"], partIds: cpu ? [cpu.id, cooler.id] : [cooler.id],
      missing: ["cooler socket support list"],
      action: "Check the manufacturer's specification for supported sockets.",
    };
  }
  if (!cpu) return null;
  const ok = cooler.sockets.includes(cpu.socket);
  return {
    ruleId: "cooler_socket", title: "Cooler mounting",
    status: ok ? "compatible" : "incompatible",
    message: ok
      ? `This cooler supports the ${cpu.socket} socket.`
      : `This cooler supports ${cooler.sockets.join(", ")}, which does not include the processor's ${cpu.socket} socket.`,
    categories: ["cpu", "cooler"], partIds: [cpu.id, cooler.id],
    evidence: { cpuSocket: cpu.socket, coolerSockets: cooler.sockets.join(", ") },
    action: ok ? undefined : "Choose a cooler that supports this socket.",
  };
};

// -------------------------------------------------------- I. radiator fit
const radiatorFit: Rule = ({ cooler, pcCase }) => {
  if (!cooler || !pcCase) return null;
  // Gated on liquid coolers. An air cooler has no radiator, and absence is not
  // missing data — without this gate the boxed-cooler scenario breaks.
  if (cooler.type !== "aio") return null;
  if (cooler.radiator_mm === null || cooler.radiator_mm === undefined) {
    return {
      ruleId: "radiator_fit", title: "Radiator fit", status: "insufficient_data",
      message: "This cooler's radiator size is not published, so it cannot be checked against the case.",
      categories: ["cooler", "case"], partIds: [cooler.id, pcCase.id],
      missing: ["radiator size"],
    };
  }
  const support = radiatorSupport(pcCase);
  if (support.unknown || support.maxMm === null) {
    return {
      ruleId: "radiator_fit", title: "Radiator fit", status: "insufficient_data",
      message: `This is a ${cooler.radiator_mm} mm radiator, but the case does not publish its radiator support.`,
      categories: ["cooler", "case"], partIds: [cooler.id, pcCase.id],
      evidence: { radiatorMm: cooler.radiator_mm, caseSupport: null },
      missing: ["case radiator support"],
    };
  }
  const listed = support.listedSizes.includes(cooler.radiator_mm);
  const fits = cooler.radiator_mm <= support.maxMm;
  return {
    ruleId: "radiator_fit", title: "Radiator fit",
    status: fits ? "compatible" : "incompatible",
    message: fits
      ? listed
        ? `The case explicitly lists support for ${cooler.radiator_mm} mm radiators.`
        : `This is a ${cooler.radiator_mm} mm radiator and the case accepts up to ${support.maxMm} mm.`
      : `This is a ${cooler.radiator_mm} mm radiator, but the case accepts a maximum of ${support.maxMm} mm.`,
    categories: ["cooler", "case"], partIds: [cooler.id, pcCase.id],
    evidence: {
      radiatorMm: cooler.radiator_mm,
      caseMaxMm: support.maxMm,
      explicitlyListed: listed ? "yes" : "no",
    },
    action: fits ? undefined : "Choose a smaller radiator, or a case with more radiator support.",
  };
};

// ------------------------------------------------ J. PSU vs manufacturer rec
const psuWattage: Rule = ({ gpu, psu }) => {
  if (!gpu || !psu) return null;
  if (gpu.recommended_psu_w === null) {
    return {
      ruleId: "psu_wattage", title: "Manufacturer PSU recommendation",
      status: "insufficient_data",
      message: "The graphics card manufacturer's recommended power supply rating is not published.",
      categories: ["gpu", "psu"], partIds: [gpu.id, psu.id],
      missing: ["recommended PSU wattage"],
    };
  }
  const ok = psu.wattage >= gpu.recommended_psu_w;
  return {
    ruleId: "psu_wattage", title: "Manufacturer PSU recommendation",
    status: ok ? "compatible" : "warning",
    message: ok
      ? `The ${psu.wattage} W supply meets the card manufacturer's ${gpu.recommended_psu_w} W recommendation.`
      : `The card manufacturer recommends at least ${gpu.recommended_psu_w} W, but this supply is rated ${psu.wattage} W — ${gpu.recommended_psu_w - psu.wattage} W short. The system may shut down under heavy load.`,
    categories: ["gpu", "psu"], partIds: [gpu.id, psu.id],
    evidence: { psuWattage: psu.wattage, recommendedW: gpu.recommended_psu_w },
    action: ok ? undefined : "Consider a higher-rated power supply.",
  };
};

// ------------------------------------------------------- K. PSU headroom
const psuHeadroom: Rule = ({ cpu, gpu, psu, policy }) => {
  if (!psu) return null;
  if (!cpu || !gpu) return null;
  if (gpu.board_power_w === null) {
    return {
      ruleId: "psu_headroom", title: "Estimated power headroom",
      status: "insufficient_data",
      message: "The graphics card's board power is not published, so headroom cannot be estimated.",
      categories: ["cpu", "gpu", "psu"], partIds: [cpu.id, gpu.id, psu.id],
      missing: ["graphics card board power"],
    };
  }
  const estimate = Math.round(
    (cpu.tdp_w + gpu.board_power_w + policy.systemOverheadW) * policy.headroomMultiplier,
  );
  const ok = estimate <= psu.wattage;
  return {
    ruleId: "psu_headroom", title: "Estimated power headroom",
    status: ok ? "compatible" : "warning",
    message: ok
      ? `Estimated requirement is around ${estimate} W, within this ${psu.wattage} W supply.`
      : `Estimated requirement is around ${estimate} W, above this ${psu.wattage} W supply.`,
    categories: ["cpu", "gpu", "psu"], partIds: [cpu.id, gpu.id, psu.id],
    evidence: {
      cpuTdpW: cpu.tdp_w,
      gpuBoardPowerW: gpu.board_power_w,
      systemOverheadW: policy.systemOverheadW,
      multiplier: policy.headroomMultiplier,
      estimateW: estimate,
      psuWattage: psu.wattage,
    },
    action:
      "This is a provisional estimate. The overhead allowance and safety multiplier are placeholder values, and TDP does not capture transient peaks.",
  };
};

// ----------------------------------------------------- L. power connectors
const gpuConnectors: Rule = ({ gpu, psu }) => {
  if (!gpu || !psu) return null;
  if (psu.connectors === null) {
    return {
      ruleId: "gpu_connectors", title: "Power connectors",
      status: "insufficient_data",
      message: `This card requires ${gpu.power_connectors?.join(", ") ?? "unpublished connectors"}, but this supply's connector list has not been captured.`,
      categories: ["gpu", "psu"], partIds: [gpu.id, psu.id],
      evidence: { cardRequires: gpu.power_connectors?.join(", ") ?? null, psuProvides: null },
      missing: ["power supply connector list"],
      action: "Confirm the supply provides the required connectors before ordering. Wattage alone does not prove this.",
    };
  }
  if (gpu.power_connectors === null) {
    return {
      ruleId: "gpu_connectors", title: "Power connectors",
      status: "insufficient_data",
      message: "This card's power connector requirement is not published.",
      categories: ["gpu", "psu"], partIds: [gpu.id, psu.id],
      missing: ["graphics card connector requirement"],
    };
  }
  const provided = psu.connectors.join(", ").toLowerCase();
  const unmet = gpu.power_connectors.filter((req) => {
    const key = req.toLowerCase().split(" ")[0] ?? "";
    return key.length > 0 && !provided.includes(key);
  });
  const ok = unmet.length === 0;
  return {
    ruleId: "gpu_connectors", title: "Power connectors",
    status: ok ? "compatible" : "incompatible",
    message: ok
      ? "The power supply provides the connectors this card requires."
      : `This card requires ${unmet.join(", ")}, which this supply does not list.`,
    categories: ["gpu", "psu"], partIds: [gpu.id, psu.id],
    evidence: { cardRequires: gpu.power_connectors.join(", "), psuProvides: psu.connectors.join(", ") },
    action: ok ? undefined : "Choose a supply with the required connectors.",
  };
};

export const RULES: Rule[] = [
  socket, memoryType, dimmType, boardFormFactor, gpuLength,
  coolerRequired, boxedCooler, coolerSocket, radiatorFit,
  psuWattage, psuHeadroom, gpuConnectors,
];
