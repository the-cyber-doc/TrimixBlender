// What the app tells the user about a blend or a target: errors, with what to do, and warnings.

import type { BlendError, Warning } from './blend';
import type { TargetProblem } from './target';
import { formatDown, pressureQuantity, format, type Preferences } from './units';

const ROLE = { o2: 'O2', he: 'He', top: 'top-up' } as const;

const FIELD = {
	target: 'the target mix',
	targetPressure: 'the target pressure',
	volume: 'the cylinder volume',
	start: 'the mix in the cylinder',
	startPressure: 'the pressure in the cylinder',
	temperature: 'the temperature'
} as const;

const EXCESS = {
	o2: 'There is too much O2 in the cylinder for this mix.',
	he: 'There is too much He in the cylinder for this mix.',
	pressure: 'The cylinder is already above the target pressure.'
} as const;

/** Why the blend cannot be done, and what to do. */
export function blendErrorText(error: BlendError, prefs: Preferences): string {
	const bar = pressureQuantity(prefs);
	switch (error.code) {
		case 'invalid':
			return `Check ${FIELD[error.field]}.`;
		case 'missing-source':
			return `No ${ROLE[error.role]} gas to blend with: check one in Available gases.`;
		case 'impossible':
			return 'This mix cannot be made from the selected gases, even from an empty cylinder.';
		case 'drain':
			return error.drainTo > 0
				? `${EXCESS[error.excess]} Drain it down to ${formatDown(bar, error.drainTo)} first.`
				: `${EXCESS[error.excess]} Empty it first.`;
		case 'source-pressure':
			return (
				`The ${ROLE[error.role]} gas (${format(bar, error.available)}) is below the ` +
				`${format(bar, error.needed)} this step reaches: use a fuller source or a booster.`
			);
	}
}

export const WARNING_TEXT: Record<Warning, string> = {
	'outside-fit':
		'Outside the range of the real-gas data (above 350 bar, or below −10 °C or above 60 °C): the result is less accurate.'
};

export const TARGET_TEXT: Record<TargetProblem, string> = {
	o2: 'O2 must be more than 0 % and at most 100 %.',
	he: 'He must be from 0 % to less than 100 %.',
	sum: 'O2 and He add up to more than 100 %.',
	ppo2: 'The PPO2 limit must be above 0.',
	'depth-beyond-mod': 'The target depth is deeper than the MOD of this mix.',
	hypoxic: 'Hypoxic mix: not breathable at the surface.'
};
