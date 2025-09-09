import { NextResponse } from 'next/server';
import { listMarkdownFiles } from '@/lib/github';

export async function GET() {
  try {
    const files = await listMarkdownFiles();
    
    return NextResponse.json({
      success: true,
      topics: files.map(file => ({
        id: file.name.replace('.md', ''),
        name: file.name,
        path: file.path
      }))
    });
  } catch (error) {
    console.error('토픽 목록 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: '토픽 목록을 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}
