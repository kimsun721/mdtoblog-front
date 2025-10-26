<script lang="ts">
	import { marked } from 'marked';
	export let data: { post: any };

	function timeAgo(dateString: string) {
		const now = new Date();
		const past = new Date(dateString);
		const diff = (now.getTime() - past.getTime()) / 1000; // 초 단위

		if (diff < 60) return `${Math.floor(diff)}초 전`;
		if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
		if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
		if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

		return past.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}
</script>

<div class="mx-auto mt-6 max-w-4xl rounded-lg bg-[#FFFFFF] p-6 font-sans shadow-md">
	<h1 class="mb-4 text-4xl font-extrabold text-[#212529]">{data.post.title}</h1>
	<p class="mb-8 text-sm text-[#868E96]">
		{data.post.user.username} · {timeAgo(data.post.updated_at)}
		<span class="ml-4">조회수: {data.post.views}</span>
	</p>
	<div class="prose max-w-none text-[#212529]">
		{@html marked(data.post.content)}
	</div>
</div>
