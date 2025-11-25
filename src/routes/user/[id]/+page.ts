import { PUBLIC_API_URL } from '$env/static/public';

export const load = async ({ params, fetch }: any) => {
	const res = await fetch(`${PUBLIC_API_URL}/user/${params.id}`);
	const result = await res.json();
	return { profile: result.data };
};
