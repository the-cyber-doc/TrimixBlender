import type { Dict } from './en';

export const it: Dict = {
	menu: {
		menu: 'Menu',
		language: 'Lingua',
		blender: 'Miscele',
		preferences: 'Preferenze',
		about: 'Informazioni'
	},
	section: {
		collapse: 'Comprimi {title}',
		gases: 'Gas disponibili',
		gasesSummary: '{used} di {total} in uso',
		target: 'Miscela obiettivo',
		mix: 'Miscela da preparare',
		mixSummary: '{mix} a {pressure}'
	},
	gases: {
		hint: 'Seleziona i gas che la miscela può usare. La loro pressione limita quanto ciascuno può caricare senza booster.',
		use: 'Usa {name}',
		name: 'Nome',
		pressure: 'Pressione',
		remove: 'Rimuovi',
		removeGas: 'Rimuovi {name}',
		invalid: 'O2 e He devono essere da 0 a 100 % in totale, la pressione 0 o più.',
		none: 'Nessun gas registrato.',
		add: 'Aggiungi un gas'
	},
	target: {
		mix: 'Miscela',
		depth: 'Profondità obiettivo',
		optional: 'facoltativa',
		ppo2Max: 'PPO2 max',
		needsDepth: 'serve una profondità',
		density: 'Densità del gas',
		endO2: "END con l'O2 considerato narcotico (Preferenze).",
		endN2: 'END con solo N2 narcotico (Preferenze).',
		densityAtDepth: 'Densità del gas a {depth}:',
		densityAtMod: 'Densità del gas alla MOD ({mod}):',
		recommended: 'Consigliata ≤ {density} fino a {depth};',
		maximum: 'massima {density} a {depth}.'
	},
	problem: {
		o2: "L'O2 deve essere più di 0 % e al massimo 100 %.",
		he: "L'He deve essere da 0 % a meno di 100 %.",
		sum: 'O2 e He sommano più di 100 %.',
		ppo2: 'Il limite di PPO2 deve essere maggiore di 0.',
		'depth-beyond-mod': 'La profondità obiettivo è oltre la MOD di questa miscela.',
		hypoxic: 'Miscela ipossica: non respirabile in superficie.',
		'density-recommended':
			'La densità del gas alla profondità obiettivo supera i 5,2 g/l consigliati. Valuta più elio.',
		'density-maximum':
			'La densità del gas alla profondità obiettivo supera il massimo assoluto di 6,2 g/l. Aggiungi elio o pianifica un’immersione meno profonda.'
	},
	mix: {
		cylinderNow: 'Bombola ora',
		pressure: 'Pressione',
		volume: 'Volume',
		currently: 'Ora {mix}. Volume: il volume d’acqua della bombola.',
		target: 'Obiettivo',
		targetPressure: 'Pressione obiettivo',
		mix: 'Miscela',
		density: 'Densità',
		gasWhenFull: 'Gas a pieno',
		atDepth:
			'Pressioni parziali e densità alla profondità obiettivo ({depth}). Gas a pieno: volume di gas libero a 1 bar e 15 °C.',
		atMod: 'Pressioni parziali e densità alla MOD. Gas a pieno: volume di gas libero a 1 bar e 15 °C.',
		compensated: 'Compensazione della temperatura',
		fillTemperature: 'Temperatura della bombola durante la ricarica',
		compensatedHint:
			'Le pressioni qui sotto si leggono a questa temperatura; la pressione obiettivo è raggiunta quando la bombola torna a 15 °C.',
		o2From: 'O2 da',
		heFrom: 'He da',
		topWith: 'Rabbocca con',
		noGas: 'Nessun gas in uso',
		setCylinder: 'Porta la bombola a {pressure}',
		checkTarget: 'Controlla prima la miscela obiettivo.',
		analyse: 'Analizza la miscela finale prima dell’uso.',
		now: 'Ora',
		empty: 'Vuota'
	},
	error: {
		target: 'Controlla la miscela obiettivo.',
		targetPressure: 'Controlla la pressione obiettivo.',
		volume: 'Controlla il volume della bombola.',
		start: 'Controlla la miscela nella bombola.',
		startPressure: 'Controlla la pressione nella bombola.',
		temperature: 'Controlla la temperatura.',
		missingO2: 'Nessun gas O2 per la miscela: selezionane uno in Gas disponibili.',
		missingHe: 'Nessun gas He per la miscela: selezionane uno in Gas disponibili.',
		missingTop: 'Nessun gas per il rabbocco: selezionane uno in Gas disponibili.',
		impossible: 'Questa miscela non si può preparare con i gas scelti, nemmeno da una bombola vuota.',
		excessO2: 'C’è troppo O2 nella bombola per questa miscela.',
		excessHe: 'C’è troppo He nella bombola per questa miscela.',
		excessPressure: 'La bombola è già sopra la pressione obiettivo.',
		problemThen: '{problem} {todo}',
		drain: 'Prima svuotala fino a {pressure}.',
		empty: 'Prima svuotala del tutto.',
		sourceO2:
			'Il gas O2 ({available}) è sotto i {needed} che raggiunge questo passo: usa una sorgente più carica o un booster.',
		sourceHe:
			'Il gas He ({available}) è sotto i {needed} che raggiunge questo passo: usa una sorgente più carica o un booster.',
		sourceTop:
			'Il gas di rabbocco ({available}) è sotto i {needed} che raggiunge questo passo: usa una sorgente più carica o un booster.',
		outsideFit:
			'Fuori dall’intervallo dei dati dei gas reali (oltre 350 bar, o sotto −10 °C o sopra 60 °C): il risultato è meno preciso.'
	},
	preferences: {
		title: 'Preferenze',
		temperature: 'Temperatura',
		pressure: 'Pressione',
		volume: 'Volume',
		depth: 'Profondità',
		model: 'Modello di gas',
		real: 'Gas reali (comprimibilità dai dati NIST)',
		ideal: 'Gas ideali (metodo classico delle pressioni parziali)',
		o2Narcotic: "L'O2 è narcotico (N2 + O2)",
		n2Only: 'Solo N2',
		saved: 'Salvato su questo dispositivo. Profondità: 10 m di acqua di mare per bar, o 33 ft per atm.'
	},
	about: {
		title: 'Informazioni',
		intro:
			'Trimix Blender calcola le miscele per pressioni parziali di aria, nitrox e trimix: quanto O2, poi He, poi gas di rabbocco aggiungere in una bombola.',
		native: 'Funziona interamente sul tuo dispositivo e non usa la rete; nulla viene inviato.',
		web: 'Funziona interamente nel tuo browser e offline una volta caricata; nulla viene inviato.',
		danger:
			'Miscelare gas è pericoloso: incendi da ossigeno, miscele sbagliate. Miscela solo se sei addestrato, e analizza sempre la miscela finale prima di immergerti.',
		version: 'Versione {version}',
		built: 'Compilata il {date}',
		source: 'Codice sorgente su GitHub',
		docker: 'Immagine Docker su Docker Hub',
		license: 'Con licenza GNU GPL v3',
		how: 'Come calcola',
		howDalton: 'Pressioni parziali, MOD ed END: legge di Dalton, con 10 m di acqua di mare per bar (33 ft per atm).',
		howMoles:
			'La miscela è risolta in moli, gas per gas (O2, He e N2), così vale anche per i gas reali. Le letture del manometro sono convertite in pressioni assolute; una bombola vuota contiene ancora 1 atm del suo gas.',
		howReal:
			'Gas reali: il fattore di comprimibilità Z di ogni gas è adattato ai dati di riferimento NIST (da −10 a +60 °C, fino a 350 bar); lo Z di una miscela segue la legge di Amagat. Precisione dell’adattamento: {accuracy}.',
		howTemperature:
			'Compensazione della temperatura: la pressione obiettivo è la pressione a 15 °C (il riferimento della pressione nominale di una bombola); le pressioni mostrate si leggono alla temperatura di ricarica.',
		howSource: 'Ogni formula, con la sua fonte, è in {file}.',
		references: 'Riferimenti'
	},
	update: {
		available: 'È disponibile una nuova versione dell’app.',
		reload: 'Ricarica',
		later: 'Più tardi'
	}
};
