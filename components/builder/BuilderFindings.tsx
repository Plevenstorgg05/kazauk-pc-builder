import type { BuilderCategory } from "@/lib/builder/categories";
import { categoryInfo } from "@/lib/builder/categories";
import type { BuilderFinding } from "@/lib/builder/types";
import { BuilderStatus } from "./BuilderStatus";
import s from "./Builder.module.css";
export function BuilderFindings({
  findings,
  onGoto,
}: {
  findings: BuilderFinding[];
  onGoto: (category: BuilderCategory) => void;
}) {
  return (
    <div className={s.findings}>
      {findings.map((r) => (
        <section key={r.ruleId} className={s.finding}>
          <div>
            <h3>{r.title}</h3>
            <BuilderStatus status={r.status} />
          </div>
          <p>{r.message}</p>
          {r.action ? <p className={s.findingAction}>{r.action}</p> : null}
          {r.evidence ? (
            <details>
              <summary>View check evidence</summary>
              <dl>
                {Object.entries(r.evidence).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                    <dd>
                      {value === null || value === undefined
                        ? "Not published"
                        : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : null}
          <div className={s.resolve}>
            {r.categories.map((c) => (
              <button type="button" key={c} onClick={() => onGoto(c)}>
                Review {categoryInfo(c).short} ↗
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
