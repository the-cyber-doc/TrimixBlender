<script lang="ts">
	// A collapsible area. Collapsed: a click anywhere on it expands it. Expanded: only the
	// arrow on the right collapses it (clicks inside the content never do).
	import type { Snippet } from 'svelte';
	import { fill, t } from './i18n';

	let {
		title,
		open = $bindable(true),
		summary = '',
		children
	}: { title: string; open?: boolean; summary?: string; children: Snippet } = $props();

	const id = $props.id();
</script>

<section class="card area" class:collapsed={!open} aria-labelledby="{id}-title">
	{#if open}
		<div class="head">
			<h2 id="{id}-title">{title}</h2>
			<button
				type="button"
				class="arrow"
				aria-expanded="true"
				aria-controls="{id}-body"
				aria-label={fill(t.section.collapse, { title })}
				onclick={() => (open = false)}
			>
				{@render chevron()}
			</button>
		</div>
		<div class="body" id="{id}-body">{@render children()}</div>
	{:else}
		<button
			type="button"
			class="head expand"
			aria-expanded="false"
			aria-controls="{id}-body"
			onclick={() => (open = true)}
		>
			<h2 id="{id}-title">{title}</h2>
			{#if summary}<span class="summary">{summary}</span>{/if}
			<span class="arrow">{@render chevron()}</span>
		</button>
	{/if}
</section>

{#snippet chevron()}
	<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
		<path
			d="M6 9l6 6 6-6"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/snippet}

<style>
	.area {
		padding: 0;
	}

	.head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-4);
		text-align: left;
	}

	.head h2 {
		flex: 1;
	}

	.expand {
		font-weight: inherit;
		color: inherit;
		background: transparent;
		border: 0;
		border-radius: var(--radius);
	}

	.expand:hover {
		background: var(--bg);
	}

	.summary {
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.arrow {
		display: grid;
		place-items: center;
		width: var(--control-height);
		height: var(--control-height);
		padding: 0;
		color: var(--text);
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-pill);
	}

	.arrow svg {
		transition: transform 0.15s;
	}

	/* Down when expanded, pointing left when collapsed. */
	.collapsed .arrow svg {
		transform: rotate(90deg);
	}

	.body {
		display: grid;
		gap: var(--space-4);
		padding: 0 var(--space-4) var(--space-4);
	}
</style>
