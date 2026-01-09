import { PUBLIC_API_URL } from '$env/static/public';
import { accessToken } from '$lib/auth';
import { get } from 'svelte/store';

class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public data?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

interface RequestConfig extends RequestInit {
	requiresAuth?: boolean;
}

class ApiService {
	private baseUrl = PUBLIC_API_URL;

	private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
		const { requiresAuth = false, headers = {}, ...restConfig } = config;

		const requestHeaders: Record<string, string> = {
			'Content-Type': 'application/json',
			...(headers as Record<string, string>)
		};

		// 토큰이 있으면 항상 헤더에 추가
		const token = get(accessToken);
		if (token) {
			requestHeaders['Authorization'] = `Bearer ${token}`;
		}

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				...restConfig,
				headers: requestHeaders
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				throw new ApiError(errorData?.message || 'Request failed', response.status, errorData);
			}

			// 204 No Content는 body가 없으므로 빈 객체 반환
			if (response.status === 204) {
				return {} as T;
			}

			return response.json();
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error', 0, error);
		}
	}

	// Auth
	async refreshToken() {
		return this.request('/auth/refresh', {
			method: 'POST',
			credentials: 'include'
		});
	}

	async logout() {
		return this.request('/auth/logout', {
			method: 'POST',
			requiresAuth: true
		});
	}

	// Posts
	async getPosts(page: number, limit = 20, signal?: AbortSignal) {
		return this.request(`/post?page=${page}&limit=${limit}`, { signal });
	}

	async getPost(id: number | string) {
		return this.request(`/post/${id}`);
	}

	async searchPosts(keyword: string) {
		return this.request(`/post/search?keyword=${encodeURIComponent(keyword)}`);
	}

	async likePost(postId: number) {
		return this.request(`/post/${postId}/likes`, {
			method: 'POST',
			requiresAuth: true
		});
	}

	async unlikePost(likeId: number) {
		return this.request(`/post/${likeId}/likes`, {
			method: 'DELETE',
			requiresAuth: true
		});
	}

	// Comments
	async createComment(data: { postId: number; content: string; parentId?: number }) {
		return this.request('/comment', {
			method: 'POST',
			body: JSON.stringify(data),
			requiresAuth: true
		});
	}

	async updateComment(id: number, content: string) {
		return this.request(`/comment/${id}`, {
			method: 'PATCH',
			body: JSON.stringify({ content }),
			requiresAuth: true
		});
	}

	async deleteComment(id: number) {
		return this.request(`/comment/${id}`, {
			method: 'DELETE',
			requiresAuth: true
		});
	}

	async likeComment(commentId: number) {
		return this.request(`/comment/${commentId}/likes`, {
			method: 'POST',
			requiresAuth: true
		});
	}

	async unlikeComment(likeId: number) {
		return this.request(`/comment/${likeId}/likes`, {
			method: 'DELETE',
			requiresAuth: true
		});
	}

	// Users
	async getUser(id: number | string) {
		return this.request(`/user/${id}`);
	}

	async getUserPosts(id: number | string) {
		return this.request(`/user/${id}/posts`);
	}

	async getUserComments(id: number | string) {
		return this.request(`/user/${id}/comments`);
	}

	// Repositories
	async getRepos() {
		return this.request('/repo', { requiresAuth: true });
	}

	async getUserRepos() {
		return this.request('/user/repos', { requiresAuth: true });
	}

	async registerRepo(data: { owner: string; repo: string }) {
		return this.request('/repo', {
			method: 'POST',
			body: JSON.stringify(data),
			requiresAuth: true
		});
	}

	async updateRepo(id: number, data: { ignorePaths: string[] }) {
		return this.request(`/repo/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
			requiresAuth: true
		});
	}

	async deleteRepo(id: number) {
		return this.request(`/repo/${id}`, {
			method: 'DELETE',
			requiresAuth: true
		});
	}

	async syncRepo(data: { owner: string; repo: string }) {
		return this.request('/repo/sync', {
			method: 'POST',
			body: JSON.stringify(data),
			requiresAuth: true
		});
	}
}

export const api = new ApiService();
export { ApiError };
