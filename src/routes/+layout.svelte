<script lang="ts">
	import '../app.css';
	import { dev } from '$app/env';
	import { NATIVE } from '#lib/about.js';
	import { persist, preferences } from '#lib/app.svelte.js';
	import { asset, page } from '#lib/base.js';
	import { setLocale } from '#lib/i18n.js';
	import Menu from '#lib/Menu.svelte';
	import { registerServiceWorker } from '#lib/pwa.js';
	import UpdateBanner from '#lib/UpdateBanner.svelte';

	let { children } = $props();

	persist();
	// The texts follow the language: set before the app is rendered (again) below.
	const language = $derived(setLocale(preferences.language));
	$effect(() => registerServiceWorker(dev || NATIVE));
</script>

<svelte:head>
	<title>Trimix Blender</title>
</svelte:head>

<!-- A new language renders the whole app again, in it (i18n.ts). -->
{#key language}
	<header>
		<a class="brand" href={page('/')}>
			<img src={asset('/favicon.svg')} alt="" width="28" height="28" />
			Trimix Blender
		</a>
		<Menu />
	</header>

	{@render children()}

	<UpdateBanner />
{/key}

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-2) max(var(--space-4), calc((100% - var(--page-width)) / 2 + var(--space-4)));
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
	}
</style>
