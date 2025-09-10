<script lang="ts">
	import { goto } from '$app/navigation';

	let title = 'MdToBlog';

	let keyword: string;

	const search = (e: Event) => {
		e.preventDefault();
		goto(`/search?q=${keyword}`);
	};
</script>

<header class="sticky top-0 z-50 w-full bg-[#282828] p-4 font-sans text-[#444444] shadow-md">
	<a href="/"
		><h1 class="text-3xl font-bold tracking-tight text-[#5B7C99] transition hover:text-blue-500">
			{title}
		</h1></a
	>
	<form class="mt-4 flex items-center gap-2" on:submit={search}>
		<input
			bind:value={keyword}
			placeholder="검색어를 입력하세요."
			class="focus:ring-opacity-50 w-full flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm transition duration-300 focus:border-[#5B7C99] focus:ring-2 focus:ring-[#5B7C99] focus:outline-none"
		/>
		<button
			type="submit"
			class="focus:ring-opacity-50 rounded-full bg-[#5B7C99] px-6 py-2 text-white shadow-md transition-transform duration-300 hover:scale-105 hover:bg-blue-600 focus:ring-2 focus:ring-[#5B7C99] focus:outline-none"
		>
			검색
		</button>
	</form>
</header>
