<script lang="ts">
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
	let toastMsg = '';
	let toastType = '';
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const showToast = (msg: string, type: 'success' | 'error' | '' = '') => {
		toastMsg = msg;
		toastType = type;
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => { toastMsg = ''; }, 2400);
	};

	const loadRepos = async () => {
		isLoading = true;
		try {
			const res1 = await fetch(`${PUBLIC_API_URL}/repo`, {
				headers: { ...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {}) }
			});
			const result1 = await res1.json();
			availableRepos = result1.data || [];

			if ($accessToken) {
				const res2 = await fetch(`${PUBLIC_API_URL}/user/repos`, {
					headers: { Authorization: `Bearer ${$accessToken}` }
				});
				const result2 = await res2.json();
				registeredRepos = result2.data || [];
			}
		} catch {
			showToast('레포 목록을 불러오는데 실패했습니다', 'error');
		} finally {
			isLoading = false;
		}
	};

	const addIgnorePath = () => {
		const t = ignoreInput.trim();
		if (t && !ignorePaths.includes(t)) { ignorePaths = [...ignorePaths, t]; ignoreInput = ''; }
	};
	const removeIgnorePath = (p: string) => { ignorePaths = ignorePaths.filter(x => x !== p); };
	const addEditIgnorePath = () => {
		const t = editIgnoreInput.trim();
		if (t && !editIgnorePaths.includes(t)) { editIgnorePaths = [...editIgnorePaths, t]; editIgnoreInput = ''; }
	};
	const removeEditIgnorePath = (p: string) => { editIgnorePaths = editIgnorePaths.filter(x => x !== p); };

	const startEdit = (repo: any) => { editingRepo = repo.id; editIgnorePaths = [...(repo.ignorePath || [])]; editIgnoreInput = ''; };
	const cancelEdit = () => { editingRepo = null; editIgnorePaths = []; editIgnoreInput = ''; };

	const saveEdit = async (repoId: number) => {
		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo/${repoId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', ...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {}) },
				body: JSON.stringify({ ignorePath: editIgnorePaths })
			});
			if (res.ok) { showToast('수정되었습니다!', 'success'); cancelEdit(); await loadRepos(); }
			else showToast('수정에 실패했습니다', 'error');
		} catch { showToast('수정 중 오류가 발생했습니다', 'error'); }
	};

	const syncRepo = async (repoId: number, repoName: string) => {
		syncingRepoId = repoId;
		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo/sync`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {}) },
				body: JSON.stringify({ repoName })
			});
			if (res.ok) { showToast(`${repoName} 동기화 완료!`, 'success'); await loadRepos(); }
			else { const e = await res.json(); showToast(e.message || '동기화에 실패했습니다', 'error'); }
		} catch { showToast('동기화 중 오류가 발생했습니다', 'error'); }
		finally { syncingRepoId = null; }
	};

	const registerRepo = async () => {
		if (!selectedRepo) { showToast('레포지토리를 선택해주세요', 'error'); return; }
		isSaving = true;
		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {}) },
				body: JSON.stringify({ repoName: selectedRepo, ignorePath: ignorePaths })
			});
			if (res.ok) {
				showToast(`${selectedRepo} 등록 완료!`, 'success');
				selectedRepo = ''; ignorePaths = []; ignoreInput = ''; searchQuery = '';
				await loadRepos();
			} else { const e = await res.json(); showToast(e.message || '레포 등록에 실패했습니다', 'error'); }
		} catch { showToast('레포 등록 중 오류가 발생했습니다', 'error'); }
		finally { isSaving = false; }
	};

	const deleteRepo = async (id: number, name: string) => {
		if (!confirm(`'${name}' 레포를 삭제하면 연결된 포스트도 모두 사라집니다. 계속할까요?`)) return;
		try {
			const res = await fetch(`${PUBLIC_API_URL}/repo/${id}`, {
				method: 'DELETE',
				headers: { ...($accessToken ? { Authorization: `Bearer ${$accessToken}` } : {}) }
			});
			if (res.ok) { showToast('레포를 삭제했어요.', ''); await loadRepos(); }
			else showToast('레포 삭제에 실패했습니다', 'error');
		} catch { showToast('레포 삭제 중 오류가 발생했습니다', 'error'); }
	};

	const toggleExpand = (id: number) => { expandedRepo = expandedRepo === id ? null : id; };
	const selectRepo = (repo: string) => {
		if (selectedRepo === repo) { selectedRepo = ''; ignorePaths = []; ignoreInput = ''; }
		else { selectedRepo = repo; }
	};

	let _prevToken: string | null = null;
	$: if ($accessToken !== _prevToken) { _prevToken = $accessToken; loadRepos(); }
	$: unregisteredRepos = availableRepos.filter(r => !registeredRepos.some(rr => rr.repoName === r));
	$: filteredRepos = unregisteredRepos.filter(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
</script>

<svelte:head>
	<title>레포지토리 관리 · MdToBlog</title>
</svelte:head>

<!-- Toast -->
{#if toastMsg}
	<div class="toast" class:success={toastType === 'success'} class:error={toastType === 'error'}>
		{toastMsg}
	</div>
{/if}

<div class="repo-body">

	<!-- Page header -->
	<div class="page-header">
		<div class="page-eyebrow">Repository</div>
		<div class="page-title">레포지토리 관리</div>
		<div class="page-sub">GitHub 레포를 등록하면 마크다운 파일이 자동으로 포스트로 변환됩니다.</div>
	</div>

	{#if isLoading}
		<div class="loading-center">
			<div class="spinner"></div>
		</div>
	{:else}

		<!-- ── 등록된 레포 ── -->
		<div class="section">
			<div class="section-header">
				<span class="section-title">등록된 레포지토리</span>
				<span class="count-badge">{registeredRepos.length}</span>
			</div>

			{#if registeredRepos.length === 0}
				<div class="empty-card">
					<div class="empty-icon">
						<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
							<path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
						</svg>
					</div>
					<div class="empty-title">등록된 레포지토리가 없어요</div>
					<div class="empty-desc">아래에서 레포를 선택해 등록해보세요</div>
				</div>
			{:else}
				<div class="repo-list">
					{#each registeredRepos as repo, i}
						<div class="repo-card" style="animation-delay:{i*0.05}s">
							<!-- Header row -->
							<button class="repo-card-header" onclick={() => toggleExpand(repo.id)}>
								<div class="repo-icon-wrap">
									<svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
									</svg>
								</div>
								<div class="repo-info">
									<span class="repo-name">{repo.repoName}</span>
									<span class="repo-meta">마크다운 {repo.mdFiles?.length || 0}개 · {new Date(repo.updatedAt).toLocaleDateString('ko-KR')} 동기화</span>
								</div>
								<span class="synced-badge">연동됨</span>
								<svg class="chevron" class:open={expandedRepo === repo.id} width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<polyline points="6 9 12 15 18 9"/>
								</svg>
							</button>

							<!-- Expanded body -->
							{#if expandedRepo === repo.id}
								<div class="repo-body-inner">

									{#if editingRepo === repo.id}
										<!-- Edit ignore paths -->
										<div class="inner-section">
											<div class="inner-label">
												<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
													<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
												</svg>
												무시 경로 수정
											</div>
											<div class="input-row">
												<input
													class="text-input"
													bind:value={editIgnoreInput}
													placeholder="예: drafts/"
													onkeydown={(e) => e.key === 'Enter' && addEditIgnorePath()}
												/>
												<button class="btn-accent-sm" onclick={addEditIgnorePath}>추가</button>
											</div>
											{#if editIgnorePaths.length > 0}
												<div class="tag-row">
													{#each editIgnorePaths as p}
														<span class="path-tag">
															{p}
															<button onclick={() => removeEditIgnorePath(p)}>
																<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
															</button>
														</span>
													{/each}
												</div>
											{/if}
											<div class="action-row" style="margin-top:14px;">
												<button class="btn-accent" onclick={() => saveEdit(repo.id)}>저장</button>
												<button class="btn-ghost" onclick={cancelEdit}>취소</button>
											</div>
										</div>

									{:else}
										<!-- Ignore paths display -->
										{#if repo.ignorePath && repo.ignorePath.length > 0}
											<div class="inner-section">
												<div class="inner-label">
													<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
														<path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
													</svg>
													무시 경로
												</div>
												<div class="tag-row">
													{#each repo.ignorePath as p}
														<span class="path-tag readonly">{p}</span>
													{/each}
												</div>
											</div>
										{/if}

										<!-- MD files -->
										{#if repo.mdFiles && repo.mdFiles.length > 0}
											<div class="inner-section">
												<div class="inner-label">
													<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
														<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
													</svg>
													포함된 파일 <span style="color:var(--text-muted);font-weight:400">({repo.mdFiles.length})</span>
												</div>
												<div class="file-list">
													{#each repo.mdFiles.slice(0, 10) as file}
														<div class="file-item">
															<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
																<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
																<polyline points="14 2 14 8 20 8"/>
															</svg>
															<span>{file}</span>
														</div>
													{/each}
													{#if repo.mdFiles.length > 10}
														<div class="file-more">외 {repo.mdFiles.length - 10}개</div>
													{/if}
												</div>
											</div>
										{/if}

										<!-- Actions -->
										<div class="action-row">
											<button class="btn-accent" onclick={() => syncRepo(repo.id, repo.repoName)} disabled={syncingRepoId === repo.id}>
												{#if syncingRepoId === repo.id}
													<div class="spinner-xs"></div>동기화 중...
												{:else}
													<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
														<polyline points="23 4 23 10 17 10"/>
														<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
													</svg>
													동기화
												{/if}
											</button>
											<button class="btn-ghost" onclick={() => startEdit(repo)}>무시 경로 수정</button>
											<button class="btn-danger" onclick={() => deleteRepo(repo.id, repo.repoName)}>삭제</button>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- ── 등록 가능한 레포 ── -->
		<div class="section">
			<div class="section-header">
				<span class="section-title">등록 가능한 레포지토리</span>
				<span class="count-badge">{unregisteredRepos.length}</span>
			</div>

			{#if unregisteredRepos.length === 0}
				<div class="empty-card">
					<div class="empty-icon">
						<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
							<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<div class="empty-title">모든 레포가 등록되었어요</div>
					<div class="empty-desc">더 이상 등록 가능한 레포지토리가 없습니다</div>
				</div>
			{:else}
				<!-- Search -->
				{#if unregisteredRepos.length > 4}
					<div class="search-wrap">
						<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
						</svg>
						<input class="search-input" bind:value={searchQuery} placeholder="레포 검색..." />
					</div>
				{/if}

				<!-- Grid -->
				<div class="unreg-grid">
					{#each filteredRepos as repo}
						<button class="unreg-card" class:selected={selectedRepo === repo} onclick={() => selectRepo(repo)}>
							<div class="unreg-card-inner">
								<div class="unreg-icon" class:selected={selectedRepo === repo}>
									<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
									</svg>
								</div>
								<span class="unreg-name">{repo}</span>
								{#if selectedRepo === repo}
									<svg class="check-icon" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
										<path d="M20 6L9 17l-5-5"/>
									</svg>
								{/if}
							</div>
						</button>
					{/each}
				</div>

				<!-- Register panel -->
				{#if selectedRepo}
					<div class="register-panel">
						<div class="register-panel-title">
							<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path d="M12 5v14M5 12h14"/>
							</svg>
							<strong>{selectedRepo}</strong> 등록하기
						</div>

						<div class="inner-label" style="margin-top:14px;">
							무시할 경로
							<span style="font-size:11px;color:var(--text-muted);font-weight:400">(선택)</span>
						</div>
						<div class="input-row">
							<input
								class="text-input"
								bind:value={ignoreInput}
								placeholder="예: drafts/, _private/"
								onkeydown={(e) => e.key === 'Enter' && addIgnorePath()}
							/>
							<button class="btn-ghost-sm" onclick={addIgnorePath}>추가</button>
						</div>
						{#if ignorePaths.length > 0}
							<div class="tag-row" style="margin-top:8px;">
								{#each ignorePaths as p}
									<span class="path-tag">
										{p}
										<button onclick={() => removeIgnorePath(p)}>
											<svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
										</button>
									</span>
								{/each}
							</div>
						{/if}
						<div class="action-row" style="margin-top:16px;">
							<button class="btn-accent" onclick={registerRepo} disabled={isSaving}>
								{#if isSaving}
									<div class="spinner-xs"></div>등록 중...
								{:else}
									등록하기
								{/if}
							</button>
							<button class="btn-ghost" onclick={() => { selectedRepo = ''; ignorePaths = []; ignoreInput = ''; }}>취소</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
/* ── Layout ── */
.repo-body {
	max-width: 720px;
	margin: 0 auto;
	padding: 40px 24px 80px;
}

/* Page header */
.page-header { margin-bottom: 36px; }
.page-eyebrow {
	font-size: 11px;
	font-weight: 600;
	color: var(--text-muted);
	letter-spacing: 1.2px;
	text-transform: uppercase;
	margin-bottom: 6px;
}
.page-title {
	font-size: 22px;
	font-weight: 800;
	letter-spacing: -0.6px;
	color: var(--text);
	margin-bottom: 5px;
}
.page-sub { font-size: 13px; color: var(--text-muted); }

/* Section */
.section { margin-bottom: 36px; }
.section-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 14px;
}
.section-title { font-size: 13px; font-weight: 700; color: var(--text); }
.count-badge {
	font-size: 11px;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 20px;
	background: var(--bg-hover);
	color: var(--text-muted);
}

/* Empty card */
.empty-card {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	padding: 40px;
	text-align: center;
}
.empty-icon {
	width: 48px;
	height: 48px;
	border-radius: 14px;
	background: var(--bg-hover);
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 14px;
	color: var(--text-faint);
}
.empty-title { font-size: 14px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px; }
.empty-desc { font-size: 12px; color: var(--text-muted); }

/* Repo cards */
.repo-list { display: flex; flex-direction: column; gap: 8px; }
.repo-card {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	overflow: hidden;
	transition: box-shadow var(--tr);
	animation: fadeUp 0.3s ease both;
}
.repo-card:hover { box-shadow: var(--sh-xs); }

.repo-card-header {
	width: 100%;
	padding: 16px 18px;
	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;
	background: none;
	border: none;
	font-family: inherit;
	text-align: left;
	transition: background var(--tr);
}
.repo-card-header:hover { background: var(--bg-hover); }

.repo-icon-wrap {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: var(--text);
	color: var(--bg-surface);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}
.repo-info { flex: 1; min-width: 0; }
.repo-name { display: block; font-size: 14px; font-weight: 700; color: var(--text); }
.repo-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.synced-badge {
	font-size: 11px;
	font-weight: 600;
	padding: 3px 9px;
	border-radius: 7px;
	background: rgba(0,180,147,0.12);
	color: var(--green);
	flex-shrink: 0;
}
.chevron {
	color: var(--text-faint);
	transition: transform var(--tr);
	flex-shrink: 0;
}
.chevron.open { transform: rotate(180deg); }

/* Expanded inner */
.repo-body-inner {
	border-top: 1px solid var(--border-subtle);
	padding: 18px;
	background: var(--bg-subtle);
}
.inner-section { margin-bottom: 16px; }
.inner-label {
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: 11px;
	font-weight: 700;
	color: var(--text-secondary);
	letter-spacing: 0.4px;
	text-transform: uppercase;
	margin-bottom: 8px;
}

.tag-row { display: flex; flex-wrap: wrap; gap: 5px; }
.path-tag {
	display: flex;
	align-items: center;
	gap: 5px;
	font-size: 12px;
	padding: 3px 9px;
	border-radius: 7px;
	background: var(--bg-surface);
	color: var(--text-secondary);
	border: 1px solid var(--border);
}
.path-tag button {
	background: none;
	border: none;
	cursor: pointer;
	color: var(--text-muted);
	padding: 0;
	display: flex;
	align-items: center;
	transition: color var(--tr);
}
.path-tag button:hover { color: var(--red); }
.path-tag.readonly { cursor: default; }

.file-list {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: 9px;
	padding: 10px 12px;
	max-height: 160px;
	overflow-y: auto;
}
.file-item {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	font-family: 'Courier New', monospace;
	color: var(--text-secondary);
	padding: 3px 0;
	border-bottom: 1px solid var(--border-subtle);
}
.file-item:last-child { border-bottom: none; }
.file-more { font-size: 11px; color: var(--text-muted); padding-top: 6px; }

/* Action row */
.action-row { display: flex; align-items: center; gap: 7px; }

/* Buttons */
.btn-accent {
	height: 32px;
	padding: 0 14px;
	background: var(--accent);
	color: #fff;
	border: none;
	border-radius: 9px;
	font-size: 12px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 5px;
	transition: background var(--tr);
}
.btn-accent:hover { background: var(--accent-hover); }
.btn-accent:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-ghost {
	height: 32px;
	padding: 0 14px;
	background: var(--bg-surface);
	color: var(--text-secondary);
	border: 1.5px solid var(--border);
	border-radius: 9px;
	font-size: 12px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	transition: all var(--tr);
}
.btn-ghost:hover { background: var(--bg-hover); color: var(--text); }

.btn-ghost-sm {
	height: 34px;
	padding: 0 12px;
	background: var(--bg-hover);
	color: var(--text-secondary);
	border: none;
	border-radius: 9px;
	font-size: 12px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	flex-shrink: 0;
	transition: all var(--tr);
}
.btn-ghost-sm:hover { background: var(--border); color: var(--text); }

.btn-danger {
	height: 32px;
	padding: 0 14px;
	background: none;
	color: var(--text-muted);
	border: 1.5px solid var(--border);
	border-radius: 9px;
	font-size: 12px;
	font-weight: 600;
	font-family: inherit;
	cursor: pointer;
	margin-left: auto;
	transition: all var(--tr);
}
.btn-danger:hover { color: var(--red); border-color: var(--red); background: rgba(240,68,82,0.05); }

/* Input */
.input-row { display: flex; gap: 6px; }
.text-input {
	flex: 1;
	height: 34px;
	padding: 0 12px;
	border: 1.5px solid var(--border);
	border-radius: 9px;
	font-size: 13px;
	font-family: inherit;
	background: var(--bg-surface);
	color: var(--text);
	outline: none;
	transition: border-color var(--tr);
}
.text-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(49,130,246,0.10); }
.text-input::placeholder { color: var(--text-muted); }

/* Search */
.search-wrap {
	position: relative;
	margin-bottom: 12px;
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
	padding: 0 12px 0 34px;
	border: 1.5px solid var(--border);
	border-radius: 10px;
	font-size: 13px;
	font-family: inherit;
	background: var(--bg-surface);
	color: var(--text);
	outline: none;
	transition: border-color var(--tr);
}
.search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(49,130,246,0.10); }
.search-input::placeholder { color: var(--text-muted); }

/* Unregistered grid */
.unreg-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 8px;
	margin-bottom: 8px;
}
.unreg-card {
	background: var(--bg-surface);
	border: 1.5px solid var(--border);
	border-radius: var(--r-md);
	padding: 14px 16px;
	cursor: pointer;
	transition: border-color var(--tr), background var(--tr);
	font-family: inherit;
	text-align: left;
}
.unreg-card:hover { border-color: var(--accent); background: var(--accent-bg); }
.unreg-card.selected { border-color: var(--accent); background: var(--accent-bg); }
.unreg-card-inner { display: flex; align-items: center; gap: 9px; }
.unreg-icon {
	width: 30px;
	height: 30px;
	border-radius: 8px;
	background: var(--bg-hover);
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: background var(--tr), color var(--tr);
}
.unreg-icon.selected { background: var(--accent); color: #fff; }
.unreg-name {
	font-size: 13px;
	font-weight: 600;
	color: var(--text);
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.check-icon { color: var(--accent); flex-shrink: 0; }

/* Register panel */
.register-panel {
	background: var(--bg-surface);
	border: 1px solid var(--border);
	border-radius: var(--r-md);
	padding: 20px;
	margin-top: 4px;
	animation: fadeUp 0.2s ease both;
}
.register-panel-title {
	display: flex;
	align-items: center;
	gap: 7px;
	font-size: 13px;
	color: var(--text-secondary);
	margin-bottom: 4px;
}
.register-panel-title strong { color: var(--text); }

/* Toast */
.toast {
	position: fixed;
	bottom: 24px;
	right: 24px;
	z-index: 9999;
	background: var(--text);
	color: var(--bg-surface);
	padding: 12px 18px;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 500;
	box-shadow: var(--sh-md);
	animation: fadeUp 0.2s ease both;
}
.toast.success { background: var(--green); }
.toast.error { background: var(--red); }

/* Spinner */
.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner {
	width: 20px;
	height: 20px;
	border: 2px solid var(--border);
	border-top-color: var(--text-muted);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}
.spinner-xs {
	width: 12px;
	height: 12px;
	border: 2px solid rgba(255,255,255,0.3);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
	display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp {
	from { opacity: 0; transform: translateY(8px); }
	to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 720px) {
	.repo-body { padding: 24px 16px 60px; }
	.unreg-grid { grid-template-columns: 1fr; }
}
</style>
