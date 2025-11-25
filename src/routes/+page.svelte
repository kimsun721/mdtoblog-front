<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { toKrDate } from '$lib/toKrDate';
	import { onMount, onDestroy } from 'svelte';

	interface Post {
		id: number;
		title: string;
		content: string;
		user: { userName: string };
		views?: number;
		updated_at?: string;
		updatedAt?: string;
	}

	let posts: Post[] = [];
	let page = 1;
	const limit = 20;
	let sentinel: HTMLDivElement;
	let isLoading = true;
	let isFetchingMore = false;
	let hasMore = true;
	let observer: IntersectionObserver | null = null;
	let fetchAbort: AbortController | null = null;

	const stripMarkdown = (md = '') =>
		md
			.replace(/```[\s\S]*?```/g, '')
			.replace(/`[^`]*`/g, '')
			.replace(/!\[.*?\]\(.*?\)/g, '')
			.replace(/\[(.*?)\]\(.*?\)/g, '$1')
			.replace(/[#>*_\-~]/g, '')
			.replace(/\n{2,}/g, '\n')
			.replace(/\s{2,}/g, ' ')
			.trim();

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
		const txt = stripMarkdown(content);
		return txt.length > 240 ? txt.slice(0, 240) + '…' : txt;
	};
</script>

<svelte:head>
	<title>Home · 최신 글</title>
</svelte:head>

<div class="mx-auto my-8 max-w-7xl px-4">
	<header class="mb-10 flex items-end justify-between border-b border-gray-200 pb-6">
		<div>
			<h1 class="text-4xl font-bold text-gray-900">최신 글</h1>
			<p class="mt-2 text-sm text-gray-500">최신 포스트를 자동으로 불러옵니다</p>
		</div>
		<!-- <div class="text-sm text-gray-400">
			{posts.length}개의 글
		</div> -->
	</header>

	{#if isLoading && posts.length === 0}
		<ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each Array(8) as _}
				<li class="animate-pulse rounded-xl border border-gray-200 bg-white p-6">
					<div class="mb-4 h-6 w-3/4 rounded-lg bg-gray-200"></div>
					<div class="space-y-2">
						<div class="h-3 w-full rounded bg-gray-100"></div>
						<div class="h-3 w-5/6 rounded bg-gray-100"></div>
						<div class="h-3 w-4/5 rounded bg-gray-100"></div>
					</div>
					<div class="mt-6 flex items-center justify-between">
						<div class="h-3 w-20 rounded bg-gray-100"></div>
						<div class="h-3 w-16 rounded bg-gray-100"></div>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each posts as post}
				<li
					class="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-400 hover:shadow-lg"
				>
					<a data-sveltekit-preload-data href={`/post/${post.id}`} class="block h-full">
						<div class="flex h-full flex-col">
							<h2 class="mb-3 line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-black">
								{post.title}
							</h2>
							<p class="mb-auto line-clamp-4 text-sm leading-relaxed text-gray-600">
								{preview(post.content)}
							</p>
							<div
								class="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500"
							>
								<span class="font-medium">{post.user?.userName ?? '익명'}</span>
								<span>{toKrDate(post.updatedAt)}</span>
							</div>
						</div>
					</a>
				</li>
			{/each}
		</ul>

		{#if isFetchingMore}
			<div class="mt-10 flex justify-center">
				<div class="flex items-center gap-2 text-gray-500">
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"
					></div>
					<span class="text-sm">로딩 중...</span>
				</div>
			</div>
		{:else if !hasMore}
			<div class="mt-10 text-center">
				<div
					class="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
						></path>
					</svg>
					모든 글을 불러왔습니다
				</div>
			</div>
		{:else}
			<div class="mt-10 text-center">
				<button
					on:click={fetchPosts}
					class="rounded-lg border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
					>더 불러오기</button
				>
			</div>
		{/if}
	{/if}

	<div bind:this={sentinel} class="h-1"></div>
</div>
