<script lang="ts">
	import { preferences } from '#lib/app.svelte.js';
	import { t } from '#lib/i18n.js';
	import { UNIT_LABELS } from '#lib/units.js';

	const UNITS = [
		{ key: 'temperature', label: t.preferences.temperature, options: UNIT_LABELS.temperature },
		{ key: 'pressure', label: t.preferences.pressure, options: UNIT_LABELS.pressure },
		{ key: 'volume', label: t.preferences.volume, options: UNIT_LABELS.volume },
		{ key: 'depth', label: t.preferences.depth, options: UNIT_LABELS.depth }
	] as const;
	const set = (key: (typeof UNITS)[number]['key'], value: string) =>
		((preferences as unknown as Record<string, string>)[key] = value);
</script>

<svelte:head><title>{t.preferences.title} · Trimix Blender</title></svelte:head>

<main class="page">
	<div class="card prefs">
		<h1>{t.preferences.title}</h1>
		{#each UNITS as unit (unit.key)}
			<fieldset>
				<legend>{unit.label}</legend>
				{#each Object.entries(unit.options) as [value, label] (value)}
					<label class="check">
						<input
							type="radio"
							name={unit.key}
							{value}
							checked={preferences[unit.key] === value}
							onchange={() => set(unit.key, value)}
						/>
						{label}
					</label>
				{/each}
			</fieldset>
		{/each}
		<fieldset>
			<legend>{t.preferences.model}</legend>
			<label class="check">
				<input
					type="radio"
					name="model"
					checked={preferences.model === 'real'}
					onchange={() => (preferences.model = 'real')}
				/>
				{t.preferences.real}
			</label>
			<label class="check">
				<input
					type="radio"
					name="model"
					checked={preferences.model === 'ideal'}
					onchange={() => (preferences.model = 'ideal')}
				/>
				{t.preferences.ideal}
			</label>
		</fieldset>
		<fieldset>
			<legend>END</legend>
			<label class="check">
				<input
					type="radio"
					name="end"
					checked={preferences.o2Narcotic}
					onchange={() => (preferences.o2Narcotic = true)}
				/>
				{t.preferences.o2Narcotic}
			</label>
			<label class="check">
				<input
					type="radio"
					name="end"
					checked={!preferences.o2Narcotic}
					onchange={() => (preferences.o2Narcotic = false)}
				/>
				{t.preferences.n2Only}
			</label>
		</fieldset>
		<p class="hint">{t.preferences.saved}</p>
	</div>
</main>

<style>
	.prefs {
		display: grid;
		gap: var(--space-4);
	}

	fieldset {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	legend {
		padding: 0 var(--space-1);
		font-weight: 600;
	}
</style>
