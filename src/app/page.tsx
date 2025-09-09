'use client';

import { useState, useEffect } from 'react';
import QuestionCard from '@/components/QuestionCard';
import { QAItem } from '@/lib/question';

interface Topic {
  id: string;
  name: string;
  path: string;
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QAItem | null>(null);
  const [currentSource, setCurrentSource] = useState<{ file: string; path: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTopicSelection, setShowTopicSelection] = useState(true);

  // 토픽 목록 가져오기
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        const data = await response.json();
        
        if (data.success) {
          setTopics(data.topics);
        } else {
          setError('토픽 목록을 가져올 수 없습니다.');
        }
      } catch (err) {
        setError('서버 연결에 실패했습니다.');
      }
    };

    fetchTopics();
  }, []);

  // 랜덤 질문 가져오기
  const fetchRandomQuestion = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/random-question');
      const data = await response.json();
      
      if (data.success) {
        setCurrentQuestion(data.question);
        setCurrentSource(data.source);
        setShowTopicSelection(false);
      } else {
        setError(data.error || '질문을 가져올 수 없습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 특정 토픽에서 질문 가져오기
  const fetchQuestionFromTopic = async (topicId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/content/${topicId}`);
      const data = await response.json();
      
      if (data.success && data.content.questions.length > 0) {
        // 랜덤하게 질문 선택
        const randomIndex = Math.floor(Math.random() * data.content.questions.length);
        setCurrentQuestion(data.content.questions[randomIndex]);
        setCurrentSource({ file: topicId + '.md', path: data.content.path });
        setShowTopicSelection(false);
      } else {
        setError('해당 토픽에서 질문을 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    fetchRandomQuestion();
  };

  const handleBackToTopics = () => {
    setShowTopicSelection(true);
    setCurrentQuestion(null);
    setCurrentSource(null);
    setError(null);
  };

  if (showTopicSelection) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              CS 학습 시스템
            </h1>
            <p className="text-lg text-gray-600">
              GitHub 리포지토리의 마크다운 문서를 기반으로 한 문제 풀이 학습
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => fetchQuestionFromTopic(topic.id)}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {topic.name.replace('.md', '')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {topic.path}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={fetchRandomQuestion}
              disabled={loading}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
            >
              {loading ? '로딩 중...' : '랜덤 문제 시작'}
            </button>
          </div>

          {topics.length === 0 && !error && (
            <div className="text-center text-gray-500 mt-8">
              <p>토픽을 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={handleBackToTopics}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← 토픽 선택으로 돌아가기
            </button>
          </div>
          
          <QuestionCard question={currentQuestion} onNext={handleNextQuestion} source={currentSource} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}
