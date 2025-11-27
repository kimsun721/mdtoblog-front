<script lang="ts">
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.css';

	export let content: string;

	// @ts-ignore
	marked.use({
		highlight: function (code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		},
		langPrefix: 'hljs language-'
	});
</script>

<div
	class="prose prose-lg mb-10 max-w-none leading-relaxed text-gray-800 prose-headings:font-bold prose-a:text-blue-600 prose-a:hover:underline prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-pre:rounded-lg prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:text-white prose-ol:list-decimal prose-ul:list-disc prose-li:ml-6"
>
	{@html marked.parse(content)}
</div>

<style>
	.hljs {
		background: #1e1e1e;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
	}
</style>
