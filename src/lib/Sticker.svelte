<script lang="ts">
	// The label for the cylinder: "Nx: 32 | O2 to | final" or "Tx: 21/35 | O2 to | He to | final".
	import type { BlendPlan } from './blend';
	import { PERCENT, format, type Quantity } from './units';

	let { plan, bar }: { plan: BlendPlan; bar: Quantity } = $props();

	const final = $derived(plan.stages[plan.stages.length - 1]);
	const name = $derived(
		plan.kind === 'trimix'
			? `Tx: ${format(PERCENT, final.mix.o2, false)}/${format(PERCENT, final.mix.he, false)}`
			: `Nx: ${format(PERCENT, final.mix.o2, false)}`
	);
	const cells = $derived(plan.stages.slice(1).map((s) => format(bar, s.pressure)));
</script>

<p class="sticker {plan.kind}" data-testid="sticker">
	<span class="name">{name}</span>
	{#each cells as cell, i (i)}<span class="sep" aria-hidden="true">|</span><span class="numbers">{cell}</span>{/each}
</p>

<style>
	/* A printed cylinder label: same colours in both themes. */
	.sticker {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-lg);
		font-weight: 700;
		color: #111111;
		background: #ffffff;
		border: 3px solid #2f9e44;
		border-radius: var(--radius-sm);
	}

	.sticker.trimix {
		border-color: #8b5a2b;
	}

	.sep {
		color: #6b7280;
	}
</style>
