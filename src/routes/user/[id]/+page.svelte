<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	export let data: { profile: any };
	const profile = data.profile;

	let posts: {
		id: number;
		title: string;
		likes: number;
		views: number;
		likeCount: number;
		createdAt: string;
		updatedAt: string;
	}[] = [];
	let comments: {
		id: number;
		post: { id: number; title: string };
		content: string;
		createdAt: string;
		updatedAt: string;
	}[] = [];

	onMount(async () => {
		if (profile) {
			const res = await fetch(`${PUBLIC_API_URL}/user/${profile.id}/posts`);
			const result = await res.json();
			posts = result.data;
			const res2 = await fetch(`${PUBLIC_API_URL}/user/${profile.id}/comments`);
			const result2 = await res2.json();
			comments = result2.data;
		}
	});

	let activeTab: 'posts' | 'comments' = 'posts';
</script>

<svelte:head>
	<title>{profile?.userName ?? '프로필'} · MdToBlog</title>
</svelte:head>

{#if !profile}
	<div class="empty-wrap">
		<p>존재하지 않는 유저입니다.</p>
	</div>
{:else}
	<div class="profile-body">
		<!-- Profile card -->
		<div class="profile-card">
			<div class="profile-avatar-wrap">
				<img
					class="profile-avatar"
					src={`https://avatars.githubusercontent.com/u/${profile.githubId}`}
					alt="프로필"
				/>
				<div class="profile-online"></div>
			</div>
			<div>
				<div class="profile-username">{profile.userName}</div>
				<div class="profile-email">{profile.email}</div>
				<div class="profile-stats">
					<div>
						<div class="profile-stat-num">{posts.length}</div>
						<div class="profile-stat-label">포스트</div>
					</div>
					<div>
						<div class="profile-stat-num">{comments.length}</div>
						<div class="profile-stat-label">댓글</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="profile-tabs">
			<button
				class="profile-tab"
				class:active={activeTab === 'posts'}
				onclick={() => (activeTab = 'posts')}
			>내 글</button>
			<button
				class="profile-tab"
				class:active={activeTab === 'comments'}
				onclick={() => (activeTab = 'comments')}
			>내 댓글</button>
		</div>

		<!-- Posts -->
		{#if activeTab === 'posts'}
			{#if posts.length > 0}
				{#each posts as post}
					<button class="profile-post-item" onclick={() => goto(`/post/${post.id}`)}>
						<div style="flex:1">
							<div class="profile-post-title">{post.title}</div>
							<div class="profile-post-stats">
								<span class="profile-post-stat">
									<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
									</svg>
									{post.views ?? 0}
								</span>
								<span class="profile-post-stat">
									<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
									</svg>
									{post.likeCount ?? 0}
								</span>
							</div>
						</div>
					</button>
				{/each}
			{:else}
				<div class="empty-tab">아직 작성한 글이 없어요</div>
			{/if}

		<!-- Comments -->
		{:else if activeTab === 'comments'}
			{#if comments.length > 0}
				{#each comments as comment}
					<button class="profile-comment-item" onclick={() => goto(`/post/${comment.post.id}`)}>
						<div class="profile-comment-post-title">📄 {comment.post.title}</div>
						<div class="profile-comment-content">{comment.content}</div>
					</button>
				{/each}
			{:else}
				<div class="empty-tab">아직 작성한 댓글이 없어요</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
.empty-wrap {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 60vh;
	font-size: 14px;
	color: var(--text-secondary);
}

.profile-body {
	max-width: 800px;
	margin: 0 auto;
	padding: 40px 24px 60px;
}

.profile-card {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-xl);
	padding: 28px;
	margin-bottom: 24px;
	display: flex;
	align-items: center;
	gap: 20px;
}
.profile-avatar-wrap { position: relative; flex-shrink: 0; }
.profile-avatar {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	object-fit: cover;
	border: 3px solid var(--border);
}
.profile-online {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #22c55e;
	border: 3px solid var(--bg-surface);
	position: absolute;
	bottom: 2px;
	right: 2px;
}
.profile-username { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 3px; }
.profile-email { font-size: 13px; color: var(--text-muted); margin-bottom: 14px; }
.profile-stats { display: flex; gap: 20px; }
.profile-stat-num { font-size: 18px; font-weight: 700; }
.profile-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

.profile-tabs {
	display: flex;
	gap: 2px;
	background: var(--bg-surface);
	border-radius: 12px;
	padding: 3px;
	border: 1px solid var(--border);
	margin-bottom: 18px;
}
.profile-tab {
	flex: 1;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	font-weight: 500;
	border-radius: 9px;
	cursor: pointer;
	color: var(--text-muted);
	transition: all var(--tr);
	border: none;
	background: transparent;
	font-family: inherit;
}
.profile-tab.active {
	background: var(--bg);
	color: var(--text);
	font-weight: 600;
	box-shadow: var(--sh-xs);
}

.profile-post-item {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	padding: 16px 18px;
	margin-bottom: 8px;
	cursor: pointer;
	transition: box-shadow var(--tr), transform var(--tr);
	display: flex;
	align-items: flex-start;
	gap: 12px;
	width: 100%;
	font-family: inherit;
	text-align: left;
}
.profile-post-item:hover { box-shadow: var(--sh-xs); transform: translateY(-1px); }
.profile-post-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; flex: 1; line-height: 1.4; color: var(--text); }
.profile-post-stats { display: flex; gap: 10px; }
.profile-post-stat { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 3px; }

.profile-comment-item {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	padding: 14px 18px;
	margin-bottom: 8px;
	cursor: pointer;
	transition: box-shadow var(--tr);
	width: 100%;
	font-family: inherit;
	text-align: left;
}
.profile-comment-item:hover { box-shadow: var(--sh-xs); }
.profile-comment-post-title { font-size: 12px; color: var(--accent); font-weight: 500; margin-bottom: 5px; }
.profile-comment-content {
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.55;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.empty-tab {
	padding: 40px;
	text-align: center;
	color: var(--text-muted);
	font-size: 14px;
}
</style>
