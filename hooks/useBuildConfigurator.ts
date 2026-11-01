"use client";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { CATEGORIES, type Category } from "@/lib/catalog/schema";
import { evaluateBuild } from "@/lib/compatibility/engine";
import {
  STORAGE_KEY,
  validateSelection,
  selectionFromURL,
} from "@/lib/configurator/build-storage";
import { DEFAULT_POLICY, type Selection } from "@/lib/compatibility/types";
/**
 * Configurator state (brief 14).
 *
 * State holds ONLY the selected ids, the active category and acknowledgement.
 * Compatibility findings, totals and readiness are derived on every render by
 * the pure engine — so a stale compatibility result is structurally impossible,
 * and no state library is needed.
 */
interface State {
  selection: Selection;
  active: Category;
  acknowledged: boolean;
  hydrated: boolean;
  storageAvailable: boolean;
}
type Action =
  | {
      type: "select";
      category: Category;
      partId: string;
    }
  | {
      type: "clear";
      category: Category;
    }
  | {
      type: "goto";
      category: Category;
    }
  | {
      type: "acknowledge";
      value: boolean;
    }
  | {
      type: "reset";
    }
  | {
      type: "restore";
      selection: Selection;
      storageAvailable: boolean;
    }
  | {
      type: "storage_failed";
    };
const initial: State = {
  selection: {},
  active: "cpu",
  acknowledged: false,
  hydrated: false,
  storageAvailable: true,
};
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select": {
      // Changing a part invalidates any previous acknowledgement, so the user
      // cannot acknowledge warnings and then quietly alter the build.
      return {
        ...state,
        selection: { ...state.selection, [action.category]: action.partId },
        acknowledged: false,
      };
    }
    case "clear": {
      // Never silently delete other selections when resolving a conflict
      // (brief 9.5) — only the named category is cleared.
      const next = { ...state.selection };
      delete next[action.category];
      return { ...state, selection: next, acknowledged: false };
    }
    case "goto":
      return { ...state, active: action.category };
    case "acknowledge":
      return { ...state, acknowledged: action.value };
    case "reset":
      return {
        ...initial,
        hydrated: true,
        storageAvailable: state.storageAvailable,
      };
    case "restore":
      return {
        ...initial,
        selection: action.selection,
        hydrated: true,
        storageAvailable: action.storageAvailable,
      };
    case "storage_failed":
      return { ...state, storageAvailable: false };
  }
}
export function useBuildConfigurator() {
  const [state, dispatch] = useReducer(reducer, initial);
  useEffect(() => {
    const shared = selectionFromURL(window.location.search);
    let saved: unknown = {};
    let storageAvailable = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      try {
        saved = raw ? JSON.parse(raw) : {};
      } catch {
        saved = {};
      }
    } catch {
      storageAvailable = false;
    }
    dispatch({
      type: "restore",
      selection: shared ?? validateSelection(saved),
      storageAvailable,
    });
  }, []);
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selection));
    } catch {
      dispatch({ type: "storage_failed" });
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("build")) {
      url.searchParams.set("build", JSON.stringify(state.selection));
      window.history.replaceState(window.history.state, "", url);
    }
  }, [state.selection, state.hydrated]);
  const evaluation = useMemo(
    () => evaluateBuild(state.selection, DEFAULT_POLICY),
    [state.selection],
  );
  const select = useCallback(
    (category: Category, partId: string) =>
      dispatch({ type: "select", category, partId }),
    [],
  );
  const clear = useCallback(
    (category: Category) => dispatch({ type: "clear", category }),
    [],
  );
  const goto = useCallback(
    (category: Category) => dispatch({ type: "goto", category }),
    [],
  );
  const acknowledge = useCallback(
    (value: boolean) => dispatch({ type: "acknowledge", value }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const nextIncomplete = useMemo(
    () => CATEGORIES.find((c) => !state.selection[c]) ?? null,
    [state.selection],
  );
  return {
    ...state,
    evaluation,
    select,
    clear,
    goto,
    acknowledge,
    reset,
    nextIncomplete,
  };
}
