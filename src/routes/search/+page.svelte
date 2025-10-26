<script lang="ts">
	import { marked } from 'marked';
	import { timeAgo } from '../../lib/TimeAgo';

	export let data: { posts: any };
	// export let data1: { user: any };
</script>

<div class="mx-auto max-w-4xl bg-[#F0F2F5] p-6 font-sans">
	<h1 class="mb-6 text-4xl font-extrabold text-[#212529]">검색 결과</h1>
	<ul class="space-y-4">
		{#each data.posts as post}
			<li
				class="rounded-xl border border-gray-200 bg-[#FFFFFF] p-5 shadow-sm transition-all duration-300 hover:shadow-lg"
			>
				<a href={`/post/${post.id}`} class="block">
					<h2 class="text-2xl font-bold text-[#212529] transition hover:text-[#717171]">
						{post.title}
					</h2>
					<p class="mt-2 mb-3 line-clamp-4 text-[#495057]">{@html marked(post.content)}</p>
					<p class="text-sm text-[#868E96]">
						작성자 : {post.user.username}
						작성일 : {timeAgo(post.updated_at)}
					</p>
				</a>
			</li>
		{/each}
		{#if data.posts.length === 0}
			<li class="text-[#868E96] italic">검색 결과가 없습니다.</li>
		{/if}
	</ul>
</div>
