# CS 학습 시스템

GitHub 리포지토리의 마크다운 문서를 기반으로 한 문제 풀이 학습 웹 애플리케이션입니다.

## 기능

- GitHub 리포지토리에서 마크다운 파일 자동 가져오기
- 마크다운 문서를 질문/답변 형태로 자동 분할
- 사용자 답안 입력 및 정답과 비교
- 실시간 차이점 표시 (Diff)
- 토픽별 문제 선택 또는 랜덤 문제

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# GitHub 리포지토리 설정
GITHUB_REPO_OWNER=repo owner username
GITHUB_REPO_NAME=repo name
GITHUB_MD_DIR=repo url
GITHUB_REF=branch name

# GitHub 토큰 (선택사항 - 레이트리밋 완화용)
GITHUB_TOKEN=ghp_your_token_here
```

#### 환경변수 설정 가이드

- **`GITHUB_REPO_OWNER`**: GitHub 사용자명 또는 조직명
- **`GITHUB_REPO_NAME`**: 리포지토리 이름
- **`GITHUB_MD_DIR`**: 마크다운 파일들이 있는 폴더 경로
  - 루트 디렉터리에 있으면: `""` (빈 값) 또는 `"."`
  - 특정 폴더에 있으면: `"docs"`, `"notes"`, `"cs-notes"` 등
- **`GITHUB_REF`**: 브랜치명 (기본값: `main`)
- **`GITHUB_TOKEN`**: GitHub Personal Access Token (선택사항)

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 애플리케이션을 확인하세요.

## 사용법

1. **토픽 선택**: 메인 페이지에서 원하는 토픽을 클릭하거나 "랜덤 문제 시작" 버튼을 클릭합니다.
2. **문제 풀이**: 제시된 문제에 대해 답안을 입력합니다.
3. **답안 제출**: "답안 제출" 버튼을 클릭하여 답안을 제출합니다.
4. **정답 확인**: "정답과 비교하기" 버튼을 클릭하여 정답과 차이점을 확인합니다.
5. **다음 문제**: "다음 문제" 버튼을 클릭하여 새로운 문제를 받습니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── topics/route.ts          # 토픽 목록 API
│   │   ├── content/[slug]/route.ts  # 특정 토픽 콘텐츠 API
│   │   └── random-question/route.ts # 랜덤 질문 API
│   ├── globals.css                  # 전역 스타일
│   ├── layout.tsx                   # 레이아웃
│   └── page.tsx                     # 메인 페이지
├── components/
│   ├── DiffViewer.tsx               # 답안 비교 컴포넌트
│   └── QuestionCard.tsx             # 문제 카드 컴포넌트
└── lib/
    ├── github.ts                    # GitHub API 유틸리티
    ├── markdown.ts                  # 마크다운 파싱 유틸리티
    └── question.ts                  # 질문 생성 로직
```

## 마크다운 문서 형식

시스템은 다음과 같은 마크다운 구조를 기대합니다:

```markdown
# 문서 제목

## 질문 1
이것은 첫 번째 질문입니다.

답변 내용이 여기에 들어갑니다.

## 질문 2
이것은 두 번째 질문입니다.

답변 내용이 여기에 들어갑니다.
```

- `##` 또는 `###` 헤더가 질문으로 사용됩니다.
- 헤더 다음의 내용이 정답으로 사용됩니다.

### 루트 디렉터리 구조 예시

루트 디렉터리에 여러 과목별 마크다운 파일이 있는 경우:

```
your-repo/
├── algorithms.md
├── data-structures.md
├── system-design.md
├── database.md
└── README.md
```

환경변수 설정:
```env
GITHUB_MD_DIR=""  # 빈 값으로 설정
```

이렇게 하면 모든 `.md` 파일에서 랜덤하게 문제를 가져와서 제시합니다.

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Markdown**: unified, remark, rehype
- **Diff**: diff-match-patch
- **GitHub API**: @octokit/rest

## 라이선스

MIT License