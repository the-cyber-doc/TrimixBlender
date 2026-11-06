<script lang="ts">
	import { app, preferences } from '#lib/app.svelte.js';
	import Gases from '#lib/Gases.svelte';
	import { mixName } from '#lib/gases.js';
	import MixToDo from '#lib/MixToDo.svelte';
	import Section from '#lib/Section.svelte';
	import TargetMix from '#lib/TargetMix.svelte';
	import { targetMix } from '#lib/target.js';
	import { format, pressureQuantity } from '#lib/units.js';

	const bar = $derived(pressureQuantity(preferences));
	const usedCount = $derived(app.gases.filter((g) => g.used).length);
</script>

<main class="page">
	<Section title="Available gases" bind:open={app.open.gases} summary="{usedCount} of {app.gases.length} in use">
		<Gases />
	</Section>
	<Section title="Target mix" bind:open={app.open.target} summary={mixName(targetMix(app.target))}>
		<TargetMix />
	</Section>
	<Section
		title="Mix to do"
		bind:open={app.open.mix}
		summary="{mixName(targetMix(app.target))} to {format(bar, app.mix.targetPressure)}"
	>
		<MixToDo />
	</Section>
</main>
