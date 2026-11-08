<script lang="ts">
	// Available gases: the registered sources (name, O2 %, He %, pressure), the ones to use checked.
	import { app, preferences } from './app.svelte';
	import NumberField from './NumberField.svelte';
	import { mixName, newGas, validGas, type Gas } from './gases';
	import { fill, t } from './i18n';
	import { PERCENT, pressureQuantity } from './units';

	const bar = $derived(pressureQuantity(preferences));

	/** O2 or He changed: a name that was the old mix's own follows the new mix. */
	function setMix(gas: Gas, change: Partial<Pick<Gas, 'o2' | 'he'>>) {
		const auto = gas.name === mixName(gas);
		Object.assign(gas, change);
		if (auto && validGas(gas)) gas.name = mixName(gas);
	}

	const remove = (gas: Gas) => (app.gases = app.gases.filter((g) => g !== gas));
</script>

<p class="hint">{t.gases.hint}</p>

<ul class="gases">
	{#each app.gases as gas (gas.id)}
		<li class="gas" class:unused={!gas.used} data-testid="gas">
			<label class="check use">
				<input type="checkbox" bind:checked={gas.used} aria-label={fill(t.gases.use, { name: gas.name })} />
			</label>
			<label class="name">
				<span>{t.gases.name}</span>
				<input type="text" bind:value={gas.name} />
			</label>
			<NumberField label="O2" quantity={PERCENT} value={gas.o2} onchange={(v) => setMix(gas, { o2: v ?? 0 })} />
			<NumberField label="He" quantity={PERCENT} value={gas.he} onchange={(v) => setMix(gas, { he: v ?? 0 })} />
			<NumberField
				label={t.gases.pressure}
				quantity={bar}
				value={gas.pressure}
				onchange={(v) => (gas.pressure = v ?? 0)}
			/>
			<button
				type="button"
				class="secondary remove"
				aria-label={fill(t.gases.removeGas, { name: gas.name })}
				onclick={() => remove(gas)}
			>
				{t.gases.remove}
			</button>
			{#if !validGas(gas)}
				<p class="message error wide">{t.gases.invalid}</p>
			{/if}
		</li>
	{:else}
		<li class="hint">{t.gases.none}</li>
	{/each}
</ul>

<div>
	<button type="button" onclick={() => app.gases.push(newGas(app.gases))}>{t.gases.add}</button>
</div>

<style>
	.gases {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-3);
	}

	.gas {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-3);
		align-items: end;
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--border);
	}

	.use {
		align-self: end;
		height: var(--control-height);
	}

	.name {
		width: 8rem;
	}

	.wide {
		flex-basis: 100%;
	}

	.unused {
		opacity: 0.6;
	}

	/* Phones: use, name and Remove on the first line, the numbers on the second. */
	@media (max-width: 40rem) {
		.remove {
			order: 1;
		}

		.gas > :global(.field) {
			order: 2;
		}

		.wide {
			order: 3;
		}
	}
</style>
