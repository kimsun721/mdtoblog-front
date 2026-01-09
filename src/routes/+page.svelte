<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { api } from '$lib/services/api';
	import { getRelativeTime } from '$lib/utils/date';
	import { formatNumber } from '$lib/utils/format';
	import type { Post } from '$lib/types/post';

	let posts = $state<Post[]>([]);
	let page = $state(1);
	let sentinel = $state<HTMLElement>();
	let isLoading = $state(true);
	let isFetchingMore = $state(false);
	let hasMore = $state(true);
	let observer: IntersectionObserver | null = null;
	let fetchAbort: AbortController | null = null;

	const limit = 20;

	async function fetchPosts() {
		if (isFetchingMore || !hasMore) return;

		isFetchingMore = true;
		fetchAbort?.abort();
		fetchAbort = new AbortController();

		try {
			const result: any = await api.getPosts(page, limit, fetchAbort.signal);
			const list: Post[] = result?.data || [];

			if (list.length === 0) {
				hasMore = false;
			} else {
				posts = [...posts, ...list];
				page++;
			}
		} catch (error: any) {
			if (error.name !== 'AbortError') {
				console.error('Failed to fetch posts:', error);
			}
		} finally {
			isFetchingMore = false;
			isLoading = false;
		}
	}

	function setupObserver() {
		if (!sentinel) return;

		observer?.disconnect();
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchPosts();
				}
			},
			{ root: null, rootMargin: '200px', threshold: 0.1 }
		);
		observer.observe(sentinel);
	}

	function getPostPreview(content: string): string {
		const plainText = content.replace(/[#*`]/g, '').trim();
		return plainText.length > 200 ? plainText.slice(0, 200) + '...' : plainText;
	}

	onMount(async () => {
		await fetchPosts();
		setupObserver();
	});

	onDestroy(() => {
		observer?.disconnect();
		fetchAbort?.abort();
	});
</script>

<svelte:head>
	<title>최신 글 · MdToBlog</title>
</svelte:head>

<main class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<header class="mb-12">
			<h1 class="text-3xl font-bold text-gray-900">최신 글</h1>
			<p class="mt-2 text-gray-600">개발자 블로그</p>
		</header>

		{#if isLoading && posts.length === 0}
			<!-- Loading Skeleton -->
			<div class="space-y-6">
				{#each Array(5) as _}
					<div class="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
						<div class="mb-4 h-7 w-2/3 rounded bg-gray-200"></div>
						<div class="mb-4 space-y-2">
							<div class="h-4 w-full rounded bg-gray-100"></div>
							<div class="h-4 w-11/12 rounded bg-gray-100"></div>
							<div class="h-4 w-10/12 rounded bg-gray-100"></div>
						</div>
						<div class="flex items-center gap-3">
							<div class="h-6 w-6 rounded-full bg-gray-200"></div>
							<div class="h-3 w-24 rounded bg-gray-200"></div>
							<div class="h-3 w-20 rounded bg-gray-100"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Posts Grid -->
			<div class="space-y-6">
				{#each posts as post (post.id)}
					<div
						class="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md"
						onclick={() => goto(`/post/${post.id}`)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								goto(`/post/${post.id}`);
							}
						}}
					>
						<!-- Title -->
						<h2
							class="mb-3 text-xl font-semibold text-gray-900 transition group-hover:text-gray-700"
						>
							{post.title}
						</h2>

						<!-- Preview -->
						<p class="mb-4 line-clamp-3 text-gray-600">
							{getPostPreview(post.content)}
						</p>

						<!-- Meta -->
						<div class="flex items-center justify-between text-sm text-gray-500">
							<div class="flex items-center gap-3">
								<button
									type="button"
									class="flex items-center gap-2 transition hover:text-gray-900"
									onclick={(e) => {
										e.stopPropagation();
										goto(`/user/${post.user.id}`);
									}}
								>
									<img
										src={`https://avatars.githubusercontent.com/u/${post.user.githubId}`}
										alt={post.user.userName}
										class="h-6 w-6 rounded-full border border-gray-200"
									/>
									<span class="font-medium">{post.user.userName}</span>
								</button>
								<span>·</span>
								<time datetime={new Date(post.updatedAt).toISOString()}>
									{getRelativeTime(post.updatedAt)}
								</time>
							</div>

							<div class="flex items-center gap-4">
								<span class="flex items-center gap-1" title="조회수">
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
									{formatNumber(post.views)}
								</span>
								<span class="flex items-center gap-1" title="댓글">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										/>
									</svg>
									{formatNumber(post.commentCount ?? 0)}
								</span>
								<span class="flex items-center gap-1" title="좋아요">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										/>
									</svg>
									{formatNumber(post.likeCount)}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Load More Section -->
			{#if hasMore || isFetchingMore}
				<div class="mt-12 flex justify-center">
					{#if isFetchingMore}
						<div class="flex items-center gap-2 text-sm text-gray-500">
							<svg
								class="h-5 w-5 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<span>로딩 중...</span>
						</div>
					{:else}
						<button
							type="button"
							class="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
							onclick={fetchPosts}
						>
							더 보기
						</button>
					{/if}
				</div>
			{:else if posts.length > 0}
				<div class="mt-12 text-center text-sm text-gray-400">모든 글을 불러왔습니다</div>
			{/if}
		{/if}
	</div>

	<!-- Intersection Observer Sentinel -->
	<div bind:this={sentinel} class="h-px"></div>
</main>
