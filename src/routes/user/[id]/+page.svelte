<script lang="ts">
	import { onMount } from 'svelte';

	export let data: { profile: any };
	const profile = data.profile;
	console.log(profile);
	let posts: {
		id: number;
		title: string;
		likes: number;
		views: number;
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
			const res = await fetch(`http://localhost:3000/api/user/${profile.id}/posts`);
			const result = await res.json();
			posts = result.data;

			const res2 = await fetch(`http://localhost:3000/api/user/${profile.id}/comments`);
			const result2 = await res2.json();
			comments = result2.data;

			console.log(comments, posts);
		}
	});

	let activeTab: 'posts' | 'comments' = 'posts';
</script>

{#if !profile}
	<div class="mx-auto max-w-2xl rounded bg-white p-6 text-center text-gray-500 shadow">
		존재하지 않는 유저입니다.
	</div>
{:else}
	<div class="mx-auto max-w-4xl rounded bg-white p-6 shadow">
		<!-- 프로필 헤더 -->
		<div class="mb-6 flex items-center gap-4">
			<img
				src={`https://avatars.githubusercontent.com/u/${profile.githubId}`}
				alt="프로필"
				class="h-24 w-24 rounded-full"
			/>
			<div>
				<h1 class="text-3xl font-bold">{profile.userName}</h1>
				<p class="text-gray-500">{profile.email}</p>
			</div>
		</div>

		<!-- 탭 -->
		<div class="mb-6 flex gap-4 border-b">
			<button
				class="border-b-2 pb-2 transition-colors"
				class:border-blue-600={activeTab === 'posts'}
				class:border-transparent={activeTab !== 'posts'}
				on:click={() => (activeTab = 'posts')}
			>
				내 글 ({posts.length})
			</button>
			<button
				class="border-b-2 pb-2 transition-colors"
				class:border-blue-600={activeTab === 'comments'}
				class:border-transparent={activeTab !== 'comments'}
				on:click={() => (activeTab = 'comments')}
			>
				내 댓글 ({comments.length})
			</button>
		</div>

		<!-- 내용 -->
		{#if activeTab === 'posts'}
			{#if posts.length > 0}
				<ul class="space-y-3">
					{#each posts as post}
						<li class="rounded border p-4 transition hover:shadow">
							<a href={`/post/${post.id}`} class="text-600 font-semibold hover:underline"
								>{post.title}</a
							>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-gray-400">작성한 글이 없습니다.</p>
			{/if}
		{:else if comments.length > 0}
			<ul class="space-y-3">
				{#each comments as comment}
					<li class="rounded border p-4 transition hover:shadow">
						<p>{comment.content}</p>
						<p class="mt-1 text-sm text-gray-400">
							게시글: <a href={`/post/${comment.post.id}`} class="text-blue-600 hover:underline"
								>{comment.post.title}</a
							>
						</p>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-gray-400">작성한 댓글이 없습니다.</p>
		{/if}
	</div>
{/if}
