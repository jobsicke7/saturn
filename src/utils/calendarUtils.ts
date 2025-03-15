/**
 * 두 날짜가 같은 날인지 확인합니다.
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }
  
  /**
   * 주어진 날짜가 오늘인지 확인합니다.
   */
  export function isToday(date: Date): boolean {
    const today = new Date();
    return isSameDay(date, today);
  }
  
  /**
   * 주어진 날짜가 현재 달에 속하는지 확인합니다.
   */
  export function isCurrentMonth(date: Date, currentMonth: Date): boolean {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  }
  
  /**
   * 한 주의 시작일(일요일)과 마지막일(토요일)을 구합니다.
   */
  export function getWeekRange(date: Date): { start: Date; end: Date } {
    const day = date.getDay(); // 0: 일요일, 6: 토요일
    const diff = date.getDate() - day;
    
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    
    const weekEnd = new Date(date);
    weekEnd.setDate(diff + 6);
    
    return { start: weekStart, end: weekEnd };
  }
  
  /**
   * 월별 달력을 위한 날짜 배열을 생성합니다.
   * 이전 달, 현재 달, 다음 달의 날짜들이 포함됩니다.
   */
  export function getCalendarDays(year: number, month: number): Date[] {
    const result: Date[] = [];
    
    // 해당 월의 첫날과 마지막날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫 주의 이전 달 날짜들 (일요일부터 시작)
    const firstDayOfWeek = firstDay.getDay(); // 0: 일요일, 6: 토요일
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      result.push(prevDate);
    }
    
    // 현재 달의 날짜들
    for (let date = 1; date <= lastDay.getDate(); date++) {
      result.push(new Date(year, month, date));
    }
    
    // 마지막 주의 다음 달 날짜들 (토요일까지)
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      result.push(new Date(year, month + 1, i));
    }
    
    return result;
  }
  
  /**
   * 달력에 표시할 월 이름을 포맷합니다.
   */
  export function formatMonth(date: Date, locale: string = 'ko-KR'): string {
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
  }
  
  /**
   * 날짜를 일 형식으로 포맷합니다.
   */
  export function formatDay(date: Date, locale: string = 'ko-KR'): string {
    return date.toLocaleDateString(locale, { day: 'numeric' });
  }
  