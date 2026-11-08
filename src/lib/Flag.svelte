<script lang="ts">
	// A language's flag, drawn (emoji flags show as two letters on Windows): 3:2, 21 × 14 px,
	// the same colours in both themes. Simplified where the real flag has an emblem (Spain).
	import type { LocaleInfo } from './i18n';

	let { flag }: { flag: LocaleInfo['flag'] } = $props();
	const id = $props.id();

	/** A five-pointed star centred on (x, y), outer radius r, a point turned `angle` degrees from up. */
	function star(x: number, y: number, r: number, angle = 0) {
		const points = [];
		for (let i = 0; i < 10; i++) {
			const radius = i % 2 === 0 ? r : r * 0.382;
			const a = ((angle + i * 36) * Math.PI) / 180;
			points.push(`${(x + radius * Math.sin(a)).toFixed(2)},${(y - radius * Math.cos(a)).toFixed(2)}`);
		}
		return points.join(' ');
	}
	/** Tricolours: three stripes, vertical or horizontal. */
	const STRIPES: Partial<Record<LocaleInfo['flag'], { vertical: boolean; colors: string[] }>> = {
		fr: { vertical: true, colors: ['#002654', '#ffffff', '#ce1126'] },
		it: { vertical: true, colors: ['#009246', '#ffffff', '#ce2b37'] },
		de: { vertical: false, colors: ['#000000', '#dd0000', '#ffce00'] },
		nl: { vertical: false, colors: ['#ae1c28', '#ffffff', '#21468b'] }
	};
	const stripes = $derived(STRIPES[flag]);
</script>

<svg class="flag" viewBox="0 0 30 20" width="21" height="14" aria-hidden="true">
	<clipPath id="{id}-c"><rect width="30" height="20" rx="1.5" /></clipPath>
	<g clip-path="url(#{id}-c)">
		{#if stripes}
			{#each stripes.colors as color, i (i)}
				{#if stripes.vertical}
					<rect x={i * 10} width="10" height="20" fill={color} />
				{:else}
					<rect y={(i * 20) / 3} width="30" height={20 / 3 + 0.1} fill={color} />
				{/if}
			{/each}
		{:else if flag === 'es'}
			<rect width="30" height="20" fill="#aa151b" />
			<rect y="5" width="30" height="10" fill="#f1bf00" />
		{:else if flag === 'jp'}
			<rect width="30" height="20" fill="#ffffff" />
			<circle cx="15" cy="10" r="6" fill="#bc002d" />
		{:else if flag === 'cn'}
			<rect width="30" height="20" fill="#ee1c25" />
			<polygon points={star(5, 5, 3)} fill="#ffff00" />
			<polygon points={star(10, 2, 1, 23)} fill="#ffff00" />
			<polygon points={star(12, 4, 1, 45)} fill="#ffff00" />
			<polygon points={star(12, 7, 1, 70)} fill="#ffff00" />
			<polygon points={star(10, 9, 1, 21)} fill="#ffff00" />
		{:else}
			<!-- Union Jack (2:1), centred and cropped to 3:2. -->
			<svg x="0" y="0" width="30" height="20" viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice">
				<clipPath id="{id}-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
				<rect width="60" height="30" fill="#012169" />
				<path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" stroke-width="6" />
				<path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#{id}-t)" stroke="#c8102e" stroke-width="4" />
				<path d="M30,0 v30 M0,15 h60" stroke="#ffffff" stroke-width="10" />
				<path d="M30,0 v30 M0,15 h60" stroke="#c8102e" stroke-width="6" />
			</svg>
		{/if}
	</g>
	<rect width="30" height="20" rx="1.5" fill="none" stroke="#00000033" stroke-width="1" />
</svg>

<style>
	.flag {
		flex: none;
		display: block;
	}
</style>
