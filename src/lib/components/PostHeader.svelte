<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDate } from '$lib/utils/date';
	import { formatNumber } from '$lib/utils/format';
	import type { Post } from '$lib/types/post';

	interface Props {
		post: Post;
	}

	let { post }: Props = $props();
</script>

<header class="post-header">
	<span class="detail-badge">{post.repoName ?? ''}</span>
	<h1 class="detail-title">{post.title}</h1>
	<div class="detail-meta-row">
		<button class="author-btn" onclick={() => goto(`/user/${post.userId}`)}>
			<img
				class="detail-avatar"
				src={`https://avatars.githubusercontent.com/u/${post.user.githubId}`}
				alt={post.user.userName}
			/>
			<div>
				<div class="detail-author-name">{post.user.userName}</div>
				<div class="detail-author-date">{formatDate(post.updatedAt)}</div>
			</div>
		</button>
		<div class="detail-stats">
			<span class="detail-stat">
				<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
				</svg>
				{formatNumber(post.views ?? 0)}
			</span>
			<span class="detail-stat">
				<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
				</svg>
				{formatNumber(post.likeCount ?? 0)}
			</span>
		</div>
	</div>
</header>

<style>
.post-header { margin-bottom: 0; }
.detail-badge {
	display: inline-block;
	font-size: 12px;
	font-weight: 600;
	padding: 3px 10px;
	border-radius: 7px;
	background: var(--accent-bg);
	color: var(--accent);
	margin-bottom: 16px;
}
.detail-title {
	font-size: 28px;
	font-weight: 800;
	letter-spacing: -1px;
	line-height: 1.28;
	color: var(--text);
	margin-bottom: 18px;
}
.detail-meta-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 28px;
	padding-bottom: 22px;
	border-bottom: 1px solid var(--border);
}
.author-btn {
	display: flex;
	align-items: center;
	gap: 10px;
	background: none;
	border: none;
	cursor: pointer;
	font-family: inherit;
	padding: 0;
	transition: opacity var(--tr);
}
.author-btn:hover { opacity: 0.7; }
.detail-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.detail-author-name { font-size: 14px; font-weight: 600; color: var(--text); }
.detail-author-date { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
.detail-stats { display: flex; align-items: center; gap: 14px; }
.detail-stat {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	color: var(--text-muted);
}
</style>
