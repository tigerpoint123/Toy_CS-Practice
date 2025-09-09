'use client';

import { useState } from 'react';
import DiffViewer from './DiffViewer';
import { QAItem } from '@/lib/question';

interface QuestionCardProps {
  question: QAItem;
  onNext: () => void;
  source?: {
    file: string;
    path: string;
  };
}

export default function QuestionCard({ question, onNext, source }: QuestionCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
    // 답안 제출 후 답안 칸 비우기
    setUserAnswer('');
  };

  const handleNext = () => {
    setUserAnswer('');
    setIsSubmitted(false);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            문제
          </h2>
          {source && (
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              📁 {source.file.replace('.md', '')}
            </div>
          )}
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-lg text-gray-700">{question.question}</p>
        </div>
      </div>

      {!isSubmitted ? (
        <>
          <div className="mb-6">
            <label htmlFor="answer" className="block text-lg font-semibold text-gray-700 mb-2">
              답안을 입력하세요:
            </label>
            <textarea
              id="answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="여기에 답안을 작성해주세요..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              답안 제출
            </button>
          </div>
        </>
      ) : (
        <div className="border-t pt-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              다음 문제
            </button>
          </div>
          
          <DiffViewer 
            userAnswer={userAnswer} 
            correctAnswer={question.answerText} 
            correctAnswerMarkdown={question.answerMarkdown}
            userAnswerMarkdown={userAnswer}
          />
        </div>
      )}
    </div>
  );
}
