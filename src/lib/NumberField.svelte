<script lang="ts">
	// A number in the user's unit. Shows the value formatted; while typing, keeps the text as
	// typed and reports each valid number at once (the linked fields follow live).
	import { format, parseNumber, type Quantity } from './units';

	let {
		label,
		value,
		quantity,
		onchange,
		disabled = false,
		optional = false,
		placeholder = '',
		testid
	}: {
		label: string;
		value: number | null;
		quantity: Quantity;
		onchange: (value: number | null) => void;
		disabled?: boolean;
		/** Empty is allowed: reports null. */
		optional?: boolean;
		placeholder?: string;
		testid?: string;
	} = $props();

	let focused = $state(false);
	let text = $state('');
	const shown = $derived(value === null || !Number.isFinite(value) ? '' : format(quantity, value, false));
	const invalid = $derived(focused ? !(optional && text.trim() === '') && !Number.isFinite(parseNumber(text)) : false);

	function input(e: Event & { currentTarget: HTMLInputElement }) {
		text = e.currentTarget.value;
		const n = parseNumber(text);
		if (Number.isFinite(n)) onchange(quantity.fromDisplay(n));
		else if (optional && text.trim() === '') onchange(null);
	}
</script>

<label>
	<span
		>{label}{#if quantity.unit}&nbsp;<span class="unit">({quantity.unit})</span>{/if}</span
	>
	<input
		type="text"
		inputmode="decimal"
		autocomplete="off"
		value={focused ? text : shown}
		{disabled}
		{placeholder}
		aria-invalid={invalid}
		data-testid={testid}
		onfocus={() => {
			text = shown;
			focused = true;
		}}
		oninput={input}
		onblur={() => (focused = false)}
	/>
</label>

<style>
	.unit {
		white-space: nowrap;
	}
</style>
