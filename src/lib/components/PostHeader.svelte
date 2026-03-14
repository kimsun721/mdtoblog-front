<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/utils/date';
	import { formatNumber } from '$lib/utils/format';
	import type { Post } from '$lib/types/post';

	interface Props {
		post: Post;
	}

	let { post }: Props = $props();
</script>

<header class="mb-10">
	<h1 class="mb-7 text-2xl font-bold leading-tight tracking-tight sm:text-3xl" style="color: var(--text);">
		{post.title}
	</h1>

	<div class="flex items-center justify-between">
		<button
			onclick={() => goto(`/user/${post.userId}`)}
			class="cursor-pointer group flex items-center gap-2.5 transition-opacity hover:opacity-70"
		>
			<img
				src={`https://avatars.githubusercontent.com/u/${post.user.githubId}`}
				alt={post.user.userName}
				class="h-8 w-8 rounded-full border"
				style="border-color: var(--border);"
			/>
			<div class="text-left">
				<p class="text-sm font-medium" style="color: var(--text);">{post.user.userName}</p>
				<p class="text-xs" style="color: var(--text-muted);">{formatDate(post.updatedAt)}</p>
			</div>
		</button>

		<div class="flex items-center gap-4 text-xs" style="color: var(--text-muted);">
			<div class="flex items-center gap-1.5" title="조회수">
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
				</svg>
				<span>{formatNumber(post.views)}</span>
			</div>
			<div class="flex items-center gap-1.5" title="좋아요">
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
				</svg>
				<span>{formatNumber(post.likeCount)}</span>
			</div>
		</div>
	</div>

	<div class="mt-8 border-b" style="border-color: var(--border-subtle);"></div>
</header>
