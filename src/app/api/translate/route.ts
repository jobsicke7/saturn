import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();
    
    // 마크다운 이미지 태그 추출 및 보존
    const imageRegex = /!\[.*?\]\(.*?\)/g;
    const imageMatches = text.match(imageRegex) || [];
    
    // 이미지 태그를 특수 플레이스홀더로 대체
    let processedText = text;
    const placeholders: { [key: string]: string } = {};
    
    imageMatches.forEach((match: string, index: number) => {
      const placeholder = `__IMAGE_PLACEHOLDER_${index}__`;  // 구분자 추가
      processedText = processedText.replace(match, placeholder);
      placeholders[placeholder] = match;
    });
    
    // Gemini AI 모델 생성
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // 번역 요청
    const prompt = `Translate the following text to ${targetLanguage}. Preserve all markdown formatting. Keep the placeholder patterns that look like __IMAGE_PLACEHOLDER_X__ (where X is a number) unchanged:

${processedText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let translatedText = response.text();
    
    // 이미지 태그 복원
    Object.keys(placeholders).forEach((placeholder) => {
      translatedText = translatedText.replace(placeholder, placeholders[placeholder]);
      // 만약 첫 번째 치환이 실패했을 경우, 직접 패턴을 찾아서 치환
      if (translatedText.includes(placeholder.replace(/__/g, ''))) {
        translatedText = translatedText.replace(
          placeholder.replace(/__/g, ''), 
          placeholders[placeholder]
        );
      }
    });
    
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}