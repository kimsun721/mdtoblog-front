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

<header class="mb-8 border-b border-gray-200 pb-8">
	<h1 class="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
		{post.title}
	</h1>

	<div class="flex items-center justify-between">
		<!-- Author Info -->
		<button
			onclick={() => goto(`/user/${post.userId}`)}
			class="group flex items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50"
		>
			<img
				src={`https://avatars.githubusercontent.com/u/${post.user.githubId}`}
				alt={post.user.userName}
				class="h-12 w-12 rounded-full border-2 border-gray-200 transition group-hover:border-gray-300"
			/>
			<div class="text-left">
				<p class="text-sm font-semibold text-gray-900">{post.user.userName}</p>
				<p class="text-sm text-gray-500">{formatDate(post.updatedAt)}</p>
			</div>
		</button>

		<!-- Meta Info -->
		<div class="flex items-center gap-6 text-sm text-gray-500">
			<div class="flex items-center gap-1.5" title="조회수">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/>
				</svg>
				<span>{formatNumber(post.views)}</span>
			</div>
			<div class="flex items-center gap-1.5" title="좋아요">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
				<span>{formatNumber(post.likeCount)}</span>
			</div>
		</div>
	</div>
</header>
