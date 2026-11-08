// English: the reference. Every other language has exactly these keys (the Dict type) and the
// same {placeholders} in each text (i18n.test.ts). Not translated anywhere: chemical names
// (O2, He, N2, PPO2…), MOD and END, mix names (Air, Nx32, Tx21/35) and units.

export const en = {
	menu: {
		menu: 'Menu',
		language: 'Language',
		blender: 'Blender',
		preferences: 'Preferences',
		about: 'About'
	},
	section: {
		collapse: 'Collapse {title}',
		gases: 'Available gases',
		gasesSummary: '{used} of {total} in use',
		target: 'Target mix',
		mix: 'Mix to do',
		mixSummary: '{mix} to {pressure}'
	},
	gases: {
		hint: 'Check the gases the blend may use. Their pressure limits what each one can fill without a booster.',
		use: 'Use {name}',
		name: 'Name',
		pressure: 'Pressure',
		remove: 'Remove',
		removeGas: 'Remove {name}',
		invalid: 'O2 and He must be from 0 to 100 % in total, the pressure 0 or more.',
		none: 'No gas registered.',
		add: 'Add a gas'
	},
	target: {
		mix: 'Mix',
		depth: 'Target depth',
		optional: 'optional',
		ppo2Max: 'PPO2 max',
		needsDepth: 'needs a depth',
		density: 'Gas density',
		endO2: 'END with O2 counted as narcotic (Preferences).',
		endN2: 'END with N2 only as narcotic (Preferences).',
		densityAtDepth: 'Gas density at {depth}:',
		densityAtMod: 'Gas density at the MOD ({mod}):',
		recommended: 'Recommended ≤ {density} down to {depth};',
		maximum: 'maximum {density} at {depth}.'
	},
	problem: {
		o2: 'O2 must be more than 0 % and at most 100 %.',
		he: 'He must be from 0 % to less than 100 %.',
		sum: 'O2 and He add up to more than 100 %.',
		ppo2: 'The PPO2 limit must be above 0.',
		'depth-beyond-mod': 'The target depth is deeper than the MOD of this mix.',
		hypoxic: 'Hypoxic mix: not breathable at the surface.',
		'density-recommended': 'Gas density at the target depth is above the recommended 5.2 g/l. Consider more helium.',
		'density-maximum':
			'Gas density at the target depth is above the 6.2 g/l absolute maximum. Add helium or plan a shallower dive.'
	},
	mix: {
		cylinderNow: 'Cylinder now',
		pressure: 'Pressure',
		volume: 'Volume',
		currently: "Currently {mix}. Volume: the cylinder's water volume.",
		target: 'Target',
		targetPressure: 'Target pressure',
		mix: 'Mix',
		density: 'Density',
		gasWhenFull: 'Gas when full',
		atDepth:
			'Partial pressures and density at the target depth ({depth}). Gas when full: free gas volume at 1 bar and 15 °C.',
		atMod: 'Partial pressures and density at the MOD. Gas when full: free gas volume at 1 bar and 15 °C.',
		compensated: 'Temperature compensated',
		fillTemperature: 'Cylinder temperature while filling',
		compensatedHint:
			'The pressures below are read at this temperature; the target pressure is reached once the cylinder is back at 15 °C.',
		o2From: 'O2 from',
		heFrom: 'He from',
		topWith: 'Top up with',
		noGas: 'No gas in use',
		setCylinder: 'Set the cylinder to {pressure}',
		checkTarget: 'Check the target mix first.',
		analyse: 'Check the final mix with an analyser before use.',
		now: 'Now',
		empty: 'Empty'
	},
	error: {
		target: 'Check the target mix.',
		targetPressure: 'Check the target pressure.',
		volume: 'Check the cylinder volume.',
		start: 'Check the mix in the cylinder.',
		startPressure: 'Check the pressure in the cylinder.',
		temperature: 'Check the temperature.',
		missingO2: 'No O2 gas to blend with: check one in Available gases.',
		missingHe: 'No He gas to blend with: check one in Available gases.',
		missingTop: 'No top-up gas to blend with: check one in Available gases.',
		impossible: 'This mix cannot be made from the selected gases, even from an empty cylinder.',
		excessO2: 'There is too much O2 in the cylinder for this mix.',
		excessHe: 'There is too much He in the cylinder for this mix.',
		excessPressure: 'The cylinder is already above the target pressure.',
		problemThen: '{problem} {todo}',
		drain: 'Drain it down to {pressure} first.',
		empty: 'Empty it first.',
		sourceO2: 'The O2 gas ({available}) is below the {needed} this step reaches: use a fuller source or a booster.',
		sourceHe: 'The He gas ({available}) is below the {needed} this step reaches: use a fuller source or a booster.',
		sourceTop:
			'The top-up gas ({available}) is below the {needed} this step reaches: use a fuller source or a booster.',
		outsideFit:
			'Outside the range of the real-gas data (above 350 bar, or below −10 °C or above 60 °C): the result is less accurate.'
	},
	preferences: {
		title: 'Preferences',
		temperature: 'Temperature',
		pressure: 'Pressure',
		volume: 'Volume',
		depth: 'Depth',
		model: 'Gas model',
		real: 'Real gases (compressibility from NIST data)',
		ideal: 'Ideal gases (classic partial-pressure method)',
		o2Narcotic: 'O2 is narcotic (N2 + O2)',
		n2Only: 'N2 only',
		saved: 'Saved on this device. Depths use 10 m of seawater per bar, or 33 ft per atm.'
	},
	about: {
		title: 'About',
		intro:
			'Trimix Blender works out partial-pressure blends of air, nitrox and trimix: how much O2, then He, then top-up gas to add to a cylinder.',
		native: 'It runs entirely on your device and needs no network; nothing is sent anywhere.',
		web: 'It runs entirely in your browser and works offline once loaded; nothing is sent anywhere.',
		danger:
			'Gas blending is dangerous: oxygen fires, wrong mixes. Only blend if you are trained to, and always analyse the final mix before diving it.',
		version: 'Version {version}',
		built: 'Built on {date}',
		source: 'Source code on GitHub',
		docker: 'Docker image on Docker Hub',
		license: 'Licensed under the GNU GPL v3',
		how: 'How it calculates',
		howDalton: "Partial pressures, MOD and END: Dalton's law, with 10 m of seawater per bar (33 ft per atm).",
		howMoles:
			'The blend is solved in moles, gas by gas (O2, He and N2), so that it holds for real gases. Gauge readings are turned into absolute pressures; an empty cylinder still holds 1 atm of its gas.',
		howReal:
			"Real gases: each gas's compressibility factor Z is fitted to NIST reference data (−10 to +60 °C, up to 350 bar); a mix's Z follows Amagat's law. Fit accuracy: {accuracy}.",
		howTemperature:
			"Temperature compensation: the target pressure is the pressure at 15 °C (the reference of a cylinder's rated pressure); the pressures shown are read at the filling temperature.",
		howSource: 'Every formula, with its source, is in {file}.',
		references: 'References'
	},
	update: {
		available: 'A new version of the app is available.',
		reload: 'Reload',
		later: 'Later'
	}
};

export type Dict = typeof en;
