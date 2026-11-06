#!/bin/sh
# Downloads the reference compressibility data used by scripts/fit-compressibility.js
# from the NIST Chemistry WebBook, "Thermophysical Properties of Fluid Systems"
# (E.W. Lemmon, I.H. Bell, M.L. Huber, M.O. McLinden, NIST Standard Reference Database 69,
# https://webbook.nist.gov/chemistry/fluid/). The WebBook evaluates each fluid's reference
# equation of state (see src/lib/references.ts).
#
# Output: scripts/nist/<gas>.tsv, columns: temperature (K), pressure (bar, absolute),
# density (mol/l). Isotherms from -10 °C to +60 °C, 1 to 401 bar every 10 bar.
set -eu
cd "$(dirname "$0")/nist"
for g in He:C7440597 N2:C7727379 O2:C7782447; do
	name=${g%%:*}
	id=${g#*:}
	: >"$name.tsv"
	for T in 263.15 273.15 283.15 288.15 293.15 303.15 313.15 323.15 333.15; do
		curl -fsS -m 30 "https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=$id&Type=IsoTherm&Digits=6&PLow=1&PHigh=401&PInc=10&T=$T&RefState=DEF&TUnit=K&PUnit=bar&DUnit=mol%2Fl&HUnit=kJ%2Fmol&WUnit=m%2Fs&VisUnit=uPa*s&STUnit=N%2Fm" |
			awk -F'\t' 'NR>1{print $1"\t"$2"\t"$3}' | sort -u -k2,2g >>"$name.tsv"
	done
	echo "scripts/nist/$name.tsv"
done
