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

<div class="mx-auto max-w-3xl p-6">
	<h1 class="mb-5 text-4xl font-bold">{data.post.title}</h1>
	<p class="mb-10 text-gray-400">
		{data.post.user.username} · {timeAgo(data.post.updated_at)}
	</p>
	<div class="prose max-w-none prose-invert">
		{@html marked(data.post.content)}
	</div>
</div>
