<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { toKrDate } from '$lib/toKrDate';
	import type { Post } from '$lib/types/post';
	import { marked } from 'marked';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';

	let posts: Post[] = [];
	let page = 1;
	const limit = 20;
	let sentinel: HTMLDivElement;
	let isLoading = true;
	let isFetchingMore = false;
	let hasMore = true;
	let observer: IntersectionObserver | null = null;
	let fetchAbort: AbortController | null = null;

	const fetchPosts = async () => {
		if (isFetchingMore || !hasMore) return;
		isFetchingMore = true;
		fetchAbort?.abort();
		fetchAbort = new AbortController();
		try {
			const res = await fetch(`${PUBLIC_API_URL}/post?page=${page}&limit=${limit}`, {
				signal: fetchAbort.signal
			});
			if (!res.ok) throw new Error('fetch failed');
			const result = await res.json();
			const list: Post[] = Array.isArray(result.data) ? result.data : (result.data ?? []);
			if (list.length === 0) {
				hasMore = false;
			} else {
				posts = [...posts, ...list];
				page++;
			}
		} catch (e) {
			if ((e as any).name !== 'AbortError') console.error('posts fetch error', e);
		} finally {
			isFetchingMore = false;
			isLoading = false;
		}
	};

	const setupObserver = () => {
		if (!sentinel) return;
		observer?.disconnect();
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) fetchPosts();
			},
			{ root: null, rootMargin: '200px', threshold: 0.1 }
		);
		observer.observe(sentinel);
	};

	onMount(async () => {
		await fetchPosts();
		setupObserver();
	});

	onDestroy(() => {
		observer?.disconnect();
		fetchAbort?.abort();
	});

	const preview = (content: string) => {
		return content.length > 240 ? content.slice(0, 240) + '…' : content;
	};

	const handlePostClick = (postId: number) => {
		goto(`/post/${postId}`);
	};

	const handleUserClick = (e: Event, userId: number) => {
		e.stopPropagation();
		goto(`/user/${userId}`);
	};
</script>

<svelte:head>
	<title>Home · 최신 글</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
	<div class="mx-auto max-w-7xl">
		<!-- 헤더 -->
		<div class="mb-12">
			<h2
				class="mb-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent"
			>
				최신 글
			</h2>
			<div class="mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
			<p class="text-lg text-slate-600">최신 포스트를 자동으로 불러옵니다</p>
		</div>

		{#if isLoading && posts.length === 0}
			<!-- 스켈레톤 그리드 -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<div class="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
						<div class="mb-4 h-6 w-3/4 rounded-lg bg-slate-200"></div>
						<div class="mb-6 space-y-3">
							<div class="h-3 w-full rounded bg-slate-100"></div>
							<div class="h-3 w-5/6 rounded bg-slate-100"></div>
							<div class="h-3 w-4/6 rounded bg-slate-100"></div>
						</div>
						<div class="flex items-center gap-3">
							<div class="h-10 w-10 rounded-full bg-slate-200"></div>
							<div class="flex-1">
								<div class="mb-2 h-3 w-20 rounded bg-slate-200"></div>
								<div class="h-2.5 w-16 rounded bg-slate-100"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- 포스트 그리드 -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each posts as post}
					<article
						class="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl"
						on:click={() => handlePostClick(post.id)}
						on:keydown={(e) => e.key === 'Enter' && handlePostClick(post.id)}
						role="button"
						tabindex="0"
					>
						<!-- 그라데이션 오버레이 -->
						<div
							class="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-indigo-50/0 to-purple-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>

						<div class="relative">
							<!-- 제목 -->
							<h3
								class="mb-4 line-clamp-2 min-h-[56px] text-xl leading-tight font-bold text-slate-900 transition-colors group-hover:text-blue-700"
							>
								{post.title}
							</h3>

							<!-- 내용 미리보기 -->
							<div class="prose prose-sm mb-6 line-clamp-3 min-h-[60px] max-w-none text-slate-600">
								{@html marked(preview(post.content))}
							</div>

							<!-- 작성자 정보 -->
							<div class="flex items-center gap-3 border-t border-slate-100 pt-4">
								<div
									class="relative h-10 w-10 flex-shrink-0 cursor-pointer overflow-hidden rounded-full ring-2 ring-slate-200 transition-all duration-200 hover:ring-4 hover:ring-blue-300"
									on:click={(e) => handleUserClick(e, post.user.id)}
									on:keydown={(e) => e.key === 'Enter' && handleUserClick(e, post.user.id)}
									role="button"
									tabindex="0"
								>
									<img
										src={`https://avatars.githubusercontent.com/u/${post.user.githubId}`}
										alt={`${post.user?.userName ?? '익명'} 프로필`}
										class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
									/>
								</div>
								<div class="min-w-0 flex-1">
									<p
										class="cursor-pointer truncate text-sm font-semibold text-slate-900 hover:text-blue-700"
										on:click={(e) => handleUserClick(e, post.user.id)}
										on:keydown={(e) => e.key === 'Enter' && handleUserClick(e, post.user.id)}
										role="button"
										tabindex="0"
									>
										{post.user?.userName ?? '익명'}
									</p>
									<time class="text-xs text-slate-500">{toKrDate(post.updatedAt)}</time>
								</div>
							</div>
						</div>
					</article>
				{/each}
			</div>

			<!-- 더 보기 영역 -->
			<div class="mt-12 text-center">
				{#if isFetchingMore}
					<div
						class="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-white px-6 py-3.5 shadow-lg"
					>
						<svg
							class="h-5 w-5 animate-spin text-blue-600"
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
						<span class="text-sm font-semibold text-blue-600">로딩 중...</span>
					</div>
				{:else if !hasMore}
					<div
						class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3.5 shadow-md"
					>
						<svg
							class="h-5 w-5 text-blue-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						<span class="text-sm font-semibold text-blue-700">모든 글을 불러왔습니다</span>
					</div>
				{:else}
					<button
						class="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-95"
						on:click={fetchPosts}
					>
						<span>더 불러오기</span>
						<svg
							class="h-4 w-4 transition-transform group-hover:translate-y-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Intersection Observer Sentinel -->
	<div bind:this={sentinel} class="h-1"></div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.prose {
		color: inherit;
	}

	.prose :global(p) {
		margin: 0;
	}

	.prose :global(code) {
		background-color: rgb(241 245 249);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}
</style>
