export interface Comment {
	id: number;
	parentId: number | null;
	content: string;
	user: {
		id: number;
		userName: string;
		githubId: number;
	};
	createdAt: string;
	liked: boolean;
	likeId?: number | null;
	likeCount: number;
}
