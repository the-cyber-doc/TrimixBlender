// The app's reactive state: the preferences and the current blend, loaded from this device
// and saved on every change (persist(), called once by the root layout).

import { PREFERENCES_KEY, STATE_KEY, load, parsePreferences, parseState, save } from './storage';

export const preferences = $state(parsePreferences(load(PREFERENCES_KEY)));
export const app = $state(parseState(load(STATE_KEY)));

/** Saves both whenever they change. Call from a component (it needs an effect context). */
export function persist() {
	$effect(() => save(PREFERENCES_KEY, $state.snapshot(preferences)));
	$effect(() => save(STATE_KEY, $state.snapshot(app)));
}
