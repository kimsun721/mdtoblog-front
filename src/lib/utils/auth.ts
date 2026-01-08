interface JwtPayload {
	id?: number;
	userId?: number;
	userName: string;
	githubId: number;
	iat: number;
	exp: number;
}

export function parseJwt(token: string): JwtPayload | null {
	try {
		const base64Url = token.split('.')[1];
		if (!base64Url) return null;

		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);

		return JSON.parse(jsonPayload);
	} catch (error) {
		console.error('Failed to parse JWT:', error);
		return null;
	}
}

export function isTokenExpired(token: string): boolean {
	const payload = parseJwt(token);
	if (!payload || !payload.exp) return true;

	return Date.now() >= payload.exp * 1000;
}
