<script lang="ts">
	import {
		APP_BUILD,
		APP_VERSION,
		BUILD_DATE,
		COPYRIGHT_HOLDER,
		DOCKER_URL,
		GITHUB_URL,
		LICENSE_URL,
		versionLabel
	} from '#lib/about.js';
	import { url } from '#lib/base.js';
	import { Z_MAX_ERROR } from '#lib/compressibility-coefficients.js';
	import { REFERENCES } from '#lib/references.js';

	const built = new Date(BUILD_DATE);
	const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(built);
</script>

<svelte:head><title>About · Trimix Blender</title></svelte:head>

<main class="page">
	<div class="card about">
		<h1>About</h1>
		<p class="app">
			<img src={url('/favicon.svg')} alt="" width="48" height="48" />
			<span>Trimix Blender</span>
		</p>
		<p>
			Trimix Blender works out partial-pressure blends of air, nitrox and trimix: how much O2, then He, then top-up gas
			to add to a cylinder. It runs entirely in your browser and works offline once loaded; nothing is sent anywhere.
		</p>
		<p class="message warning">
			Gas blending is dangerous: oxygen fires, wrong mixes. Only blend if you are trained to, and always analyse the
			final mix before diving it.
		</p>
		<ul class="facts">
			<li data-testid="version">Version {versionLabel(APP_VERSION, APP_BUILD)}</li>
			<li>Built on {date}</li>
		</ul>
		<ul class="facts">
			<li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">Source code on GitHub</a></li>
			<li><a href={DOCKER_URL} target="_blank" rel="noopener noreferrer">Docker image on Docker Hub</a></li>
		</ul>
		<p class="legal" data-testid="copyright">
			© {built.getUTCFullYear()}
			{COPYRIGHT_HOLDER} ·
			<a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">Licensed under the GNU GPL v3</a>
		</p>

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

	.app {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-title);
		font-weight: 600;
	}

	.facts {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-1);
	}

	.legal {
		color: var(--muted);
		font-size: var(--text-label);
	}

	h2 {
		margin-top: var(--space-4);
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
