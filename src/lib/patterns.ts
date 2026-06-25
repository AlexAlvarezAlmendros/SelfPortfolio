// CSS background patterns used for project/post thumbnails and the floating preview.
export const grid =
  'repeating-linear-gradient(90deg,#1c1c18,#1c1c18 1px,transparent 1px,transparent 13px),repeating-linear-gradient(0deg,#1c1c18,#1c1c18 1px,transparent 1px,transparent 13px),#0a0a08';
export const dots = 'radial-gradient(#23231e 1.5px,transparent 1.6px) 0 0/15px 15px,#0a0a08';
export const diag =
  'repeating-linear-gradient(45deg,#171715,#171715 1px,transparent 1px,transparent 11px),#0a0a08';
export const cross =
  'repeating-linear-gradient(0deg,#1c1c18,#1c1c18 1px,transparent 1px,transparent 17px),#0a0a08';

// Rotating palette for blog post thumbnails.
export const patterns = [grid, dots, diag, cross, dots, diag];

// Per-project thumbnail pattern, keyed by slug. Used as the hover-preview /
// mobile-thumbnail fallback for projects without a live-site screenshot.
export const projectThumb: Record<string, string> = {
  otp: dots,
  inmocapt: grid,
  gogestia: cross,
  trimar: diag,
  gitchain: dots,
};
