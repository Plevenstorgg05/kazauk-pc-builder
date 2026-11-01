import type { Status } from "@/lib/compatibility/types";
import s from "./Builder.module.css";
const labels: Record<Status, string> = {
  compatible: "Compatible",
  incompatible: "Incompatible",
  warning: "Warning",
  needs_verification: "Needs verification",
  insufficient_data: "Insufficient data",
};
export function BuilderStatus({
  status,
  compact = false,
}: {
  status: Status | null;
  compact?: boolean;
}) {
  return (
    <span
      className={`${s.status} ${status === "incompatible" ? s.fail : status === "compatible" ? s.pass : status ? s.caution : s.unchecked}`}
    >
      <span aria-hidden>
        {status === "incompatible"
          ? "×"
          : status === "compatible"
            ? "✓"
            : status
              ? "!"
              : "—"}
      </span>
      {!compact ? (
        <span>{status ? labels[status] : "Not yet checked"}</span>
      ) : (
        <span className={s.srOnly}>
          {status ? labels[status] : "Not yet checked"}
        </span>
      )}
    </span>
  );
}
