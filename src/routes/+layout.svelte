<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';

	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { accessToken } from '$lib/auth';
	import { theme } from '$lib/stores/theme';

	interface Props {
		data?: { accessToken?: string | null };
	}

	let { data }: Props = $props();

	onMount(async () => {
		theme.init();

		try {
			const res = await fetch(`${PUBLIC_API_URL}/auth/refresh`, {
				method: 'POST',
				credentials: 'include'
			});

			const json = await res.json();
			if (json?.data) {
				accessToken.set(json.data);
			}
		} catch (e) {
			console.error('refresh fail', e);
		}
	});
</script>

<div class="flex min-h-screen flex-col" style="background: var(--bg);">
	<Header />
	<div class="flex-1">
		<slot />
	</div>
	<Footer />
</div>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
