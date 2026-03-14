<script lang="ts">
	import { page } from '$app/stores';
	import { accessToken } from '$lib/auth';
	import { api } from '$lib/services/api';
	import type { Post } from '$lib/types/post';
	import PostHeader from '$lib/components/PostHeader.svelte';
	import PostContent from '$lib/components/PostContent.svelte';
	import CommentSection from '$lib/components/CommentSection.svelte';
	import LikeButton from '$lib/components/LikeButton.svelte';

	let post = $state<Post | null>(null);
	let isLoading = $state(true);
	let lastLoadedPostId = $state<string | null>(null);

	async function loadPost() {
		const postId = $page.params.id;
		if (!postId) return;
		if (lastLoadedPostId === postId && post) return;

		isLoading = true;
		try {
			const data: any = await api.getPost(postId);
			post = data.data;
			lastLoadedPostId = postId;
		} catch (error) {
			console.error('Failed to load post:', error);
		} finally {
			isLoading = false;
		}
	}

	async function refreshPost() {
		const postId = $page.params.id;
		if (!postId) return;
		try {
			const data: any = await api.getPost(postId);
			post = data.data;
		} catch (error) {
			console.error('Failed to refresh post:', error);
		}
	}

	$effect(() => {
		$accessToken;
		$page.params.id;
		setTimeout(() => { loadPost(); }, 50);
	});

	async function handleLikeToggle() {
		if (!post) return;

		const originalLiked = post.liked;
		const originalLikeId = post.likeId;
		const originalLikeCount = post.likeCount;
		const currentPostId = post.id;

		if (post.liked) {
			post = { ...post, liked: false, likeCount: post.likeCount - 1, likeId: undefined };
		} else {
			post = { ...post, liked: true, likeCount: post.likeCount + 1 };
		}

		try {
			if (originalLiked && originalLikeId) {
				await api.unlikePost(originalLikeId);
			} else {
				const result: any = await api.likePost(currentPostId);
				if (result?.data?.likeId) {
					post = { ...post, likeId: result.data.likeId };
				}
			}
			lastLoadedPostId = null;
			await loadPost();
		} catch (error) {
			console.error('Failed to toggle like:', error);
			post = { ...post, liked: originalLiked, likeId: originalLikeId, likeCount: originalLikeCount };
			alert('좋아요 처리에 실패했습니다');
		}
	}
</script>

<svelte:head>
	<title>{post?.title ?? '로딩 중...'} · MdToBlog</title>
</svelte:head>

<main class="min-h-screen" style="background: var(--bg);">
	<div class="mx-auto max-w-5xl px-6 py-12 sm:px-10">
		{#if isLoading}
			<div class="flex min-h-[60vh] items-center justify-center">
				<div class="h-5 w-5 animate-spin rounded-full border-2" style="border-color: var(--border); border-top-color: var(--text-secondary);"></div>
			</div>
		{:else if post}
			<!-- Article card -->
			<div class="rounded-2xl border overflow-hidden" style="background: var(--bg-surface); border-color: var(--border);">
				<div class="p-7 sm:p-10">
					<PostHeader {post} />
					<PostContent content={post.content} />

					<div class="mt-12 flex justify-center border-t pt-10" style="border-color: var(--border-subtle);">
						<LikeButton liked={post.liked} likeCount={post.likeCount} ontoggle={handleLikeToggle} />
					</div>
				</div>

				<div class="border-t" style="border-color: var(--border); background: var(--bg);">
					<div class="p-7 sm:p-10">
						<CommentSection {post} {refreshPost} />
					</div>
				</div>
			</div>
		{:else}
			<div class="flex min-h-[60vh] items-center justify-center">
				<div class="text-center">
					<p class="text-sm" style="color: var(--text-secondary);">게시글을 불러올 수 없습니다</p>
					<button
						onclick={() => window.location.reload()}
						class="cursor-pointer mt-4 text-xs underline underline-offset-2 transition hover:opacity-60"
						style="color: var(--text-muted);"
					>
						다시 시도
					</button>
				</div>
			</div>
		{/if}
	</div>
</main>
