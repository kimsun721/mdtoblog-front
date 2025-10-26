<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { accessToken } from './auth';
	import { get } from 'svelte/store';
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

			const res = await fetch('http://localhost:3000/api/auth/logout', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!res.ok) throw new Error('로그아웃 실패');

			accessToken.set(null);
			// localStorage.removeItem('accessToken');
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

<header class="sticky top-0 z-50 w-full bg-white p-4 font-sans shadow-md">
	<div class="flex flex-col items-start md:flex-row md:items-center md:justify-between">
		<a href="/" class="mb-4 md:mb-0">
			<h1
				class="ml-10 text-3xl font-bold tracking-tight text-[#212529] transition hover:text-[#645f5f]"
			>
				{title}
			</h1>
		</a>

		<form class="flex w-full items-center border-1 md:w-auto" on:submit={search}>
			<input
				bind:value={keyword}
				placeholder="검색어를 입력하세요."
				class="w-full flex-1 border border-[#DEE2E6] bg-[#F8F9FA] px-4 py-2 text-[#212529] shadow-sm transition focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF] focus:outline-none"
			/>
		</form>

		{#if $accessToken}
			{#if profileImage}
				<div id="profile-dropdown" class="relative mr-10">
					<button
						on:click={toggleDropdown}
						class="cursor-pointer transition-transform hover:scale-105"
					>
						<img src={profileImage} alt="프로필" class="h-12 w-12 rounded-full border-1" />
					</button>

					{#if dropdownOpen}
						<div class="absolute right-0 z-50 mt-2 w-40 rounded border bg-white shadow-lg">
							<a href={`/user/${userId}`} class="block px-4 py-2 hover:bg-gray-100">내 프로필</a>
							<a href="/settings" class="block px-4 py-2 hover:bg-gray-100">설정</a>
							<button
								on:click={logout}
								class="block w-full cursor-pointer px-4 py-2 text-left text-red-600 hover:bg-red-100"
							>
								로그아웃
							</button>
						</div>
					{/if}
				</div>
			{/if}
		{:else}
			<button
				class="cursor-pointer rounded bg-[#212529] px-4 py-2 text-white hover:bg-[#525253]"
				on:click={() => (window.location.href = 'http://localhost:3000/api/auth/github')}
			>
				GitHub 로그인
			</button>
		{/if}
	</div>
</header>
