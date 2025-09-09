import { Octokit } from '@octokit/rest';

const GITHUB_API = 'https://api.github.com';

// GitHub API 헤더 생성
function getHeaders() {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  
  return headers;
}

// 마크다운 파일 목록 조회
export async function listMarkdownFiles(): Promise<{ name: string; path: string }[]> {
  const owner = process.env.GITHUB_REPO_OWNER || 'your-username';
  const repo = process.env.GITHUB_REPO_NAME || 'your-repo';
  const dir = process.env.GITHUB_MD_DIR || '';
  const ref = process.env.GITHUB_REF || 'main';

  try {
    // 루트 디렉터리인 경우 빈 경로로 요청
    const apiPath = dir ? `${dir}` : '';
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${apiPath}?ref=${ref}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const items = await response.json();
    
    return items
      .filter((item: any) => item.type === 'file' && item.name.endsWith('.md'))
      .map((item: any) => ({
        name: item.name,
        path: item.path
      }));
  } catch (error) {
    console.error('마크다운 파일 목록 조회 실패:', error);
    return [];
  }
}

// 특정 마크다운 파일 내용 가져오기
export async function fetchMarkdownByPath(path: string): Promise<string> {
  const owner = process.env.GITHUB_REPO_OWNER || 'your-username';
  const repo = process.env.GITHUB_REPO_NAME || 'your-repo';
  const ref = process.env.GITHUB_REF || 'main';

  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`파일 조회 실패: ${response.status}`);
    }

    const fileData = await response.json();
    
    if (!('download_url' in fileData)) {
      throw new Error('파일이 아닙니다');
    }

    const contentResponse = await fetch(fileData.download_url);
    if (!contentResponse.ok) {
      throw new Error('파일 내용 다운로드 실패');
    }

    return await contentResponse.text();
  } catch (error) {
    console.error('마크다운 파일 가져오기 실패:', error);
    throw error;
  }
}

// 재귀적으로 모든 마크다운 파일 경로 수집
export async function listAllMarkdownPaths(): Promise<string[]> {
  const owner = process.env.GITHUB_REPO_OWNER || 'your-username';
  const repo = process.env.GITHUB_REPO_NAME || 'your-repo';
  const dir = process.env.GITHUB_MD_DIR || 'docs';
  const ref = process.env.GITHUB_REF || 'main';

  const paths: string[] = [];

  async function walkDirectory(path: string): Promise<void> {
    try {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
        { headers: getHeaders() }
      );

      if (!response.ok) return;

      const items = await response.json();

      for (const item of items) {
        if (item.type === 'dir') {
          await walkDirectory(item.path);
        } else if (item.type === 'file' && item.name.endsWith('.md')) {
          paths.push(item.path);
        }
      }
    } catch (error) {
      console.error(`디렉터리 순회 실패 (${path}):`, error);
    }
  }

  await walkDirectory(dir);
  return paths;
}
