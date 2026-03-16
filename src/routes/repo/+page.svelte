<script lang="ts">
	import { onMount } from 'svelte';
	import { accessToken } from '$lib/auth';
	import { PUBLIC_API_URL } from '$env/static/public';

	let availableRepos: string[] = [];
	let registeredRepos: any[] = [];
	let selectedRepo = '';
	let ignorePaths: string[] = [];
	let ignoreInput = '';
	let isLoading = true;
	let isSaving = false;
	let expandedRepo: number | null = null;
	let searchQuery = '';
	let editingRepo: number | null = null;
	let editIgnorePaths: string[] = [];
	let editIgnoreInput = '';
	let syncingRepoId: number | null = null;
	let message: { type: 'success' | 'error'; text: string } | null = null;
	let showMessage = false;

	const showMsg = (type: 'success' | 'error', text: string) => {
		message = { type, text };
		showMessage = true;
		setTimeout(() => {
			showMessage = false;
		}, 3000);
	};

	const loadRepos = async () => {
		isLoading = true;
		try {
			const res1 = await fetch(`${PUBLIC_API_URL}/repo`, {
				headers: {
					...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {})
				}
			});
			const result1 = await res1.json();
			availableRepos = result1.data || [];

			if ($accessToken) {
				const res2 = await fetch(`${PUBLIC_API_URL}/user/repos`, {
					headers: {
						Authorization: `Bearer ${$accessToken}`
					}
				});
				const result2 = await res2.json();
				registeredRepos = result2.data || [];
			}
		} catch (err) {
			console.error('레포 로딩 실패:', err);
			showMsg('error', '레포 목록을 불러오는데 실패했습니다');
		} finally {
			isLoading = false;
		}
	};

	const addIgnorePath = () => {
		const trimmed = ignoreInput.trim();
		if (trimmed && !ignorePaths.includes(trimmed)) {
			ignorePaths = [...ignorePaths, trimmed];
			ignoreInput = '';
		}
	};

	const removeIgnorePath = (path: string) => {
		ignorePaths = ignorePaths.filter((p) => p !== path);
	};

	const addEditIgnorePath = () => {
		const trimmed = editIgnoreInput.trim();
		if (trimmed && !editIgnorePaths.includes(trimmed)) {
			editIgnorePaths = [...editIgnorePaths, trimmed];
			editIgnoreInput = '';
		}
	};

	const removeEditIgnorePath = (path: string) => {
		editIgnorePaths = editIgnorePaths.filter((p) => p !== path);
	};

	const startEdit = (repo: any) => {
		editingRepo = repo.id;
		editIgnorePaths = [...(repo.ignorePath || [])];
		editIgnoreInput = '';
	};

	const cancelEdit = () => {
		editingRepo = null;
		editIgnorePaths = [];
		editIgnoreInput = '';
	};

	const saveEdit = async (repoId: number) => {
		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo/${repoId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {})
				},
				body: JSON.stringify({
					ignorePath: editIgnorePaths
				})
			});

			if (res.ok) {
				showMsg('success', '수정되었습니다!');
				editingRepo = null;
				editIgnorePaths = [];
				await loadRepos();
			} else {
				showMsg('error', '수정에 실패했습니다');
			}
		} catch (err) {
			console.error('수정 오류:', err);
			showMsg('error', '수정 중 오류가 발생했습니다');
		}
	};

	const syncRepo = async (repoId: number, repoName: string) => {
		syncingRepoId = repoId;
		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo/sync`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {})
				},
				body: JSON.stringify({
					repoName: repoName
				})
			});

			if (res.ok) {
				showMsg('success', '동기화되었습니다!');
				await loadRepos();
			} else {
				const error = await res.json();
				showMsg('error', error.message || '동기화에 실패했습니다');
			}
		} catch (err) {
			console.error('동기화 오류:', err);
			showMsg('error', '동기화 중 오류가 발생했습니다');
		} finally {
			syncingRepoId = null;
		}
	};

	const registerRepo = async () => {
		if (!selectedRepo) {
			showMsg('error', '레포지토리를 선택해주세요');
			return;
		}

		isSaving = true;
		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {})
				},
				body: JSON.stringify({
					repoName: selectedRepo,
					ignorePath: ignorePaths
				})
			});

			if (res.ok) {
				showMsg('success', '레포가 등록되었습니다!');
				selectedRepo = '';
				ignorePaths = [];
				ignoreInput = '';
				searchQuery = '';
				await loadRepos();
			} else {
				const error = await res.json();
				showMsg('error', error.message || '레포 등록에 실패했습니다');
			}
		} catch (err) {
			console.error('레포 등록 오류:', err);
			showMsg('error', '레포 등록 중 오류가 발생했습니다');
		} finally {
			isSaving = false;
		}
	};

	const deleteRepo = async (id: number, name: string) => {
		if (!confirm(`"${name}" 레포를 삭제하시겠습니까?`)) return;

		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo/${id}`, {
				method: 'DELETE',
				headers: {
					...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {})
				}
			});

			if (res.ok) {
				showMsg('success', '레포가 삭제되었습니다');
				await loadRepos();
			} else {
				showMsg('error', '레포 삭제에 실패했습니다');
			}
		} catch (err) {
			console.error('레포 삭제 오류:', err);
			showMsg('error', '레포 삭제 중 오류가 발생했습니다');
		}
	};

	const toggleExpand = (id: number) => {
		expandedRepo = expandedRepo === id ? null : id;
	};

	const selectRepo = (repo: string) => {
		if (selectedRepo === repo) {
			selectedRepo = '';
			ignorePaths = [];
			ignoreInput = '';
		} else {
			selectedRepo = repo;
		}
	};

	onMount(() => {
		loadRepos();
	});

	$: unregisteredRepos = availableRepos.filter(
		(repo) => !registeredRepos.some((r) => r.repoName === repo)
	);

	$: filteredRepos = unregisteredRepos.filter((repo) =>
		repo.toLowerCase().includes(searchQuery.toLowerCase())
	);
