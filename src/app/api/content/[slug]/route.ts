import { NextResponse } from 'next/server';
import { fetchMarkdownByPath } from '@/lib/github';
import { splitMarkdownIntoQA } from '@/lib/question';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // slug를 파일 경로로 변환
    const mdDir = process.env.GITHUB_MD_DIR || '';
    const filePath = mdDir ? `${mdDir}/${slug}.md` : `${slug}.md`;
    
    console.log(`파일 경로: ${filePath}`);
    
    const markdown = await fetchMarkdownByPath(filePath);
    console.log(`마크다운 길이: ${markdown.length} 문자`);
    
    const qaItems = splitMarkdownIntoQA(markdown);
    console.log(`생성된 질문 수: ${qaItems.length}`);
    
    if (qaItems.length === 0) {
      console.log('질문이 생성되지 않았습니다. 마크다운 내용:', markdown.substring(0, 200));
    }
    
    return NextResponse.json({
      success: true,
      content: {
        path: filePath,
        markdown,
        questions: qaItems
      }
    });
  } catch (error) {
    console.error('콘텐츠 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: `콘텐츠를 가져올 수 없습니다: ${error.message}` },
      { status: 500 }
    );
  }
}
