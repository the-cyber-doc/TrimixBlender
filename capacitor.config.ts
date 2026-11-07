// The Android and iOS apps (Capacitor): the web build of `npm run build:native` (build-native/,
// see vite.config.ts) inside a native web view. Self-contained: every file is in the app, served
// by the web view from the app itself; nothing is ever downloaded. The apps request no
// permission (android/app/src/main/AndroidManifest.xml removes even INTERNET; the iOS app has
// no usage description) and contain no tracker, analytics or Google/Apple service SDK.
//   npm run build:native   # build-native/, copied into android/ and ios/ (`cap sync`)
//   npx cap open android   # or ios: build and run from Android Studio / Xcode
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.dolphinslabs.trimixblender',
	appName: 'Trimix Blender',
	webDir: 'build-native',
	// Links out of the app (GitHub, references) open in the system browser: Capacitor does that
	// for every URL that is not the app's own.
	loggingBehavior: 'none',
	android: {
		// Release builds cannot be inspected with chrome://inspect (debug builds can).
		webContentsDebuggingEnabled: false,
		allowMixedContent: false
	},
	ios: {
		// The page stays clear of the notch and the home indicator.
		contentInset: 'automatic',
		webContentsDebuggingEnabled: false
	},
	plugins: {
		// The web view is padded clear of the system bars, as on iOS (the page has no viewport-fit=cover).
		SystemBars: { insetsHandling: 'native' },
		// Capacitor's native HTTP and cookie bridges: unused, off.
		CapacitorHttp: { enabled: false },
		CapacitorCookies: { enabled: false }
	}
};

export default config;
