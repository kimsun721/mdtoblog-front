export function timeAgo(dateString: string) {
	const now = new Date();
	const past = new Date(dateString);
	const diff = (now.getTime() - past.getTime()) / 1000; // 초 단위

	if (diff < 60) return `${Math.floor(diff)}초 전`;
	if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

	return past.toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
}
