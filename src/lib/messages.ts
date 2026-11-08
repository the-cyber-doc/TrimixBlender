// What the app tells the user about a blend or a target: errors, with what to do, and warnings.
// In the current language (i18n.ts).

import type { BlendError, Warning } from './blend';
import { fill, t } from './i18n';
import type { TargetProblem } from './target';
import { formatDown, pressureQuantity, format, type Preferences } from './units';

const MISSING = { o2: 'missingO2', he: 'missingHe', top: 'missingTop' } as const;
const SOURCE = { o2: 'sourceO2', he: 'sourceHe', top: 'sourceTop' } as const;
const EXCESS = { o2: 'excessO2', he: 'excessHe', pressure: 'excessPressure' } as const;

/** Why the blend cannot be done, and what to do. */
export function blendErrorText(error: BlendError, prefs: Preferences): string {
	const bar = pressureQuantity(prefs);
	switch (error.code) {
		case 'invalid':
			return t.error[error.field];
		case 'missing-source':
			return t.error[MISSING[error.role]];
		case 'impossible':
			return t.error.impossible;
		case 'drain': {
			const what = t.error[EXCESS[error.excess]];
			const todo =
				error.drainTo > 0 ? fill(t.error.drain, { pressure: formatDown(bar, error.drainTo) }) : t.error.empty;
			return fill(t.error.problemThen, { problem: what, todo });
		}
		case 'source-pressure':
			return fill(t.error[SOURCE[error.role]], {
				available: format(bar, error.available),
				needed: format(bar, error.needed)
			});
	}
}

const WARNING = { 'outside-fit': 'outsideFit' } as const satisfies Record<Warning, keyof typeof t.error>;

export const warningText = (warning: Warning): string => t.error[WARNING[warning]];

export const targetText = (problem: TargetProblem): string => t.problem[problem];
