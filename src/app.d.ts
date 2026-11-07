// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	/** Version, commit and date of the build (vite.config.ts): use $lib/about.ts. */
	const __APP_VERSION__: string;
	const __APP_BUILD__: string;
	const __BUILD_DATE__: string;
	/** The Android / iOS app's build (APP_TARGET=native): use $lib/about.ts NATIVE. */
	const __APP_NATIVE__: boolean;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
