<script lang="ts">
	// The menu at the top right: the language (its flag and code; a click opens the list of
	// languages), then Blender, Preferences, About. Closes on a click outside, Escape and navigation.
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { preferences } from './app.svelte';
	import { page as link } from './base';
	import Flag from './Flag.svelte';
	import { LOCALES, localeInfo, t, type Locale } from './i18n';

	let open = $state(false);
	let languages = $state(false);
	let root: HTMLElement;
	const ENTRIES = [
		{ path: '/', label: t.menu.blender },
		{ path: '/preferences', label: t.menu.preferences },
		{ path: '/about', label: t.menu.about }
	];
	const current = $derived(localeInfo(preferences.language));

	const close = () => {
		open = false;
		languages = false;
	};
	// The root layout renders the app again in the new language (this menu too, closed).
	const choose = (code: Locale) => {
		close();
		preferences.language = code;
	};

	afterNavigate(close);
</script>

<svelte:window
	onclick={(e) => open && !root.contains(e.target as Node) && close()}
	onkeydown={(e) => e.key === 'Escape' && close()}
/>

<div class="menu-root" bind:this={root}>
	<button
		type="button"
		class="toggle"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label={t.menu.menu}
		onclick={() => (open ? close() : (open = true))}
	>
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
			<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
		</svg>
	</button>
	{#if open}
		<ul class="menu" role="menu">
			<li role="none">
				<button
					type="button"
					role="menuitem"
					class="language"
					aria-haspopup="menu"
					aria-expanded={languages}
					aria-label="{t.menu.language}: {current.name}"
					data-testid="language"
					onclick={() => (languages = !languages)}
				>
					<Flag flag={current.flag} />
					<span class="code">{current.code.toUpperCase()}</span>
					<svg class="chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
						<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
					</svg>
				</button>
				{#if languages}
					<ul class="languages" role="menu" aria-label={t.menu.language}>
						{#each LOCALES as l (l.code)}
							<li role="none">
								<button
									type="button"
									role="menuitemradio"
									aria-checked={l.code === current.code}
									lang={l.code}
									onclick={() => choose(l.code)}
								>
									<Flag flag={l.flag} />
									<span class="code">{l.code.toUpperCase()}</span>
									<span class="name">{l.name}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
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

	.menu a,
	.menu button {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font: inherit;
		font-weight: inherit;
		color: var(--text);
		text-align: left;
		text-decoration: none;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
	}

	.menu a:hover,
	.menu a[aria-current='page'],
	.menu button:hover,
	.languages button[aria-checked='true'] {
		background: var(--bg);
	}

	/* The language apart from the pages. */
	.menu > li:first-child {
		margin-bottom: var(--space-1);
		padding-bottom: var(--space-1);
		border-bottom: 1px solid var(--border);
	}

	.code {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.chevron {
		margin-left: auto;
		transition: transform 0.15s;
	}

	[aria-expanded='true'] .chevron {
		transform: rotate(180deg);
	}

	/* The list of languages: a box of its own, under the language entry. */
	.languages {
		margin: var(--space-1) 0;
		padding: var(--space-1);
		list-style: none;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-menu);
	}

	.name {
		color: var(--muted);
	}
</style>
