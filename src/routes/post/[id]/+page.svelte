<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { accessToken } from '$lib/auth';
	import { toKrDate } from '$lib/toKrDate';
	import type { Post } from '$lib/types/post';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';

	let post: Post;
	let profileImage = '';
	let newCommentContent = '';
	let editingCommentId: number | null = null;
	let editingContent = '';
	let visibleReplyId: number | null = null;
	let replyContents: { [key: number]: string } = {};

	onMount(async () => {
		const postId = $page.params.id;
		const result = await fetch(`${PUBLIC_API_URL}/post/${postId}`, {
			headers: {
				Authorization: `Bearer ${$accessToken}`
			}
		});
		const data = await result.json();
		post = data.data;
		profileImage = `https://avatars.githubusercontent.com/u/${post.user.githubId}`;
	});

	async function refreshPost() {
		const postId = $page.params.id;
		const result = await fetch(`${PUBLIC_API_URL}/post/${postId}`, {
			headers: {
				Authorization: `Bearer ${$accessToken}`
			}
		});
		const data = await result.json();
		post = data.data;
	}

	async function togglePostLike() {
		if (post.liked) {
			await fetch(`${PUBLIC_API_URL}/post/${post.likeId}/likes`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${$accessToken}`
				}
			});
		} else {
			await fetch(`${PUBLIC_API_URL}/post/${post.id}/likes`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${$accessToken}`
				}
			});
		}
		await refreshPost();
	}

	async function toggleCommentLike(commentId: number, liked: boolean, likeId: number) {
		if (liked) {
			await fetch(`${PUBLIC_API_URL}/comment/${likeId}/likes`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${$accessToken}`
				}
			});
		} else {
			await fetch(`${PUBLIC_API_URL}/comment/${commentId}/likes`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${$accessToken}`
				}
			});
		}
		await refreshPost();
	}

	async function addComment(parentId?: number) {
		const content = parentId ? replyContents[parentId] : newCommentContent;
		if (!content) return;

		const body = {
			postId: post.id,
			content,
			...(parentId && { parentId })
		};

		await fetch(`${PUBLIC_API_URL}/comment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${$accessToken}`
			},
			body: JSON.stringify(body)
		});

		if (parentId) {
			replyContents[parentId] = '';
			visibleReplyId = null;
		} else {
			newCommentContent = '';
		}
		await refreshPost();
	}

	function startEdit(commentId: number, content: string) {
		editingCommentId = commentId;
		editingContent = content;
	}

	async function saveEdit(commentId: number) {
		await fetch(`${PUBLIC_API_URL}/comment/${commentId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${$accessToken}`
			},
			body: JSON.stringify({ content: editingContent })
		});
		editingCommentId = null;
		await refreshPost();
	}

	async function deleteComment(commentId: number) {
		await fetch(`${PUBLIC_API_URL}/comment/${commentId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${$accessToken}`
			}
		});
		await refreshPost();
	}

	function toggleReply(parentId: number) {
		visibleReplyId = visibleReplyId === parentId ? null : parentId;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-12">
	{#if post}
		<article class="mx-auto max-w-4xl">
			<!-- 메인 게시글 카드 -->
			<div
				class="overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5 transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/10"
			>
				<div class="p-10 md:p-14">
					<!-- 헤더 -->
					<div class="mb-8 border-b border-gray-100 pb-8">
						<h1 class="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
							{post.title}
						</h1>

						<!-- 작성자 정보 -->
						<div class="flex items-center justify-between">
							<button
								on:click={() => goto(`/user/${post.userId}`)}
								class="group flex items-center space-x-4 rounded-2xl p-2 transition-all duration-200 hover:bg-gray-50"
							>
								<div class="relative">
									<img
										src={profileImage}
										alt="프로필"
										class="h-14 w-14 rounded-full border-2 border-gray-200 transition-transform duration-200 group-hover:scale-105 group-hover:border-gray-300"
									/>
									<div
										class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"
									></div>
								</div>
								<div class="text-left">
									<p class="text-lg font-semibold text-gray-900">{post.user.userName}</p>
									<p class="text-sm text-gray-500">{toKrDate(post.updatedAt)}</p>
								</div>
							</button>

							<!-- 메타 정보 -->
							<div class="flex items-center space-x-6 text-sm text-gray-500">
								<div class="flex items-center space-x-2">
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
									<span class="font-medium">{post.views}</span>
								</div>
								<div class="flex items-center space-x-2">
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
										/>
									</svg>
									<span class="font-medium">{post.likeCount}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- 본문 -->
					<div class="prose prose-lg mb-10 max-w-none leading-relaxed text-gray-800 prose-gray">
						{@html marked(post.content)}
					</div>

					<!-- 좋아요 버튼 -->
					<div class="flex justify-center pt-6">
						<button
							on:click={togglePostLike}
							class="group relative overflow-hidden rounded-full px-8 py-4 font-medium text-gray-700 transition-all duration-300 {post.liked
								? 'bg-gray-900 text-white'
								: 'bg-gray-100 hover:bg-gray-900 hover:text-white'}"
						>
							<span class="relative z-10 flex items-center space-x-2">
								<svg
									class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
									fill={post.liked ? 'currentColor' : 'none'}
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
								<span>{post.liked ? '좋아요 취소' : '좋아요'}</span>
							</span>
						</button>
					</div>
				</div>
			</div>

			<!-- 댓글 섹션 -->
			<div class="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5">
				<div class="p-10 md:p-14">
					<h2 class="mb-8 flex items-center text-2xl font-bold text-gray-900">
						<svg
							class="mr-3 h-6 w-6 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
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
								on:click={() => addComment()}
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
							<div
								class="group rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50/50 to-white p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-lg hover:shadow-black/5"
							>
								{#if editingCommentId === parent.id}
									<textarea
										bind:value={editingContent}
										class="mb-4 w-full resize-none rounded-xl border-2 border-gray-200 bg-white p-4 text-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
										rows="3"
									></textarea>
									<div class="flex space-x-3">
										<button
											on:click={() => saveEdit(parent.id)}
											class="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
										>
											저장
										</button>
										<button
											on:click={() => {
												editingCommentId = null;
											}}
											class="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
										>
											취소
										</button>
									</div>
								{:else}
									<p class="mb-4 text-lg leading-relaxed text-gray-800">{parent.content}</p>

									<div class="flex items-center justify-between">
										<div class="flex items-center space-x-2 text-sm text-gray-500">
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												/>
											</svg>
											<span class="font-medium">{parent.likeCount}</span>
										</div>

										<div class="flex space-x-1">
											<button
												on:click={() => toggleCommentLike(parent.id, parent.liked, parent.likeId)}
												class="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 {parent.liked
													? 'bg-gray-900 text-white'
													: 'text-gray-600 hover:bg-gray-100'}"
											>
												{parent.liked ? '좋아요 취소' : '좋아요'}
											</button>
											<button
												on:click={() => startEdit(parent.id, parent.content)}
												class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100"
											>
												수정
											</button>
											<button
												on:click={() => deleteComment(parent.id)}
												class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
											>
												삭제
											</button>
											<button
												on:click={() => toggleReply(parent.id)}
												class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100"
											>
												답글
											</button>
										</div>
									</div>
								{/if}

								<!-- 대댓글 리스트 -->
								{#if post.comment.filter((c) => c.parentId === parent.id).length > 0}
									<div class="mt-6 space-y-4 border-l-2 border-gray-200 pl-6">
										{#each post.comment.filter((c) => c.parentId === parent.id) as child}
											<div
												class="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
											>
												{#if editingCommentId === child.id}
													<textarea
														bind:value={editingContent}
														class="mb-4 w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
														rows="2"
													></textarea>
													<div class="flex space-x-3">
														<button
															on:click={() => saveEdit(child.id)}
															class="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
														>
															저장
														</button>
														<button
															on:click={() => {
																editingCommentId = null;
															}}
															class="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
														>
															취소
														</button>
													</div>
												{:else}
													<p class="mb-3 leading-relaxed text-gray-800">{child.content}</p>

													<div class="flex items-center justify-between">
														<div class="flex items-center space-x-2 text-sm text-gray-500">
															<svg
																class="h-4 w-4"
																fill="none"
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
															<span class="font-medium">{child.likeCount}</span>
														</div>

														<div class="flex space-x-1">
															<button
																on:click={() =>
																	toggleCommentLike(child.id, child.liked, child.likeId)}
																class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 {child.liked
																	? 'bg-gray-900 text-white'
																	: 'text-gray-600 hover:bg-gray-100'}"
															>
																{child.liked ? '좋아요 취소' : '좋아요'}
															</button>
															<button
																on:click={() => startEdit(child.id, child.content)}
																class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-100"
															>
																수정
															</button>
															<button
																on:click={() => deleteComment(child.id)}
																class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
															>
																삭제
															</button>
														</div>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								{/if}

								<!-- 대댓글 입력 -->
								{#if visibleReplyId === parent.id}
									<div class="mt-6 border-l-2 border-gray-200 pl-6">
										<textarea
											bind:value={replyContents[parent.id]}
											placeholder="답글을 입력하세요..."
											class="w-full resize-none rounded-xl border-2 border-gray-200 bg-white p-4 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 focus:outline-none"
											rows="3"
										></textarea>
										<div class="mt-3 flex justify-end">
											<button
												on:click={() => addComment(parent.id)}
												disabled={!replyContents[parent.id]?.trim()}
												class="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-900"
											>
												답글 등록
											</button>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</article>
	{:else}
		<div class="flex min-h-[60vh] items-center justify-center">
			<div class="text-center">
				<div
					class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"
				></div>
				<p class="text-lg text-gray-500">로딩 중...</p>
			</div>
		</div>
	{/if}
</div>
