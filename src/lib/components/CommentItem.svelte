<script lang="ts">
	import type { Post } from '$lib/types/post';
	import type { Comment } from '$lib/types/comment';
	import { accessToken } from '$lib/auth';
	import { api } from '$lib/services/api';
	import { parseJwt } from '$lib/utils/auth';
	import { getRelativeTime } from '$lib/utils/date';
	import { goto } from '$app/navigation';
	import CommentItem from './CommentItem.svelte';

	interface Props {
		comment: Comment;
		post: Post;
		refreshPost: () => Promise<void>;
		replies: Comment[];
		onCommentUpdate: (commentId: number, updates: Partial<Comment>) => void;
	}

	let { comment, post, refreshPost, replies = [], onCommentUpdate }: Props = $props();
	let isReplying = $state(false);
	let replyContent = $state('');
	let isSubmitting = $state(false);
	let isEditing = $state(false);
	let editContent = $state('');

	const currentUser = $derived($accessToken ? parseJwt($accessToken) : null);
	const isOwnComment = $derived(currentUser?.id === comment.user.id);

	async function handleAddReply() {
		if (!replyContent.trim() || isSubmitting) return;
		isSubmitting = true;
		try {
			await api.createComment({ postId: post.id, content: replyContent.trim(), parentId: comment.id });
			replyContent = '';
			isReplying = false;
			await refreshPost();
		} catch (error) {
			console.error('Failed to add reply:', error);
			alert('답글 등록에 실패했습니다');
		} finally {
			isSubmitting = false;
		}
	}

	function handleStartEdit() {
		editContent = comment.content;
		isEditing = true;
	}

	async function handleEditComment() {
		if (!editContent.trim() || isSubmitting) return;
		isSubmitting = true;
		try {
			await api.updateComment(comment.id, editContent.trim());
			isEditing = false;
			await refreshPost();
		} catch (error) {
			console.error('Failed to update comment:', error);
			alert('댓글 수정에 실패했습니다');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDeleteComment() {
		if (!confirm('댓글을 삭제하시겠습니까?')) return;
		try {
			await api.deleteComment(comment.id);
			await refreshPost();
		} catch (error) {
			console.error('Failed to delete comment:', error);
			alert('댓글 삭제에 실패했습니다');
		}
	}

	async function handleLikeToggle() {
		const originalLiked = comment.liked;
		const originalLikeId = comment.likeId;
		const originalLikeCount = comment.likeCount;

		onCommentUpdate(comment.id, {
			liked: !comment.liked,
			likeCount: comment.liked ? comment.likeCount - 1 : comment.likeCount + 1,
			likeId: comment.liked ? undefined : comment.likeId
		});

		try {
			if (originalLiked && originalLikeId) {
				await api.unlikeComment(originalLikeId);
			} else {
				const result: any = await api.likeComment(comment.id);
				if (result?.data?.likeId) {
					onCommentUpdate(comment.id, { likeId: result.data.likeId });
				}
			}
		} catch (error) {
			console.error('Failed to toggle comment like:', error);
			onCommentUpdate(comment.id, { liked: originalLiked, likeId: originalLikeId, likeCount: originalLikeCount });
			alert('좋아요 처리에 실패했습니다');
		}
	}
</script>

<div>
	<div class="flex gap-3">
		<!-- Avatar -->
		<button onclick={() => goto(`/user/${comment.user.id}`)} class="cursor-pointer flex-shrink-0" aria-label={`${comment.user.userName} 프로필`}>
			<img
				src={`https://avatars.githubusercontent.com/u/${comment.user.githubId}`}
				alt={comment.user.userName}
				class="h-7 w-7 rounded-full border"
				style="border-color: var(--border);"
			/>
		</button>

		<div class="min-w-0 flex-1">
			{#if isEditing}
				<div>
					<textarea
						bind:value={editContent}
						class="cursor-text w-full resize-none rounded-xl border p-3 text-sm outline-none transition"
						style="background: var(--bg); color: var(--text); border-color: var(--border);"
						rows="3"
					></textarea>
					<div class="mt-2 flex justify-end gap-2">
						<button onclick={() => { isEditing = false; editContent = ''; }} class="cursor-pointer px-3 py-1.5 text-xs font-medium transition hover:opacity-60" style="color: var(--text-muted);">
							취소
						</button>
						<button onclick={handleEditComment} disabled={!editContent.trim() || isSubmitting}
							class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
							style="background: var(--text); color: var(--bg-surface);">
							{isSubmitting ? '수정 중...' : '수정'}
						</button>
					</div>
				</div>
			{:else}
				<div class="mb-1 flex items-baseline gap-2">
					<span class="text-sm font-medium" style="color: var(--text);">{comment.user.userName}</span>
					<span class="text-xs" style="color: var(--text-muted);">{getRelativeTime(comment.createdAt)}</span>
				</div>
				<p class="text-sm leading-relaxed whitespace-pre-wrap break-words" style="color: var(--text-secondary);">{comment.content}</p>
			{/if}

			<!-- Actions -->
			<div class="mt-2.5 flex items-center gap-3 text-xs" style="color: var(--text-muted);">
				<button onclick={handleLikeToggle} class="cursor-pointer flex items-center gap-1 transition hover:opacity-100" style="color: {comment.liked ? 'var(--text)' : 'var(--text-muted)'};">
					<svg class="h-3.5 w-3.5" fill={comment.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
					</svg>
					{#if comment.likeCount > 0}<span>{comment.likeCount}</span>{/if}
				</button>

				<button onclick={() => (isReplying = !isReplying)} class="cursor-pointer transition hover:opacity-100">답글</button>
				<button onclick={handleStartEdit} class="cursor-pointer transition hover:opacity-100">수정</button>
				<button onclick={handleDeleteComment} class="cursor-pointer transition hover:text-red-500">삭제</button>
			</div>

			<!-- Reply form -->
			{#if isReplying}
				<div class="mt-3">
					<textarea
						bind:value={replyContent}
						placeholder="답글을 입력하세요"
						class="cursor-text w-full resize-none rounded-xl border p-3 text-sm outline-none transition"
						style="background: var(--bg); color: var(--text); border-color: var(--border);"
						rows="2"
					></textarea>
					<div class="mt-2 flex justify-end gap-2">
						<button onclick={() => { isReplying = false; replyContent = ''; }} class="cursor-pointer px-3 py-1.5 text-xs font-medium transition hover:opacity-60" style="color: var(--text-muted);">
							취소
						</button>
						<button onclick={handleAddReply} disabled={!replyContent.trim() || isSubmitting}
							class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
							style="background: var(--text); color: var(--bg-surface);">
							{isSubmitting ? '등록 중...' : '등록'}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Replies -->
	{#if replies.length > 0}
		<div class="ml-10 mt-5 space-y-5 border-l-2 pl-4" style="border-color: var(--border-subtle);">
			{#each replies as reply (reply.id)}
				<CommentItem
					comment={reply}
					{post}
					{refreshPost}
					{onCommentUpdate}
					replies={post.comment?.filter((c) => c.parent?.id === reply.id) ?? []}
				/>
			{/each}
		</div>
	{/if}
</div>
