<script lang="ts">
	import { APP_BUILD, APP_VERSION, BUILD_DATE, versionLabel } from '#lib/about.js';
	import { Z_MAX_ERROR } from '#lib/compressibility-coefficients.js';
	import { REFERENCES } from '#lib/references.js';
</script>

<svelte:head><title>About · Trimix Blender</title></svelte:head>

<main class="page">
	<div class="card about">
		<h1>About</h1>
		<p>
			Trimix Blender works out partial-pressure blends of air, nitrox and trimix: how much O2, then He, then top-up gas
			to add to a cylinder. It runs entirely in your browser and works offline once loaded; nothing is sent anywhere.
		</p>
		<p class="message warning">
			Gas blending is dangerous: oxygen fires, wrong mixes. Only blend if you are trained to, and always analyse the
			final mix before diving it.
		</p>
		<dl class="numbers">
			<dt>Version</dt>
			<dd data-testid="version">{versionLabel(APP_VERSION, APP_BUILD)}</dd>
			<dt>Built</dt>
			<dd>{new Date(BUILD_DATE).toLocaleString()}</dd>
		</dl>

		<h2>How it calculates</h2>
		<ul>
			<li>Partial pressures, MOD and END: Dalton's law, with 10 m of seawater per bar (33 ft per atm).</li>
			<li>
				The blend is solved in moles, gas by gas (O2, He and N2), so that it holds for real gases. Gauge readings are
				turned into absolute pressures; an empty cylinder still holds 1 atm of its gas.
			</li>
			<li>
				Real gases: each gas's compressibility factor Z is fitted to NIST reference data (−10 to +60 °C, up to 350 bar);
				a mix's Z follows Amagat's law. Fit accuracy: {Z_MAX_ERROR.join('; ')}.
			</li>
			<li>
				Temperature compensation: the target pressure is the pressure at 15 °C (the reference of a cylinder's rated
				pressure); the pressures shown are read at the filling temperature.
			</li>
			<li>Every formula, with its source, is in <code>src/lib/formulas.ts</code>.</li>
		</ul>

		<h2>References</h2>
		<ol class="references">
			{#each REFERENCES as ref (ref.id)}
				<li id={ref.id}>
					<p class="citation">
						{ref.citation}
						{#if ref.url}<a href={ref.url} rel="noreferrer external" target="_blank">{ref.url}</a>{/if}
					</p>
					<p class="hint">{ref.usedFor}</p>
				</li>
			{/each}
		</ol>
	</div>
</main>

<style>
	.about {
		display: grid;
		gap: var(--space-3);
	}

	.about p,
	.about ul {
		margin: 0;
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-1) var(--space-4);
		margin: 0;
	}

	dt {
		color: var(--muted);
	}

	dd {
		margin: 0;
	}

	.references {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding-left: var(--space-5);
	}

	.citation {
		overflow-wrap: anywhere;
	}
</style>
