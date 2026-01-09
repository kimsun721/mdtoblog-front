<script lang="ts">
	import type { Post } from '$lib/types/post';
	import type { Comment } from '$lib/types/comment';
	import { api } from '$lib/services/api';
	import CommentItem from './CommentItem.svelte';
	import { accessToken } from '$lib/auth';
	import { parseJwt } from '$lib/utils/auth';

	interface Props {
		post: Post;
		refreshPost: () => Promise<void>;
	}

	let { post, refreshPost }: Props = $props();
	let newCommentContent = $state('');
	let isSubmitting = $state(false);

	async function handleAddComment() {
		if (!newCommentContent.trim() || isSubmitting) return;

		isSubmitting = true;
		try {
			const result: any = await api.createComment({
				postId: post.id,
				content: newCommentContent.trim()
			});

			// 성공하면 새로고침
			newCommentContent = '';
			await refreshPost();
		} catch (error) {
			console.error('Failed to add comment:', error);
			alert('댓글 등록에 실패했습니다');
		} finally {
			isSubmitting = false;
		}
	}

	function handleCommentUpdate(commentId: number, updates: Partial<Comment>) {
		if (!post.comment) return;

		// 댓글 배열을 순회하면서 해당 댓글 업데이트
		post.comment = post.comment.map((c) => {
			if (c.id === commentId) {
				return { ...c, ...updates };
			}
			return c;
		});
	}

	const topLevelComments = $derived(post.comment?.filter((c) => !c.parent) ?? []);
</script>

<div class="border-t border-gray-200 bg-gray-50 p-6 sm:p-8 lg:p-10">
	<h2 class="mb-6 text-lg font-semibold text-gray-900">
		댓글 <span class="text-gray-500">{post.comment?.length ?? 0}</span>
	</h2>

	<!-- Comment Input -->
	<div class="mb-8">
		<textarea
			bind:value={newCommentContent}
			placeholder="댓글을 남겨보세요"
			class="w-full resize-none rounded-lg border border-gray-300 bg-white p-5 text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
			rows="4"
		></textarea>
		<div class="mt-3 flex justify-end">
			<button
				onclick={handleAddComment}
				disabled={!newCommentContent.trim() || isSubmitting}
				class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? '등록 중...' : '댓글 등록'}
			</button>
		</div>
	</div>

	<!-- Comments List -->
	<div class="space-y-4">
		{#each topLevelComments as comment (comment.id)}
			<CommentItem
				{comment}
				{post}
				{refreshPost}
				onCommentUpdate={handleCommentUpdate}
				replies={post.comment?.filter((c) => c.parent?.id === comment.id) ?? []}
			/>
		{/each}
		{#if topLevelComments.length === 0}
			<p class="py-8 text-center text-sm text-gray-400">첫 댓글을 남겨보세요</p>
		{/if}
	</div>
</div>
