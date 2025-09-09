import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

// 마크다운을 HTML로 변환
export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  try {
    // 마크다운 전처리: 문제가 될 수 있는 요소들을 정리
    const cleanedMarkdown = markdown
      .replace(/^---+$/gm, '') // 수평선 제거
      .replace(/^===+$/gm, '') // 수평선 제거
      .replace(/^\*\*\*+$/gm, '') // 수평선 제거
      .trim();

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeHighlight)
      .use(rehypeStringify, { allowDangerousHtml: true });

    const result = await processor.process(cleanedMarkdown);
    return String(result);
  } catch (error) {
    console.error('마크다운 렌더링 실패:', error);
    // 실패 시 간단한 HTML로 변환
    return convertToSimpleHtml(markdown);
  }
}

// 간단한 HTML 변환 함수 (폴백용)
function convertToSimpleHtml(markdown: string): string {
  return markdown
    .replace(/^### (.+)$/gm, '<h3>$1</h3>') // h3 헤더
    .replace(/^## (.+)$/gm, '<h2>$1</h2>') // h2 헤더
    .replace(/^# (.+)$/gm, '<h1>$1</h1>') // h1 헤더
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 볼드
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // 이탤릭
    .replace(/`(.*?)`/g, '<code>$1</code>') // 인라인 코드
    .replace(/^\+ (.+)$/gm, '<li>$1</li>') // 리스트
    .replace(/^- (.+)$/gm, '<li>$1</li>') // 리스트
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>') // 번호 리스트
    .replace(/\n/g, '<br>'); // 줄바꿈
}

// 마크다운 텍스트를 단순 텍스트로 변환 (비교용)
export function markdownToText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // 헤더 제거
    .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 제거
    .replace(/\*(.*?)\*/g, '$1') // 이탤릭 제거
    .replace(/`(.*?)`/g, '$1') // 인라인 코드 제거
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 제거
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 이미지 링크 제거 (alt 텍스트도 제거)
    .replace(/^\s*[-*+]\s+/gm, '') // 리스트 마커 제거
    .replace(/^\s*\d+\.\s+/gm, '') // 번호 리스트 제거
    .replace(/<details>[\s\S]*?<\/details>/g, '') // details 태그 제거
    .replace(/<summary>[\s\S]*?<\/summary>/g, '') // summary 태그 제거
    .replace(/<br\s*\/?>/g, '\n') // br 태그를 줄바꿈으로 변환
    .replace(/<[^>]+>/g, '') // 기타 HTML 태그 제거
    .replace(/\n\s*\n/g, '\n') // 빈 줄 정리
    .trim();
}
