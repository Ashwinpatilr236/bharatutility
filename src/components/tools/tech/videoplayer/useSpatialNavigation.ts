import { useEffect, useRef, RefObject } from 'react';

/**
 * TV-remote / keyboard spatial navigation (D-Pad).
 *
 * - Arrow keys move focus to the nearest focusable element in that direction.
 * - If nothing focusable exists in that direction, Up/Down scrolls the nearest
 *   scrollable container instead (so long pages / settings are always reachable).
 * - Enter / OK activates the focused element natively (button click, form submit).
 * - Back keys (Escape, Backspace outside inputs, Tizen 10009, webOS 461,
 *   Android 4, GoBack / BrowserBack) call `onBack`.
 *
 * Touch & mouse behaviour is untouched – this only reacts to key events.
 */

export type NavDirection = 'up' | 'down' | 'left' | 'right';

interface SpatialNavOptions {
  enabled: boolean;
  onBack?: () => void;
  /** Called when there is no focusable element further in the given direction. Return true if handled. */
  onEdge?: (dir: NavDirection) => boolean | void;
  /** Focus the `[data-autofocus]` element (or first focusable) as soon as navigation is enabled. */
  autoFocus?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const TEXT_INPUT_TYPES = ['text', 'url', 'search', 'email', 'password', 'tel', 'number', ''];

export const isTvBackKey = (e: KeyboardEvent): boolean => {
  const code = (e as KeyboardEvent & { keyCode: number }).keyCode;
  return (
    e.key === 'Escape' ||
    e.key === 'GoBack' ||
    e.key === 'BrowserBack' ||
    code === 10009 || // Samsung Tizen
    code === 461 || // LG webOS
    code === 4 // Android TV
  );
};

export const isEditableTarget = (el: Element | null): boolean => {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag === 'INPUT') {
    const type = ((el as HTMLInputElement).type || '').toLowerCase();
    return TEXT_INPUT_TYPES.includes(type);
  }
  return (el as HTMLElement).isContentEditable === true;
};

const isVisible = (el: HTMLElement): boolean => {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const style = window.getComputedStyle(el);
  return style.visibility !== 'hidden' && style.display !== 'none';
};

const getScrollParent = (el: HTMLElement | null, root: HTMLElement): HTMLElement => {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    if (node === root) break;
    node = node.parentElement;
  }
  // Fall back to root if scrollable, else any scrollable descendant of root
  if (root.scrollHeight > root.clientHeight + 1) return root;
  const inner = Array.from(root.querySelectorAll<HTMLElement>('*')).find((n) => {
    const s = window.getComputedStyle(n);
    return /(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 1;
  });
  return inner || root;
};

const findNext = (current: HTMLElement, candidates: HTMLElement[], dir: NavDirection): HTMLElement | null => {
  const c = current.getBoundingClientRect();
  const cx = c.left + c.width / 2;
  const cy = c.top + c.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    if (el === current || el.contains(current) || current.contains(el)) continue;
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;

    let primary: number;
    let orthogonal: number;

    if (dir === 'down') {
      if (ey <= cy + 1 || r.top < c.top + 1) continue;
      primary = Math.max(0, r.top - c.bottom);
      orthogonal = Math.max(0, r.left - c.right, c.left - r.right);
    } else if (dir === 'up') {
      if (ey >= cy - 1 || r.bottom > c.bottom - 1) continue;
      primary = Math.max(0, c.top - r.bottom);
      orthogonal = Math.max(0, r.left - c.right, c.left - r.right);
    } else if (dir === 'right') {
      if (ex <= cx + 1 || r.left < c.left + 1) continue;
      primary = Math.max(0, r.left - c.right);
      orthogonal = Math.max(0, r.top - c.bottom, c.top - r.bottom);
    } else {
      if (ex >= cx - 1 || r.right > c.right - 1) continue;
      primary = Math.max(0, c.left - r.right);
      orthogonal = Math.max(0, r.top - c.bottom, c.top - r.bottom);
    }

    // Prefer elements that are aligned on the orthogonal axis
    const score = primary + orthogonal * 3 + (orthogonal > 0 ? 40 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
};

export function useSpatialNavigation(rootRef: RefObject<HTMLElement | null>, options: SpatialNavOptions) {
  const optsRef = useRef(options);
  optsRef.current = options;

  // Optional auto focus when enabled
  useEffect(() => {
    if (!options.enabled || !options.autoFocus) return;
    const t = window.setTimeout(() => {
      const root = rootRef.current;
      if (!root || root.contains(document.activeElement)) return;
      const target =
        root.querySelector<HTMLElement>('[data-autofocus]') ||
        Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(isVisible);
      target?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(t);
  }, [options.enabled, options.autoFocus, rootRef]);

  useEffect(() => {
    if (!options.enabled) return;

    const handler = (e: KeyboardEvent) => {
      const root = rootRef.current;
      if (!root || e.defaultPrevented) return;
      const { onBack, onEdge } = optsRef.current;
      const active = document.activeElement as HTMLElement | null;
      const editing = isEditableTarget(active);

      // Back / Escape
      if (isTvBackKey(e) || (e.key === 'Backspace' && !editing)) {
        if (onBack) {
          e.preventDefault();
          e.stopPropagation();
          onBack();
        }
        return;
      }

      const dirMap: Record<string, NavDirection> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      const dir = dirMap[e.key];

      if (!dir) {
        // Enter with nothing focused inside: focus first sensible element
        if (e.key === 'Enter' && (!active || !root.contains(active) || active === root)) {
          const first =
            root.querySelector<HTMLElement>('[data-autofocus]') ||
            Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(isVisible);
          if (first) {
            e.preventDefault();
            first.focus({ preventScroll: true });
            first.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
        return;
      }

      // Let caret move inside text inputs on Left/Right
      if (editing && (dir === 'left' || dir === 'right')) return;

      const candidates: HTMLElement[] = (Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[]).filter(isVisible);

      e.preventDefault();
      e.stopPropagation();

      // Nothing focused yet inside root → focus preferred / first visible element
      if (!active || !root.contains(active) || active === root) {
        const viewportH = window.innerHeight;
        const preferred =
          root.querySelector<HTMLElement>('[data-autofocus]') ||
          candidates.find((el) => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= viewportH;
          }) ||
          candidates[0];
        preferred?.focus({ preventScroll: true });
        preferred?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      const next = findNext(active, candidates, dir);
      if (next) {
        next.focus({ preventScroll: true });
        next.scrollIntoView({ block: dir === 'up' || dir === 'down' ? 'center' : 'nearest', inline: 'nearest', behavior: 'smooth' });
        return;
      }

      if (onEdge && onEdge(dir)) return;

      // No element in that direction → scroll content so text sections remain readable
      if (dir === 'up' || dir === 'down') {
        const scroller = getScrollParent(active, root);
        scroller.scrollBy({ top: (dir === 'down' ? 1 : -1) * Math.round(scroller.clientHeight * 0.6), behavior: 'smooth' });
      }
    };

    // Capture phase so overlays get keys before the main player handler
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [options.enabled, rootRef]);
}

export default useSpatialNavigation;
