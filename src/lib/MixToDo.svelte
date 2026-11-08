<script lang="ts">
	// Mix to do: the cylinder now, the target pressure, the blend's four stages and the sticker.
	import { app, preferences } from './app.svelte';
	import { blendWith, candidates, validChoices, type Stage } from './blend';
	import Bottle from './Bottle.svelte';
	import { REFERENCE_TEMPERATURE } from './formulas';
	import { mixName } from './gases';
	import { fill, t } from './i18n';
	import { blendErrorText, warningText } from './messages';
	import NumberField from './NumberField.svelte';
	import Sticker from './Sticker.svelte';
	import { view } from './target';
	import {
		DENSITY,
		PARTIAL_PRESSURE,
		PERCENT,
		depthQuantity,
		format,
		gasVolumeQuantity,
		pressureQuantity,
		roundDown,
		temperatureQuantity,
		volumeQuantity
	} from './units';

	const bar = $derived(pressureQuantity(preferences));
	const depth = $derived(depthQuantity(preferences));
	const target = $derived(view(app.target, preferences));
	const used = $derived(app.gases.filter((g) => g.used));
	const choices = $derived(candidates(used));
	const trimix = $derived(app.target.kind === 'trimix');
	// The sources chosen by the user and still valid; the others are picked by blendWith.
	const chosen = $derived(validChoices(app.mix.sources, used));
	const m = app.mix;

	const result = $derived(
		target.valid
			? blendWith(
					{
						kind: app.target.kind,
						target: target.mix,
						targetPressure: m.targetPressure,
						volume: m.volume,
						start: m.start,
						startPressure: m.startPressure,
						temperature: m.compensate ? m.temperature : REFERENCE_TEMPERATURE,
						model: preferences.model
					},
					used,
					chosen
				)
			: undefined
	);
	const plan = $derived(result?.ok ? result : undefined);
	const topName = $derived(plan ? plan.sources.top.name : 'Air');

	const GAS = { o2: 'O2', he: 'He' } as const;
	/** "1. Now", "2. + O2", "3. + He", "4. + Air" (the top-up gas's name). */
	function title(stage: Stage, index: number) {
		if (stage.step === 'start') return `${index + 1}. ${t.mix.now}`;
		return `${index + 1}. + ${stage.step === 'top' ? topName : GAS[stage.step]}`;
	}
	function added(stage: Stage) {
		if (!plan || stage.step === 'start') return '';
		const source = plan.sources[stage.step];
		return `+${format(bar, stage.added)} ${source?.name ?? ''}`;
	}

	type Role = 'o2' | 'he' | 'top';
	const ROLES: { role: Role; label: string }[] = [
		{ role: 'o2', label: t.mix.o2From },
		{ role: 'he', label: t.mix.heFrom },
		{ role: 'top', label: t.mix.topWith }
	];
	/** The gas shown in a role's list: the user's choice, else the one the blend picked, else the first. */
	const selected = (role: Role) => chosen[role] ?? plan?.sources[role]?.id ?? choices[role][0]?.id ?? '';
</script>

<div class="group">
	<h3>{t.mix.cylinderNow}</h3>
	<div class="fields">
		<NumberField
			label="O2"
			quantity={PERCENT}
			value={m.start.o2}
			testid="start-o2"
			onchange={(v) => (m.start.o2 = v ?? 0)}
		/>
		<NumberField
			label="He"
			quantity={PERCENT}
			value={m.start.he}
			testid="start-he"
			onchange={(v) => (m.start.he = v ?? 0)}
		/>
		<NumberField
			label={t.mix.pressure}
			quantity={bar}
			value={m.startPressure}
			testid="start-pressure"
			onchange={(v) => (m.startPressure = v ?? 0)}
		/>
		<NumberField
			label={t.mix.volume}
			quantity={volumeQuantity(preferences)}
			value={m.volume}
			testid="volume"
			onchange={(v) => (m.volume = v ?? 0)}
		/>
	</div>
	<p class="hint">{fill(t.mix.currently, { mix: mixName(m.start) })}</p>
</div>

