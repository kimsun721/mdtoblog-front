<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';

	interface Props {
		content: string;
	}

	let { content }: Props = $props();

	let renderedContent = $state('');
	let containerDiv = $state<HTMLDivElement>();

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
		if (!document.querySelector('link[href*="prism"]')) {
			const prismCSS = document.createElement('link');
			prismCSS.rel = 'stylesheet';
			prismCSS.href =
				'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
			document.head.appendChild(prismCSS);
		}

		if (!(window as any).Prism) {
			const prismJS = document.createElement('script');
			prismJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
			prismJS.onload = () => {
				const languages = ['javascript', 'typescript', 'rust', 'json', 'bash', 'python'];
				languages.forEach((lang) => {
					const script = document.createElement('script');
					script.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
					document.head.appendChild(script);
				});

				setTimeout(() => {
					const prism = (window as any).Prism;
					if (prism && containerDiv) {
						prism.highlightAllUnder(containerDiv);
					}
				}, 150);
			};
			document.head.appendChild(prismJS);
		} else {
			setTimeout(() => {
				const prism = (window as any).Prism;
				if (prism && containerDiv) {
					prism.highlightAllUnder(containerDiv);
				}
			}, 50);
		}
	});
</script>

<div class="prose" bind:this={containerDiv}>
	{@html renderedContent}
</div>

<style>
	.prose {
		max-width: none;
		color: #374151;
		line-height: 1.75;
	}

	/* Headings */
	.prose :global(h1) {
		font-size: 2rem;
		font-weight: 700;
		margin-top: 2rem;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #e5e7eb;
		color: #111827;
	}

	.prose :global(h2) {
		font-size: 1.5rem;
		font-weight: 700;
		margin-top: 1.75rem;
		margin-bottom: 0.75rem;
		color: #111827;
	}

	.prose :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	.prose :global(h4),
	.prose :global(h5),
	.prose :global(h6) {
		font-size: 1.125rem;
		font-weight: 600;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	/* Paragraphs */
	.prose :global(p) {
		margin-bottom: 1rem;
		line-height: 1.75;
	}

	/* Links */
	.prose :global(a) {
		color: #4b5563;
		text-decoration: underline;
		text-underline-offset: 2px;
		font-weight: 500;
		transition: color 150ms;
	}

	.prose :global(a:hover) {
		color: #111827;
	}

	/* Inline code */
	.prose :global(:not(pre) > code) {
		background-color: #f3f4f6;
		color: #1f2937;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		font-weight: 500;
		font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
		border: 1px solid #e5e7eb;
	}

	/* Code blocks */
	.prose :global(pre) {
		background-color: #1e293b !important;
		border-radius: 0.5rem;
		padding: 1.25rem;
		margin: 1.5rem 0;
		overflow-x: auto;
		border: 1px solid #334155;
	}

	.prose :global(pre code) {
		background-color: transparent !important;
		color: #e2e8f0 !important;
		padding: 0 !important;
		border: none !important;
		font-size: 0.875rem;
		line-height: 1.7;
		font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
	}

	/* Blockquote */
	.prose :global(blockquote) {
		border-left: 4px solid #d1d5db;
		background-color: #f9fafb;
		padding: 0.75rem 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: #6b7280;
	}

	.prose :global(blockquote p) {
		margin: 0;
	}

	/* Lists */
	.prose :global(ul),
	.prose :global(ol) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.prose :global(li) {
		margin-bottom: 0.5rem;
		line-height: 1.75;
	}

	.prose :global(ul) {
		list-style-type: disc;
	}

	.prose :global(ol) {
		list-style-type: decimal;
	}

	.prose :global(ul ul),
	.prose :global(ol ol),
	.prose :global(ul ol),
	.prose :global(ol ul) {
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	/* Emphasis */
	.prose :global(strong) {
		font-weight: 600;
		color: #111827;
	}

	.prose :global(em) {
		font-style: italic;
	}

	/* Tables */
	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
		overflow-x: auto;
		display: block;
	}

	.prose :global(thead) {
		background-color: #f9fafb;
		border-bottom: 2px solid #e5e7eb;
	}

	.prose :global(th) {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.875rem;
		color: #374151;
	}

	.prose :global(td) {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e5e7eb;
		color: #4b5563;
	}

	.prose :global(tbody tr:hover) {
		background-color: #f9fafb;
	}

	/* Horizontal rule */
	.prose :global(hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 2rem 0;
	}

	/* Images */
	.prose :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1.5rem 0;
		border: 1px solid #e5e7eb;
	}

	/* Scrollbar for code blocks */
	.prose :global(pre::-webkit-scrollbar) {
		height: 8px;
	}

	.prose :global(pre::-webkit-scrollbar-track) {
		background: #0f172a;
		border-radius: 0 0 0.5rem 0.5rem;
	}

	.prose :global(pre::-webkit-scrollbar-thumb) {
		background: #475569;
		border-radius: 4px;
	}

	.prose :global(pre::-webkit-scrollbar-thumb:hover) {
		background: #64748b;
	}
</style>
