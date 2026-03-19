<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { accessToken } from '$lib/auth';
	import { api } from '$lib/services/api';
	import type { Post } from '$lib/types/post';
	import PostHeader from '$lib/components/PostHeader.svelte';
	import PostContent from '$lib/components/PostContent.svelte';
	import CommentSection from '$lib/components/CommentSection.svelte';
	import LikeButton from '$lib/components/LikeButton.svelte';
	import { formatNumber } from '$lib/utils/format';

	let post = $state<Post | null>(null);
	let isLoading = $state(true);
	let lastLoadedPostId = $state<string | null>(null);
	let scrolled = $state(false);

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

	function onScroll(e: Event) {
		const el = e.target as HTMLElement;
		scrolled = el.scrollTop > 80;
	}
</script>

<svelte:head>
	<title>{post?.title ?? '로딩 중...'} · MdToBlog</title>
</svelte:head>

<div class="detail-page" onscroll={onScroll} role="main">
	<!-- Detail nav -->
	<nav class="detail-nav">
		<button class="back-btn" onclick={() => goto('/')}>
			<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
				<path d="M19 12H5M12 5l-7 7 7 7"/>
			</svg>
			목록으로
		</button>
		<span class="detail-nav-title" class:show={scrolled}>{post?.title ?? ''}</span>
	</nav>

	{#if isLoading}
		<div class="loading-wrap">
			<div class="spinner"></div>
		</div>
	{:else if post}
		<div class="detail-body">
			<PostHeader {post} />
			<div class="detail-content">
				<PostContent content={post.content} />
			</div>
		</div>

		<div class="detail-footer">
			<LikeButton liked={post.liked} likeCount={post.likeCount} ontoggle={handleLikeToggle} />
			<span class="detail-stat">
				<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
				</svg>
				{formatNumber(post.views ?? 0)}
			</span>
			<span class="detail-stat">
				<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
				</svg>
				{formatNumber(post.comment?.length ?? 0)}
			</span>
		</div>

		<div class="comment-wrapper">
			<CommentSection {post} {refreshPost} />
		</div>
	{:else}
		<div class="loading-wrap">
			<p style="font-size:14px;color:var(--text-secondary);">게시글을 불러올 수 없습니다</p>
			<button class="retry-btn" onclick={() => window.location.reload()}>다시 시도</button>
		</div>
	{/if}
</div>

<style>
.detail-page {
	min-height: 100vh;
	background: var(--bg);
}

.detail-nav {
	position: sticky;
	top: 0;
	z-index: 10;
	background: var(--bg-glass);
	backdrop-filter: blur(20px) saturate(180%);
	-webkit-backdrop-filter: blur(20px) saturate(180%);
	border-bottom: 1px solid var(--border);
	height: 56px;
	display: flex;
	align-items: center;
	padding: 0 24px;
	gap: 12px;
}
.back-btn {
	display: flex;
	align-items: center;
	gap: 5px;
	height: 32px;
	padding: 0 12px 0 8px;
	background: var(--bg-hover);
	border: none;
	border-radius: 9px;
	font-size: 13px;
	font-weight: 500;
	font-family: inherit;
	color: var(--text-secondary);
	cursor: pointer;
	transition: background var(--tr), color var(--tr);
	flex-shrink: 0;
}
.back-btn:hover { background: var(--border); color: var(--text); }
.detail-nav-title {
	font-size: 14px;
	font-weight: 600;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	opacity: 0;
	transition: opacity 0.2s ease;
	color: var(--text);
}
.detail-nav-title.show { opacity: 1; }

.detail-body {
	max-width: 720px;
	margin: 0 auto;
	padding: 44px 24px 0;
}
.detail-content {
	font-size: 15px;
	color: var(--text-secondary);
	line-height: 1.85;
	padding-bottom: 32px;
}

.detail-footer {
	max-width: 720px;
	margin: 0 auto;
	padding: 20px 24px;
	border-top: 1px solid var(--border);
	display: flex;
	align-items: center;
	gap: 10px;
}
.detail-stat {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	color: var(--text-muted);
}

.comment-wrapper {
	max-width: 720px;
	margin: 0 auto;
	padding: 0 24px 60px;
	border-top: 1px solid var(--border);
}

.loading-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 60vh;
	gap: 16px;
}
.spinner {
	width: 20px;
	height: 20px;
	border: 2px solid var(--border);
	border-top-color: var(--text-muted);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
	font-size: 13px;
	color: var(--text-muted);
	background: none;
	border: none;
	cursor: pointer;
	text-decoration: underline;
	font-family: inherit;
}
</style>
