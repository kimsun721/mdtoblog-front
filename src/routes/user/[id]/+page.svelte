<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	export let data: { profile: any };
	const profile = data.profile;

	let posts: {
		id: number;
		title: string;
		likes: number;
		views: number;
		likeCount: number;
		createdAt: string;
		updatedAt: string;
	}[] = [];
	let comments: {
		id: number;
		post: { id: number; title: string };
		content: string;
		createdAt: string;
		updatedAt: string;
	}[] = [];
	onMount(async () => {
		if (profile) {
			const res = await fetch(`${PUBLIC_API_URL}/user/${profile.id}/posts`);
			const result = await res.json();
			posts = result.data;
			const res2 = await fetch(`${PUBLIC_API_URL}/user/${profile.id}/comments`);
			const result2 = await res2.json();
			comments = result2.data;
			console.log(comments, posts);
		}
	});
	let activeTab: 'posts' | 'comments' = 'posts';
</script>

<svelte:head>
	<title>profile</title>
</svelte:head>

{#if !profile}
	<div class="mx-auto mt-20 max-w-md">
		<div class="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
			<svg
				class="mx-auto mb-4 h-16 w-16 text-gray-300"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
				></path>
			</svg>
			<p class="text-lg font-medium text-gray-600">존재하지 않는 유저입니다.</p>
		</div>
	</div>
{:else}
	<div class="mx-auto my-8 max-w-5xl px-4">
		<!-- 프로필 헤더 -->
		<div class="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
			<div class="bg-gradient-to-r from-gray-100 to-gray-50 p-8">
				<div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
					<div class="relative">
						<img
							src={`https://avatars.githubusercontent.com/u/${profile.githubId}`}
							alt="프로필"
							class="h-24 w-24 rounded-full border-4 border-white shadow-md sm:h-28 sm:w-28"
						/>
						<div
							class="absolute right-1 bottom-1 h-5 w-5 rounded-full border-2 border-white bg-green-500"
						></div>
					</div>
					<div class="flex-1">
						<h1 class="mb-2 text-3xl font-bold text-gray-900">{profile.userName}</h1>
						<p class="flex items-center gap-2 text-sm text-gray-600">
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								></path>
							</svg>
							{profile.email}
						</p>
						<div class="mt-4 flex gap-6 text-sm">
							<div class="flex items-center gap-2">
								<svg
									class="h-5 w-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									></path>
								</svg>
								<span class="font-semibold text-gray-900">{posts.length}</span>
								<span class="text-gray-500">개의 글</span>
							</div>
							<div class="flex items-center gap-2">
								<svg
									class="h-5 w-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									></path>
								</svg>
								<span class="font-semibold text-gray-900">{comments.length}</span>
								<span class="text-gray-500">개의 댓글</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 탭 -->
			<div class="flex border-t border-gray-200 bg-white">
				<button
					class="relative flex-1 px-6 py-4 text-center font-medium transition"
					class:text-gray-900={activeTab === 'posts'}
					class:text-gray-500={activeTab !== 'posts'}
					on:click={() => (activeTab = 'posts')}
				>
					<span class="relative z-10">내 글</span>
					{#if activeTab === 'posts'}
						<div class="absolute right-0 bottom-0 left-0 h-0.5 bg-gray-900 transition-all"></div>
					{/if}
				</button>
				<button
					class="relative flex-1 px-6 py-4 text-center font-medium transition"
					class:text-gray-900={activeTab === 'comments'}
					class:text-gray-500={activeTab !== 'comments'}
					on:click={() => (activeTab = 'comments')}
				>
					<span class="relative z-10">내 댓글</span>
					{#if activeTab === 'comments'}
						<div class="absolute right-0 bottom-0 left-0 h-0.5 bg-gray-900 transition-all"></div>
					{/if}
				</button>
			</div>
		</div>

		<!-- 내용 -->
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
			{#if activeTab === 'posts'}
				{#if posts.length > 0}
					<ul class="space-y-3">
						{#each posts as post}
							<li
								class="group rounded-lg border border-gray-200 p-5 transition hover:border-gray-400 hover:shadow-md"
							>
								<a href={`/post/${post.id}`} class="block">
									<h3 class="mb-2 text-lg font-semibold text-gray-900 group-hover:text-black">
										{post.title}
									</h3>
									<div class="flex items-center gap-4 text-xs text-gray-500">
										<span class="flex items-center gap-1">
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												></path>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												></path>
											</svg>
											{post.views ?? 0}
										</span>
										<span class="flex items-center gap-1">
											<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												></path>
											</svg>
											{post.likeCount ?? 0}
										</span>
									</div>
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="py-16 text-center">
						<svg
							class="mx-auto mb-4 h-16 w-16 text-gray-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							></path>
						</svg>
						<p class="text-gray-400">작성한 글이 없습니다.</p>
					</div>
				{/if}
			{:else if comments.length > 0}
				<ul class="space-y-3">
					{#each comments as comment}
						<a href={`/post/${comment.post.id}`} class="font-medium text-gray-900 hover:underline">
							<li
								class="cursor-pointer rounded-lg border border-gray-200 p-5 transition hover:border-gray-400 hover:shadow-md"
							>
								<p class="mb-3 leading-relaxed text-gray-700">{comment.content}</p>
								<div class="flex items-center gap-2 text-sm text-gray-500">
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path>
									</svg>
									<span>게시글 : {comment.post.title}</span>
								</div>
							</li>
						</a>
					{/each}
				</ul>
			{:else}
				<div class="py-16 text-center">
					<svg
						class="mx-auto mb-4 h-16 w-16 text-gray-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						></path>
					</svg>
					<p class="text-gray-400">작성한 댓글이 없습니다.</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
