<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Header from '../lib/Header.svelte';
	import '../app.css';
	import { accessToken } from '$lib/auth';
	export let data: { accessToken: string | null };

	$: if (data.accessToken) {
		accessToken.set(data.accessToken);
	}
</script>

<Header {data} />
<slot />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
