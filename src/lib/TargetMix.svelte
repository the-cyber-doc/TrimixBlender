<script lang="ts">
	// Target mix: nitrox or trimix, depth, %O2 ↔ MOD ↔ PPO2, %He ↔ END ↔ gas density, %N2.
	import { app, preferences } from './app.svelte';
	import NumberField from './NumberField.svelte';
	import { fill, split, t } from './i18n';
	import { targetText } from './messages';
	import { setDensity, setDepth, setEnd, setHe, setKind, setMod, setO2, setPpo2, view } from './target';
	import { DENSITY_LIMITS } from './formulas';
	import { DENSITY, PARTIAL_PRESSURE, PERCENT, depthQuantity, format } from './units';

	const depth = $derived(depthQuantity(preferences));
	const v = $derived(view(app.target, preferences));
	const trimix = $derived(app.target.kind === 'trimix');
	const update = (f: (t: typeof app.target) => typeof app.target) => (app.target = f(app.target));
</script>

<fieldset class="kind">
	<legend>{t.target.mix}</legend>
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
		label={t.target.depth}
		quantity={depth}
		value={app.target.depth}
		optional
		placeholder={t.target.optional}
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
		label={t.target.ppo2Max}
		quantity={PARTIAL_PRESSURE}
		value={app.target.ppo2}
		testid="ppo2"
		onchange={(p) => p !== null && update((t) => setPpo2(t, p))}
	/>
</div>

{#if trimix}
	<div class="fields helium">
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
			placeholder={t.target.needsDepth}
			testid="end"
			onchange={(end) => end !== null && update((t) => setEnd(t, end, preferences.o2Narcotic))}
		/>
		<div class="with-note">
			<NumberField
				label={t.target.density}
				quantity={DENSITY}
				value={app.target.depth === null ? null : v.density.value}
				disabled={app.target.depth === null}
				placeholder={t.target.needsDepth}
				testid="target-density"
				onchange={(d) => d !== null && update((t) => setDensity(t, d, preferences))}
			/>
			{@render limits()}
		</div>
	</div>
	<p class="hint">{preferences.o2Narcotic ? t.target.endO2 : t.target.endN2}</p>
{/if}

<p class="n2" data-testid="n2">N2: <strong class="numbers">{format(PERCENT, v.n2)}</strong></p>

{#if !trimix}
	<div class="density" data-testid="density">
		<p>
			{app.target.depth !== null
				? fill(t.target.densityAtDepth, { depth: format(depth, app.target.depth) })
				: fill(t.target.densityAtMod, { mod: format(depth, v.mod) })}
			<strong class="numbers" data-testid="density-value">{format(DENSITY, v.density.value)}</strong>
		</p>
		{@render limits()}
	</div>
{/if}

{#snippet limits()}
	<p class="hint numbers" data-testid="density-limits">
		<span class="line"
			>{@render values(t.target.recommended, {
				density: format(DENSITY, DENSITY_LIMITS.recommended),
				depth: format(depth, v.density.recommendedDepth)
			})}</span
		>
		<span class="line"
			>{@render values(t.target.maximum, {
				density: format(DENSITY, DENSITY_LIMITS.maximum),
				depth: format(depth, v.density.maximumDepth)
			})}</span
		>
	</p>
{/snippet}

<!-- A text with its values each kept on one line. -->
{#snippet values(text: string, parts: Record<string, string>)}
	{#each split(text, parts) as part, i (i)}{#if part.value}<span class="nowrap">{part.text}</span
			>{:else}{part.text}{/if}{/each}
{/snippet}

{#each v.errors as problem (problem)}
	<p class="message error" role="alert">{targetText(problem)}</p>
{/each}
{#each v.warnings as problem (problem)}
	<p class="message warning">{targetText(problem)}</p>
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

	.n2,
	.density p {
		margin: 0;
	}

	/* The note under the density input: the inputs of the row stay aligned at the top. */
	.helium {
		align-items: start;
	}

	.with-note {
		display: grid;
		gap: var(--space-1);
	}

	.with-note .hint {
		margin: 0;
	}

	.line {
		display: block;
	}

	.nowrap {
		white-space: nowrap;
	}
</style>
