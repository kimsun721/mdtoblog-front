export const load = async ({ fetch, url }: any) => {
	const q = url.searchParams.get('q') || '';
	const res = await fetch(`http://localhost:3000/api/post/search?q=${q}`);
	const result = await res.json();
	return { posts: result.data };
};
