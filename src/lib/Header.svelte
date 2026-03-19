<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { accessToken } from './auth';
	import { api } from './services/api';
	import { parseJwt } from './utils/auth';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { theme } from '$lib/stores/theme';

	let keyword = $state('');
	let profileImage = $state('');
	let userId = $state<number | null>(null);
	let userName = $state('');
	let userEmail = $state('');
	let dropdownOpen = $state(false);
	let isDark = $state(false);

	$effect(() => {
		isDark = $theme === 'dark';
	});

	$effect(() => {
		if ($accessToken) {
			const payload = parseJwt($accessToken);
			if (payload) {
				userId = payload.userId ?? payload.id ?? null;
				userName = payload.userName;
				userEmail = payload.email ?? '';
				profileImage = `https://avatars.githubusercontent.com/u/${payload.githubId}`;
			}
		} else {
			userId = null;
			userName = '';
			userEmail = '';
			profileImage = '';
		}
	});

	const handleLogout = async () => {
		try {
			if (!$accessToken) {
				alert('이미 로그아웃 상태입니다');
				return;
			}
			await api.logout();
			accessToken.set(null);
			goto('/');
		} catch (error) {
			console.error('Logout error:', error);
			alert('로그아웃 중 오류가 발생했습니다');
		}
	};

	const handleSearch = (e: Event) => {
		e.preventDefault();
		if (!keyword.trim()) return;
		goto(`/search?q=${encodeURIComponent(keyword.trim())}`);
	};

	const handleClickOutside = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (!target.closest('#profile-dropdown')) {
			dropdownOpen = false;
		}
	};

	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<nav class="nav">
	<div class="nav-inner">
		<!-- Logo -->
		<a href="/" class="logo">Md<span>To</span>Blog</a>

		<!-- Search -->
		<form onsubmit={handleSearch} class="search-wrap">
			<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
			</svg>
			<input
				bind:value={keyword}
				class="search-input"
				type="search"
				placeholder="포스트 검색..."
			/>
		</form>

		<!-- Actions -->
		<div class="nav-actions">
			<!-- Theme toggle -->
			<button class="btn-icon" onclick={() => theme.toggle()} aria-label="테마 변경">
				{#if isDark}
					<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="5"/>
						<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
					</svg>
				{:else}
					<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				{/if}
			</button>

			{#if $accessToken && profileImage}
				<!-- Profile dropdown -->
				<div id="profile-dropdown" class="profile-wrap">
					<button onclick={() => (dropdownOpen = !dropdownOpen)} aria-label="프로필 메뉴">
						<img class="nav-avatar" src={profileImage} alt={userName} />
					</button>

					<div class="dropdown" class:open={dropdownOpen}>
						<div class="dropdown-header">
							<div class="dropdown-username">{userName}</div>
							{#if userEmail}<div class="dropdown-email">{userEmail}</div>{/if}
						</div>
						<button class="dropdown-item" onclick={() => { goto(`/user/${userId}`); dropdownOpen = false; }}>
							<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
								<circle cx="12" cy="7" r="4"/>
							</svg>
							내 프로필
						</button>
						<button class="dropdown-item" onclick={() => { goto('/repo'); dropdownOpen = false; }}>
							<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<rect x="3" y="3" width="18" height="18" rx="2"/>
								<path d="M3 9h18M9 21V9"/>
							</svg>
							레포지토리 관리
						</button>
						<div class="dropdown-divider"></div>
						<button class="dropdown-item danger" onclick={handleLogout}>
							<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
							</svg>
							로그아웃
						</button>
					</div>
				</div>
			{:else}
				<a href={`${PUBLIC_API_URL}/auth/github`} class="btn-login">
					GitHub 로그인
				</a>
			{/if}
		</div>
	</div>
</nav>

<style>
.nav {
	position: sticky;
	top: 0;
	z-index: 300;
	background: var(--bg-glass);
	backdrop-filter: blur(20px) saturate(180%);
	-webkit-backdrop-filter: blur(20px) saturate(180%);
	border-bottom: 1px solid var(--border);
}
.nav-inner {
	max-width: 1100px;
	margin: 0 auto;
	padding: 0 24px;
	height: 60px;
	display: flex;
	align-items: center;
	gap: 16px;
}
.logo {
	font-size: 17px;
	font-weight: 700;
	color: var(--text);
	text-decoration: none;
	letter-spacing: -0.5px;
	flex-shrink: 0;
}
.logo span {
	color: var(--accent);
}
.search-wrap {
	flex: 1;
	max-width: 320px;
	position: relative;
}
.search-wrap svg {
	position: absolute;
	left: 11px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--text-muted);
	pointer-events: none;
}
.search-input {
	width: 100%;
	height: 36px;
	padding: 0 12px 0 36px;
	border: 1.5px solid var(--border);
	border-radius: 10px;
	font-size: 13px;
	font-family: inherit;
	background: var(--bg-surface);
	color: var(--text);
	outline: none;
	transition: border-color var(--tr), box-shadow var(--tr);
}
.search-input::placeholder { color: var(--text-muted); }
.search-input:focus {
	border-color: var(--accent);
	box-shadow: 0 0 0 3px rgba(49,130,246,0.12);
}
.nav-actions {
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 6px;
}
.btn-icon {
	width: 34px;
	height: 34px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	border-radius: 10px;
	cursor: pointer;
	color: var(--text-secondary);
	transition: background var(--tr), color var(--tr);
}
.btn-icon:hover { background: var(--bg-hover); color: var(--text); }
.btn-login {
	height: 34px;
	padding: 0 14px;
	background: var(--text);
	color: var(--bg-surface);
	border: none;
	border-radius: 10px;
	font-size: 13px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	text-decoration: none;
	display: flex;
	align-items: center;
	transition: opacity var(--tr);
}
.btn-login:hover { opacity: 0.8; }

/* Dropdown */
.profile-wrap { position: relative; }
.nav-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	object-fit: cover;
	cursor: pointer;
	border: 2px solid var(--border);
	transition: border-color var(--tr);
	display: block;
}
.nav-avatar:hover { border-color: var(--accent); }
.profile-wrap > button {
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
}
.dropdown {
	position: absolute;
	top: calc(100% + 8px);
	right: 0;
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	box-shadow: var(--sh-md);
	min-width: 176px;
	overflow: hidden;
	opacity: 0;
	pointer-events: none;
	transform: translateY(-6px);
	transition: opacity 0.16s ease, transform 0.16s ease;
	z-index: 400;
}
.dropdown.open {
	opacity: 1;
	pointer-events: all;
	transform: translateY(0);
}
.dropdown-header {
	padding: 12px 16px 10px;
	border-bottom: 1px solid var(--border-subtle);
}
.dropdown-username { font-size: 14px; font-weight: 700; color: var(--text); }
.dropdown-email { font-size: 12px; color: var(--text-muted); margin-top: 1px; }
.dropdown-item {
	display: flex;
	align-items: center;
	gap: 9px;
	padding: 10px 16px;
	font-size: 13px;
	font-weight: 500;
	color: var(--text-secondary);
	cursor: pointer;
	transition: background var(--tr), color var(--tr);
	border: none;
	background: none;
	font-family: inherit;
	width: 100%;
	text-align: left;
}
.dropdown-item:hover { background: var(--bg-hover); color: var(--text); }
.dropdown-item.danger:hover { background: rgba(240,68,82,0.06); color: var(--red); }
.dropdown-divider { height: 1px; background: var(--border-subtle); margin: 4px 0; }

@media (max-width: 720px) {
	.search-wrap { max-width: 180px; }
}
</style>
