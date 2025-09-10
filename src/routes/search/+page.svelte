<script lang="ts">
	import Header from '../lib/Header.svelte';
	import { timeAgo } from '../lib/TimeAgo';

	export let data: { posts: any };
</script>

<Header></Header>
<div class="mx-auto max-w-4xl p-6 font-sans">
	<h1 class="mb-6 text-4xl font-extrabold text-[#FFFFFF]">검색 결과</h1>
	<ul class="space-y-4">
		{#each data.posts as post}
			<li
				class="rounded-xl border border-gray-200 bg-[#282828] p-5 shadow-sm transition-all duration-300 hover:shadow-lg"
			>
				<a
					href={`/post/${post.id}`}
					class="text-xl font-bold text-[#5B7C99] hover:text-blue-500 hover:underline"
				>
					<h2>{post.title}</h2>
					<p class="text-[#FFFFFF]">
						작성자 : {post.user.username}
						작성일 : {timeAgo(post.updated_at)}
					</p>
				</a>
			</li>
		{/each}
		{#if data.posts.length === 0}
			<li class="text-gray-500 italic">검색 결과가 없습니다.</li>
		{/if}
	</ul>
</div>
