<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from './lib/Header.svelte';
	import { timeAgo } from './lib/TimeAgo';

	let posts: any[] = [];
	onMount(async () => {
		const res = await fetch('http://localhost:3000/api/post');
		const result = await res.json();
		posts = result.data;
	});
	let keyword: string;
</script>

<Header></Header>

<div class="mx-auto w-full bg-[#282828] p-6">
	<h1 class="mb-4 text-3xl font-bold text-white">최신 글</h1>
	<ul class="space-y-3">
		{#each posts as post}
			<li class="rounded border-2 border-gray-100 bg-[#282828] p-4 transition hover:bg-gray-50">
				<a href={`/post/${post.id}`} class="font-semibold text-blue-600 hover:underline">
					{post.title}
				</a>
				<p class="text-[#E0E0E0]">
					작성자 : {post.user.username}
					작성일 : {timeAgo(post.updated_at)}
				</p>
			</li>
		{/each}
	</ul>
</div>
