<script lang="ts">
	// Target mix: nitrox or trimix, depth, %O2 ↔ MOD ↔ PPO2, %He ↔ END, %N2.
	import { app, preferences } from './app.svelte';
	import NumberField from './NumberField.svelte';
	import { TARGET_TEXT } from './messages';
	import { setDepth, setEnd, setHe, setKind, setMod, setO2, setPpo2, view } from './target';
	import { PARTIAL_PRESSURE, PERCENT, depthQuantity, format } from './units';

	const depth = $derived(depthQuantity(preferences));
	const v = $derived(view(app.target, preferences.o2Narcotic));
	const trimix = $derived(app.target.kind === 'trimix');
	const update = (f: (t: typeof app.target) => typeof app.target) => (app.target = f(app.target));
</script>

<fieldset class="kind">
	<legend>Mix</legend>
	<label class="check"
		><input
			type="radio"
			name="kind"
			value="nitrox"
			checked={!trimix}
			onchange={() => update((t) => setKind(t, 'nitrox'))}
		/> Nitrox</label
	>
	<label class="check"
		><input
			type="radio"
			name="kind"
			value="trimix"
			checked={trimix}
			onchange={() => update((t) => setKind(t, 'trimix'))}
		/> Trimix</label
	>
</fieldset>

<div class="fields">
	<NumberField
		label="Target depth"
		quantity={depth}
		value={app.target.depth}
		optional
		placeholder="optional"
		testid="depth"
		onchange={(d) => update((t) => setDepth(t, d))}
	/>
</div>

<div class="fields">
	<NumberField
		label="O2"
		quantity={PERCENT}
		value={app.target.o2}
		testid="target-o2"
		onchange={(o2) => o2 !== null && update((t) => setO2(t, o2))}
	/>
	<NumberField
		label="MOD"
		quantity={depth}
		value={v.mod}
		testid="mod"
		onchange={(mod) => mod !== null && update((t) => setMod(t, mod))}
	/>
	<NumberField
		label="PPO2 max"
		quantity={PARTIAL_PRESSURE}
		value={app.target.ppo2}
		testid="ppo2"
		onchange={(p) => p !== null && update((t) => setPpo2(t, p))}
	/>
</div>

{#if trimix}
	<div class="fields">
		<NumberField
			label="He"
			quantity={PERCENT}
			value={app.target.he}
			testid="target-he"
			onchange={(he) => he !== null && update((t) => setHe(t, he))}
		/>
		<NumberField
			label="END"
			quantity={depth}
			value={v.end}
			disabled={app.target.depth === null}
			placeholder="needs a depth"
			testid="end"
			onchange={(end) => end !== null && update((t) => setEnd(t, end, preferences.o2Narcotic))}
		/>
	</div>
	<p class="hint">
		END with {preferences.o2Narcotic ? 'O2 counted as narcotic' : 'N2 only as narcotic'} (Preferences).
	</p>
{/if}

<p class="n2" data-testid="n2">N2: <strong class="numbers">{format(PERCENT, v.n2)}</strong></p>

{#each v.errors as problem (problem)}
	<p class="message error" role="alert">{TARGET_TEXT[problem]}</p>
{/each}
{#each v.warnings as problem (problem)}
	<p class="message warning">{TARGET_TEXT[problem]}</p>
{/each}

<style>
	.kind {
		display: flex;
		gap: var(--space-5);
		margin: 0;
		padding: 0;
		border: 0;
	}

	.kind legend {
		float: left;
		margin-right: var(--space-2);
		color: var(--muted);
		font-size: var(--text-label);
	}

	.n2 {
		margin: 0;
	}
</style>
