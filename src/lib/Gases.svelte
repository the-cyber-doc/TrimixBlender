<script lang="ts">
	// Available gases: the registered sources (name, O2 %, He %, pressure), the ones to use checked.
	import { app, preferences } from './app.svelte';
	import NumberField from './NumberField.svelte';
	import { mixName, newGas, validGas, type Gas } from './gases';
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

<p class="hint">Check the gases the blend may use. Their pressure limits what each one can fill without a booster.</p>

<ul class="gases">
	{#each app.gases as gas (gas.id)}
		<li class="gas" class:unused={!gas.used} data-testid="gas">
			<label class="check use">
				<input type="checkbox" bind:checked={gas.used} aria-label="Use {gas.name}" />
			</label>
			<label class="name">
				<span>Name</span>
				<input type="text" bind:value={gas.name} />
			</label>
			<NumberField label="O2" quantity={PERCENT} value={gas.o2} onchange={(v) => setMix(gas, { o2: v ?? 0 })} />
			<NumberField label="He" quantity={PERCENT} value={gas.he} onchange={(v) => setMix(gas, { he: v ?? 0 })} />
			<NumberField label="Pressure" quantity={bar} value={gas.pressure} onchange={(v) => (gas.pressure = v ?? 0)} />
			<button type="button" class="secondary remove" aria-label="Remove {gas.name}" onclick={() => remove(gas)}>
				Remove
			</button>
			{#if !validGas(gas)}
				<p class="message error wide">O2 and He must be from 0 to 100 % in total, the pressure 0 or more.</p>
			{/if}
		</li>
	{:else}
		<li class="hint">No gas registered.</li>
	{/each}
</ul>

<div>
	<button type="button" onclick={() => app.gases.push(newGas(app.gases))}>Add a gas</button>
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
		display: grid;
		grid-template-columns: auto 1fr 1fr;
		gap: var(--space-2) var(--space-3);
		align-items: end;
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--border);
	}

	.use {
		grid-row: span 2;
		align-self: center;
	}

	.name {
		grid-column: span 2;
	}

	.wide {
		grid-column: 1 / -1;
	}

	.unused {
		opacity: 0.6;
	}

	@media (min-width: 40rem) {
		.gas {
			grid-template-columns: auto 2fr 1fr 1fr 1.2fr auto;
		}

		.use {
			grid-row: auto;
			align-self: end;
			height: var(--control-height);
		}

		.name {
			grid-column: auto;
		}
	}
</style>
