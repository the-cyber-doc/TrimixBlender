<script lang="ts">
	import '../app.css';
	import { dev } from '$app/env';
	import { persist } from '#lib/app.svelte.js';
	import { asset, page } from '#lib/base.js';
	import Menu from '#lib/Menu.svelte';
	import { registerServiceWorker } from '#lib/pwa.js';
	import UpdateBanner from '#lib/UpdateBanner.svelte';

	let { children } = $props();

	persist();
	$effect(() => registerServiceWorker(dev));
</script>

<svelte:head>
	<title>Trimix Blender</title>
</svelte:head>

<header>
	<a class="brand" href={page('/')}>
		<img src={asset('/favicon.svg')} alt="" width="28" height="28" />
		Trimix Blender
	</a>
	<Menu />
</header>

{@render children()}

<UpdateBanner />

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
