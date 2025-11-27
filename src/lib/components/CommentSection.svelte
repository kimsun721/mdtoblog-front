<script lang="ts">
	import type { Post } from '$lib/types/post';
	import type { Comment } from '$lib/types/comment';
	import { accessToken } from '$lib/auth';
	import { PUBLIC_API_URL } from '$env/static/public';
	import CommentItem from './CommentItem.svelte';

	export let post: Post;
	export let refreshPost: () => Promise<void>;

	let newCommentContent = '';

	async function addComment() {
		if (!newCommentContent.trim()) return;
		await fetch(`${PUBLIC_API_URL}/comment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${$accessToken}`
			},
			body: JSON.stringify({ postId: post.id, content: newCommentContent })
		});
		newCommentContent = '';
		await refreshPost();
	}
</script>

<div
	class="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5 transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/10"
>
	<div class="p-10 md:p-14">
		<h2 class="mb-8 flex items-center text-2xl font-bold text-gray-900">
			<svg class="mr-3 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
				/>
			</svg>
			댓글 <span class="ml-2 text-lg text-gray-400">{post.comment.length}</span>
		</h2>
		<!-- 댓글 입력 -->
		<div class="mb-10">
			<textarea
				bind:value={newCommentContent}
				placeholder="댓글을 남겨보세요..."
				class="w-full resize-none rounded-2xl border-2 border-gray-200 bg-gray-50/50 p-5 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
				rows="4"
			></textarea>
			<div class="mt-4 flex justify-end">
				<button
					on:click={addComment}
					disabled={!newCommentContent.trim()}
					class="rounded-xl bg-gray-900 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-900"
				>
					댓글 등록
				</button>
			</div>
		</div>
		<!-- 댓글 리스트 -->
		<div class="space-y-6">
			{#each post.comment.filter((c) => !c.parentId) as parent}
				<CommentItem
					comment={parent}
					{post}
					{refreshPost}
					replies={post.comment.filter((c) => c.parentId === parent.id)}
				/>
			{/each}
		</div>
	</div>
</div>
