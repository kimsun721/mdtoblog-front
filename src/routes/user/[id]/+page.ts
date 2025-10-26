export const load = async ({ params, fetch }: any) => {
	const res = await fetch(`http://localhost:3000/api/user/${params.id}`);
	const result = await res.json();
	return { profile: result.data };
};
