<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let liked: boolean;
	export let likeCount: number;

	const dispatch = createEventDispatcher();

	function handleToggle() {
		dispatch('toggle');
	}
</script>

<button
	on:click={handleToggle}
	class="group relative inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 font-medium transition-all duration-200 {liked
		? 'border-gray-800 bg-gray-800 text-white shadow-sm'
		: 'border-gray-200 bg-white text-gray-700 hover:border-gray-800 hover:bg-gray-50'}"
>
	<svg
		class="h-4 w-4 transition-all duration-200 {liked ? 'scale-110' : 'group-hover:scale-110'}"
		fill={liked ? 'currentColor' : 'none'}
		stroke="currentColor"
		stroke-width="2"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
		/>
	</svg>
	<span class="text-sm">{liked ? '좋아요' : '좋아요'}</span>
</button>