<div class="group">
	<h3>{t.mix.target}</h3>
	<div class="fields">
		<NumberField
			label={t.mix.targetPressure}
			quantity={bar}
			value={m.targetPressure}
			testid="target-pressure"
			onchange={(v) => (m.targetPressure = v ?? 0)}
		/>
	</div>
	<dl class="summary numbers" data-testid="reminder">
		<div>
			<dt>{t.mix.mix}</dt>
			<dd>{mixName(target.mix)}</dd>
		</div>
		<div>
			<dt>MOD</dt>
			<dd>{format(depth, target.mod)} <small>(PPO2 {format(PARTIAL_PRESSURE, app.target.ppo2)})</small></dd>
		</div>
		{#if target.end !== null}<div>
				<dt>END</dt>
				<dd>{format(depth, target.end)}</dd>
			</div>{/if}
		<div>
			<dt>PPO2</dt>
			<dd>{format(PARTIAL_PRESSURE, target.pp.o2)}</dd>
		</div>
		{#if trimix}<div>
				<dt>PPHe</dt>
				<dd>{format(PARTIAL_PRESSURE, target.pp.he)}</dd>
			</div>{/if}
		<div>
			<dt>PPN2</dt>
			<dd>{format(PARTIAL_PRESSURE, target.pp.n2)}</dd>
		</div>
		<div>
			<dt>{t.mix.density}</dt>
			<dd data-testid="reminder-density">{format(DENSITY, target.density.value)}</dd>
		</div>
		<div>
			<dt>{t.mix.gasWhenFull}</dt>
			<dd data-testid="free-gas">{plan ? format(gasVolumeQuantity(preferences), plan.freeGas) : '–'}</dd>
		</div>
	</dl>
	<p class="hint">
		{app.target.depth !== null ? fill(t.mix.atDepth, { depth: format(depth, app.target.depth) }) : t.mix.atMod}
	</p>
</div>

<div class="group">
	<div class="temperature">
		<label class="check compensate"
			><input type="checkbox" bind:checked={m.compensate} data-testid="compensate" />
			{t.mix.compensated}</label
		>
		{#if m.compensate}
			<NumberField
				label={t.mix.fillTemperature}
				quantity={temperatureQuantity(preferences)}
				value={m.temperature}
				testid="temperature"
				onchange={(v) => v !== null && (m.temperature = v)}
			/>
		{/if}
	</div>
	{#if m.compensate}
		<p class="hint">{t.mix.compensatedHint}</p>
	{/if}
</div>

<div class="fields">
	{#each ROLES as { role, label } (role)}
		{#if role !== 'he' || trimix}
			<label>
				<span>{label}</span>
				<select
					value={selected(role)}
					disabled={choices[role].length === 0}
					onchange={(e) => (m.sources[role] = e.currentTarget.value)}
					data-testid="source-{role}"
				>
					{#each choices[role] as gas (gas.id)}
						<option value={gas.id}>{gas.name}, {format(bar, gas.pressure)}</option>
					{:else}
						<option value="">{t.mix.noGas}</option>
					{/each}
				</select>
			</label>
		{/if}
	{/each}
</div>

{#if result && !result.ok}
	<div class="message error" role="alert" data-testid="blend-error">
		<p>{blendErrorText(result.error, preferences)}</p>
		{#if result.error.code === 'drain'}
			{@const drainTo = roundDown(bar, result.error.drainTo)}
			<button type="button" class="secondary" onclick={() => (m.startPressure = drainTo)}
				>{fill(t.mix.setCylinder, { pressure: format(bar, drainTo) })}</button
			>
		{/if}
	</div>
{:else if !result}
	<p class="message error" role="alert" data-testid="blend-error">{t.mix.checkTarget}</p>
{/if}

{#if plan}
	{#each plan.warnings as warning (warning)}
		<p class="message warning">{warningText(warning)}</p>
	{/each}
	<div class="bottles" class:four={plan.stages.length === 4} style:--count={plan.stages.length}>
		{#each plan.stages as stage, i (stage.step)}
			<Bottle {stage} title={title(stage, i)} added={added(stage)} {bar} {topName} />
		{/each}
	</div>
	<div class="sticker-row">
		<Sticker {plan} {bar} />
	</div>
	<p class="hint">{t.mix.analyse}</p>
{/if}

<style>
	.group {
		display: grid;
		gap: var(--space-2);
	}

	/* Desktop: the checkbox and the temperature on one line (the checkbox level with the input);
	   phones: the temperature below. */
	.temperature {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--space-2) var(--space-6);
	}

	.compensate {
		height: var(--control-height);
	}

	@media (max-width: 40rem) {
		.temperature {
			flex-direction: column;
			align-items: start;
		}

		.compensate {
			height: auto;
		}
	}

	.summary {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		margin: 0;
	}

	.summary dt {
		font-size: var(--text-xs);
		color: var(--muted);
	}

	.summary dd {
		margin: 0;
		font-weight: 600;
	}

	.message p {
		margin: 0 0 var(--space-2);
	}

	.message p:last-child {
		margin: 0;
	}

	/* One row of bottles; each bottle spans three rows (caption, drawing, legend: Bottle.svelte). */
	.bottles {
		display: grid;
		grid-template-columns: repeat(var(--count), minmax(0, 1fr));
		gap: var(--space-1) var(--space-2);
	}

	/* Phones: trimix's four steps on two lines, 1–2 then 3–4. */
	@media (max-width: 40rem) {
		.bottles.four {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			row-gap: var(--space-4);
		}
	}

	.sticker-row {
		display: flex;
		justify-content: center;
	}
</style>
