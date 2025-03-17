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
    const placeholders: string[] = [];
    
    imageMatches.forEach((match: string, index: number) => {
      const placeholder = `IMAGE_PLACEHOLDER_${index}`;
      processedText = processedText.replace(match, placeholder);
      placeholders.push(placeholder);
    });
    
    // Gemini AI 모델 생성
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // 번역 요청
    const prompt = `Translate the following text to ${targetLanguage}. Preserve all markdown formatting. Don't translate placeholders that look like IMAGE_PLACEHOLDER_X:

${processedText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let translatedText = response.text();
    
    // 이미지 태그 복원
    imageMatches.forEach((match: string, index: number) => {
      translatedText = translatedText.replace(`IMAGE_PLACEHOLDER_${index}`, match);
    });
    
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate' }, { status: 500 });
  }
}