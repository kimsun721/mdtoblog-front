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
				profileImage = `https://avatars.githubusercontent.com/u/${payload.githubId}`;
			}
		} else {
			userId = null;
			userName = '';
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

<header class="sticky top-0 z-50 border-b bg-[var(--bg-surface)]/90 backdrop-blur-md" style="border-color: var(--border);">
	<div class="mx-auto max-w-3xl px-5 sm:px-8">
		<div class="flex h-14 items-center justify-between gap-4">

			<!-- Logo -->
			<a href="/" class="flex-shrink-0 cursor-pointer transition-opacity hover:opacity-60">
				<span class="text-[15px] font-semibold tracking-tight" style="color: var(--text);">MdToBlog</span>
			</a>

			<!-- Search -->
			<form onsubmit={handleSearch} class="max-w-xs flex-1">
				<div class="relative w-full">
					<svg class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						bind:value={keyword}
						type="search"
						placeholder="검색"
						class="w-full cursor-text rounded-md border py-1.5 pl-9 pr-4 text-sm outline-none transition"
						style="background: var(--bg); color: var(--text); border-color: var(--border);"
					/>
				</div>
			</form>

			<!-- Right side -->
			<div class="flex items-center gap-2">
				<!-- Dark mode toggle -->
				<button
					onclick={() => theme.toggle()}
					class="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-[var(--bg-hover)]"
					aria-label="테마 변경"
				>
					{#if isDark}
						<!-- Sun icon -->
						<svg class="h-4 w-4" style="color: var(--text-secondary);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
						</svg>
					{:else}
						<!-- Moon icon -->
						<svg class="h-4 w-4" style="color: var(--text-secondary);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
						</svg>
					{/if}
				</button>

				<!-- User Menu -->
				{#if $accessToken && profileImage}
					<div id="profile-dropdown" class="relative">
						<button
							onclick={() => (dropdownOpen = !dropdownOpen)}
							class="cursor-pointer flex items-center transition-opacity hover:opacity-70"
							aria-label="프로필 메뉴"
						>
							<img src={profileImage} alt={userName} class="h-7 w-7 rounded-full border" style="border-color: var(--border);" />
						</button>

						{#if dropdownOpen}
							<div class="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border shadow-lg shadow-black/10" style="background: var(--bg-surface); border-color: var(--border);">
								<div class="px-4 py-2.5 border-b" style="border-color: var(--border-subtle);">
									<p class="text-sm font-medium" style="color: var(--text);">{userName}</p>
								</div>

								<nav class="py-1">
									<a href={`/user/${userId}`} class="cursor-pointer flex items-center gap-2.5 px-4 py-2 text-sm transition hover:bg-[var(--bg-hover)]" style="color: var(--text-secondary);">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										내 프로필
									</a>
									<a href="/repo" class="cursor-pointer flex items-center gap-2.5 px-4 py-2 text-sm transition hover:bg-[var(--bg-hover)]" style="color: var(--text-secondary);">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
										</svg>
										레포지토리 관리
									</a>
								</nav>

								<div class="border-t" style="border-color: var(--border-subtle);">
									<button onclick={handleLogout} class="cursor-pointer flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition hover:bg-[var(--bg-hover)]" style="color: var(--text-secondary);">
										<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
										</svg>
										로그아웃
									</button>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<a
						href={`${PUBLIC_API_URL}/auth/github`}
						class="cursor-pointer flex-shrink-0 rounded-md px-3.5 py-1.5 text-xs font-medium transition hover:opacity-80"
						style="background: var(--text); color: var(--bg-surface);"
					>
						GitHub 로그인
					</a>
				{/if}
			</div>
		</div>
	</div>
</header>
