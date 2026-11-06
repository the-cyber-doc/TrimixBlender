<script lang="ts">
	// The menu at the top right: Blender, Preferences, About. Closes on a click outside, Escape
	// and navigation.
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { page as link } from './base';

	let open = $state(false);
	let root: HTMLElement;
	const ENTRIES = [
		{ path: '/', label: 'Blender' },
		{ path: '/preferences', label: 'Preferences' },
		{ path: '/about', label: 'About' }
	];

	afterNavigate(() => (open = false));
</script>

<svelte:window
	onclick={(e) => open && !root.contains(e.target as Node) && (open = false)}
	onkeydown={(e) => e.key === 'Escape' && (open = false)}
/>

<div class="menu-root" bind:this={root}>
	<button
		type="button"
		class="toggle"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label="Menu"
		onclick={() => (open = !open)}
	>
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
			<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
		</svg>
	</button>
	{#if open}
		<ul class="menu" role="menu">
			{#each ENTRIES as entry (entry.path)}
				<li role="none">
					<a role="menuitem" href={link(entry.path)} aria-current={page.route.id === entry.path ? 'page' : undefined}
						>{entry.label}</a
					>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.menu-root {
		position: relative;
	}

	.toggle {
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

	.menu {
		position: absolute;
		top: calc(100% + var(--space-1));
		right: 0;
		z-index: 50;
		min-width: 12rem;
		margin: 0;
		padding: var(--space-1);
		list-style: none;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow-menu);
	}

	.menu a {
		display: block;
		padding: var(--space-2) var(--space-3);
		color: var(--text);
		text-decoration: none;
		border-radius: var(--radius-sm);
	}

	.menu a:hover,
	.menu a[aria-current='page'] {
		background: var(--bg);
	}
</style>
