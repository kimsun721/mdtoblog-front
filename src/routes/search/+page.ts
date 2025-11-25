import { PUBLIC_API_URL } from '$env/static/public';

export const load = async ({ fetch, url }: any) => {
	const q = url.searchParams.get('q') || '';
	const res = await fetch(`${PUBLIC_API_URL}/post/search?keyword=${q}`);
	const result = await res.json();
	return { posts: result.data };
};
