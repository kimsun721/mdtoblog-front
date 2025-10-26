<script lang="ts">
	import { onMount } from 'svelte';
	import { timeAgo } from '$lib/TimeAgo';
	import { marked } from 'marked';

	let posts: any[] = [];

	let page = 1;
	let limit = 20;

	let sentinel: HTMLDivElement;
	async function loadPosts() {
		const res = await fetch(`http://localhost:3000/api/post?page=${page}&limit=${limit}`);
		const result = await res.json();
		posts = [...posts, ...result.data];
		page++;
	}
	onMount(async () => {
		await loadPosts(); // 함수 호출

		if (sentinel) {
			const observer = new IntersectionObserver(async (entries) => {
				if (entries[0].isIntersecting) {
					await loadPosts();
				}
			});
			observer.observe(sentinel);
		}
	});
	let keyword: string;
</script>

<div class="mx-auto w-full bg-[#F0F2F5] p-6">
	<h1 class="mb-7 ml-15 text-4xl font-bold text-[#212529]">최신 글</h1>
	<ul class="mr-20 ml-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		{#each posts as post}
			<li
				class="rounded-lg border border-[#DEE2E6] bg-[#FFFFFF] p-6 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
			>
				<a href={`/post/${post.id}`} class="font-semibold text-[#212529]">
					<span class="text-2xl font-bold hover:text-[#007BFF]">{post.title}</span>
					<p class="mt-4 mb-4 line-clamp-4 text-[#495057]">{@html marked(post.content)}</p>
					<p class="text-sm text-[#868E96]">
						{post.user.username} · {timeAgo(post.updated_at)}
					</p>
				</a>
			</li>
		{/each}
	</ul>
	<div bind:this={sentinel}></div>
</div>
