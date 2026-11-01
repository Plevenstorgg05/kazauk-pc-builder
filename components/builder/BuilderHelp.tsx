import { helpFor } from "@/lib/builder/help";
import type { BuilderCategory } from "@/lib/builder/categories";
import s from "./Builder.module.css";
export function BuilderHelp({ category }: { category: BuilderCategory }) {
  const guide = helpFor(category);
  return (
    <section className={s.help}>
      <div className={s.helpHeader}>
        <span className={s.kicker}>BEFORE YOU CHOOSE</span>
        <h3>Selection guide.</h3>
      </div>
      <div className={s.helpContent}>
        <details className={s.guide}>
          <summary>
            Choosing {category === "case" ? "the right case" : "this component"}{" "}
            <span aria-hidden>＋</span>
          </summary>
          <p>{guide.tip}</p>
          <dl>
            {guide.terms.map(([term, definition]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{definition}</dd>
              </div>
            ))}
          </dl>
          <small>
            General guidance, separate from individual product specifications.
          </small>
        </details>
        {guide.faqs.map(([question, answer]) => (
          <details key={question} className={s.guide}>
            <summary>
              {question} <span aria-hidden>＋</span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
