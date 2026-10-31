/**
 * Shared material definitions for the procedural PC.
 *
 * Centralised so the whole build reads as one object rather than a pile of
 * unrelated surfaces (brief 3.1). Values are chosen for a dark studio: metals
 * stay fairly rough, because mirror-polished metal in a near-black room just
 * reads as black.
 */
export const MAT = {
  /** Powder-coated steel chassis. */
  chassis: { color: "#23262a", metalness: 0.62, roughness: 0.52 },
  /** Brushed aluminium trim and brackets. */
  aluminium: { color: "#9aa3ad", metalness: 0.88, roughness: 0.3 },
  /** Dark anodised aluminium — GPU shroud, cooler body. */
  anodised: { color: "#2b2f34", metalness: 0.78, roughness: 0.36 },
  /** Bare heatsink fin stock. */
  fin: { color: "#b8c0c8", metalness: 0.92, roughness: 0.26 },
  /** Copper heatpipes. */
  copper: { color: "#c0763f", metalness: 0.95, roughness: 0.28 },
  /** Matte PCB. */
  pcb: { color: "#15291f", metalness: 0.1, roughness: 0.82 },
  /** Darker PCB for add-in cards. */
  pcbDark: { color: "#101b16", metalness: 0.1, roughness: 0.85 },
  /** Black injection-moulded plastic — fan frames, shrouds. */
  plastic: { color: "#17191c", metalness: 0.15, roughness: 0.68 },
  /** Translucent fan blade / RGB diffuser plastic. */
  diffuser: { color: "#d8dde3", metalness: 0.05, roughness: 0.45 },
  /** CPU integrated heat spreader. */
  ihs: { color: "#c9ced4", metalness: 0.94, roughness: 0.22 },
  /** Gold contacts on slots and connectors. */
  gold: { color: "#c9a227", metalness: 0.96, roughness: 0.3 },
} as const;

/** RGB accents. Restrained — a few sources, not every surface (brief 3.1). */
export const RGB = {
  cool: "#3b82f6",
  magenta: "#b04bd6",
  cyan: "#22d3ee",
  warm: "#f97316",
} as const;
