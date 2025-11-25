import { PUBLIC_API_URL } from '$env/static/public';

export const load = async ({ fetch }: any) => {
	try {
		let res = await fetch(`${PUBLIC_API_URL}/auth/refresh`, {
			method: 'POST',
			credentials: 'include'
		});
		res = await res.json();
		const data = res.data;

		return { accessToken: data ?? null };
	} catch (e) {
		console.error(e);
		return { accessToken: null };
	}
};
