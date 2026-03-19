<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { api } from '$lib/services/api';
	import { getRelativeTime } from '$lib/utils/date';
	import { formatNumber } from '$lib/utils/format';
	import type { Post } from '$lib/types/post';

	let posts = $state<Post[]>([]);
	let trendingPosts = $state<Post[]>([]);
	let page = $state(1);
	let sentinel = $state<HTMLElement>();
	let isLoading = $state(true);
	let isFetchingMore = $state(false);
	let hasMore = $state(true);
	let observer: IntersectionObserver | null = null;
	let fetchAbort: AbortController | null = null;
	let activeTab = $state<'latest' | 'trending'>('latest');

	// 실제 stats
	let stats = $state({ totalPosts: 0, totalUsers: 0, today: { posts: 0 } });

	// 인기 키워드 (하드코딩)
	const KEYWORDS = ['Rust', 'TypeScript', 'NestJS', 'WebRTC', 'Redis', 'Docker', 'Svelte', 'Tauri', 'Prisma', 'PostgreSQL', 'AWS', 'Go'];

	let topUsers = $state<Array<{ id: number; userName: string; githubId: number; postCount: number }>>([]);

	const limit = 20;

	async function fetchPosts(reset = false) {
		if (isFetchingMore || (!hasMore && !reset)) return;

		isFetchingMore = true;
		fetchAbort?.abort();
		fetchAbort = new AbortController();

		try {
			const result: any = await api.getPosts(reset ? 1 : page, limit, fetchAbort.signal, 'created_at');
			const list: Post[] = result?.data || [];

			if (list.length === 0) {
				hasMore = false;
			} else {
				if (reset) {
					posts = list;
					page = 2;
					hasMore = true;
				} else {
					posts = [...posts, ...list];
					page++;
				}
			}
		} catch (error: any) {
			if (error.name !== 'AbortError') {
				console.error('Failed to fetch posts:', error);
			}
		} finally {
			isFetchingMore = false;
			isLoading = false;
		}
	}

	async function fetchTrending() {
		try {
			const result: any = await api.getPosts(1, 5, undefined, 'views');
			trendingPosts = result?.data || [];
		} catch (e) {
			console.error('Failed to fetch trending:', e);
		}
	}

	async function fetchStats() {
		try {
			const result: any = await api.getStats();
			stats = result;
		} catch (e) {
			// 실패해도 기본값 유지
		}
	}

	async function fetchTopUsers() {
		try {
			const result: any = await api.getTopUsers(4);
			topUsers = result?.data || [];
		} catch (e) {
			console.error('Failed to fetch top users:', e);
		}
	}

	function setupObserver() {
		if (!sentinel) return;
		observer?.disconnect();
		observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting && activeTab === 'latest') fetchPosts(); },
			{ root: null, rootMargin: '200px', threshold: 0.1 }
		);
		observer.observe(sentinel);
	}

	function getPostPreview(content: string): string {
		const plainText = content.replace(/[#*`\[\]()]/g, '').trim();
		return plainText.length > 160 ? plainText.slice(0, 160) + '…' : plainText;
	}

	const tabLabel = $derived(activeTab === 'latest' ? '최신 포스트' : '인기 포스트');
	const displayedPosts = $derived(activeTab === 'trending' ? trendingPosts : posts);

	onMount(async () => {
		await Promise.all([fetchPosts(true), fetchTrending(), fetchStats(), fetchTopUsers()]);
		setupObserver();
	});

	onDestroy(() => {
		observer?.disconnect();
		fetchAbort?.abort();
	});
</script>

<svelte:head>
	<title>MdToBlog — 개발자 블로그 플랫폼</title>
</svelte:head>

<div class="page-wrapper">
	<main class="main-col">
		<!-- Hero -->
		<div class="hero">
			<div class="hero-eyebrow">Developer Blog Platform</div>
			<div class="hero-title">GitHub 마크다운을<br>블로그로 모아드려요</div>
			<div class="hero-sub">레포를 연결하면 자동으로 포스트가 생성돼요</div>
			<div class="hero-stats">
				<div>
					<div class="hero-stat-num">{stats.totalPosts.toLocaleString()}</div>
					<div class="hero-stat-label">전체 포스트</div>
				</div>
				<div>
					<div class="hero-stat-num">{stats.totalUsers.toLocaleString()}</div>
					<div class="hero-stat-label">개발자</div>
				</div>
				<div>
					<div class="hero-stat-num">{stats.today.posts}</div>
					<div class="hero-stat-label">오늘 업데이트</div>
				</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="tabs">
			<button class="tab" class:active={activeTab === 'latest'} onclick={() => activeTab = 'latest'}>최신 글</button>
			<button class="tab" class:active={activeTab === 'trending'} onclick={() => activeTab = 'trending'}>인기 글</button>
		</div>

		<!-- Section header -->
		<div class="section-header">
			<span class="section-title">{tabLabel}</span>
		</div>

		<!-- Post list -->
		{#if isLoading && posts.length === 0}
			<div class="post-list">
				{#each Array(5) as _}
					<div class="post-card" style="cursor: default;">
						<div style="height:13px;width:60%;background:var(--bg-hover);border-radius:6px;margin-bottom:10px;"></div>
						<div style="height:13px;width:100%;background:var(--bg-hover);border-radius:6px;margin-bottom:6px;"></div>
						<div style="height:13px;width:80%;background:var(--bg-hover);border-radius:6px;"></div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="post-list">
				{#each displayedPosts as post, i (post.id)}
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
							<time class="post-date" datetime={new Date(post.updatedAt).toISOString()}>
								{getRelativeTime(post.updatedAt)}
							</time>
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

			{#if activeTab === 'latest'}
				{#if isFetchingMore}
					<div style="display:flex;justify-content:center;padding:16px;">
						<div style="width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--text-muted);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
					</div>
				{:else if hasMore}
					<button class="load-more-btn" onclick={() => fetchPosts()}>더 보기</button>
				{:else if posts.length > 0}
					<div style="text-align:center;padding:16px;font-size:12px;color:var(--text-faint);">모든 글을 불러왔습니다</div>
				{/if}
			{/if}
		{/if}
	</main>

	<!-- Sidebar -->
	<aside class="side-col">
		<div class="notice-banner">
			<div class="notice-icon">
				<svg width="13" height="13" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24">
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
				</svg>
			</div>
			<div>
				<div class="notice-title">레포 연동하고 시작해요</div>
				<div class="notice-desc">GitHub 레포를 등록하면 마크다운이 자동으로 포스트로 변환돼요.</div>
			</div>
		</div>

		<div class="sidebar-card">
			<div class="sidebar-title">🔍 인기 키워드</div>
			<div class="tag-cloud">
				{#each KEYWORDS as kw}
					<button class="tag-cloud-item" onclick={() => goto(`/search?q=${encodeURIComponent(kw)}`)}>{kw}</button>
				{/each}
			</div>
		</div>

		<div class="sidebar-card">
			<div class="sidebar-title">📈 인기 포스트 TOP 5</div>
			<div class="trend-list">
				{#if trendingPosts.length === 0}
					<div style="font-size:12px;color:var(--text-faint);padding:8px 0;">불러오는 중...</div>
				{:else}
					{#each trendingPosts as post, i}
						<button class="trend-item" onclick={() => goto(`/post/${post.id}`)}>
							<span class="trend-rank">{i + 1}</span>
							<span class="trend-text">{post.title}</span>
							<span class="trend-count">{formatNumber(post.views ?? 0)} 조회</span>
						</button>
					{/each}
				{/if}
			</div>
		</div>
		<div class="sidebar-card">
			<div class="sidebar-title">✨ 활발한 개발자</div>
			<div class="contrib-list">
				{#if topUsers.length === 0}
					<div style="font-size:12px;color:var(--text-faint);padding:8px 0;">불러오는 중...</div>
				{:else}
					{#each topUsers as user, i}
						<button class="contrib-item" onclick={() => goto(`/user/${user.id}`)}>
							<img class="contrib-avatar-img" src={`https://avatars.githubusercontent.com/u/${user.githubId}?s=72`} alt={user.userName} />
							<div>
								<div class="contrib-name">{user.userName}</div>
								<div class="contrib-count">{user.postCount} 포스트</div>
							</div>
							{#if i === 0}<span class="contrib-badge">🥇</span>
							{:else if i === 1}<span class="contrib-badge">🥈</span>
							{:else if i === 2}<span class="contrib-badge">🥉</span>{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</aside>
</div>

<div bind:this={sentinel} style="height:1px;"></div>

<style>
@keyframes spin {
	to { transform: rotate(360deg); }
}

.page-wrapper {
	max-width: 1100px;
	margin: 0 auto;
	padding: 32px 24px 80px;
	display: grid;
	grid-template-columns: 1fr 288px;
	gap: 28px;
}
.main-col { min-width: 0; }

/* Hero */
.hero {
	background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0c2461 100%);
	border-radius: var(--r-xl);
	padding: 32px 36px;
	margin-bottom: 28px;
	position: relative;
	overflow: hidden;
}
.hero::before {
	content: '';
	position: absolute;
	top: -80px;
	right: -80px;
	width: 260px;
	height: 260px;
	background: radial-gradient(circle, rgba(49,130,246,0.25) 0%, transparent 70%);
	border-radius: 50%;
}
.hero-eyebrow {
	font-size: 11px;
	font-weight: 600;
	color: rgba(255,255,255,0.45);
	letter-spacing: 1.4px;
	text-transform: uppercase;
	margin-bottom: 8px;
}
.hero-title {
	font-size: 24px;
	font-weight: 700;
	color: #fff;
	letter-spacing: -0.7px;
	line-height: 1.3;
	margin-bottom: 6px;
}
.hero-sub { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 22px; }
.hero-stats { display: flex; gap: 24px; }
.hero-stat-num { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.4px; }
.hero-stat-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }

/* Tabs */
.tabs {
	display: flex;
	gap: 2px;
	margin-bottom: 18px;
	background: var(--bg-surface);
	border-radius: 12px;
	padding: 3px;
	border: 1px solid var(--border);
}
.tab {
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
	transition: background var(--tr), color var(--tr);
	border: none;
	background: transparent;
	font-family: inherit;
}
.tab.active {
	background: var(--bg);
	color: var(--text);
	font-weight: 600;
	box-shadow: var(--sh-xs);
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14px;
}
.section-title { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }

/* Post cards */
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
.load-more-btn {
	width: 100%;
	height: 44px;
	background: var(--bg-surface);
	border: 1.5px dashed var(--border);
	border-radius: var(--r-md);
	font-size: 13px;
	font-weight: 500;
	font-family: inherit;
	color: var(--text-muted);
	cursor: pointer;
	transition: all var(--tr);
	margin-top: 8px;
}
.load-more-btn:hover {
	border-color: var(--accent);
	color: var(--accent);
	background: var(--accent-bg);
}

/* Sidebar */
.sidebar-card {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	padding: 18px;
	margin-bottom: 14px;
}
.sidebar-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 5px; }
.tag-cloud-item {
	font-size: 12px;
	font-weight: 500;
	padding: 4px 10px;
	border-radius: 7px;
	background: var(--bg);
	color: var(--text-secondary);
	border: 1px solid var(--border);
	cursor: pointer;
	font-family: inherit;
	transition: all var(--tr);
}
.tag-cloud-item:hover {
	background: var(--accent-bg);
	color: var(--accent);
	border-color: var(--accent);
}
.trend-list { display: flex; flex-direction: column; }
.trend-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 9px 0;
	border-bottom: 1px solid var(--border-subtle);
	transition: opacity var(--tr);
	background: none;
	border-left: none;
	border-right: none;
	border-top: none;
	font-family: inherit;
	text-align: left;
	width: 100%;
	cursor: pointer;
}
.trend-item:last-child { border-bottom: none; }
.trend-item:hover { opacity: 0.65; }
.trend-rank { font-size: 12px; font-weight: 700; color: var(--accent); width: 14px; text-align: center; flex-shrink: 0; }
.trend-text { font-size: 13px; font-weight: 500; flex: 1; line-height: 1.35; }
.trend-count { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }

.contrib-list { display: flex; flex-direction: column; gap: 9px; }
.contrib-item {
	display: flex;
	align-items: center;
	gap: 9px;
	cursor: pointer;
	transition: opacity var(--tr);
	background: none;
	border: none;
	font-family: inherit;
	text-align: left;
	width: 100%;
	padding: 0;
}
.contrib-item:hover { opacity: 0.65; }
.contrib-avatar-img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.contrib-name { font-size: 13px; font-weight: 600; }
.contrib-count { font-size: 12px; color: var(--text-muted); }
.contrib-badge { margin-left: auto; font-size: 13px; }

.notice-banner {
	background: var(--accent-bg);
	border: 1px solid rgba(49,130,246,0.18);
	border-radius: var(--r-md);
	padding: 12px 14px;
	margin-bottom: 14px;
	display: flex;
	align-items: flex-start;
	gap: 10px;
}
.notice-icon {
	width: 26px;
	height: 26px;
	background: var(--accent);
	border-radius: 7px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.notice-title { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
.notice-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }

@media (max-width: 720px) {
	.page-wrapper {
		grid-template-columns: 1fr;
		padding: 20px 16px 60px;
	}
	.side-col { display: none; }
	.hero { padding: 22px; }
	.hero-title { font-size: 20px; }
}
</style>
