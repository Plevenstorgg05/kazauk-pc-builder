import type { Readiness, Status } from "./types";

/**
 * Completion policy (brief 11.7).
 *
 * "Completion" here means reaching an accepted build summary. There is no
 * checkout — this is a frontend demonstration.
 */
export const READINESS_COPY: Record<Readiness, { title: string; detail: string; canProceed: boolean }> = {
  incomplete: {
    title: "Build incomplete",
    detail: "Select the remaining components to review your build.",
    canProceed: false,
  },
  blocked: {
    title: "Incompatible selections",
    detail: "Some parts in this build cannot work together. Resolve these before continuing.",
    canProceed: false,
  },
  ready_with_ack: {
    title: "Review required",
    detail:
      "This build has unresolved warnings or unverified specifications. Read them and confirm you understand before continuing.",
    canProceed: true,
  },
  ready: {
    title: "Ready to review",
    detail: "Every check this configurator can make has passed.",
    canProceed: true,
  },
};

export const STATUS_COPY: Record<Status, { label: string; tone: "ok" | "fail" | "caution"; icon: string }> = {
  compatible:        { label: "Compatible",        tone: "ok",      icon: "check" },
  incompatible:      { label: "Not compatible",    tone: "fail",    icon: "cross" },
  needs_verification:{ label: "Needs verification",tone: "caution", icon: "query" },
  insufficient_data: { label: "Insufficient data", tone: "caution", icon: "unknown" },
  warning:           { label: "Warning",           tone: "caution", icon: "alert" },
};

/**
 * Serious electrical advisories. These get stronger wording: a demo should
 * never imply it is safe to buy and build on an unverified power assumption.
 */
export const ELECTRICAL_RULES = new Set(["psu_wattage", "psu_headroom", "gpu_connectors"]);
