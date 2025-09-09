'use client';

import React, { useState } from 'react';
import { diff_match_patch } from 'diff-match-patch';
import { renderMarkdownToHtml } from '@/lib/markdown';

interface DiffViewerProps {
  userAnswer: string;
  correctAnswer: string;
  correctAnswerMarkdown?: string;
  userAnswerMarkdown?: string;
}

export default function DiffViewer({ userAnswer, correctAnswer, correctAnswerMarkdown, userAnswerMarkdown }: DiffViewerProps) {
  const [showDiff, setShowDiff] = useState(true); // 기본적으로 비교 결과를 보여줌
  const dmp = new diff_match_patch();

  const generateDiff = () => {
    const diffs = dmp.diff_main(userAnswer, correctAnswer);
    dmp.diff_cleanupSemantic(diffs);
    return diffs;
  };

  const [renderedCorrectMarkdown, setRenderedCorrectMarkdown] = useState<string>('');
  const [renderedUserMarkdown, setRenderedUserMarkdown] = useState<string>('');

  const renderMarkdownContent = async (markdown: string) => {
    try {
      const html = await renderMarkdownToHtml(markdown);
      return html;
    } catch (error) {
      console.error('마크다운 렌더링 실패:', error);
      return markdown;
    }
  };

  // 컴포넌트 마운트 시 마크다운 렌더링
  React.useEffect(() => {
    const renderBoth = async () => {
      if (correctAnswerMarkdown) {
        const correctHtml = await renderMarkdownContent(correctAnswerMarkdown);
        setRenderedCorrectMarkdown(correctHtml);
      }
      if (userAnswerMarkdown) {
        const userHtml = await renderMarkdownContent(userAnswerMarkdown);
        setRenderedUserMarkdown(userHtml);
      }
    };
    renderBoth();
  }, [correctAnswerMarkdown, userAnswerMarkdown]);

  const renderDiff = () => {
    const diffs = generateDiff();
    
    return diffs.map((diff, index) => {
      const [operation, text] = diff;
      
      if (operation === 0) {
        // 동일한 부분
        return (
          <span key={index} className="text-gray-800">
            {text}
          </span>
        );
      } else if (operation === -1) {
        // 삭제된 부분 (사용자 답안에만 있음)
        return (
          <span key={index} className="bg-red-200 text-red-800 line-through">
            {text}
          </span>
        );
      } else {
        // 추가된 부분 (정답에만 있음)
        return (
          <span key={index} className="bg-green-200 text-green-800">
            {text}
          </span>
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">정답 확인</h3>
        <button
          onClick={() => setShowDiff(!showDiff)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
        >
          {showDiff ? '숨기기' : '보기'}
        </button>
      </div>
      
      {showDiff && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2 text-blue-600">정답</h4>
            <div className="bg-blue-50 p-4 rounded text-gray-800">
              {correctAnswerMarkdown && renderedCorrectMarkdown ? (
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ 
                    __html: renderedCorrectMarkdown 
                  }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{correctAnswer}</div>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2 text-green-600">내 답안</h4>
            <div className="bg-gray-50 p-4 rounded text-gray-800 mb-4">
              {userAnswerMarkdown && renderedUserMarkdown ? (
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ 
                    __html: renderedUserMarkdown 
                  }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{userAnswer}</div>
              )}
            </div>
            
            <h4 className="font-semibold text-lg mb-2 text-blue-600">정답</h4>
            <div className="bg-blue-50 p-4 rounded text-gray-800">
              {correctAnswerMarkdown && renderedCorrectMarkdown ? (
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ 
                    __html: renderedCorrectMarkdown 
                  }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{correctAnswer}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
