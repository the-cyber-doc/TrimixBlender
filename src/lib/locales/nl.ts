import type { Dict } from './en';

export const nl: Dict = {
	menu: {
		menu: 'Menu',
		language: 'Taal',
		blender: 'Mengen',
		preferences: 'Voorkeuren',
		about: 'Over'
	},
	section: {
		collapse: '{title} inklappen',
		gases: 'Beschikbare gassen',
		gasesSummary: '{used} van {total} in gebruik',
		target: 'Doelmengsel',
		mix: 'Te mengen',
		mixSummary: '{mix} tot {pressure}'
	},
	gases: {
		hint: 'Vink de gassen aan die het mengsel mag gebruiken. Hun druk beperkt hoe ver elk zonder booster kan vullen.',
		use: '{name} gebruiken',
		name: 'Naam',
		pressure: 'Druk',
		remove: 'Verwijderen',
		removeGas: '{name} verwijderen',
		invalid: 'O2 en He moeten samen 0 tot 100 % zijn, de druk 0 of meer.',
		none: 'Geen gas geregistreerd.',
		add: 'Gas toevoegen'
	},
	target: {
		mix: 'Mengsel',
		depth: 'Doeldiepte',
		optional: 'optioneel',
		ppo2Max: 'PPO2 max',
		needsDepth: 'vraagt een diepte',
		density: 'Gasdichtheid',
		endO2: 'END met O2 als narcotisch gerekend (Voorkeuren).',
		endN2: 'END met alleen N2 als narcotisch (Voorkeuren).',
		densityAtDepth: 'Gasdichtheid op {depth}:',
		densityAtMod: 'Gasdichtheid op de MOD ({mod}):',
		recommended: 'Aanbevolen ≤ {density} tot {depth};',
		maximum: 'maximum {density} op {depth}.'
	},
	problem: {
		o2: 'O2 moet meer dan 0 % en hoogstens 100 % zijn.',
		he: 'He moet van 0 % tot minder dan 100 % zijn.',
		sum: 'O2 en He zijn samen meer dan 100 %.',
		ppo2: 'De PPO2-limiet moet boven 0 liggen.',
		'depth-beyond-mod': 'De doeldiepte is dieper dan de MOD van dit mengsel.',
		hypoxic: 'Hypoxisch mengsel: niet ademhaalbaar aan de oppervlakte.',
		'density-recommended': 'De gasdichtheid op doeldiepte ligt boven de aanbevolen 5,2 g/l. Overweeg meer helium.',
		'density-maximum':
			'De gasdichtheid op doeldiepte ligt boven het absolute maximum van 6,2 g/l. Voeg helium toe of plan een ondiepere duik.'
	},
	mix: {
		cylinderNow: 'Fles nu',
		pressure: 'Druk',
		volume: 'Volume',
		currently: 'Nu {mix}. Volume: het watervolume van de fles.',
		target: 'Doel',
		targetPressure: 'Doeldruk',
		mix: 'Mengsel',
		density: 'Dichtheid',
		gasWhenFull: 'Gas bij volle fles',
		atDepth:
			'Partiële drukken en dichtheid op doeldiepte ({depth}). Gas bij volle fles: vrij gasvolume bij 1 bar en 15 °C.',
		atMod: 'Partiële drukken en dichtheid op de MOD. Gas bij volle fles: vrij gasvolume bij 1 bar en 15 °C.',
		compensated: 'Temperatuurgecompenseerd',
		fillTemperature: 'Flestemperatuur tijdens het vullen',
		compensatedHint:
			'De drukken hieronder gelden bij deze temperatuur; de doeldruk is bereikt zodra de fles weer 15 °C is.',
		o2From: 'O2 uit',
		heFrom: 'He uit',
		topWith: 'Bijvullen met',
		noGas: 'Geen gas in gebruik',
		setCylinder: 'Fles op {pressure} zetten',
		checkTarget: 'Controleer eerst het doelmengsel.',
		analyse: 'Analyseer het eindmengsel voor gebruik.',
		now: 'Nu',
		empty: 'Leeg'
	},
	error: {
		target: 'Controleer het doelmengsel.',
		targetPressure: 'Controleer de doeldruk.',
		volume: 'Controleer het flesvolume.',
		start: 'Controleer het mengsel in de fles.',
		startPressure: 'Controleer de druk in de fles.',
		temperature: 'Controleer de temperatuur.',
		missingO2: 'Geen O2-gas om mee te mengen: vink er een aan bij Beschikbare gassen.',
		missingHe: 'Geen He-gas om mee te mengen: vink er een aan bij Beschikbare gassen.',
		missingTop: 'Geen gas om bij te vullen: vink er een aan bij Beschikbare gassen.',
		impossible: 'Dit mengsel kan niet met de gekozen gassen gemaakt worden, zelfs niet vanuit een lege fles.',
		excessO2: 'Er zit te veel O2 in de fles voor dit mengsel.',
		excessHe: 'Er zit te veel He in de fles voor dit mengsel.',
		excessPressure: 'De fles zit al boven de doeldruk.',
		problemThen: '{problem} {todo}',
		drain: 'Laat hem eerst af tot {pressure}.',
		empty: 'Maak hem eerst leeg.',
		sourceO2:
			'Het O2-gas ({available}) ligt onder de {needed} die deze stap bereikt: gebruik een vollere bron of een booster.',
		sourceHe:
			'Het He-gas ({available}) ligt onder de {needed} die deze stap bereikt: gebruik een vollere bron of een booster.',
		sourceTop:
			'Het bijvulgas ({available}) ligt onder de {needed} die deze stap bereikt: gebruik een vollere bron of een booster.',
		outsideFit:
			'Buiten het bereik van de reële-gasgegevens (boven 350 bar, of onder −10 °C of boven 60 °C): het resultaat is minder nauwkeurig.'
	},
	preferences: {
		title: 'Voorkeuren',
		temperature: 'Temperatuur',
		pressure: 'Druk',
		volume: 'Volume',
		depth: 'Diepte',
		model: 'Gasmodel',
		real: 'Reële gassen (samendrukbaarheid uit NIST-gegevens)',
		ideal: 'Ideale gassen (klassieke partiële-drukmethode)',
		o2Narcotic: 'O2 is narcotisch (N2 + O2)',
		n2Only: 'Alleen N2',
		saved: 'Opgeslagen op dit apparaat. Diepten: 10 m zeewater per bar, of 33 ft per atm.'
	},
	about: {
		title: 'Over',
		intro:
			'Trimix Blender berekent partiële-drukmengsels van lucht, nitrox en trimix: hoeveel O2, dan He, dan bijvulgas er in een fles moet.',
		native: 'De app werkt volledig op je apparaat en gebruikt geen netwerk; er wordt niets verstuurd.',
		web: 'De app werkt volledig in je browser en offline na het laden; er wordt niets verstuurd.',
		danger:
			'Gas mengen is gevaarlijk: zuurstofbranden, verkeerde mengsels. Meng alleen als je daarvoor opgeleid bent, en analyseer het eindmengsel altijd voor je ermee duikt.',
		version: 'Versie {version}',
		built: 'Gebouwd op {date}',
		source: 'Broncode op GitHub',
		docker: 'Docker-image op Docker Hub',
		license: 'Gelicentieerd onder de GNU GPL v3',
		how: 'Hoe er gerekend wordt',
		howDalton: 'Partiële drukken, MOD en END: wet van Dalton, met 10 m zeewater per bar (33 ft per atm).',
		howMoles:
			'Het mengsel wordt in mol opgelost, gas per gas (O2, He en N2), zodat het ook voor reële gassen klopt. Manometerwaarden worden omgezet in absolute drukken; een lege fles bevat nog 1 atm van zijn gas.',
		howReal:
			'Reële gassen: de compressibiliteitsfactor Z van elk gas is gefit op NIST-referentiegegevens (−10 tot +60 °C, tot 350 bar); de Z van een mengsel volgt de wet van Amagat. Nauwkeurigheid van de fit: {accuracy}.',
		howTemperature:
			'Temperatuurcompensatie: de doeldruk is de druk bij 15 °C (de referentie van de werkdruk van een fles); de getoonde drukken gelden bij de vultemperatuur.',
		howSource: 'Elke formule staat met haar bron in {file}.',
		references: 'Bronnen'
	},
	update: {
		available: 'Er is een nieuwe versie van de app beschikbaar.',
		reload: 'Herladen',
		later: 'Later'
	}
};
