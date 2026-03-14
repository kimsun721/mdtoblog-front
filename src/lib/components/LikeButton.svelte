<script lang="ts">
	interface Props {
		liked: boolean;
		likeCount: number;
		ontoggle: () => void;
	}

	let { liked, likeCount, ontoggle }: Props = $props();
</script>

<button
	onclick={ontoggle}
	class="cursor-pointer inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition hover:opacity-80"
	style={liked
		? 'background: var(--text); color: var(--bg-surface); border-color: var(--text);'
		: 'background: transparent; color: var(--text-secondary); border-color: var(--border);'}
>
	<svg class="h-4 w-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
	</svg>
	<span>{liked ? '좋아요 취소' : '좋아요'}</span>
	<span class="text-xs opacity-60">{likeCount}</span>
</button>
