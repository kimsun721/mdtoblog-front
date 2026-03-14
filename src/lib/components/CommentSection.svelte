<script lang="ts">
	import type { Post } from '$lib/types/post';
	import type { Comment } from '$lib/types/comment';
	import { api } from '$lib/services/api';
	import CommentItem from './CommentItem.svelte';
	import { accessToken } from '$lib/auth';

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
			await api.createComment({ postId: post.id, content: newCommentContent.trim() });
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
		post.comment = post.comment.map((c) => c.id === commentId ? { ...c, ...updates } : c);
	}

	const topLevelComments = $derived(post.comment?.filter((c) => !c.parent) ?? []);
</script>

<div>
	<h2 class="mb-6 text-sm font-semibold" style="color: var(--text);">
		댓글 <span class="font-normal" style="color: var(--text-muted);">{post.comment?.length ?? 0}</span>
	</h2>

	<!-- Comment Input -->
	<div class="mb-8">
		<textarea
			bind:value={newCommentContent}
			placeholder="댓글을 남겨보세요"
			class="w-full cursor-text resize-none rounded-xl border p-4 text-sm outline-none transition"
			style="background: var(--bg); color: var(--text); border-color: var(--border); placeholder-color: var(--text-muted);"
			rows="3"
		></textarea>
		<div class="mt-2.5 flex justify-end">
			<button
				onclick={handleAddComment}
				disabled={!newCommentContent.trim() || isSubmitting}
				class="cursor-pointer rounded-lg px-4 py-2 text-xs font-medium transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
				style="background: var(--text); color: var(--bg-surface);"
			>
				{isSubmitting ? '등록 중...' : '댓글 등록'}
			</button>
		</div>
	</div>

	<!-- Comments -->
	<div class="space-y-6">
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
			<p class="py-10 text-center text-sm" style="color: var(--text-faint);">첫 댓글을 남겨보세요</p>
		{/if}
	</div>
</div>
