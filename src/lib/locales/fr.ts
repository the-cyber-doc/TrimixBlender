import type { Dict } from './en';

export const fr: Dict = {
	menu: {
		menu: 'Menu',
		language: 'Langue',
		blender: 'Gonflage',
		preferences: 'Préférences',
		about: 'À propos'
	},
	section: {
		collapse: 'Replier {title}',
		gases: 'Gaz disponibles',
		gasesSummary: '{used} sur {total} utilisés',
		target: 'Mélange cible',
		mix: 'Mélange à faire',
		mixSummary: '{mix} à {pressure}'
	},
	gases: {
		hint: 'Cochez les gaz que le mélange peut utiliser. Leur pression limite ce que chacun peut gonfler sans surpresseur.',
		use: 'Utiliser {name}',
		name: 'Nom',
		pressure: 'Pression',
		remove: 'Supprimer',
		removeGas: 'Supprimer {name}',
		invalid: 'O2 et He doivent faire de 0 à 100 % au total, la pression 0 ou plus.',
		none: 'Aucun gaz enregistré.',
		add: 'Ajouter un gaz'
	},
	target: {
		mix: 'Mélange',
		depth: 'Profondeur cible',
		optional: 'facultatif',
		ppo2Max: 'PPO2 max',
		needsDepth: 'il faut une profondeur',
		density: 'Densité du gaz',
		endO2: "END avec l'O2 compté comme narcotique (Préférences).",
		endN2: 'END avec le N2 seul comme narcotique (Préférences).',
		densityAtDepth: 'Densité du gaz à {depth} :',
		densityAtMod: 'Densité du gaz à la MOD ({mod}) :',
		recommended: 'Recommandé ≤ {density} jusqu’à {depth} ;',
		maximum: 'maximum {density} à {depth}.'
	},
	problem: {
		o2: "L'O2 doit être supérieur à 0 % et au plus 100 %.",
		he: "L'He doit être de 0 % à moins de 100 %.",
		sum: 'O2 et He font plus de 100 % au total.',
		ppo2: 'La limite de PPO2 doit être supérieure à 0.',
		'depth-beyond-mod': 'La profondeur cible est plus profonde que la MOD de ce mélange.',
		hypoxic: 'Mélange hypoxique : non respirable en surface.',
		'density-recommended':
			'La densité du gaz à la profondeur cible dépasse les 5,2 g/l recommandés. Envisagez plus d’hélium.',
		'density-maximum':
			'La densité du gaz à la profondeur cible dépasse le maximum absolu de 6,2 g/l. Ajoutez de l’hélium ou prévoyez une plongée moins profonde.'
	},
	mix: {
		cylinderNow: 'Bloc actuel',
		pressure: 'Pression',
		volume: 'Volume',
		currently: 'Actuellement {mix}. Volume : le volume en eau du bloc.',
		target: 'Cible',
		targetPressure: 'Pression cible',
		mix: 'Mélange',
		density: 'Densité',
		gasWhenFull: 'Gaz une fois plein',
		atDepth:
			'Pressions partielles et densité à la profondeur cible ({depth}). Gaz une fois plein : volume de gaz détendu à 1 bar et 15 °C.',
		atMod: 'Pressions partielles et densité à la MOD. Gaz une fois plein : volume de gaz détendu à 1 bar et 15 °C.',
		compensated: 'Compensation de température',
		fillTemperature: 'Température du bloc pendant le gonflage',
		compensatedHint:
			'Les pressions ci-dessous se lisent à cette température ; la pression cible est atteinte une fois le bloc revenu à 15 °C.',
		o2From: 'O2 depuis',
		heFrom: 'He depuis',
		topWith: 'Compléter avec',
		noGas: 'Aucun gaz utilisé',
		setCylinder: 'Mettre le bloc à {pressure}',
		checkTarget: 'Vérifiez d’abord le mélange cible.',
		analyse: 'Analysez le mélange final avant usage.',
		now: 'Actuel',
		empty: 'Vide'
	},
	error: {
		target: 'Vérifiez le mélange cible.',
		targetPressure: 'Vérifiez la pression cible.',
		volume: 'Vérifiez le volume du bloc.',
		start: 'Vérifiez le mélange dans le bloc.',
		startPressure: 'Vérifiez la pression dans le bloc.',
		temperature: 'Vérifiez la température.',
		missingO2: 'Aucun gaz O2 pour le mélange : cochez-en un dans Gaz disponibles.',
		missingHe: 'Aucun gaz He pour le mélange : cochez-en un dans Gaz disponibles.',
		missingTop: 'Aucun gaz de complément pour le mélange : cochez-en un dans Gaz disponibles.',
		impossible: 'Ce mélange ne peut pas être fait avec les gaz choisis, même à partir d’un bloc vide.',
		excessO2: "Il y a trop d'O2 dans le bloc pour ce mélange.",
		excessHe: "Il y a trop d'He dans le bloc pour ce mélange.",
		excessPressure: 'Le bloc est déjà au-dessus de la pression cible.',
		problemThen: '{problem} {todo}',
		drain: 'Videz-le d’abord jusqu’à {pressure}.',
		empty: 'Videz-le d’abord complètement.',
		sourceO2:
			'Le gaz O2 ({available}) est en dessous des {needed} de cette étape : prenez une source plus pleine ou un surpresseur.',
		sourceHe:
			'Le gaz He ({available}) est en dessous des {needed} de cette étape : prenez une source plus pleine ou un surpresseur.',
		sourceTop:
			'Le gaz de complément ({available}) est en dessous des {needed} de cette étape : prenez une source plus pleine ou un surpresseur.',
		outsideFit:
			'Hors du domaine des données de gaz réels (au-dessus de 350 bar, ou en dessous de −10 °C ou au-dessus de 60 °C) : le résultat est moins précis.'
	},
	preferences: {
		title: 'Préférences',
		temperature: 'Température',
		pressure: 'Pression',
		volume: 'Volume',
		depth: 'Profondeur',
		model: 'Modèle de gaz',
		real: 'Gaz réels (compressibilité des données NIST)',
		ideal: 'Gaz parfaits (méthode classique des pressions partielles)',
		o2Narcotic: "L'O2 est narcotique (N2 + O2)",
		n2Only: 'N2 seul',
		saved: 'Enregistré sur cet appareil. Profondeurs : 10 m d’eau de mer par bar, ou 33 ft par atm.'
	},
	about: {
		title: 'À propos',
		intro:
			'Trimix Blender calcule les mélanges par pressions partielles d’air, de nitrox et de trimix : combien d’O2, puis d’He, puis de gaz de complément ajouter dans un bloc.',
		native: 'Elle fonctionne entièrement sur votre appareil, sans réseau ; rien n’est envoyé nulle part.',
		web: 'Elle fonctionne entièrement dans votre navigateur, hors ligne une fois chargée ; rien n’est envoyé nulle part.',
		danger:
			'Le gonflage de mélanges est dangereux : feux d’oxygène, mélanges erronés. Ne gonflez que si vous êtes formé, et analysez toujours le mélange final avant de plonger avec.',
		version: 'Version {version}',
		built: 'Compilée le {date}',
		source: 'Code source sur GitHub',
		docker: 'Image Docker sur Docker Hub',
		license: 'Sous licence GNU GPL v3',
		how: 'Méthode de calcul',
		howDalton: 'Pressions partielles, MOD et END : loi de Dalton, avec 10 m d’eau de mer par bar (33 ft par atm).',
		howMoles:
			'Le mélange est résolu en moles, gaz par gaz (O2, He et N2), pour rester juste avec des gaz réels. Les lectures du manomètre sont converties en pressions absolues ; un bloc vide contient encore 1 atm de son gaz.',
		howReal:
			'Gaz réels : le facteur de compressibilité Z de chaque gaz est ajusté sur les données de référence du NIST (−10 à +60 °C, jusqu’à 350 bar) ; le Z d’un mélange suit la loi d’Amagat. Précision de l’ajustement : {accuracy}.',
		howTemperature:
			'Compensation de température : la pression cible est la pression à 15 °C (la référence de la pression de service d’un bloc) ; les pressions affichées se lisent à la température de gonflage.',
		howSource: 'Chaque formule, avec sa source, est dans {file}.',
		references: 'Références'
	},
	update: {
		available: 'Une nouvelle version de l’application est disponible.',
		reload: 'Recharger',
		later: 'Plus tard'
	}
};
