<script lang="ts">
	import { marked } from 'marked';

	export let content: string;
</script>

<div
	class="prose prose-lg mb-10 max-w-none leading-relaxed text-gray-800 prose-headings:font-bold prose-a:text-blue-600 prose-a:hover:underline prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-pre:rounded-lg prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:text-white prose-ol:list-decimal prose-ul:list-disc prose-li:ml-6"
>
	{@html marked(content)}
</div>
