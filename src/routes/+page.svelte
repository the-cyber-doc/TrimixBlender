<script lang="ts">
	import { app, preferences } from '#lib/app.svelte.js';
	import Gases from '#lib/Gases.svelte';
	import { mixName } from '#lib/gases.js';
	import MixToDo from '#lib/MixToDo.svelte';
	import Section from '#lib/Section.svelte';
	import TargetMix from '#lib/TargetMix.svelte';
	import { targetMix } from '#lib/target.js';
	import { format, pressureQuantity } from '#lib/units.js';
	import { fill, t } from '#lib/i18n.js';

	const bar = $derived(pressureQuantity(preferences));
	const usedCount = $derived(app.gases.filter((g) => g.used).length);
</script>

<main class="page">
	<Section
		title={t.section.gases}
		bind:open={app.open.gases}
		summary={fill(t.section.gasesSummary, { used: usedCount, total: app.gases.length })}
	>
		<Gases />
	</Section>
	<Section title={t.section.target} bind:open={app.open.target} summary={mixName(targetMix(app.target))}>
		<TargetMix />
	</Section>
	<Section
		title={t.section.mix}
		bind:open={app.open.mix}
		summary={fill(t.section.mixSummary, {
			mix: mixName(targetMix(app.target)),
			pressure: format(bar, app.mix.targetPressure)
		})}
	>
		<MixToDo />
	</Section>
</main>
