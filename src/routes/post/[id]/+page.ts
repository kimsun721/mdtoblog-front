export const load = async ({ params, fetch }: any) => {
	const res = await fetch(`http://localhost:3000/api/post/${params.id}`);
	const result = await res.json();
	return { post: result.data };
};
