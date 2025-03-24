import { NextResponse } from 'next/server';
import axios from 'axios';

let cachedData: string | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2시간

export async function GET() {
  try {
    const now = Date.now();
    
    // 캐시 유효성 검사
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json({ data: cachedData });
    }
    
    // 대체 API 소스들
    const apiSources = [
      'https://celestrak.com/NORAD/elements/stations.txt'
    ];

    // API 순차적으로 시도
    for (const source of apiSources) {
      try {
        const response = await axios.get(source, { 
          timeout: 5000,
          headers: {
            'User-Agent': 'ISS Tracker Application'
          }
        });

        if (response.status === 200) {
          cachedData = response.data;
          lastFetchTime = now;
          
          return NextResponse.json({ 
            data: cachedData,
            source: source 
          });
        }
      } catch (sourceError) {
        console.warn(`Failed to fetch from ${source}:`, sourceError);
        continue;
      }
    }

    // 모든 소스 실패 시
    return NextResponse.json({ 
      error: 'Failed to fetch TLE data',
      status: 500 
    });

  } catch (error) {
    console.error("Critical error fetching TLE data:", error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      status: 500 
    });
  }
}

// CORS 및 캐시 헤더 설정
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
