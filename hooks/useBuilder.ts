"use client";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { BuilderCategory } from "@/lib/builder/categories";
import type { BuilderSelection } from "@/lib/builder/types";
import { summarizeDemoBuild } from "@/lib/builder/demo";
import { CATEGORY_IDS } from "@/lib/builder/categories";
import {
  BUILDER_STORAGE_KEY,
  readSharedBuild,
  validateBuilder,
} from "@/lib/builder/storage";
interface State {
  selection: BuilderSelection;
  active: BuilderCategory;
  hydrated: boolean;
  storageAvailable: boolean;
}
type Action =
  | { type: "select"; category: BuilderCategory; id: string }
  | { type: "goto"; category: BuilderCategory }
  | { type: "clear"; category: BuilderCategory }
  | { type: "restore"; selection: BuilderSelection; available: boolean }
  | { type: "storage_failed" }
  | { type: "reset" };
const initial: State = {
  selection: {},
  active: "case",
  hydrated: false,
  storageAvailable: true,
};
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return {
        ...state,
        selection: { ...state.selection, [action.category]: action.id },
      };
    case "clear": {
      const next = { ...state.selection };
      delete next[action.category];
      return { ...state, selection: next };
    }
    case "goto":
      return { ...state, active: action.category };
    case "restore":
      return {
        ...state,
        selection: { ...action.selection, ...state.selection },
        hydrated: true,
        storageAvailable: action.available,
      };
    case "storage_failed":
      return { ...state, storageAvailable: false };
    case "reset":
      return {
        ...initial,
        hydrated: true,
        storageAvailable: state.storageAvailable,
      };
  }
}
export function useBuilder() {
  const [state, dispatch] = useReducer(reducer, initial);
  useEffect(() => {
    let saved: unknown = {};
    let available = true;
    try {
      const raw =
        localStorage.getItem(BUILDER_STORAGE_KEY) ??
        localStorage.getItem("ionz-build-v1");
      try {
        saved = raw ? JSON.parse(raw) : {};
      } catch {
        saved = {};
      }
    } catch {
      available = false;
    }
    dispatch({
      type: "restore",
      selection: readSharedBuild(location.search) ?? validateBuilder(saved),
      available,
    });
    const category = new URLSearchParams(location.search).get("category");
    if (category && CATEGORY_IDS.includes(category as BuilderCategory))
      dispatch({ type: "goto", category: category as BuilderCategory });
  }, []);
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(
        BUILDER_STORAGE_KEY,
        JSON.stringify(state.selection),
      );
    } catch {
      dispatch({ type: "storage_failed" });
    }
    const url = new URL(location.href);
    if (url.searchParams.has("build")) {
      url.searchParams.set("build", JSON.stringify(state.selection));
      history.replaceState(history.state, "", url);
    }
  }, [state.selection, state.hydrated]);
  const evaluation = useMemo(
    () => summarizeDemoBuild(state.selection),
    [state.selection],
  );
  const select = useCallback(
    (category: BuilderCategory, id: string) =>
      dispatch({ type: "select", category, id }),
    [],
  );
  const goto = useCallback(
    (category: BuilderCategory) => dispatch({ type: "goto", category }),
    [],
  );
  const clear = useCallback(
    (category: BuilderCategory) => dispatch({ type: "clear", category }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  return { ...state, evaluation, select, goto, clear, reset };
}
