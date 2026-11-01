import type { AnyPart, Category } from "@/lib/catalog/schema";
export interface Spec {
  key: string;
  label: string;
  value: string;
}
const labels: Record<string, string> = {
  socket: "Socket",
  cores: "Cores",
  threads: "Threads",
  tdp_w: "CPU TDP",
  memory_type: "Memory generation",
  has_igpu: "Integrated graphics",
  cooler_included: "Cooler included",
  chipset: "Chipset",
  form_factor: "Form factor",
  dimm_type: "Module format",
  memory_slots: "Memory slots",
  type: "Type",
  capacity_gb: "Capacity",
  modules: "Modules",
  speed_mts: "Memory speed",
  length_mm: "Length",
  height_mm: "Height",
  thickness_mm: "Thickness",
  board_power_w: "Board power",
  recommended_psu_w: "Recommended PSU",
  power_connectors: "Required connectors",
  sockets: "Supported sockets",
  radiator_mm: "Radiator size",
  radiator_thickness_mm: "Radiator thickness",
  wattage: "Output",
  connectors: "PSU connectors",
  motherboard_support: "Motherboards supported",
  gpu_max_mm: "GPU clearance",
  gpu_max_mm_conflict: "Conflicting GPU limits",
  cooler_max_mm: "Cooler clearance",
  dimensions_mm: "Dimensions",
  radiators: "Radiator support",
  sku: "SKU",
  mpn: "Manufacturer part number",
};
const fields: Record<Category, string[]> = {
  cpu: [
    "socket",
    "cores",
    "threads",
    "tdp_w",
    "memory_type",
    "has_igpu",
    "cooler_included",
    "sku",
  ],
  motherboard: [
    "socket",
    "chipset",
    "form_factor",
    "memory_type",
    "dimm_type",
    "memory_slots",
  ],
  memory: ["capacity_gb", "type", "speed_mts", "modules", "dimm_type"],
  gpu: [
    "chipset",
    "length_mm",
    "height_mm",
    "thickness_mm",
    "board_power_w",
    "recommended_psu_w",
    "power_connectors",
    "mpn",
  ],
  case: [
    "motherboard_support",
    "gpu_max_mm",
    "cooler_max_mm",
    "radiators",
    "dimensions_mm",
    "gpu_max_mm_conflict",
  ],
  cooler: [
    "type",
    "sockets",
    "radiator_mm",
    "height_mm",
    "radiator_thickness_mm",
  ],
  psu: ["wattage", "form_factor", "connectors"],
};
export function specsFor(category: Category, part: AnyPart): Spec[] {
  const record = part as unknown as Record<string, unknown>;
  return fields[category]
    .filter((key) => key in record)
    .map((key) => {
      const v = record[key];
      let value = "Not published";
      if (v !== null && v !== undefined) {
        if (key === "radiators")
          value = (
            v as {
              position: string;
              max_mm?: number | null;
              sizes_mm?: number[];
            }[]
          )
            .map(
              (r) =>
                `${r.position}: ${r.sizes_mm?.join(" / ") ?? r.max_mm ?? "not published"}${r.max_mm || r.sizes_mm ? " mm" : ""}`,
            )
            .join("; ");
        else if (typeof v === "boolean") value = v ? "Yes" : "No";
        else if (Array.isArray(v)) value = v.join(" / ");
        else if (key === "type" && category === "cooler")
          value = v === "aio" ? "Liquid / AIO" : "Air";
        else
          value = `${String(v)}${key.endsWith("_mm") ? " mm" : key.endsWith("_w") || key === "wattage" ? " W" : key === "capacity_gb" ? " GB" : key === "speed_mts" ? " MT/s" : ""}`;
      }
      return { key, label: labels[key] ?? key, value };
    });
}
export function manufacturer(part: AnyPart): string {
  return part.name.split(" ")[0] ?? "Unknown";
}
export function displayName(part: AnyPart): string {
  return part.name.replace(/ — TRAP ITEM$/, "");
}
export const FILTER_SPEC: Record<
  Category,
  {
    key: string;
    label: string;
  }
> = {
  cpu: { key: "cores", label: "Core count" },
  motherboard: { key: "form_factor", label: "Board size" },
  memory: { key: "capacity_gb", label: "Capacity" },
  gpu: { key: "chipset", label: "GPU model" },
  case: { key: "motherboard_support", label: "Board support" },
  cooler: { key: "type", label: "Cooling type" },
  psu: { key: "wattage", label: "Output" },
};
