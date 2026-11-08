<script lang="ts">
	// One stage of the blend as a cylinder, filled from the bottom: the content's height is its
	// share of the full cylinder by pressure, split into the gases' colours (fixed, whatever the theme).
	import type { Stage } from './blend';
	import { BAND_TEXT, GAS_COLORS, legend, segments } from './bottle';
	import { t } from './i18n';
	import { PERCENT, format, type Quantity } from './units';

	let {
		stage,
		title,
		added = '',
		bar,
		topName
	}: { stage: Stage; title: string; added?: string; bar: Quantity; topName: string } = $props();

	// Inside of the body, in viewBox units: from the shoulders (TOP) down to the bottom (BOTTOM).
	const TOP = 26;
	const BOTTOM = 214;
	const H = BOTTOM - TOP;
	const BODY = 'M 10 60 Q 10 28 40 26 Q 70 28 70 60 L 70 200 Q 70 214 56 214 L 24 214 Q 10 214 10 200 Z';
	const id = $props.id();
	const bands = $derived(segments(stage));
	const parts = $derived(legend(stage));
	const name = (band: string) => (band === 'Air' ? topName : band);
</script>

<figure class="bottle" data-testid="bottle-{stage.step}">
	<figcaption>
		<strong>{title}</strong>
		<span class="numbers total" data-testid="total">{format(bar, stage.pressure)}</span>
		{#if added}<span class="numbers added" data-testid="added">{added}</span>{/if}
	</figcaption>
	<svg viewBox="0 0 80 220" role="img" aria-label="{title}: {format(bar, stage.pressure)}">
		<defs>
			<clipPath id="{id}-inside"><path d={BODY} /></clipPath>
		</defs>
		<rect x="24" y="3" width="32" height="6" rx="2" fill="#7a8087" />
		<rect x="33" y="8" width="14" height="12" fill="#9aa0a6" />
		<rect x="35" y="19" width="10" height="8" fill="#b5bac0" />
		<path d={BODY} fill={GAS_COLORS.empty} />
		<g clip-path="url(#{id}-inside)">
			{#each bands as band (band.origin)}
				{@const y = BOTTOM - (band.bottom + band.height) * H}
				<rect x="0" {y} width="80" height={band.height * H} fill={band.color} data-band={band.band} />
				{#if band.height * H >= 12}
					<text
						x="40"
						y={y + (band.height * H) / 2}
						fill={BAND_TEXT}
						font-size="10"
						text-anchor="middle"
						dominant-baseline="central">{name(band.band)} {format(PERCENT, band.share)}</text
					>
				{/if}
			{/each}
		</g>
		<path d={BODY} fill="none" stroke="#3c4248" stroke-width="2" />
	</svg>
	<ul class="legend">
		{#each parts as part (part.band)}
			<li>
				<span class="swatch" style:background={part.color}></span>{name(part.band)}
				<span class="numbers">{format(PERCENT, part.share)}</span>
			</li>
		{:else}
			<li class="hint">{t.mix.empty}</li>
		{/each}
	</ul>
</figure>

<style>
	/* Caption, drawing and legend each take one row of the parent's grid (subgrid): the
	   captions of a row of bottles share one height, so the drawings start, and end, level,
	   whatever the length of each caption and legend (MixToDo.svelte .bottles). */
	.bottle {
		margin: 0;
		display: grid;
		grid-row: span 3;
		grid-template-rows: subgrid;
		justify-items: center;
		row-gap: var(--space-1);
		min-width: 0;
	}

	figcaption {
		display: grid;
		align-self: end;
		justify-items: center;
		text-align: center;
		font-size: var(--text-sm);
	}

	.total {
		font-size: var(--text-md);
		font-weight: 600;
	}

	.added {
		color: var(--muted);
	}

	svg {
		align-self: end;
		width: 100%;
		max-width: 6rem;
		height: auto;
	}

	.legend {
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: var(--text-xs);
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	/* The swatch keeps its gas colour in both themes; the border shows white (empty) and black (N2) in either. */
	.swatch {
		width: 0.7rem;
		height: 0.7rem;
		border: 1px solid #888888;
		border-radius: 2px;
	}
</style>
