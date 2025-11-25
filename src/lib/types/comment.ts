export interface Comment {
	id: number;
	parentId: number;
	content: string;
	liked: boolean;
	likeId: number;
	likeCount: number;
}
