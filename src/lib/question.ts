import { markdownToText } from './markdown';

export interface QAItem {
  id: string;
  question: string;
  answerMarkdown: string;
  answerText: string;
}

// 마크다운 문서를 질문/답변 블록으로 분할
export function splitMarkdownIntoQA(markdown: string): QAItem[] {
  const qaItems: QAItem[] = [];
  
  // <details> 태그 밖의 헤더만 질문으로 사용
  // <details> 태그를 임시로 제거한 후 헤더를 찾음
  const tempMarkdown = markdown.replace(/<details>[\s\S]*?<\/details>/g, '');
  
  // 헤더(##, ###, ####)를 기준으로 섹션 분할
  const sections = tempMarkdown.split(/^#{2,4}\s+/m);
  
  // 첫 번째 섹션은 보통 제목이므로 제외
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n');
    
    if (lines.length === 0) continue;
    
    // 첫 번째 줄이 헤더 (질문)
    const question = lines[0].trim();
    if (!question) continue;
    
    // 원본 마크다운에서 해당 질문에 해당하는 답변 내용 찾기
    const answerMarkdown = findAnswerForQuestion(markdown, question);
    if (!answerMarkdown) continue;
    
    // <details> 태그가 있으면 그 안의 내용을 추출
    let processedAnswer = answerMarkdown;
    if (answerMarkdown.includes('<details>')) {
      // <details> 태그 안의 내용을 추출 (summary 제외)
      const detailsContent = answerMarkdown.replace(/<details>[\s\S]*?<summary>[\s\S]*?<\/summary>\s*/, '');
      processedAnswer = detailsContent.replace(/<\/details>[\s\S]*$/, '').trim();
      
      // <br /> 태그를 줄바꿈으로 변환
      processedAnswer = processedAnswer.replace(/<br\s*\/?>/g, '\n');
    }
    
    // 이미지 링크 제거
    processedAnswer = processedAnswer.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
    
    const answerText = markdownToText(processedAnswer);
    
    qaItems.push({
      id: `q${i}`,
      question,
      answerMarkdown: processedAnswer,
      answerText
    });
  }
  
  // 헤더가 없는 경우 전체를 하나의 질문으로 처리
  if (qaItems.length === 0) {
    const lines = markdown.split('\n');
    const firstLine = lines[0] || '이 문서의 내용을 설명해주세요';
    const content = lines.slice(1).join('\n').trim() || markdown;
    
    qaItems.push({
      id: 'q1',
      question: firstLine,
      answerMarkdown: content,
      answerText: markdownToText(content)
    });
  }
  
  return qaItems;
}

// 질문에 해당하는 답변 내용을 원본 마크다운에서 찾는 함수
function findAnswerForQuestion(markdown: string, question: string): string {
  // 질문 헤더를 찾아서 그 다음 내용을 반환
  const questionRegex = new RegExp(`^#{2,4}\\s+${question.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
  const match = markdown.match(questionRegex);
  
  if (!match) return '';
  
  const startIndex = match.index! + match[0].length;
  const remainingContent = markdown.substring(startIndex);
  
  // 다음 헤더까지의 내용을 추출
  const nextHeaderMatch = remainingContent.match(/^#{2,4}\s+/m);
  const endIndex = nextHeaderMatch ? nextHeaderMatch.index! : remainingContent.length;
  
  return remainingContent.substring(0, endIndex).trim();
}

// 랜덤하게 질문 선택
export function getRandomQuestion(qaItems: QAItem[]): QAItem | null {
  if (qaItems.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * qaItems.length);
  return qaItems[randomIndex];
}
