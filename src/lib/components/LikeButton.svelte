<script lang="ts">
	interface Props {
		liked: boolean;
		likeCount: number;
		ontoggle: () => void;
	}

	let { liked, likeCount, ontoggle }: Props = $props();
</script>

<button class="like-btn" class:liked onclick={ontoggle}>
	<svg width="15" height="15" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
		<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
	</svg>
	<span>{likeCount}</span>
</button>

<style>
.like-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	height: 40px;
	padding: 0 18px;
	border-radius: 11px;
	font-size: 14px;
	font-weight: 600;
	font-family: inherit;
	border: 1.5px solid var(--border);
	background: var(--bg-surface);
	color: var(--text-secondary);
	cursor: pointer;
	transition: all var(--tr);
}
.like-btn:hover {
	border-color: var(--red);
	color: var(--red);
	background: rgba(240,68,82,0.05);
}
.like-btn.liked {
	border-color: var(--red);
	color: var(--red);
	background: rgba(240,68,82,0.07);
}
</style>
