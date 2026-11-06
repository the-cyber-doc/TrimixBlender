// Bibliography of every formula and constant in formulas.ts. Each formula's comment there
// names its entry here by `id`; the About page lists them all.

export interface Reference {
	id: string;
	/** Full citation. */
	citation: string;
	/** What the app takes from it. */
	usedFor: string;
	url?: string;
}

export const REFERENCES: readonly Reference[] = [
	{
		id: 'dalton-1802',
		citation:
			'Dalton, J. (1802). Experimental essays on the constitution of mixed gases; on the force of steam or vapour from ' +
			'water and other liquids in different temperatures; on evaporation; and on the expansion of gases by heat. ' +
			'Memoirs of the Literary and Philosophical Society of Manchester, 5(2), 535–602.',
		usedFor: "Dalton's law of partial pressures: PPx = fx × P (PPO2, PPHe, PPN2, MOD, END)."
	},
	{
		id: 'usn-rev7',
		citation:
			'U.S. Navy (2016). U.S. Navy Diving Manual, Revision 7 (SS521-AG-PRO-010). Naval Sea Systems Command, Washington, DC. ' +
			'Chapter 2 (Underwater physics) and Chapter 13 (Mixed-gas diving theory).',
		usedFor:
			'Pressure with depth (33 fsw = 1 atm, 10 msw ≈ 1 bar), gauge vs absolute pressure, ' +
			'equivalent air depth (the basis of END), partial-pressure mixing of breathing gases.',
		url: 'https://www.navsea.navy.mil/Home/SUPSALV/00C3-Diving/Diving-Publications/'
	},
	{
		id: 'noaa-6',
		citation:
			'NOAA Diving Program (2017). NOAA Diving Manual: Diving for Science and Technology, 6th edition. ' +
			'Best Publishing Company, North Palm Beach, FL.',
		usedFor:
			'Nitrox and mixed-gas blending by partial pressure, maximum operating depth, ' +
			'the diving convention air = 21 % O2 / 79 % N2.'
	},
	{
		id: 'bennett-elliott',
		citation:
			'Brubakk, A.O. & Neuman, T.S. (eds.) (2003). Bennett and Elliott’s Physiology and Medicine of Diving, 5th edition. ' +
			'Saunders, Edinburgh. Chapter on inert gas narcosis.',
		usedFor:
			'Narcotic potency of the gases: helium is not narcotic at diving depths; oxygen is generally considered ' +
			'as narcotic as nitrogen (hence the END preference: O2 narcotic, or N2 only).'
	},
	{
		id: 'nist-webbook',
		citation:
			'Lemmon, E.W., Bell, I.H., Huber, M.L. & McLinden, M.O. Thermophysical Properties of Fluid Systems. ' +
			'In: Linstrom, P.J. & Mallard, W.G. (eds.), NIST Chemistry WebBook, NIST Standard Reference Database 69. ' +
			'National Institute of Standards and Technology, Gaithersburg, MD. doi:10.18434/T4D303',
		usedFor:
			'Reference density of O2, N2 and He from −10 to +60 °C and 1 to 401 bar (scripts/nist/), ' +
			'to which the compressibility factor Z is fitted (scripts/fit-compressibility.js).',
		url: 'https://webbook.nist.gov/chemistry/fluid/'
	},
	{
		id: 'span-2000',
		citation:
			'Span, R., Lemmon, E.W., Jacobsen, R.T., Wagner, W. & Yokozeki, A. (2000). A reference equation of state for the ' +
			'thermodynamic properties of nitrogen for temperatures from 63.151 to 1000 K and pressures to 2200 MPa. ' +
			'Journal of Physical and Chemical Reference Data, 29(6), 1361–1433. doi:10.1063/1.1349047',
		usedFor: 'The nitrogen equation of state behind the NIST data.'
	},
	{
		id: 'schmidt-wagner-1985',
		citation:
			'Schmidt, R. & Wagner, W. (1985). A new form of the equation of state for pure substances and its application to ' +
			'oxygen. Fluid Phase Equilibria, 19(3), 175–200. doi:10.1016/0378-3812(85)85020-5',
		usedFor: 'The oxygen equation of state behind the NIST data.'
	},
	{
		id: 'ortiz-vega-he',
		citation:
			'Ortiz-Vega, D.O., Hall, K.R., Holste, J.C., Arp, V.D., Harvey, A.H. & Lemmon, E.W. Equation of state for helium-4, ' +
			'as implemented in NIST Standard Reference Database 69 (see NIST Chemistry WebBook).',
		usedFor: 'The helium equation of state behind the NIST data.'
	},
	{
		id: 'poling-2001',
		citation:
			'Poling, B.E., Prausnitz, J.M. & O’Connell, J.P. (2001). The Properties of Gases and Liquids, 5th edition. ' +
			'McGraw-Hill, New York. Chapter 5 (Pressure-volume-temperature relations of mixtures).',
		usedFor:
			'Compressibility of a gas mixture from its components (Amagat’s law of additive volumes: ' +
			'Z_mix = Σ x_i Z_i at the same P and T), and the definition Z = PV / (nRT).'
	},
	{
		id: 'anthony-mitchell-2016',
		citation:
			'Anthony, G. & Mitchell, S.J. (2016). Respiratory physiology of rebreather diving. In: Pollock, N.W., Sellers, S.H. & ' +
			'Godfrey, J.M. (eds.), Rebreathers and Scientific Diving. Proceedings of NPS/NOAA/DAN/AAUS June 16–19, 2015 ' +
			'Workshop. Durham, NC, pp. 66–79.',
		usedFor:
			'Gas density ceilings: 5.2 g/L recommended, 6.2 g/L absolute maximum, from the sharp rise in CO2 retention ' +
			'above 6 g/L in rebreather test dives.'
	},
	{
		id: 'warkander-1990',
		citation:
			'Warkander, D.E., Norfleet, W.T., Nagasawa, G.K. & Lundgren, C.E.G. (1990). CO2 retention with minimal symptoms ' +
			'but severe dysfunction during wet simulated dives to 6.8 atm abs. Undersea Biomedical Research, 17(6), 515–523.',
		usedFor: 'Evidence that dense gas (air at 6.8 atm, 8.8 g/L) causes CO2 retention with little warning.'
	},
	{
		id: 'doolette-mitchell-2011',
		citation:
			'Doolette, D.J. & Mitchell, S.J. (2011). Hyperbaric conditions. Comprehensive Physiology, 1(1), 163–201. ' +
			'doi:10.1002/cphy.c091004',
		usedFor:
			'Effects of gas density on breathing (airway resistance, work of breathing, CO2 retention); breathing-gas ' +
			'densities tabulated at 0 °C and 1 atm, scaled with the absolute pressure at depth.'
	},
	{
		id: 'iupac-2021',
		citation:
			'Prohaska, T. et al. (2022). Standard atomic weights of the elements 2021 (IUPAC Technical Report). ' +
			'Pure and Applied Chemistry, 94(5), 573–600. doi:10.1515/pac-2019-0603',
		usedFor: 'Molar masses: O2 31.998, N2 28.014, He 4.0026 g/mol (gas density).'
	},
	{
		id: 'codata-2018',
		citation:
			'Tiesinga, E., Mohr, P.J., Newell, D.B. & Taylor, B.N. (2021). CODATA recommended values of the fundamental physical ' +
			'constants: 2018. Reviews of Modern Physics, 93, 025010. doi:10.1103/RevModPhys.93.025010',
		usedFor: 'The molar gas constant R = 8.314462618 J/(mol·K) (exact since the 2019 SI).'
	},
	{
		id: 'nist-sp811',
		citation:
			'Thompson, A. & Taylor, B.N. (2008). Guide for the Use of the International System of Units (SI). ' +
			'NIST Special Publication 811. National Institute of Standards and Technology, Gaithersburg, MD.',
		usedFor:
			'Unit conversions: 1 psi = 6.894 757 kPa, 1 ft³ = 28.316 846 592 L, °F = °C × 9/5 + 32, ' +
			'K = °C + 273.15, standard atmosphere = 101.325 kPa.'
	},
	{
		id: 'iso-10286',
		citation: 'ISO 10286:2021. Gas cylinders — Vocabulary. International Organization for Standardization, Geneva.',
		usedFor:
			'Working (rated) pressure is the settled pressure at a uniform reference temperature of 15 °C: ' +
			'the temperature at which the target pressure is met when temperature compensation is on.'
	}
];
