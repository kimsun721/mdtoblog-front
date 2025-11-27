<script lang="ts">
	import { marked } from 'marked';

	export let content: string;

	// marked 옵션 설정
	marked.setOptions({
		breaks: true,
		gfm: true
	});
</script>

<div
	class="prose-pre:code:bg-transparent prose-pre:code:text-white prose-pre:code:p-0 prose prose-lg mb-10
    max-w-none leading-relaxed text-gray-800
    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 prose-h1:mt-8 prose-h1:mb-4 prose-h1:border-b
    prose-h1:border-gray-200 prose-h1:pb-2 prose-h1:text-4xl
    prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-3xl
    prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-2xl
    prose-h4:mt-4 prose-h4:mb-2
    prose-h4:text-xl prose-p:mb-4 prose-p:leading-7 prose-a:font-medium prose-a:text-blue-600
    prose-a:no-underline hover:prose-a:text-blue-800
    hover:prose-a:underline prose-blockquote:my-4
    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:pl-4 prose-blockquote:text-gray-600 prose-blockquote:italic prose-strong:font-semibold
    prose-strong:text-gray-900 prose-em:text-gray-700 prose-em:italic prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm
    prose-code:text-pink-600 prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:my-4 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-gray-900
    prose-pre:p-4 prose-pre:text-white prose-pre:shadow-lg
    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
    prose-li:mb-2 prose-li:leading-7
    prose-table:my-4 prose-table:w-full prose-table:border-collapse
    prose-thead:border-b-2 prose-thead:border-gray-300 prose-thead:bg-gray-100
    prose-tr:hover:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left
    prose-th:font-semibold prose-td:border-b prose-td:border-gray-200 prose-td:px-4
    prose-td:py-2
    prose-img:my-4 prose-img:rounded-lg
    prose-img:shadow-md prose-hr:my-8 prose-hr:border-gray-300"
>
	{@html marked(content)}
</div>

<style>
	/* 코드 블록 추가 스타일링 */
	:global(.prose pre code) {
		display: block;
		line-height: 1.5;
	}

	/* 인라인 코드와 코드 블록 구분 */
	:global(.prose :not(pre) > code) {
		font-weight: 600;
	}

	/* 리스트 스타일 개선 */
	:global(.prose ul ul),
	:global(.prose ol ol) {
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	/* 테이블 반응형 */
	:global(.prose table) {
		display: block;
		overflow-x: auto;
		white-space: nowrap;
	}
</style>
