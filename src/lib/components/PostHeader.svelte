<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { toKrDate } from '$lib/toKrDate';
	import type { Post } from '$lib/types/post';

	const dispatch = createEventDispatcher();

	export let post: Post;
</script>

<div class="mb-8 border-b border-gray-100 pb-8">
	<h1 class="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">{post.title}</h1>
	<!-- 작성자 정보 -->
	<div class="flex items-center justify-between">
		<button
			on:click={() => dispatch('navigate', { url: `/user/${post.userId}` })}
			class="group flex items-center space-x-4 rounded-2xl p-2 transition-all duration-200 hover:bg-gray-50"
		>
			<div class="relative">
				<img
					src={`https://avatars.githubusercontent.com/u/${post.user.githubId}`}
					alt="프로필"
					class="h-14 w-14 rounded-full border-2 border-gray-200 transition-transform duration-200 group-hover:scale-105 group-hover:border-gray-300"
				/>
				<div
					class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"
				></div>
			</div>
			<div class="text-left">
				<p class="text-lg font-semibold text-gray-900">{post.user.userName}</p>
				<p class="text-sm text-gray-500">{toKrDate(post.updatedAt)}</p>
			</div>
		</button>
		<!-- 메타 정보 -->
		<div class="flex items-center space-x-6 text-sm text-gray-500">
			<div class="flex items-center space-x-2">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				<span class="font-medium">{post.views}</span>
			</div>
			<div class="flex items-center space-x-2">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
				<span class="font-medium">{post.likeCount}</span>
			</div>
		</div>
	</div>
</div>
