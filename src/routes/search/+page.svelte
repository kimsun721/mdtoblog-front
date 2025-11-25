<script lang="ts">
	import { marked } from 'marked';
	export let data: { posts: any };
	import { accessToken } from '../../lib/auth';
	import { toKrDate } from '$lib/toKrDate';

	let profileImage = '';

	if ($accessToken) {
		const payload = JSON.parse(atob($accessToken.split('.')[1]));
		const githubId = payload.githubId;
		const userId = payload.userId;
		profileImage = `https://avatars.githubusercontent.com/u/${githubId}`;
	}
</script>

<svelte:head>
	<title>search</title>
</svelte:head>

<div class="mx-auto my-8 max-w-5xl px-4">
	<!-- 헤더 -->
	<div class="mb-8 border-b border-gray-200 pb-6">
		<h1 class="mb-2 text-3xl font-bold text-gray-900">검색 결과</h1>
		<p class="text-sm text-gray-500">
			총 <span class="font-semibold text-gray-900">{data.posts.length}</span>개의 결과를 찾았습니다
		</p>
	</div>

	<!-- 결과 목록 -->
	<ul class="space-y-4">
		{#each data.posts as post}
			<li
				class="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-400 hover:shadow-lg"
			>
				<a href={`/post/${post.id}`} class="block">
					<!-- 제목 -->
					<h2 class="mb-3 text-xl font-bold text-gray-900 transition group-hover:text-black">
						{post.title}
					</h2>

					<!-- 내용 미리보기 -->
					<div class="prose prose-sm mb-4 line-clamp-3 max-w-none text-gray-600">
						{@html marked(post.content)}
					</div>

					<!-- 메타 정보 -->
					<div
						class="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500"
					>
						<div class="flex items-center gap-1.5">
							<!-- <div
								class="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-xs font-bold text-white"
							>
								{profileImage}
							</div> -->
							<img
								src={profileImage}
								alt="프로필"
								class="h-10 w-10 rounded-full border-2 border-gray-200 transition group-hover:border-gray-400"
							/>
							<span class="font-medium text-gray-700">{post.user.userName}</span>
						</div>
						<span class="text-gray-300">·</span>
						<div class="flex items-center gap-1">
							<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							<span>{toKrDate(post.updatedAt)}</span>
						</div>
					</div>
				</a>
			</li>
		{/each}

		<!-- 빈 상태 -->
		{#if data.posts.length === 0}
			<li class="py-20 text-center">
				<svg
					class="mx-auto mb-4 h-20 w-20 text-gray-300"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					></path>
				</svg>
				<p class="mb-2 text-lg font-medium text-gray-600">검색 결과가 없습니다</p>
				<p class="text-sm text-gray-400">다른 키워드로 검색해보세요</p>
			</li>
		{/if}
	</ul>
</div>
