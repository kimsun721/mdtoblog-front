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
	<title>{profile?.userName ?? '프로필'} · MdToBlog</title>
</svelte:head>

<main class="min-h-screen" style="background: var(--bg);">
	{#if !profile}
		<div class="flex min-h-[60vh] items-center justify-center px-5">
			<p class="text-sm" style="color: var(--text-secondary);">존재하지 않는 유저입니다.</p>
		</div>
	{:else}
		<div class="mx-auto max-w-5xl px-6 py-12 sm:px-10">
			<!-- Profile card -->
			<div class="mb-8 rounded-2xl border p-7" style="background: var(--bg-surface); border-color: var(--border);">
				<div class="flex items-center gap-5">
					<div class="relative flex-shrink-0">
						<img
							src={`https://avatars.githubusercontent.com/u/${profile.githubId}`}
							alt="프로필"
							class="h-16 w-16 rounded-full border-2"
							style="border-color: var(--border);"
						/>
						<div class="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 bg-emerald-400" style="border-color: var(--bg-surface);"></div>
					</div>
					<div>
						<h1 class="text-lg font-semibold" style="color: var(--text);">{profile.userName}</h1>
						<p class="mt-0.5 text-sm" style="color: var(--text-muted);">{profile.email}</p>
						<div class="mt-3 flex gap-5 text-xs" style="color: var(--text-muted);">
							<span><span class="font-semibold" style="color: var(--text);">{posts.length}</span> 글</span>
							<span><span class="font-semibold" style="color: var(--text);">{comments.length}</span> 댓글</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="mb-6 flex gap-1 rounded-xl p-1" style="background: var(--bg-surface); border: 1px solid var(--border);">
				<button
					class="cursor-pointer flex-1 rounded-lg py-2 text-sm font-medium transition"
					style={activeTab === 'posts'
						? 'background: var(--bg); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.08);'
						: 'color: var(--text-muted);'}
					on:click={() => (activeTab = 'posts')}
				>
					내 글
				</button>
				<button
					class="cursor-pointer flex-1 rounded-lg py-2 text-sm font-medium transition"
					style={activeTab === 'comments'
						? 'background: var(--bg); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.08);'
						: 'color: var(--text-muted);'}
					on:click={() => (activeTab = 'comments')}
				>
					내 댓글
				</button>
			</div>

			<!-- Content -->
			{#if activeTab === 'posts'}
				{#if posts.length > 0}
					<div class="space-y-3">
						{#each posts as post}
							<a href={`/post/${post.id}`} class="cursor-pointer group block rounded-xl border p-5 transition-all duration-150 hover:shadow-md" style="background: var(--bg-surface); border-color: var(--border);">
								<h3 class="mb-2 text-[15px] font-medium leading-snug transition group-hover:opacity-60" style="color: var(--text);">
									{post.title}
								</h3>
								<div class="flex items-center gap-3 text-xs" style="color: var(--text-muted);">
									<span class="flex items-center gap-1">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
										</svg>
										{post.views ?? 0}
									</span>
									<span class="flex items-center gap-1">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
										</svg>
										{post.likeCount ?? 0}
									</span>
								</div>
							</a>
						{/each}
					</div>
				{:else}
					<div class="rounded-2xl border py-16 text-center" style="background: var(--bg-surface); border-color: var(--border);">
						<p class="text-sm" style="color: var(--text-muted);">작성한 글이 없습니다.</p>
					</div>
				{/if}
			{:else if comments.length > 0}
				<div class="space-y-3">
					{#each comments as comment}
						<a href={`/post/${comment.post.id}`} class="cursor-pointer group block rounded-xl border p-5 transition-all duration-150 hover:shadow-md" style="background: var(--bg-surface); border-color: var(--border);">
							<p class="mb-2 text-sm leading-relaxed" style="color: var(--text-secondary);">{comment.content}</p>
							<p class="text-xs transition group-hover:opacity-60" style="color: var(--text-muted);">{comment.post.title}</p>
						</a>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border py-16 text-center" style="background: var(--bg-surface); border-color: var(--border);">
					<p class="text-sm" style="color: var(--text-muted);">작성한 댓글이 없습니다.</p>
				</div>
			{/if}
		</div>
	{/if}
</main>
