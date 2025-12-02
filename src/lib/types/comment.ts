export interface Comment {
	id: number;
	parentId: number;
	content: string;
	user: {
		id: number;
		userName: string;
		githubId: number;
	};
	createdAt: string;
	liked: boolean;
	likeId: number;
	likeCount: number;
}
