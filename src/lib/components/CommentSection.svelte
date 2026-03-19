<script lang="ts">
	import type { Post } from '$lib/types/post';
	import type { Comment } from '$lib/types/comment';
	import { api } from '$lib/services/api';
	import CommentItem from './CommentItem.svelte';
	import { accessToken } from '$lib/auth';
	import { parseJwt } from '$lib/utils/auth';
	import { PUBLIC_API_URL } from '$env/static/public';

	interface Props {
		post: Post;
		refreshPost: () => Promise<void>;
	}

	let { post, refreshPost }: Props = $props();
	let newCommentContent = $state('');
	let isSubmitting = $state(false);

	const currentUser = $derived($accessToken ? parseJwt($accessToken) : null);

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
	const commentCount = $derived(post.comment?.length ?? 0);
</script>

<div class="comment-section">
	<div class="comment-section-title">댓글 {commentCount}개</div>

	<!-- Comment input -->
	{#if currentUser}
		<div class="comment-input-wrap">
			<img
				class="comment-input-avatar"
				src={`https://avatars.githubusercontent.com/u/${currentUser.githubId}?s=64`}
				alt=""
			/>
			<div class="comment-input-box">
				<textarea
					bind:value={newCommentContent}
					class="comment-textarea"
					placeholder="댓글을 입력하세요..."
					rows="3"
				></textarea>
				<div class="comment-submit-row">
					<button
						onclick={handleAddComment}
						disabled={!newCommentContent.trim() || isSubmitting}
						class="btn-submit"
					>
						{isSubmitting ? '등록 중...' : '댓글 달기'}
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="login-prompt">
			<a href={`${PUBLIC_API_URL}/auth/github`}>로그인</a>하면 댓글을 달 수 있어요
		</div>
	{/if}

	<!-- Comments list -->
	<div class="comment-list">
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
			<div class="comment-empty">아직 댓글이 없어요. 첫 댓글을 달아보세요!</div>
		{/if}
	</div>
</div>

<style>
.comment-section { padding-top: 28px; }
.comment-section-title { font-size: 15px; font-weight: 700; margin-bottom: 18px; }
.comment-input-wrap { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 24px; }
.comment-input-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	object-fit: cover;
	flex-shrink: 0;
	margin-top: 2px;
}
.comment-input-box { flex: 1; }
.comment-textarea {
	width: 100%;
	min-height: 80px;
	padding: 12px 14px;
	border: 1.5px solid var(--border);
	border-radius: var(--r-md);
	font-size: 14px;
	font-family: inherit;
	background: var(--bg-surface);
	color: var(--text);
	resize: none;
	outline: none;
	line-height: 1.6;
	transition: border-color var(--tr), box-shadow var(--tr);
}
.comment-textarea::placeholder { color: var(--text-muted); }
.comment-textarea:focus {
	border-color: var(--accent);
	box-shadow: 0 0 0 3px rgba(49,130,246,0.10);
}
.comment-submit-row { display: flex; justify-content: flex-end; margin-top: 8px; }
.btn-submit {
	height: 34px;
	padding: 0 16px;
	background: var(--accent);
	color: #fff;
	border: none;
	border-radius: 9px;
	font-size: 13px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	transition: background var(--tr);
}
.btn-submit:hover { background: var(--accent-hover); }
.btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.login-prompt {
	padding: 20px;
	text-align: center;
	background: var(--bg-hover);
	border-radius: var(--r-md);
	font-size: 14px;
	color: var(--text-muted);
	margin-bottom: 24px;
}
.login-prompt a {
	color: var(--accent);
	font-weight: 600;
	text-decoration: none;
}
.comment-list { display: flex; flex-direction: column; }
.comment-empty {
	padding: 32px;
	text-align: center;
	color: var(--text-muted);
	font-size: 14px;
}
</style>
