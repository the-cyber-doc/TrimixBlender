import type { Dict } from './en';

export const es: Dict = {
	menu: {
		menu: 'Menú',
		language: 'Idioma',
		blender: 'Mezclas',
		preferences: 'Preferencias',
		about: 'Acerca de'
	},
	section: {
		collapse: 'Contraer {title}',
		gases: 'Gases disponibles',
		gasesSummary: '{used} de {total} en uso',
		target: 'Mezcla objetivo',
		mix: 'Mezcla a preparar',
		mixSummary: '{mix} a {pressure}'
	},
	gases: {
		hint: 'Marca los gases que puede usar la mezcla. Su presión limita lo que cada uno puede llenar sin booster.',
		use: 'Usar {name}',
		name: 'Nombre',
		pressure: 'Presión',
		remove: 'Quitar',
		removeGas: 'Quitar {name}',
		invalid: 'O2 y He deben sumar de 0 a 100 %, la presión 0 o más.',
		none: 'Ningún gas registrado.',
		add: 'Añadir un gas'
	},
	target: {
		mix: 'Mezcla',
		depth: 'Profundidad objetivo',
		optional: 'opcional',
		ppo2Max: 'PPO2 máx.',
		needsDepth: 'requiere una profundidad',
		density: 'Densidad del gas',
		endO2: 'END con el O2 contado como narcótico (Preferencias).',
		endN2: 'END con solo el N2 como narcótico (Preferencias).',
		densityAtDepth: 'Densidad del gas a {depth}:',
		densityAtMod: 'Densidad del gas a la MOD ({mod}):',
		recommended: 'Recomendado ≤ {density} hasta {depth};',
		maximum: 'máximo {density} a {depth}.'
	},
	problem: {
		o2: 'El O2 debe ser mayor que 0 % y como mucho 100 %.',
		he: 'El He debe ser de 0 % a menos de 100 %.',
		sum: 'O2 y He suman más de 100 %.',
		ppo2: 'El límite de PPO2 debe ser mayor que 0.',
		'depth-beyond-mod': 'La profundidad objetivo es mayor que la MOD de esta mezcla.',
		hypoxic: 'Mezcla hipóxica: no respirable en superficie.',
		'density-recommended':
			'La densidad del gas a la profundidad objetivo supera los 5,2 g/l recomendados. Considera más helio.',
		'density-maximum':
			'La densidad del gas a la profundidad objetivo supera el máximo absoluto de 6,2 g/l. Añade helio o planifica una inmersión menos profunda.'
	},
	mix: {
		cylinderNow: 'Botella ahora',
		pressure: 'Presión',
		volume: 'Volumen',
		currently: 'Ahora {mix}. Volumen: el volumen de agua de la botella.',
		target: 'Objetivo',
		targetPressure: 'Presión objetivo',
		mix: 'Mezcla',
		density: 'Densidad',
		gasWhenFull: 'Gas al llenar',
		atDepth:
			'Presiones parciales y densidad a la profundidad objetivo ({depth}). Gas al llenar: volumen de gas libre a 1 bar y 15 °C.',
		atMod: 'Presiones parciales y densidad a la MOD. Gas al llenar: volumen de gas libre a 1 bar y 15 °C.',
		compensated: 'Compensación de temperatura',
		fillTemperature: 'Temperatura de la botella al llenar',
		compensatedHint:
			'Las presiones de abajo se leen a esta temperatura; la presión objetivo se alcanza cuando la botella vuelve a 15 °C.',
		o2From: 'O2 de',
		heFrom: 'He de',
		topWith: 'Completar con',
		noGas: 'Ningún gas en uso',
		setCylinder: 'Poner la botella a {pressure}',
		checkTarget: 'Revisa primero la mezcla objetivo.',
		analyse: 'Analiza la mezcla final antes de usarla.',
		now: 'Ahora',
		empty: 'Vacía'
	},
	error: {
		target: 'Revisa la mezcla objetivo.',
		targetPressure: 'Revisa la presión objetivo.',
		volume: 'Revisa el volumen de la botella.',
		start: 'Revisa la mezcla de la botella.',
		startPressure: 'Revisa la presión de la botella.',
		temperature: 'Revisa la temperatura.',
		missingO2: 'No hay gas O2 para mezclar: marca uno en Gases disponibles.',
		missingHe: 'No hay gas He para mezclar: marca uno en Gases disponibles.',
		missingTop: 'No hay gas para completar: marca uno en Gases disponibles.',
		impossible: 'Esta mezcla no se puede preparar con los gases elegidos, ni siquiera desde una botella vacía.',
		excessO2: 'Hay demasiado O2 en la botella para esta mezcla.',
		excessHe: 'Hay demasiado He en la botella para esta mezcla.',
		excessPressure: 'La botella ya está por encima de la presión objetivo.',
		problemThen: '{problem} {todo}',
		drain: 'Vacíala primero hasta {pressure}.',
		empty: 'Vacíala primero del todo.',
		sourceO2:
			'El gas O2 ({available}) está por debajo de los {needed} que alcanza este paso: usa una fuente más llena o un booster.',
		sourceHe:
			'El gas He ({available}) está por debajo de los {needed} que alcanza este paso: usa una fuente más llena o un booster.',
		sourceTop:
			'El gas para completar ({available}) está por debajo de los {needed} que alcanza este paso: usa una fuente más llena o un booster.',
		outsideFit:
			'Fuera del rango de los datos de gases reales (más de 350 bar, o menos de −10 °C o más de 60 °C): el resultado es menos preciso.'
	},
	preferences: {
		title: 'Preferencias',
		temperature: 'Temperatura',
		pressure: 'Presión',
		volume: 'Volumen',
		depth: 'Profundidad',
		model: 'Modelo de gas',
		real: 'Gases reales (compresibilidad de datos NIST)',
		ideal: 'Gases ideales (método clásico de presiones parciales)',
		o2Narcotic: 'El O2 es narcótico (N2 + O2)',
		n2Only: 'Solo N2',
		saved: 'Guardado en este dispositivo. Profundidades: 10 m de agua de mar por bar, o 33 ft por atm.'
	},
	about: {
		title: 'Acerca de',
		intro:
			'Trimix Blender calcula mezclas por presiones parciales de aire, nitrox y trimix: cuánto O2, luego He, luego gas de llenado añadir a una botella.',
		native: 'Funciona por completo en tu dispositivo y no necesita red; no se envía nada a ningún sitio.',
		web: 'Funciona por completo en tu navegador y sin conexión una vez cargada; no se envía nada a ningún sitio.',
		danger:
			'Mezclar gases es peligroso: incendios por oxígeno, mezclas erróneas. Mezcla solo si tienes formación, y analiza siempre la mezcla final antes de bucear con ella.',
		version: 'Versión {version}',
		built: 'Compilada el {date}',
		source: 'Código fuente en GitHub',
		docker: 'Imagen Docker en Docker Hub',
		license: 'Con licencia GNU GPL v3',
		how: 'Cómo calcula',
		howDalton: 'Presiones parciales, MOD y END: ley de Dalton, con 10 m de agua de mar por bar (33 ft por atm).',
		howMoles:
			'La mezcla se resuelve en moles, gas por gas (O2, He y N2), para que sea válida con gases reales. Las lecturas del manómetro se pasan a presiones absolutas; una botella vacía aún contiene 1 atm de su gas.',
		howReal:
			'Gases reales: el factor de compresibilidad Z de cada gas se ajusta a los datos de referencia del NIST (−10 a +60 °C, hasta 350 bar); el Z de una mezcla sigue la ley de Amagat. Precisión del ajuste: {accuracy}.',
		howTemperature:
			'Compensación de temperatura: la presión objetivo es la presión a 15 °C (la referencia de la presión nominal de una botella); las presiones mostradas se leen a la temperatura de llenado.',
		howSource: 'Cada fórmula, con su fuente, está en {file}.',
		references: 'Referencias'
	},
	update: {
		available: 'Hay una nueva versión de la app disponible.',
		reload: 'Recargar',
		later: 'Más tarde'
	}
};
