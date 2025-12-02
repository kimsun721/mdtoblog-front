<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';

	export let content: string;

	let renderedContent = '';
	let containerDiv: HTMLDivElement;

	// marked 옵션 설정
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	function escapeHtml(text: string): string {
		const map: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, (m) => map[m]);
	}

	function processMarkdown(md: string): string {
		const renderer = new marked.Renderer();

		renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
			const language = lang || 'plaintext';
			return `<pre><code class="language-${language}">${escapeHtml(text)}</code></pre>`;
		};

		return marked(content, { renderer }) as string;
	}

	onMount(() => {
		renderedContent = processMarkdown(content);

		// Prism.js 동적 로드
		const prismCSS = document.createElement('link');
		prismCSS.rel = 'stylesheet';
		prismCSS.href =
			'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
		document.head.appendChild(prismCSS);

		const prismJS = document.createElement('script');
		prismJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
		prismJS.onload = () => {
			// 주요 언어 로드
			const languages = ['javascript', 'typescript', 'rust', 'json', 'shell', 'sql'];
			languages.forEach((lang) => {
				const script = document.createElement('script');
				script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
				document.head.appendChild(script);
			});

			// 하이라이팅 적용
			setTimeout(() => {
				const prism = (window as any).Prism;
				if (prism && containerDiv) {
					prism.highlightAllUnder(containerDiv);
				}
			}, 100);
		};
		document.head.appendChild(prismJS);
	});
</script>

<div class="markdown-container" bind:this={containerDiv}>
	{@html renderedContent}
</div>

<style>
	.markdown-container {
		max-width: none;
		margin-bottom: 2.5rem;
		color: #1f2937;
		line-height: 1.75;
	}

	/* 제목 스타일 */
	.markdown-container :global(h1) {
		font-size: 2.25rem;
		font-weight: 700;
		margin-top: 2rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #e5e7eb;
		color: #111827;
	}

	.markdown-container :global(h2) {
		font-size: 1.875rem;
		font-weight: 700;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: #111827;
	}

	.markdown-container :global(h3) {
		font-size: 1.5rem;
		font-weight: 700;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		color: #111827;
	}

	.markdown-container :global(h4) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
		color: #111827;
	}

	/* 문단 */
	.markdown-container :global(p) {
		margin-bottom: 1rem;
		line-height: 1.75;
	}

	/* 링크 */
	.markdown-container :global(a) {
		color: #2563eb;
		text-decoration: none;
		font-weight: 500;
	}

	.markdown-container :global(a:hover) {
		color: #1e40af;
		text-decoration: underline;
	}

	/* 인라인 코드 */
	.markdown-container :global(:not(pre) > code) {
		background-color: #f3f4f6;
		color: #db2777;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		font-weight: 600;
		font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	}

	/* 코드 블록 */
	.markdown-container :global(pre) {
		background-color: #1e293b !important;
		border-radius: 0.5rem;
		padding: 1.25rem;
		margin: 1.5rem 0;
		overflow-x: auto;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.markdown-container :global(pre code) {
		background-color: transparent !important;
		color: #e2e8f0 !important;
		padding: 0 !important;
		font-size: 0.875rem;
		line-height: 1.7;
		font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	}

	/* 인용구 */
	.markdown-container :global(blockquote) {
		border-left: 4px solid #3b82f6;
		background-color: #f8fafc;
		padding: 0.75rem 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: #475569;
	}

	/* 리스트 */
	.markdown-container :global(ul),
	.markdown-container :global(ol) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.markdown-container :global(li) {
		margin-bottom: 0.5rem;
		line-height: 1.75;
	}

	.markdown-container :global(ul) {
		list-style-type: disc;
	}

	.markdown-container :global(ol) {
		list-style-type: decimal;
	}

	.markdown-container :global(ul ul),
	.markdown-container :global(ol ol) {
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	/* 강조 */
	.markdown-container :global(strong) {
		font-weight: 600;
		color: #111827;
	}

	.markdown-container :global(em) {
		font-style: italic;
		color: #374151;
	}

	/* 테이블 */
	.markdown-container :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
		overflow-x: auto;
		display: block;
	}

	.markdown-container :global(thead) {
		background-color: #f3f4f6;
		border-bottom: 2px solid #d1d5db;
	}

	.markdown-container :global(th) {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #374151;
	}

	.markdown-container :global(td) {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.markdown-container :global(tbody tr:hover) {
		background-color: #f9fafb;
	}

	/* 구분선 */
	.markdown-container :global(hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 2rem 0;
	}

	/* 이미지 */
	.markdown-container :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	}
</style>
