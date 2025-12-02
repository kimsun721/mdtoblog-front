<script lang="ts">
	import { page } from '$app/stores';
	import { accessToken } from '$lib/auth';
	import type { Post } from '$lib/types/post';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import PostHeader from '$lib/components/PostHeader.svelte';
	import PostContent from '$lib/components/PostContent.svelte';
	import CommentSection from '$lib/components/CommentSection.svelte';
	import LikeButton from '$lib/components/LikeButton.svelte';
	import { goto } from '$app/navigation';

	let post: Post | null = null;
	console.log($accessToken);

	async function loadPost() {
		const postId = $page.params.id;
		const response = await fetch(`${PUBLIC_API_URL}/post/${postId}`, {
			headers: { Authorization: `Bearer ${$accessToken}` }
		});
		const data = await response.json();
		post = data.data;
	}

	async function refreshPost() {
		await loadPost();
	}

	onMount(loadPost);
</script>

<div class="min-h-screen bg-gray-50 px-4 py-8">
	{#if post}
		<article class="mx-auto max-w-4xl">
			<!-- 메인 게시글 카드 -->
			<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
				<div class="p-6 md:p-10">
					<PostHeader {post} on:navigate={(e) => goto(e.detail.url)} />
					<PostContent content={post.content} />

					<div class="flex justify-center border-t border-gray-100 pt-6">
						<LikeButton
							liked={post.liked}
							likeCount={post.likeCount}
							on:toggle={async () => {
								if (post?.liked) {
									await fetch(`${PUBLIC_API_URL}/post/${post.likeId}/likes`, {
										method: 'DELETE',
										headers: { Authorization: `Bearer ${$accessToken}` }
									});
								} else {
									await fetch(`${PUBLIC_API_URL}/post/${post?.id}/likes`, {
										method: 'POST',
										headers: { Authorization: `Bearer ${$accessToken}` }
									});
								}
								await refreshPost();
							}}
						/>
					</div>
				</div>

				<!-- 댓글 섹션 -->
				<CommentSection {post} {refreshPost} />
			</div>
		</article>
	{:else}
		<div class="flex min-h-[60vh] items-center justify-center">
			<div class="text-center">
				<div
					class="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900"
				></div>
				<p class="text-sm text-gray-500">로딩 중...</p>
			</div>
		</div>
	{/if}
</div>
