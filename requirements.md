# Requirements — 백엔드 미구현 기능

디자인 HTML(`mdtoblog(1).html`)에 존재하지만 현재 백엔드 API에 없어 하드코딩으로 처리된 기능 목록입니다.

---

## 1. 플랫폼 통계 (히어로 섹션)

**위치**: 홈 페이지 히어로 배너

현재 상태: 하드코딩 (`2,841 포스트`, `438 개발자`, `127 오늘 업데이트`)

**필요한 API**:
```
GET /stats
Response: {
  totalPosts: number,
  totalUsers: number,
  todayUpdated: number
}
```

---

## 2. 인기 태그 (사이드바)

**위치**: 홈 사이드바 "🔥 인기 태그"

현재 상태: 태그 목록 하드코딩 (`['Rust', 'TypeScript', 'NestJS', ...]`)

**필요한 API**:
```
GET /tags/popular?limit=12
Response: {
  data: Array<{ name: string, count: number }>
}
```

---

## 3. 인기 포스트 TOP 5 (사이드바)

**위치**: 홈 사이드바 "📈 인기 포스트 TOP 5"

현재 상태: 데이터 하드코딩

**필요한 API**:
```
GET /posts?sort=views&limit=5
Response: {
  data: Array<{ id: number, title: string, views: number }>
}
```
(혹은 기존 `/posts` API에 `sort` 파라미터 추가)

---

## 4. 활발한 개발자 (사이드바)

**위치**: 홈 사이드바 "✨ 활발한 개발자"

현재 상태: 유저 목록 및 포스트 수 하드코딩

**필요한 API**:
```
GET /users/top?limit=4
Response: {
  data: Array<{ id: number, userName: string, githubId: number, postCount: number }>
}
```

---

## 5. 팔로잉 탭

**위치**: 홈 페이지 탭 중 "팔로잉"

현재 상태: UI 탭만 존재, 클릭 시 일반 포스트 목록과 동일하게 표시됨 (팔로잉 미구현)

**필요한 기능**:
- 팔로우/언팔로우 API
- 팔로잉 유저의 포스트만 필터링하는 API

```
POST /user/:id/follow
DELETE /user/:id/follow
GET /posts?feed=following
```

---

## 6. 팔로워 수 (프로필 페이지)

**위치**: 프로필 페이지 통계 섹션

현재 상태: HTML 원본에는 "팔로워 12" 하드코딩 표시 (현재 Svelte 구현에서는 제거됨)

**필요한 API**:
```
GET /user/:id/followers/count
Response: { count: number }
```

---

## 7. 포스트 뱃지 (태그/카테고리)

**위치**: 포스트 카드의 뱃지 (`Rust`, `NestJS`, `Architecture` 등), 포스트 상세 뱃지

현재 상태: `PostHeader.svelte`에서 `post.repoName`을 뱃지로 사용 중 (원본 HTML은 별도 `badge` 필드)

**필요한 것**: Post 데이터에 카테고리/태그 필드 추가 또는 첫 번째 태그를 뱃지로 사용하는 로직

---

## 8. 댓글 좋아요 (CommentItem)

**위치**: 댓글 액션 버튼

현재 상태: API 연동 구현됨 (`api.likeComment`, `api.unlikeComment`)

**확인 필요**: 백엔드에 댓글 좋아요 API 존재 여부 불확실
```
POST /comment/:id/like
DELETE /like/:likeId
```

---

## 9. 포스트 태그 목록

**위치**: 포스트 카드 푸터, 포스트 상세 메타 행

현재 상태: HTML 원본에는 태그 뱃지가 있으나 현재 백엔드 Post 타입에 tags 필드 없음

**필요한 것**: `Post` 타입에 `tags: string[]` 필드 추가 및 API 응답에 포함
