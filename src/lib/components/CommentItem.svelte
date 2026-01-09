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
			await api.createComment({
				postId: post.id,
				content: replyContent.trim(),
				parentId: comment.id
			});
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

		// 낙관적 UI 업데이트
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
			// 롤백
			onCommentUpdate(comment.id, {
				liked: originalLiked,
				likeId: originalLikeId,
				likeCount: originalLikeCount
			});
			alert('좋아요 처리에 실패했습니다');
		}
	}
</script>

<div class="group">
	<div class="flex gap-3">
		<!-- Avatar -->
		<button
			onclick={() => goto(`/user/${comment.user.id}`)}
			class="flex-shrink-0"
			aria-label={`${comment.user.userName} 프로필`}
		>
			<img
				src={`https://avatars.githubusercontent.com/u/${comment.user.githubId}`}
				alt={comment.user.userName}
				class="h-8 w-8 rounded-full border border-gray-200"
			/>
		</button>

		<!-- Content -->
		<div class="min-w-0 flex-1">
			{#if isEditing}
				<!-- Edit Form -->
				<div class="rounded-lg bg-white border border-gray-200 p-4">
					<textarea
						bind:value={editContent}
						class="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
						rows="3"
					></textarea>
					<div class="mt-3 flex justify-end gap-2">
						<button
							onclick={() => {
								isEditing = false;
								editContent = '';
							}}
							class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
						>
							취소
						</button>
						<button
							onclick={handleEditComment}
							disabled={!editContent.trim() || isSubmitting}
							class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? '수정 중...' : '수정'}
						</button>
					</div>
				</div>
			{:else}
				<!-- Normal View -->
				<div class="rounded-lg bg-white border border-gray-200 px-5 py-4">
					<div class="mb-2 flex items-center gap-2">
						<span class="text-base font-medium text-gray-900">{comment.user.userName}</span>
						<span class="text-sm text-gray-400">{getRelativeTime(comment.createdAt)}</span>
					</div>
					<p class="whitespace-pre-wrap break-words text-base text-gray-700">{comment.content}</p>
				</div>
			{/if}

			<!-- Actions -->
			<div class="mt-3 flex items-center gap-4 text-sm">
				<button
					onclick={handleLikeToggle}
					class="flex items-center gap-1.5 font-medium transition {comment.liked
						? 'text-gray-900'
						: 'text-gray-500 hover:text-gray-900'}"
				>
					<svg
						class="h-5 w-5"
						fill={comment.liked ? 'currentColor' : 'none'}
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						/>
					</svg>
					{#if comment.likeCount > 0}
						<span>{comment.likeCount}</span>
					{/if}
				</button>

				<button
					onclick={() => (isReplying = !isReplying)}
					class="font-medium text-gray-500 transition hover:text-gray-900"
				>
					답글
				</button>

				<button
					onclick={handleStartEdit}
					class="font-medium text-gray-500 transition hover:text-gray-900"
				>
					수정
				</button>
				<button
					onclick={handleDeleteComment}
					class="font-medium text-gray-500 transition hover:text-red-600"
				>
					삭제
				</button>

				{#if replies.length > 0}
					<span class="text-gray-400">답글 {replies.length}개</span>
				{/if}
			</div>

			<!-- Reply Form -->
			{#if isReplying}
				<div class="mt-4">
					<textarea
						bind:value={replyContent}
						placeholder="답글을 입력하세요"
						class="w-full resize-none rounded-lg border border-gray-300 bg-white p-4 text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
						rows="3"
					></textarea>
					<div class="mt-3 flex justify-end gap-2">
						<button
							onclick={() => {
								isReplying = false;
								replyContent = '';
							}}
							class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
						>
							취소
						</button>
						<button
							onclick={handleAddReply}
							disabled={!replyContent.trim() || isSubmitting}
							class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? '등록 중...' : '등록'}
						</button>
					</div>
				</div>
			{/if}

		</div>
	</div>

	<!-- Replies (외부로 이동) -->
	{#if replies.length > 0}
		<div class="ml-11 mt-4 space-y-4">
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