</script>

<svelte:head>
	<title>레포 등록</title>
</svelte:head>

<div class="min-h-screen py-14" style="background: var(--bg);">
	<!-- 토스트 -->
	{#if showMessage}
		<div class="fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg transition-all duration-300"
			class:bg-green-500={message?.type === 'success'}
			class:bg-red-500={message?.type === 'error'}>
			<div class="flex items-center gap-3 text-white">
				{#if message?.type === 'success'}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
				{:else}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
				{/if}
				<p class="text-sm font-medium">{message?.text}</p>
			</div>
		</div>
	{/if}

	<div class="mx-auto max-w-5xl px-6 sm:px-10">
		<!-- 헤더 -->
		<div class="mb-12">
			<h1 class="mb-1.5 text-2xl font-semibold tracking-tight" style="color: var(--text);">Repository</h1>
			<p class="text-sm" style="color: var(--text-muted);">GitHub 저장소를 블로그에 연동하세요</p>
		</div>

		{#if isLoading}
			<div class="flex items-center justify-center py-32">
				<div class="h-5 w-5 animate-spin rounded-full border-2" style="border-color: var(--border); border-top-color: var(--text-secondary);"></div>
			</div>
		{:else}
			<!-- 새 레포 등록 -->
			<div class="mb-16">
				<div class="mb-6 flex items-center gap-4">
					<h2 class="text-sm font-semibold" style="color: var(--text);">Github 저장소 연결</h2>
					<div class="h-px flex-1" style="background: var(--border);"></div>
				</div>

				<!-- 검색 -->
				{#if unregisteredRepos.length > 0}
					<div class="mb-5">
						<div class="relative">
							<svg class="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							<input
								bind:value={searchQuery}
								placeholder="저장소 검색"
								class="cursor-text w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm outline-none transition"
								style="background: var(--bg-surface); color: var(--text); border-color: var(--border);"
							/>
						</div>
					</div>
				{/if}

				<!-- 레포 선택 -->
				{#if unregisteredRepos.length === 0}
					<div class="rounded-2xl border py-16 text-center" style="background: var(--bg-surface); border-color: var(--border);">
						<svg class="mx-auto mb-3 h-8 w-8" style="color: var(--text-faint);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
						</svg>
						<p class="text-sm font-medium" style="color: var(--text-secondary);">등록 가능한 레포가 없습니다</p>
						<p class="mt-1 text-xs" style="color: var(--text-muted);">모든 레포가 이미 등록되었습니다</p>
					</div>
				{:else if filteredRepos.length === 0}
					<div class="rounded-2xl py-12 text-center" style="background: var(--bg-surface); border: 1px solid var(--border);">
						<p class="text-sm" style="color: var(--text-muted);">검색 결과가 없습니다</p>
					</div>
				{:else}
					<div class="mb-6 grid gap-2.5 sm:grid-cols-2">
						{#each filteredRepos as repo}
							<button
								on:click={() => selectRepo(repo)}
								class="cursor-pointer group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-150"
								style={selectedRepo === repo
									? 'background: var(--text); border-color: var(--text);'
									: 'background: var(--bg-surface); border-color: var(--border);'}
							>
								<div class="flex items-center gap-3">
									<div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-150"
										style={selectedRepo === repo ? 'background: rgba(255,255,255,0.15);' : 'background: var(--bg-hover);'}>
										<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"
											style={selectedRepo === repo ? 'color: var(--bg-surface);' : 'color: var(--text-secondary);'}>
											<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
										</svg>
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium" style={selectedRepo === repo ? 'color: var(--bg-surface);' : 'color: var(--text);'}>{repo}</p>
										<p class="text-xs" style={selectedRepo === repo ? 'color: color-mix(in srgb, var(--bg-surface) 60%, transparent);' : 'color: var(--text-muted);'}>repository</p>
									</div>
									{#if selectedRepo === repo}
										<svg class="h-4 w-4 flex-shrink-0" style="color: var(--bg-surface);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
										</svg>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}

				<!-- 무시 경로 -->
				{#if selectedRepo}
					<div class="animate-in fade-in slide-in-from-top-2 mb-6 duration-300">
						<div class="rounded-xl border p-5" style="background: var(--bg-subtle); border-color: var(--border);">
							<label class="mb-3 flex items-center gap-2 text-xs font-medium" style="color: var(--text-secondary);">
								<svg class="h-3.5 w-3.5" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
								</svg>
								무시할 경로 <span style="color: var(--text-muted);">(선택)</span>
							</label>
							<div class="flex gap-2">
								<input
									bind:value={ignoreInput}
									on:keydown={(e) => e.key === 'Enter' && addIgnorePath()}
									placeholder="예) logs/"
									class="cursor-text flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition"
									style="background: var(--bg-surface); color: var(--text); border-color: var(--border);"
								/>
								<button on:click={addIgnorePath} class="cursor-pointer rounded-lg px-4 text-xs font-medium transition hover:opacity-80" style="background: var(--text); color: var(--bg-surface);">
									추가
								</button>
							</div>
							{#if ignorePaths.length > 0}
								<div class="mt-3 flex flex-wrap gap-2">
									{#each ignorePaths as path, i}
										<span style="animation-delay: {i * 50}ms; background: var(--bg-surface); color: var(--text-secondary); border-color: var(--border);" class="animate-in fade-in zoom-in inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs">
											{path}
											<button on:click={() => removeIgnorePath(path)} class="cursor-pointer transition hover:opacity-60" style="color: var(--text-muted);">
												<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
											</button>
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<!-- 등록 버튼 -->
				{#if selectedRepo}
					<button
						on:click={registerRepo}
						disabled={isSaving}
						class="cursor-pointer animate-in fade-in slide-in-from-bottom-2 w-full rounded-xl py-3 text-sm font-medium transition hover:opacity-80 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
						style="background: var(--text); color: var(--bg-surface);"
					>
						{#if isSaving}
							<span class="flex items-center justify-center gap-2">
								<div class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								등록 중...
							</span>
						{:else}
							<span class="flex items-center justify-center gap-2">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
								{selectedRepo} 등록하기
							</span>
						{/if}
					</button>
				{/if}
			</div>

			<!-- 등록된 레포 -->
			<div>
				<div class="mb-6 flex items-center gap-4">
					<h2 class="text-sm font-semibold" style="color: var(--text);">등록된 저장소</h2>
					<div class="h-px flex-1" style="background: var(--border);"></div>
					<span class="rounded-full px-2.5 py-0.5 text-xs font-medium" style="background: var(--bg-hover); color: var(--text-secondary);">
						{registeredRepos.length}
					</span>
				</div>

				{#if registeredRepos.length === 0}
					<div class="rounded-2xl border py-16 text-center" style="background: var(--bg-surface); border-color: var(--border);">
						<svg class="mx-auto mb-3 h-8 w-8" style="color: var(--text-faint);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
						</svg>
						<p class="text-sm font-medium" style="color: var(--text-secondary);">등록된 레포지토리가 없습니다</p>
						<p class="mt-1 text-xs" style="color: var(--text-muted);">위에서 레포지토리를 선택해서 등록해보세요</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each registeredRepos as repo, i}
							<div style="animation-delay: {i * 50}ms; background: var(--bg-surface); border-color: var(--border);" class="animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md">
								<button on:click={() => toggleExpand(repo.id)} class="cursor-pointer w-full px-5 py-4 text-left transition hover:bg-[var(--bg-hover)]">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<div class="flex h-9 w-9 items-center justify-center rounded-lg" style="background: var(--text);">
												<svg class="h-4 w-4" style="color: var(--bg-surface);" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
												</svg>
											</div>
											<div>
												<p class="text-sm font-medium" style="color: var(--text);">{repo.repoName}</p>
												<p class="text-xs" style="color: var(--text-muted);">{repo.mdFiles?.length || 0}개 파일</p>
											</div>
										</div>
										<svg class="h-4 w-4 transition-transform duration-200" class:rotate-180={expandedRepo === repo.id} style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
										</svg>
									</div>
								</button>

								{#if expandedRepo === repo.id}
									<div class="animate-in fade-in slide-in-from-top-2 border-t p-5 duration-200" style="background: var(--bg); border-color: var(--border);">
										<div class="space-y-5">
											<!-- 파일 목록 -->
											{#if repo.mdFiles && repo.mdFiles.length > 0}
												<div>
													<p class="mb-2.5 flex items-center gap-1.5 text-xs font-medium" style="color: var(--text-secondary);">
														<svg class="h-3.5 w-3.5" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
														</svg>
														마크다운 파일 <span style="color: var(--text-muted);">({repo.mdFiles.length})</span>
													</p>
													<div class="max-h-40 overflow-y-auto rounded-lg border p-3" style="background: var(--bg-surface); border-color: var(--border);">
														<div class="space-y-1.5">
															{#each repo.mdFiles.slice(0, 20) as file, i}
																<div style="animation-delay: {i * 30}ms; color: var(--text-secondary);" class="animate-in fade-in slide-in-from-left-1 flex items-center gap-2 text-xs">
																	<svg class="h-3 w-3 flex-shrink-0" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
																	</svg>
																	<span class="truncate font-mono">{file}</span>
																</div>
															{/each}
															{#if repo.mdFiles.length > 20}
																<p class="pt-1 text-xs" style="color: var(--text-muted);">외 {repo.mdFiles.length - 20}개</p>
															{/if}
														</div>
													</div>
												</div>
											{/if}

											<!-- 무시 경로 수정 폼 -->
											{#if editingRepo === repo.id}
												<div class="animate-in fade-in zoom-in rounded-xl border p-4 duration-200" style="background: var(--bg-surface); border-color: var(--border);">
													<p class="mb-3 flex items-center gap-1.5 text-xs font-medium" style="color: var(--text);">
														<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
														무시 경로 수정
													</p>
													<div class="mb-3 flex gap-2">
														<input bind:value={editIgnoreInput} on:keydown={(e) => e.key === 'Enter' && addEditIgnorePath()} placeholder="예) logs/"
															class="cursor-text flex-1 rounded-lg border px-3 py-2 text-xs outline-none transition"
															style="background: var(--bg); color: var(--text); border-color: var(--border);" />
														<button on:click={addEditIgnorePath} class="cursor-pointer rounded-lg px-3 text-xs font-medium transition hover:opacity-80" style="background: var(--text); color: var(--bg-surface);">추가</button>
													</div>
													{#if editIgnorePaths.length > 0}
														<div class="mb-3 flex flex-wrap gap-1.5">
															{#each editIgnorePaths as path, i}
																<span style="animation-delay: {i * 40}ms; background: var(--bg); color: var(--text-secondary); border-color: var(--border);" class="animate-in fade-in zoom-in inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
																	{path}
																	<button on:click={() => removeEditIgnorePath(path)} class="cursor-pointer transition hover:opacity-60" style="color: var(--text-muted);">
																		<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
																	</button>
																</span>
															{/each}
														</div>
													{/if}
													<div class="flex gap-2">
														<button on:click={() => saveEdit(repo.id)} class="cursor-pointer flex-1 rounded-lg py-2 text-xs font-medium transition hover:opacity-80" style="background: var(--text); color: var(--bg-surface);">저장</button>
														<button on:click={cancelEdit} class="cursor-pointer flex-1 rounded-lg border py-2 text-xs font-medium transition hover:bg-[var(--bg-hover)]" style="color: var(--text-secondary); border-color: var(--border);">취소</button>
													</div>
												</div>
											{:else}
												{#if repo.ignorePath && repo.ignorePath.length > 0}
													<div>
														<p class="mb-2.5 flex items-center gap-1.5 text-xs font-medium" style="color: var(--text-secondary);">
															<svg class="h-3.5 w-3.5" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
															무시 경로
														</p>
														<div class="flex flex-wrap gap-1.5">
															{#each repo.ignorePath as path, i}
																<span style="animation-delay: {i * 40}ms; background: var(--bg-surface); color: var(--text-secondary); border-color: var(--border);" class="animate-in fade-in zoom-in rounded-lg border px-2.5 py-1 text-xs">{path}</span>
															{/each}
														</div>
													</div>
												{/if}
											{/if}

											<!-- 액션 -->
											<div class="flex items-center justify-between border-t pt-4" style="border-color: var(--border-subtle);">
												<span class="text-xs" style="color: var(--text-muted);">{new Date(repo.updatedAt).toLocaleDateString('ko-KR')}</span>
												<div class="flex items-center gap-1">
													{#if editingRepo !== repo.id}
														<button on:click={() => startEdit(repo)} class="cursor-pointer flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-[var(--bg-hover)]" style="color: var(--text-secondary);">
															<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
															수정
														</button>
													{/if}
													<button on:click={() => syncRepo(repo.id, repo.repoName)} disabled={syncingRepoId === repo.id} class="cursor-pointer flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-40" style="color: var(--text-secondary);">
														{#if syncingRepoId === repo.id}
															<div class="h-3.5 w-3.5 animate-spin rounded-full border-2" style="border-color: var(--border); border-top-color: var(--text-secondary);"></div>
														{:else}
															<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
														{/if}
														동기화
													</button>
													<button on:click={() => deleteRepo(repo.id, repo.repoName)} class="cursor-pointer flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30">
														<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
														삭제
													</button>
												</div>
											</div>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in-from-top-2 {
		from {
			transform: translateY(-0.5rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slide-in-from-bottom-2 {
		from {
			transform: translateY(0.5rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slide-in-from-bottom-4 {
		from {
			transform: translateY(1rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes slide-in-from-left-1 {
		from {
			transform: translateX(-0.25rem);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes zoom-in {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	.animate-in {
		animation-fill-mode: both;
	}

	.fade-in {
		animation-name: fade-in;
		animation-duration: 0.3s;
	}

	.slide-in-from-top-2 {
		animation-name: slide-in-from-top-2;
		animation-duration: 0.3s;
	}

	.slide-in-from-bottom-2 {
		animation-name: slide-in-from-bottom-2;
		animation-duration: 0.3s;
	}

	.slide-in-from-bottom-4 {
		animation-name: slide-in-from-bottom-4;
		animation-duration: 0.3s;
	}

	.slide-in-from-left-1 {
		animation-name: slide-in-from-left-1;
		animation-duration: 0.2s;
	}

	.zoom-in {
		animation-name: zoom-in;
		animation-duration: 0.2s;
	}

	.duration-200 {
		animation-duration: 200ms;
	}

	.duration-300 {
		animation-duration: 300ms;
	}
</style>
