import type { Comment } from './comment';

export interface User {
	id: number;
	userName: string;
	githubId: number;
}

export interface Post {
	id: number;
	user: User;
	comment?: Comment[];
	userId: number;
	title: string;
	content: string;
	views: number;
	updatedAt: Date | string;
	likeCount: number;
	liked: boolean;
	likeId?: number;
}
