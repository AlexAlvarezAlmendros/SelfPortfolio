// Maps each project slug to a screenshot of the top of its live site, captured by
// scripts/project-thumbs.mjs. Used for the hover preview in the projects list, the
// main shot on the project page, and the og:image meta. Projects without a live
// site (null) fall back to a CSS pattern.
//
// Regenerate the images with: npm run thumbs
export const projectShot: Record<string, string | null> = {
  otp: '/og/projects/otp.png',
  inmocapt: '/og/projects/inmocapt.png',
  gogestia: '/og/projects/gogestia.png',
  trimar: '/og/projects/trimar.png',
  gitchain: null,
};
