<script lang="ts">
	import { marked } from 'marked';
	export let data: { posts: any };
	import { accessToken } from '../../lib/auth';
	import { toKrDate } from '$lib/toKrDate';

	let profileImage = '';

	if ($accessToken) {
		const payload = JSON.parse(atob($accessToken.split('.')[1]));
		const githubId = payload.githubId;
		profileImage = `https://avatars.githubusercontent.com/u/${githubId}`;
	}
</script>

<svelte:head>
	<title>검색 결과 · MdToBlog</title>
</svelte:head>

<main class="min-h-screen" style="background: var(--bg);">
	<div class="mx-auto max-w-3xl px-5 py-12 sm:px-8">
		<!-- Header -->
		<div class="mb-8 pb-6 border-b" style="border-color: var(--border);">
			<h1 class="mb-1 text-xl font-semibold tracking-tight" style="color: var(--text);">검색 결과</h1>
			<p class="text-sm" style="color: var(--text-muted);">
				총 <span class="font-medium" style="color: var(--text-secondary);">{data.posts.length}</span>개의 결과
			</p>
		</div>

		<!-- Results -->
		{#if data.posts.length === 0}
			<div class="py-20 text-center">
				<p class="text-sm font-medium" style="color: var(--text-secondary);">검색 결과가 없습니다</p>
				<p class="mt-1 text-xs" style="color: var(--text-muted);">다른 키워드로 검색해보세요</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.posts as post}
					<a href={`/post/${post.id}`} class="cursor-pointer group block rounded-xl border p-5 transition-all duration-150 hover:shadow-md" style="background: var(--bg-surface); border-color: var(--border);">
						<h2 class="mb-2 text-[15px] font-semibold leading-snug transition-colors duration-150 group-hover:opacity-60" style="color: var(--text);">
							{post.title}
						</h2>

						<div class="mb-4 line-clamp-2 text-[13px] leading-relaxed" style="color: var(--text-secondary);">
							{@html marked(post.content)}
						</div>

						<div class="flex items-center gap-2 text-[12px]" style="color: var(--text-muted);">
							<img src={profileImage} alt="프로필" class="h-4 w-4 rounded-full" />
							<span class="font-medium" style="color: var(--text-secondary);">{post.user.userName}</span>
							<span style="color: var(--text-faint);">·</span>
							<span>{toKrDate(post.updatedAt)}</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</main>
