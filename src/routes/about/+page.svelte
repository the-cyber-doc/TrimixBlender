<script lang="ts">
	import {
		APP_BUILD,
		APP_VERSION,
		BUILD_DATE,
		COPYRIGHT_HOLDER,
		DOCKER_URL,
		GITHUB_URL,
		LICENSE_URL,
		NATIVE,
		versionLabel
	} from '#lib/about.js';
	import { asset } from '#lib/base.js';
	import { Z_MAX_ERROR } from '#lib/compressibility-coefficients.js';
	import { fill, locale, split, t } from '#lib/i18n.js';
	import { REFERENCES } from '#lib/references.js';

	const built = new Date(BUILD_DATE);
	const date = new Intl.DateTimeFormat(locale(), { dateStyle: 'medium' }).format(built);
</script>

<svelte:head><title>{t.about.title} · Trimix Blender</title></svelte:head>

<main class="page">
	<div class="card about">
		<h1>{t.about.title}</h1>
		<p class="app">
			<img src={asset('/favicon.svg')} alt="" width="48" height="48" />
			<span>Trimix Blender</span>
		</p>
		<p>{t.about.intro} {NATIVE ? t.about.native : t.about.web}</p>
		<p class="message warning">{t.about.danger}</p>
		<ul class="facts">
			<li data-testid="version">{fill(t.about.version, { version: versionLabel(APP_VERSION, APP_BUILD) })}</li>
			<li>{fill(t.about.built, { date })}</li>
		</ul>
		<ul class="facts">
			<li><a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">{t.about.source}</a></li>
			<li><a href={DOCKER_URL} target="_blank" rel="noopener noreferrer">{t.about.docker}</a></li>
		</ul>
		<p class="legal" data-testid="copyright">
			© {built.getUTCFullYear()}
			{COPYRIGHT_HOLDER} ·
			<a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">{t.about.license}</a>
		</p>

		<h2>{t.about.how}</h2>
		<ul>
			<li>{t.about.howDalton}</li>
			<li>{t.about.howMoles}</li>
			<li>{fill(t.about.howReal, { accuracy: Z_MAX_ERROR.join('; ') })}</li>
			<li>{t.about.howTemperature}</li>
			<li>
				{#each split(t.about.howSource, { file: 'src/lib/formulas.ts' }) as part, i (i)}{#if part.value}<code
							>{part.text}</code
						>{:else}{part.text}{/if}{/each}
			</li>
		</ul>

		<!-- The references stay as published (mostly English). -->
		<h2>{t.about.references}</h2>
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
