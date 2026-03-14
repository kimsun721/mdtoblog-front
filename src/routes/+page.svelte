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
			(entries) => { if (entries[0].isIntersecting) fetchPosts(); },
			{ root: null, rootMargin: '200px', threshold: 0.1 }
		);
		observer.observe(sentinel);
	}

	function getPostPreview(content: string): string {
		const plainText = content.replace(/[#*`\[\]()]/g, '').trim();
		return plainText.length > 160 ? plainText.slice(0, 160) + '…' : plainText;
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

<main class="min-h-screen" style="background: var(--bg);">
	<div class="mx-auto max-w-5xl px-6 py-12 sm:px-10">

		<!-- Page Header -->
		<header class="mb-10">
			<h1 class="text-xl font-semibold tracking-tight" style="color: var(--text);">최신 글</h1>
			<p class="mt-1 text-sm" style="color: var(--text-muted);">모든 개발자의 글을 한 곳에서</p>
		</header>

		{#if isLoading && posts.length === 0}
			<!-- Skeleton -->
			<div class="space-y-3">
				{#each Array(6) as _}
					<div class="animate-pulse rounded-xl border p-5" style="background: var(--bg-surface); border-color: var(--border);">
						<div class="mb-3 h-4 w-2/3 rounded-md" style="background: var(--bg-hover);"></div>
						<div class="mb-4 space-y-2">
							<div class="h-3 w-full rounded" style="background: var(--bg-hover);"></div>
							<div class="h-3 w-4/5 rounded" style="background: var(--bg-hover);"></div>
						</div>
						<div class="flex items-center gap-2">
							<div class="h-5 w-5 rounded-full" style="background: var(--bg-hover);"></div>
							<div class="h-3 w-20 rounded" style="background: var(--bg-hover);"></div>
							<div class="h-3 w-14 rounded" style="background: var(--bg-hover);"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Posts -->
			<div class="space-y-3">
				{#each posts as post (post.id)}
					<article
						class="group cursor-pointer rounded-xl border transition-all duration-150 hover:shadow-md hover:border-[var(--border-subtle)]"
						style="background: var(--bg-surface); border-color: var(--border);"
						onclick={() => goto(`/post/${post.id}`)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/post/${post.id}`); }
						}}
					>
						<!-- Card body -->
						<div class="px-5 pt-5 pb-4">
							<h2
								class="mb-2 text-[15px] font-semibold leading-snug transition-opacity duration-150 group-hover:opacity-60"
								style="color: var(--text);"
							>
								{post.title}
							</h2>
							<p class="line-clamp-2 text-[13px] leading-relaxed" style="color: var(--text-secondary);">
								{getPostPreview(post.content)}
							</p>
						</div>

						<!-- Card footer -->
						<div class="flex items-center justify-between border-t px-5 py-2.5" style="border-color: var(--border-subtle);">
							<button
								type="button"
								class="cursor-pointer flex items-center gap-1.5 text-[12px] transition hover:opacity-70"
								onclick={(e) => { e.stopPropagation(); goto(`/user/${post.user.id}`); }}
							>
								<img
									src={`https://avatars.githubusercontent.com/u/${post.user.githubId}`}
									alt={post.user.userName}
									class="h-4 w-4 rounded-full"
								/>
								<span class="font-medium" style="color: var(--text-secondary);">{post.user.userName}</span>
								<span style="color: var(--text-faint);">·</span>
								<time class="text-[12px]" style="color: var(--text-muted);" datetime={new Date(post.updatedAt).toISOString()}>
									{getRelativeTime(post.updatedAt)}
								</time>
							</button>

							<div class="flex items-center gap-3 text-[12px]" style="color: var(--text-faint);">
								<span class="flex items-center gap-1" title="조회수">
									<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
									</svg>
									{formatNumber(post.views)}
								</span>
								<span class="flex items-center gap-1" title="댓글">
									<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
									{formatNumber(post.commentCount ?? 0)}
								</span>
								<span class="flex items-center gap-1" title="좋아요">
									<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
									</svg>
									{formatNumber(post.likeCount)}
								</span>
							</div>
						</div>
					</article>
				{/each}
			</div>

			<!-- Load More -->
			{#if hasMore || isFetchingMore}
				<div class="mt-8 flex justify-center">
					{#if isFetchingMore}
						<div class="h-4 w-4 animate-spin rounded-full border-2" style="border-color: var(--border); border-top-color: var(--text-secondary);"></div>
					{:else}
						<button
							type="button"
							class="cursor-pointer rounded-lg border px-5 py-2 text-xs font-medium transition hover:bg-[var(--bg-hover)]"
							style="border-color: var(--border); color: var(--text-secondary);"
							onclick={fetchPosts}
						>
							더 보기
						</button>
					{/if}
				</div>
			{:else if posts.length > 0}
				<div class="mt-8 text-center text-xs" style="color: var(--text-faint);">모든 글을 불러왔습니다</div>
			{/if}
		{/if}
	</div>

	<div bind:this={sentinel} class="h-px"></div>
</main>
