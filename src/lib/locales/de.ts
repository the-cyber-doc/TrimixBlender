import type { Dict } from './en';

export const de: Dict = {
	menu: {
		menu: 'Menü',
		language: 'Sprache',
		blender: 'Mischen',
		preferences: 'Einstellungen',
		about: 'Über'
	},
	section: {
		collapse: '{title} einklappen',
		gases: 'Verfügbare Gase',
		gasesSummary: '{used} von {total} in Gebrauch',
		target: 'Zielgemisch',
		mix: 'Zu mischen',
		mixSummary: '{mix} auf {pressure}'
	},
	gases: {
		hint: 'Wähle die Gase, die die Mischung verwenden darf. Ihr Druck begrenzt, wie weit jedes ohne Booster füllen kann.',
		use: '{name} verwenden',
		name: 'Name',
		pressure: 'Druck',
		remove: 'Entfernen',
		removeGas: '{name} entfernen',
		invalid: 'O2 und He müssen zusammen 0 bis 100 % ergeben, der Druck 0 oder mehr.',
		none: 'Kein Gas erfasst.',
		add: 'Gas hinzufügen'
	},
	target: {
		mix: 'Gemisch',
		depth: 'Zieltiefe',
		optional: 'optional',
		ppo2Max: 'PPO2 max',
		needsDepth: 'braucht eine Tiefe',
		density: 'Gasdichte',
		endO2: 'END mit O2 als narkotisch gerechnet (Einstellungen).',
		endN2: 'END nur mit N2 als narkotisch (Einstellungen).',
		densityAtDepth: 'Gasdichte auf {depth}:',
		densityAtMod: 'Gasdichte auf der MOD ({mod}):',
		recommended: 'Empfohlen ≤ {density} bis {depth};',
		maximum: 'Maximum {density} auf {depth}.'
	},
	problem: {
		o2: 'O2 muss über 0 % und höchstens 100 % sein.',
		he: 'He muss von 0 % bis unter 100 % sein.',
		sum: 'O2 und He ergeben zusammen mehr als 100 %.',
		ppo2: 'Das PPO2-Limit muss über 0 liegen.',
		'depth-beyond-mod': 'Die Zieltiefe liegt tiefer als die MOD dieses Gemischs.',
		hypoxic: 'Hypoxisches Gemisch: an der Oberfläche nicht atembar.',
		'density-recommended': 'Die Gasdichte auf Zieltiefe liegt über den empfohlenen 5,2 g/l. Mehr Helium erwägen.',
		'density-maximum':
			'Die Gasdichte auf Zieltiefe liegt über dem absoluten Maximum von 6,2 g/l. Helium zugeben oder flacher tauchen.'
	},
	mix: {
		cylinderNow: 'Flasche jetzt',
		pressure: 'Druck',
		volume: 'Volumen',
		currently: 'Derzeit {mix}. Volumen: das Wasservolumen der Flasche.',
		target: 'Ziel',
		targetPressure: 'Zieldruck',
		mix: 'Gemisch',
		density: 'Dichte',
		gasWhenFull: 'Gas bei voller Flasche',
		atDepth:
			'Partialdrücke und Dichte auf Zieltiefe ({depth}). Gas bei voller Flasche: entspanntes Gasvolumen bei 1 bar und 15 °C.',
		atMod: 'Partialdrücke und Dichte auf der MOD. Gas bei voller Flasche: entspanntes Gasvolumen bei 1 bar und 15 °C.',
		compensated: 'Temperaturkompensiert',
		fillTemperature: 'Flaschentemperatur beim Füllen',
		compensatedHint:
			'Die Drücke unten gelten bei dieser Temperatur; der Zieldruck ist erreicht, sobald die Flasche wieder 15 °C hat.',
		o2From: 'O2 aus',
		heFrom: 'He aus',
		topWith: 'Auffüllen mit',
		noGas: 'Kein Gas in Gebrauch',
		setCylinder: 'Flasche auf {pressure} setzen',
		checkTarget: 'Zuerst das Zielgemisch prüfen.',
		analyse: 'Das fertige Gemisch vor Gebrauch analysieren.',
		now: 'Jetzt',
		empty: 'Leer'
	},
	error: {
		target: 'Zielgemisch prüfen.',
		targetPressure: 'Zieldruck prüfen.',
		volume: 'Flaschenvolumen prüfen.',
		start: 'Gemisch in der Flasche prüfen.',
		startPressure: 'Druck in der Flasche prüfen.',
		temperature: 'Temperatur prüfen.',
		missingO2: 'Kein O2-Gas zum Mischen: eines unter Verfügbare Gase wählen.',
		missingHe: 'Kein He-Gas zum Mischen: eines unter Verfügbare Gase wählen.',
		missingTop: 'Kein Gas zum Auffüllen: eines unter Verfügbare Gase wählen.',
		impossible:
			'Dieses Gemisch lässt sich mit den gewählten Gasen nicht herstellen, auch nicht aus einer leeren Flasche.',
		excessO2: 'Für dieses Gemisch ist zu viel O2 in der Flasche.',
		excessHe: 'Für dieses Gemisch ist zu viel He in der Flasche.',
		excessPressure: 'Die Flasche liegt bereits über dem Zieldruck.',
		problemThen: '{problem} {todo}',
		drain: 'Zuerst auf {pressure} ablassen.',
		empty: 'Zuerst ganz leeren.',
		sourceO2:
			'Das O2-Gas ({available}) liegt unter den {needed}, die dieser Schritt erreicht: eine vollere Quelle oder einen Booster nehmen.',
		sourceHe:
			'Das He-Gas ({available}) liegt unter den {needed}, die dieser Schritt erreicht: eine vollere Quelle oder einen Booster nehmen.',
		sourceTop:
			'Das Auffüllgas ({available}) liegt unter den {needed}, die dieser Schritt erreicht: eine vollere Quelle oder einen Booster nehmen.',
		outsideFit:
			'Außerhalb des Bereichs der Realgas-Daten (über 350 bar, unter −10 °C oder über 60 °C): das Ergebnis ist ungenauer.'
	},
	preferences: {
		title: 'Einstellungen',
		temperature: 'Temperatur',
		pressure: 'Druck',
		volume: 'Volumen',
		depth: 'Tiefe',
		model: 'Gasmodell',
		real: 'Reale Gase (Kompressibilität aus NIST-Daten)',
		ideal: 'Ideale Gase (klassische Partialdruckmethode)',
		o2Narcotic: 'O2 ist narkotisch (N2 + O2)',
		n2Only: 'Nur N2',
		saved: 'Auf diesem Gerät gespeichert. Tiefen: 10 m Meerwasser pro bar, oder 33 ft pro atm.'
	},
	about: {
		title: 'Über',
		intro:
			'Trimix Blender berechnet Partialdruck-Mischungen von Luft, Nitrox und Trimix: wie viel O2, dann He, dann Auffüllgas in eine Flasche kommt.',
		native: 'Die App läuft vollständig auf deinem Gerät und braucht kein Netz; nichts wird irgendwohin gesendet.',
		web: 'Die App läuft vollständig in deinem Browser und funktioniert nach dem Laden offline; nichts wird irgendwohin gesendet.',
		danger:
			'Gasmischen ist gefährlich: Sauerstoffbrände, falsche Gemische. Nur mit entsprechender Ausbildung mischen, und das fertige Gemisch vor dem Tauchen immer analysieren.',
		version: 'Version {version}',
		built: 'Erstellt am {date}',
		source: 'Quellcode auf GitHub',
		docker: 'Docker-Image auf Docker Hub',
		license: 'Lizenziert unter der GNU GPL v3',
		how: 'Wie gerechnet wird',
		howDalton: 'Partialdrücke, MOD und END: Gesetz von Dalton, mit 10 m Meerwasser pro bar (33 ft pro atm).',
		howMoles:
			'Die Mischung wird in Mol gelöst, Gas für Gas (O2, He und N2), damit sie auch für reale Gase stimmt. Manometerwerte werden in Absolutdrücke umgerechnet; eine leere Flasche enthält noch 1 atm ihres Gases.',
		howReal:
			'Reale Gase: der Kompressibilitätsfaktor Z jedes Gases ist an NIST-Referenzdaten angepasst (−10 bis +60 °C, bis 350 bar); das Z eines Gemischs folgt dem Gesetz von Amagat. Genauigkeit der Anpassung: {accuracy}.',
		howTemperature:
			'Temperaturkompensation: der Zieldruck ist der Druck bei 15 °C (die Referenz des Nenndrucks einer Flasche); die angezeigten Drücke gelten bei der Fülltemperatur.',
		howSource: 'Jede Formel steht mit ihrer Quelle in {file}.',
		references: 'Quellen'
	},
	update: {
		available: 'Eine neue Version der App ist verfügbar.',
		reload: 'Neu laden',
		later: 'Später'
	}
};
