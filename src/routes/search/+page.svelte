<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { getRelativeTime } from '$lib/utils/date';
	import { formatNumber } from '$lib/utils/format';

	export let data: { posts: any[] };

	const query = $page.url.searchParams.get('q') || '';

	function getPostPreview(content: string): string {
		const plainText = content.replace(/[#*`\[\]()]/g, '').trim();
		return plainText.length > 160 ? plainText.slice(0, 160) + '…' : plainText;
	}
</script>

<svelte:head>
	<title>{query ? `"${query}" 검색 결과` : '검색'} · MdToBlog</title>
</svelte:head>

<div class="search-body">
	<!-- Header -->
	<div class="search-header">
		<div class="search-eyebrow">검색 결과</div>
		<div class="search-title">
			{#if query}
				"<span style="color:var(--accent)">{query}</span>"
			{:else}
				전체 글
			{/if}
		</div>
		<div class="search-count">
			총 <strong>{data.posts.length}</strong>개의 결과
		</div>
	</div>

	<!-- Results -->
	{#if data.posts.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
				</svg>
			</div>
			<div class="empty-title">검색 결과가 없어요</div>
			<div class="empty-desc">다른 키워드로 검색해보세요</div>
		</div>
	{:else}
		<div class="post-list">
			{#each data.posts as post, i}
				<article
					class="post-card"
					style="animation-delay: {Math.min(i, 4) * 0.05}s"
					onclick={() => goto(`/post/${post.id}`)}
					role="button"
					tabindex="0"
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(`/post/${post.id}`); } }}
				>
					<div class="post-meta-top">
						<img
							class="post-avatar"
							src={`https://avatars.githubusercontent.com/u/${post.user.githubId}?s=48`}
							alt={post.user.userName}
						/>
						<button
							type="button"
							class="post-author"
							onclick={(e) => { e.stopPropagation(); goto(`/user/${post.user.id}`); }}
						>{post.user.userName}</button>
						<span class="post-dot">·</span>
						<time class="post-date">{getRelativeTime(post.updatedAt)}</time>
					</div>
					<div class="post-title">{post.title}</div>
					<div class="post-preview">{getPostPreview(post.content)}</div>
					<div class="post-footer">
						<span class="post-stat">
							<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
							</svg>
							{formatNumber(post.views ?? 0)}
						</span>
						<span class="post-stat">
							<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
							</svg>
							{formatNumber(post.commentCount ?? 0)}
						</span>
						<span class="post-stat">
							<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
							</svg>
							{formatNumber(post.likeCount ?? 0)}
						</span>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
.search-body {
	max-width: 720px;
	margin: 0 auto;
	padding: 40px 24px 80px;
}

.search-header {
	margin-bottom: 28px;
}
.search-eyebrow {
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted);
	letter-spacing: 1.2px;
	text-transform: uppercase;
	margin-bottom: 6px;
}
.search-title {
	font-size: 22px;
	font-weight: 800;
	letter-spacing: -0.6px;
	color: var(--text);
	margin-bottom: 6px;
	line-height: 1.3;
}
.search-count {
	font-size: 13px;
	color: var(--text-muted);
}
.search-count strong {
	color: var(--text-secondary);
	font-weight: 600;
}

/* Empty */
.empty-state {
	padding: 60px 0;
	text-align: center;
}
.empty-icon {
	width: 56px;
	height: 56px;
	border-radius: 16px;
	background: var(--bg-surface);
	border: 1px solid var(--border);
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 16px;
	color: var(--text-faint);
}
.empty-title {
	font-size: 15px;
	font-weight: 700;
	color: var(--text-secondary);
	margin-bottom: 4px;
}
.empty-desc {
	font-size: 13px;
	color: var(--text-muted);
}

/* Post cards — same as home page */
.post-list { display: flex; flex-direction: column; gap: 10px; }
.post-card {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	padding: 20px 22px;
	cursor: pointer;
	transition: box-shadow var(--tr), transform var(--tr);
	animation: fadeUp 0.3s ease both;
}
.post-card:hover { box-shadow: var(--sh-sm); transform: translateY(-2px); }
.post-meta-top {
	display: flex;
	align-items: center;
	gap: 7px;
	margin-bottom: 9px;
}
.post-avatar { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; }
.post-author {
	font-size: 13px;
	font-weight: 500;
	color: var(--text-secondary);
	background: none;
	border: none;
	cursor: pointer;
	font-family: inherit;
	padding: 0;
}
.post-author:hover { color: var(--accent); }
.post-dot { color: var(--text-faint); font-size: 11px; }
.post-date { font-size: 12px; color: var(--text-muted); }
.post-title {
	font-size: 15px;
	font-weight: 700;
	letter-spacing: -0.4px;
	color: var(--text);
	margin-bottom: 5px;
	line-height: 1.4;
}
.post-preview {
	font-size: 13px;
	color: var(--text-secondary);
	line-height: 1.6;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin-bottom: 12px;
}
.post-footer { display: flex; align-items: center; gap: 14px; }
.post-stat {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	color: var(--text-muted);
	font-weight: 500;
}

@keyframes fadeUp {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 720px) {
	.search-body { padding: 24px 16px 60px; }
}
</style>
