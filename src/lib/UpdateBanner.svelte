<script lang="ts">
	// "A new version is available" with Reload. Never reloads by itself: a blend may be in progress.
	import { onAppUpdated } from './pwa';

	let updated = $state(false);

	$effect(() => onAppUpdated(() => (updated = true)));
</script>

{#if updated}
	<div class="update" role="status" data-testid="update-banner">
		<span>A new version of the app is available.</span>
		<button type="button" onclick={() => location.reload()}>Reload</button>
		<button type="button" class="secondary" onclick={() => (updated = false)}>Later</button>
	</div>
{/if}

<style>
	.update {
		position: fixed;
		inset: auto var(--space-4) var(--space-4);
		z-index: 100;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--space-2) var(--space-4);
		max-width: 32rem;
		margin: 0 auto;
		padding: var(--space-3) var(--space-4);
		background: var(--surface);
		border: 1px solid var(--accent);
		border-radius: var(--radius);
		box-shadow: var(--shadow-banner);
	}
</style>
