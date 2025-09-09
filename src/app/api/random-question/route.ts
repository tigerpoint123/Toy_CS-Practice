import { NextResponse } from 'next/server';
import { listMarkdownFiles, fetchMarkdownByPath } from '@/lib/github';
import { splitMarkdownIntoQA, getRandomQuestion } from '@/lib/question';

export async function GET() {
  try {
    // 모든 마크다운 파일 목록 가져오기
    const files = await listMarkdownFiles();
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: '마크다운 파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 모든 파일에서 질문들을 수집
    const allQuestions: Array<{
      question: any;
      source: { file: string; path: string };
    }> = [];
    
    for (const file of files) {
      try {
        const markdown = await fetchMarkdownByPath(file.path);
        const qaItems = splitMarkdownIntoQA(markdown);
        
        // 각 질문에 출처 정보 추가
        qaItems.forEach(qa => {
          allQuestions.push({
            question: qa,
            source: {
              file: file.name,
              path: file.path
            }
          });
        });
      } catch (error) {
        console.error(`파일 ${file.name} 처리 실패:`, error);
        // 개별 파일 실패는 무시하고 계속 진행
      }
    }
    
    if (allQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: '질문을 생성할 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 전체 질문 중에서 랜덤하게 선택
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const selectedQuestion = allQuestions[randomIndex];
    
    return NextResponse.json({
      success: true,
      question: selectedQuestion.question,
      source: selectedQuestion.source
    });
  } catch (error) {
    console.error('랜덤 질문 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: '질문을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
