<script lang="ts">
	import type { Post } from '$lib/types/post';
	import type { Comment } from '$lib/types/comment';
	import { accessToken } from '$lib/auth';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { goto } from '$app/navigation';

	export let comment: Comment;
	export let post: Post;
	export let refreshPost: () => Promise<void>;
	export let replies: Comment[] = [];

	let isReplying = false;
	let replyContent = '';

	async function addReply() {
		if (!replyContent.trim()) return;
		await fetch(`${PUBLIC_API_URL}/comment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${$accessToken}`
			},
			body: JSON.stringify({
				postId: post.id,
				content: replyContent,
				parentId: comment.id
			})
		});
		replyContent = '';
		isReplying = false;
		await refreshPost();
	}

	async function deleteComment(commentId: number) {
		if (!confirm('댓글을 삭제하시겠습니까?')) return;
		await fetch(`${PUBLIC_API_URL}/comment/${commentId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${$accessToken}` }
		});
		await refreshPost();
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return '방금 전';
		if (minutes < 60) return `${minutes}분 전`;
		if (hours < 24) return `${hours}시간 전`;
		if (days < 7) return `${days}일 전`;
		return date.toLocaleDateString('ko-KR');
	}
</script>

<div class="group">
	<!-- 댓글 내용 -->
	<div class="flex gap-3">
		<!-- 프로필 이미지 -->
		<div class="flex-shrink-0">
			<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200">
				<button on:click={() => goto(`/user/${comment.user.id}`)} class="cursor-pointer">
					<img
						src={`https://avatars.githubusercontent.com/u/${comment.user.githubId}`}
						alt="프로필"
						class="rounded-full"
					/>
				</button>
			</div>
		</div>

		<!-- 댓글 본문 -->
		<div class="min-w-0 flex-1">
			<div class="rounded-lg bg-gray-50 px-4 py-3">
				<div class="mb-1 flex items-center gap-2">
					<span class="text-sm font-medium text-gray-900">{comment.user.userName || '익명'}</span>
					<span class="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
				</div>
				<p class="text-sm break-words whitespace-pre-wrap text-gray-700">{comment.content}</p>
			</div>

			<!-- 액션 버튼들 -->
			<div class="mt-2 flex items-center gap-3 text-xs">
				<button
					on:click={() => (isReplying = !isReplying)}
					class="font-medium text-gray-500 hover:text-gray-900"
				>
					답글
				</button>

				<button
					on:click={() => deleteComment(comment.id)}
					class="font-medium text-gray-500 hover:text-red-600"
				>
					삭제
				</button>

				{#if replies.length > 0}
					<span class="text-gray-400">답글 {replies.length}개</span>
				{/if}
			</div>

			<!-- 답글 입력 폼 -->
			{#if isReplying}
				<div class="mt-3">
					<textarea
						bind:value={replyContent}
						placeholder="답글을 입력하세요..."
						class="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none"
						rows="2"
					></textarea>
					<div class="mt-2 flex justify-end gap-2">
						<button
							on:click={() => {
								isReplying = false;
								replyContent = '';
							}}
							class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
						>
							취소
						</button>
						<button
							on:click={addReply}
							disabled={!replyContent.trim()}
							class="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
						>
							등록
						</button>
					</div>
				</div>
			{/if}

			<!-- 답글 리스트 -->
			{#if replies.length > 0}
				<div class="mt-4 space-y-4">
					{#each replies as reply (reply.id)}
						<svelte:self comment={reply} {post} {refreshPost} replies={[]} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
