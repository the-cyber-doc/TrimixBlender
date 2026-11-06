// The app's base path: '' at the domain's root, e.g. '/blender' under a subfolder
// (BASE_PATH at build time, vite.config.ts). Every app-absolute URL goes through url().

export const base: string = __BASE_PATH__;

/** An app path ('/about') as the browser must request it. */
export const url = (path: string) => base + path;
