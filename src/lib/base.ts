// URLs inside the app. The app can be published in any folder (vite.config.ts): every URL is
// relative to index.html, and the pages are in the hash.

/** A page's link: '/about' → '#/about' (hash routing). */
export const page = (path: string) => `#${path}`;

/** A file of the app (static/ or the build), relative to index.html: '/favicon.svg' → './favicon.svg'. */
export const asset = (path: string) => `.${path}`;
