"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  HardwareMedia,
  type MediaProduct,
} from "@/components/media/HardwareMedia";
import s from "./Showroom.module.css";
export interface HardwareLesson {
  id: string;
  label: string;
  title: string;
  intro: string;
  product: MediaProduct;
  terms: [string, string][];
  faq: [string, string];
}
export function HardwareGuide({ lessons }: { lessons: HardwareLesson[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const lesson = lessons[active]!;
  return (
    <div className={s.learningLayout}>
      <div
        className={s.lessonTabs}
        role="tablist"
        aria-label="Hardware explained"
      >
        {lessons.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`lesson-tab-${item.id}`}
            aria-selected={active === i}
            aria-controls="hardware-lesson"
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight" || e.key === "ArrowDown")
                next = (i + 1) % lessons.length;
              else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
                next = (i - 1 + lessons.length) % lessons.length;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = lessons.length - 1;
              else return;
              e.preventDefault();
              setActive(next);
              refs.current[next]?.focus();
            }}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {item.label}
            <span aria-hidden>↗</span>
          </button>
        ))}
      </div>
      <div
        id="hardware-lesson"
        role="tabpanel"
        aria-labelledby={`lesson-tab-${lesson.id}`}
        tabIndex={0}
        className={s.lessonPanel}
      >
        <div className={s.lessonTop}>
          <div>
            <span className={s.eyebrow}>
              HARDWARE FIELD NOTES / {String(active + 1).padStart(2, "0")}
            </span>
            <h3>{lesson.title}</h3>
            <p>{lesson.intro}</p>
          </div>
          <div className={s.lessonImage}>
            <HardwareMedia product={lesson.product} size="row" />
          </div>
        </div>
        <dl className={s.lessonTerms}>
          {lesson.terms.map(([term, definition]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
        <details className={s.lessonFaq}>
          <summary>
            {lesson.faq[0]}
            <span aria-hidden>＋</span>
          </summary>
          <p>{lesson.faq[1]}</p>
        </details>
        <Link className={s.textLink} href={`/configure?category=${lesson.id}`}>
          Explore {lesson.label.toLowerCase()} <span aria-hidden>↗</span>
        </Link>
      </div>
    </div>
  );
}
