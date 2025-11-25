<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { accessToken } from './auth';
	import { get } from 'svelte/store';
	import { PUBLIC_API_URL } from '$env/static/public';
	export let data: { accessToken: string | null };
	let title = 'MdToBlog';
	let keyword = '';
	let profileImage = '';
	let userId: number;
	let dropdownOpen = false;
	const logout = async () => {
		try {
			const token = $accessToken;
			if (!token) return alert('이미 로그아웃 상태임');
			const res = await fetch(`${PUBLIC_API_URL}/auth/logout`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error('로그아웃 실패');
			accessToken.set(null);
			goto('/');
			alert('로그아웃 완료');
		} catch (err) {
			console.error(err);
			alert('로그아웃 중 오류 발생');
		}
	};
	onMount(() => {
		if ($accessToken) {
			const payload = JSON.parse(atob($accessToken.split('.')[1]));
			const githubId = payload.githubId;
			userId = payload.userId;
			profileImage = `https://avatars.githubusercontent.com/u/${githubId}`;
		}
		const handleClickOutside = (e: MouseEvent) => {
			if (!(e.target as HTMLElement).closest('#profile-dropdown')) {
				dropdownOpen = false;
			}
		};
		document.addEventListener('click', handleClickOutside);
		onDestroy(() => {
			document.removeEventListener('click', handleClickOutside);
		});
	});
	const search = (e: Event) => {
		e.preventDefault();
		goto(`/search?q=${keyword}`);
	};
	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 font-sans shadow-sm backdrop-blur-sm"
>
	<div class="mx-auto max-w-7xl px-6 py-4">
		<div class="flex items-center justify-between gap-6">
			<!-- 로고 -->
			<a href="/" class="flex-shrink-0">
				<h1
					class="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent transition hover:from-black hover:to-gray-800"
				>
					{title}
				</h1>
			</a>

			<!-- 검색바 -->
			<form class="hidden max-w-md flex-1 md:flex" on:submit={search}>
				<div class="relative w-full">
					<svg
						class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
					<input
						bind:value={keyword}
						placeholder="검색어를 입력하세요..."
						class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-4 pl-10 text-sm text-gray-900 transition outline-none focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200"
					/>
				</div>
			</form>

			<!-- 모바일 검색바 -->
			<form class="flex flex-1 md:hidden" on:submit={search}>
				<div class="relative w-full">
					<svg
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						></path>
					</svg>
					<input
						bind:value={keyword}
						placeholder="검색..."
						class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-3 pl-9 text-sm text-gray-900 transition outline-none focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-200"
					/>
				</div>
			</form>

			<!-- 프로필 / 로그인 -->
			{#if $accessToken}
				{#if profileImage}
					<div id="profile-dropdown" class="relative">
						<button
							on:click={toggleDropdown}
							class="group flex cursor-pointer items-center gap-2 transition-transform hover:scale-105"
						>
							<img
								src={profileImage}
								alt="프로필"
								class="h-15 w-15 rounded-full border-2 border-gray-200 transition group-hover:border-gray-400"
							/>
						</button>
						{#if dropdownOpen}
							<div
								class="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
							>
								<a
									href={`/user/${userId}`}
									class="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										></path>
									</svg>
									내 프로필
								</a>
								<a
									href="/settings"
									class="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										></path>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										></path>
									</svg>
									설정
								</a>
								<a
									href="/repo"
									class="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
										></path>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										></path>
									</svg>
									레포지토리 관리
								</a>
								<div class="border-t border-gray-100"></div>
								<button
									on:click={logout}
									class="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
										></path>
									</svg>
									로그아웃
								</button>
							</div>
						{/if}
					</div>
				{/if}
			{:else}
				<button
					class="flex-shrink-0 cursor-pointer rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black active:scale-95"
					on:click={() => (window.location.href = `${PUBLIC_API_URL}/auth/github`)}
				>
					GitHub 로그인
				</button>
			{/if}
		</div>
	</div>
</header>
