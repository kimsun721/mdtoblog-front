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
		isReply?: boolean;
	}

	let { comment, post, refreshPost, replies = [], onCommentUpdate, isReply = false }: Props = $props();
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

<div class="comment-item" class:reply={isReply}>
	<div class="comment-header">
		<button class="comment-avatar-btn" onclick={() => goto(`/user/${comment.user.id}`)}>
			<img
				class="comment-avatar"
				src={`https://avatars.githubusercontent.com/u/${comment.user.githubId}?s=48`}
				alt={comment.user.userName}
			/>
		</button>
		<span class="comment-username">{comment.user.userName}</span>
		<span class="comment-date">{getRelativeTime(comment.createdAt)}</span>
		{#if isOwnComment}<span class="comment-mine">내 댓글</span>{/if}
	</div>

	{#if isEditing}
		<div class="comment-body" style="padding-left: 36px;">
			<textarea
				bind:value={editContent}
				class="reply-textarea"
				rows="3"
			></textarea>
			<div class="reply-actions">
				<button class="btn-cancel" onclick={() => { isEditing = false; editContent = ''; }}>취소</button>
				<button
					class="btn-submit-sm"
					onclick={handleEditComment}
					disabled={!editContent.trim() || isSubmitting}
				>
					{isSubmitting ? '수정 중...' : '수정'}
				</button>
			</div>
		</div>
	{:else}
		<div class="comment-body">{comment.content}</div>
	{/if}

	<div class="comment-actions">
		<button
			class="comment-action-btn"
			class:liked={comment.liked}
			onclick={handleLikeToggle}
		>
			<svg width="12" height="12" fill={comment.liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
			</svg>
			{#if comment.likeCount > 0}<span>{comment.likeCount}</span>{/if}
		</button>

		{#if currentUser && !isReply}
			<button class="comment-action-btn" onclick={() => (isReplying = !isReplying)}>답글</button>
		{/if}
		{#if isOwnComment && !isEditing}
			<button class="comment-action-btn" onclick={handleStartEdit}>수정</button>
			<button class="comment-action-btn" style="margin-left:auto;color:var(--text-faint)" onclick={handleDeleteComment}>삭제</button>
		{/if}
	</div>

	{#if isReplying}
		<div class="reply-form open">
			<textarea
				bind:value={replyContent}
				class="reply-textarea"
				placeholder="답글을 입력하세요..."
				rows="2"
			></textarea>
			<div class="reply-actions">
				<button class="btn-cancel" onclick={() => { isReplying = false; replyContent = ''; }}>취소</button>
				<button
					class="btn-submit-sm"
					onclick={handleAddReply}
					disabled={!replyContent.trim() || isSubmitting}
				>
					{isSubmitting ? '등록 중...' : '답글 달기'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Replies -->
	{#if replies.length > 0}
		{#each replies as reply (reply.id)}
			<CommentItem
				comment={reply}
				{post}
				{refreshPost}
				{onCommentUpdate}
				isReply={true}
				replies={post.comment?.filter((c) => c.parent?.id === reply.id) ?? []}
			/>
		{/each}
	{/if}
</div>

<style>
.comment-item {
	padding: 16px 0;
	border-bottom: 1px solid var(--border-subtle);
}
.comment-item:last-child { border-bottom: none; }
.comment-item.reply { padding-left: 42px; }

.comment-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 7px;
}
.comment-avatar-btn { background: none; border: none; padding: 0; cursor: pointer; flex-shrink: 0; }
.comment-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.comment-username { font-size: 13px; font-weight: 600; color: var(--text); }
.comment-date { font-size: 12px; color: var(--text-muted); }
.comment-mine {
	font-size: 11px;
	font-weight: 600;
	color: var(--accent);
	background: var(--accent-bg);
	padding: 2px 7px;
	border-radius: 5px;
}
.comment-body {
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.65;
	margin-bottom: 8px;
	padding-left: 36px;
	white-space: pre-wrap;
	word-break: break-word;
}
.comment-actions {
	display: flex;
	align-items: center;
	gap: 6px;
	padding-left: 36px;
}
.comment-action-btn {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	font-weight: 500;
	color: var(--text-muted);
	border: none;
	background: none;
	font-family: inherit;
	cursor: pointer;
	padding: 3px 7px;
	border-radius: 6px;
	transition: all var(--tr);
}
.comment-action-btn:hover { color: var(--text); background: var(--bg-hover); }
.comment-action-btn.liked { color: var(--red); }

.reply-form {
	margin-top: 10px;
	padding-left: 36px;
}
.reply-textarea {
	width: 100%;
	min-height: 64px;
	padding: 10px 12px;
	border: 1.5px solid var(--border);
	border-radius: var(--r-sm);
	font-size: 13px;
	font-family: inherit;
	background: var(--bg-surface);
	color: var(--text);
	resize: none;
	outline: none;
	transition: border-color var(--tr);
}
.reply-textarea:focus { border-color: var(--accent); }
.reply-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px; }
.btn-cancel {
	height: 30px;
	padding: 0 12px;
	background: var(--bg-hover);
	color: var(--text-secondary);
	border: none;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 500;
	font-family: inherit;
	cursor: pointer;
}
.btn-submit-sm {
	height: 30px;
	padding: 0 12px;
	background: var(--accent);
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 12px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	transition: background var(--tr);
}
.btn-submit-sm:hover { background: var(--accent-hover); }
.btn-submit-sm:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
