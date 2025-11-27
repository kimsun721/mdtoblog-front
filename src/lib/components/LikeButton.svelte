<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let liked: boolean;
	export let likeCount: number; // 이건 버튼에 안 쓰이지만, prop으로 유지

	const dispatch = createEventDispatcher();

	function handleToggle() {
		dispatch('toggle');
	}
</script>

<button
	on:click={handleToggle}
	class="group relative overflow-hidden rounded-full px-8 py-4 font-medium text-gray-700 transition-all duration-300 {liked
		? 'bg-gray-900 text-white'
		: 'bg-gray-100 hover:bg-gray-900 hover:text-white'}"
>
	<span class="relative z-10 flex items-center space-x-2">
		<svg
			class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
			fill={liked ? 'currentColor' : 'none'}
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
			/>
		</svg>
		<span>{liked ? '좋아요 취소' : '좋아요'}</span>
	</span>
</button>
