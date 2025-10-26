export const load = async ({ fetch }: any) => {
	try {
		let res = await fetch('http://localhost:3000/api/auth/refresh', {
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
