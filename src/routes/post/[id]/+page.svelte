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

		// 이미 로드한 게시글이면 다시 로드하지 않음
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

	// 강제 새로고침 (댓글 등록시 사용)
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

	// accessToken이 설정되거나 page.params.id가 변경되면 로드
	$effect(() => {
		// dependency: accessToken과 page.params.id를 읽음
		$accessToken;
		$page.params.id;

		// 토큰 대기: layout의 onMount가 완료될 때까지 짧게 대기
		setTimeout(() => {
			loadPost();
		}, 50);
	});

	async function handleLikeToggle() {
		if (!post) return;

		// 낙관적 UI 업데이트 (즉시 반영)
		const originalLiked = post.liked;
		const originalLikeId = post.likeId;
		const originalLikeCount = post.likeCount;
		const currentPostId = post.id;

		// UI 먼저 업데이트
		if (post.liked) {
			post = { ...post, liked: false, likeCount: post.likeCount - 1, likeId: undefined };
		} else {
			post = { ...post, liked: true, likeCount: post.likeCount + 1 };
		}

		try {
			// API 호출
			if (originalLiked && originalLikeId) {
				const result = await api.unlikePost(originalLikeId);
				console.log('Unlike result:', result);
			} else {
				const result: any = await api.likePost(currentPostId);
				console.log('Like result:', result);
				// 좋아요 ID 업데이트
				if (result?.data?.likeId) {
					post = { ...post, likeId: result.data.likeId };
				}
			}

			// 성공하면 데이터 다시 로드 (lastLoadedPostId 초기화해서 강제 로드)
			lastLoadedPostId = null;
			await loadPost();
		} catch (error) {
			console.error('Failed to toggle like:', error);
			// 에러 발생시 원래 상태로 롤백
			post = { ...post, liked: originalLiked, likeId: originalLikeId, likeCount: originalLikeCount };
			alert('좋아요 처리에 실패했습니다');
		}
	}

</script>

<svelte:head>
	<title>{post?.title ?? '로딩 중...'} · MdToBlog</title>
</svelte:head>

<main class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		{#if isLoading}
			<!-- Loading State -->
			<div class="flex min-h-[60vh] items-center justify-center">
				<div class="text-center">
					<div
						class="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900"
					></div>
					<p class="text-sm text-gray-500">로딩 중...</p>
				</div>
			</div>
		{:else if post}
			<!-- Post Content -->
			<article class="rounded-lg border border-gray-200 bg-white shadow-sm">
				<div class="p-6 sm:p-8 lg:p-10">
					<PostHeader {post} />
					<PostContent content={post.content} />

					<!-- Like Button Section -->
					<div class="mt-8 flex justify-center border-t border-gray-100 pt-6">
						<LikeButton liked={post.liked} likeCount={post.likeCount} ontoggle={handleLikeToggle} />
					</div>
				</div>

				<!-- Comments Section -->
				<CommentSection {post} {refreshPost} />
			</article>
		{:else}
			<!-- Error State -->
			<div class="flex min-h-[60vh] items-center justify-center">
				<div class="text-center">
					<p class="text-gray-600">게시글을 불러올 수 없습니다</p>
					<button
						onclick={() => window.location.reload()}
						class="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-gray-800"
					>
						다시 시도
					</button>
				</div>
			</div>
		{/if}
	</div>
</main>
