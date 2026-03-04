import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

// 시간 포맷팅
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

// 금액 포맷팅
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount)
}

// 주간 날짜 생성 (일요일 ~ 토요일)
export function getWeekDates(baseDate: Date = new Date()): Date[] {
  const dates: Date[] = []
  const day = baseDate.getDay() // 0 (일요일) ~ 6 (토요일)
  
  // 해당 주의 일요일부터 시작
  const sunday = new Date(baseDate)
  sunday.setDate(baseDate.getDate() - day)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday)
    date.setDate(sunday.getDate() + i)
    dates.push(date)
  }
  
  return dates
}

// 시간 슬롯 생성 (09:00 ~ 23:00)
export function getTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 9; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return slots
}

// 예약 가능 여부 체크
export function isBookingAllowed(
  date: Date,
  isMember: boolean
): { allowed: boolean; reason?: string } {
  const now = new Date()
  const hoursDiff = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  // 비회원: 24시간 전 예약 필수
  if (!isMember && hoursDiff < 24) {
    return {
      allowed: false,
      reason: '비회원은 24시간 전에 예약해야 합니다',
    }
  }
  
  return { allowed: true }
}
