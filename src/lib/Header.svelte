<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { accessToken } from './auth';
	import { api } from './services/api';
	import { parseJwt } from './utils/auth';
	import { PUBLIC_API_URL } from '$env/static/public';

	let keyword = $state('');
	let profileImage = $state('');
	let userId = $state<number | null>(null);
	let userName = $state('');
	let dropdownOpen = $state(false);

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

	let mounted = $state(false);

	const handleClickOutside = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (!target.closest('#profile-dropdown')) {
			dropdownOpen = false;
		}
	};

	onMount(() => {
		mounted = true;
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

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between gap-4">
			<!-- Logo -->
			<a href="/" class="flex-shrink-0 transition-opacity hover:opacity-80">
				<h1 class="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">MdToBlog</h1>
			</a>

			<!-- Desktop Search -->
			<form onsubmit={handleSearch} class="hidden max-w-md flex-1 md:flex">
				<div class="relative w-full">
					<svg
						class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						bind:value={keyword}
						type="search"
						placeholder="검색어를 입력하세요"
						class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
					/>
				</div>
			</form>

			<!-- Mobile Search -->
			<form onsubmit={handleSearch} class="flex flex-1 md:hidden">
				<div class="relative w-full">
					<svg
						class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						bind:value={keyword}
						type="search"
						placeholder="검색"
						class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
					/>
				</div>
			</form>

			<!-- User Menu -->
			{#if $accessToken && profileImage}
				<div id="profile-dropdown" class="relative">
					<button
						onclick={() => (dropdownOpen = !dropdownOpen)}
						class="flex items-center gap-2 transition-transform hover:scale-105"
						aria-label="프로필 메뉴"
					>
						<img
							src={profileImage}
							alt={userName}
							class="h-10 w-10 rounded-full border-2 border-gray-200 transition hover:border-gray-400"
						/>
					</button>

					{#if dropdownOpen}
						<div
							class="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
						>
							<div class="px-4 py-3 border-b border-gray-100">
								<p class="text-sm font-medium text-gray-900">{userName}</p>
							</div>

							<nav class="py-1">
								<a
									href={`/user/${userId}`}
									class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									내 프로필
								</a>

								<a
									href="/repo"
									class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
										/>
									</svg>
									레포지토리 관리
								</a>
							</nav>

							<div class="border-t border-gray-100">
								<button
									onclick={handleLogout}
									class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										/>
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
					class="flex-shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-95"
				>
					GitHub 로그인
				</a>
			{/if}
		</div>
	</div>
</header>
