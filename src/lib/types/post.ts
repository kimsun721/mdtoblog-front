import type { Comment } from './comment';

export interface Post {
	id: number;
	user: { userName: string; githubId: number };
	comment: [comment: Comment];
	userId: number;
	title: string;
	content: string;
	views: number;
	updatedAt: Date;
	likeCount: number;
	liked: boolean;
	likeId: number;
}
