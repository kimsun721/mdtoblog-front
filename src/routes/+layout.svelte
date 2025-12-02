<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/Header.svelte';

	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { accessToken } from '$lib/auth';

	export let data: { accessToken: string | null };

	$: if (data.accessToken) {
		accessToken.set(data.accessToken);
	}

	onMount(async () => {
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

<Header {data} />
<slot />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
