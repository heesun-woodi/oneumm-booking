'use client'

import { useState, useEffect } from 'react'
import { getWeekDates, getTimeSlots, formatDate } from '@/lib/utils'
import BookingModal from '@/components/booking/BookingModal'

interface Booking {
  id: string
  date: Date
  startTime: string
  endTime: string
  user: { name: string; isMember: boolean }
  status: string
}

interface WeeklyCalendarProps {
  spaceName: string
}

export default function WeeklyCalendar({ spaceName }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date
    time: string
  } | null>(null)

  const weekDates = getWeekDates(currentWeek)
  const timeSlots = getTimeSlots()

  // 예약 데이터 가져오기
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      try {
        const startDate = weekDates[0].toISOString()
        const endDate = weekDates[6].toISOString()
        
        const response = await fetch(
          `/api/bookings?space=${spaceName}&start=${startDate}&end=${endDate}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setBookings(data.bookings || [])
        }
      } catch (error) {
        console.error('예약 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [spaceName, currentWeek])

  // 주 이동
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newDate)
  }

  // 슬롯에 예약이 있는지 확인
  const getBookingForSlot = (date: Date, time: string) => {
    return bookings.find((booking) => {
      const bookingDate = new Date(booking.date)
      return (
        bookingDate.toDateString() === date.toDateString() &&
        booking.startTime <= time &&
        booking.endTime > time
      )
    })
  }

  // 슬롯 클릭
  const handleSlotClick = (date: Date, time: string) => {
    const booking = getBookingForSlot(date, time)
    if (!booking) {
      setSelectedSlot({ date, time })
    }
  }

  return (
    <div className="space-y-4">
      {/* 주 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek('prev')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          이전 주
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {formatDate(weekDates[0])} ~ {formatDate(weekDates[6])}
        </h2>
        
        <button
          onClick={() => navigateWeek('next')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          다음 주
        </button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          {/* 시간 헤더 */}
          <div className="p-3 bg-gray-50 font-medium text-sm text-gray-700">
            시간
          </div>
          
          {/* 요일 헤더 */}
          {weekDates.map((date, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 text-center border-l border-gray-200"
            >
              <div className="text-sm font-medium text-gray-900">
                {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* 시간 슬롯 */}
        <div className="divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8">
              {/* 시간 라벨 */}
              <div className="p-3 bg-gray-50 text-sm text-gray-600 font-medium">
                {time}
              </div>

              {/* 요일별 슬롯 */}
              {weekDates.map((date, dateIndex) => {
                const booking = getBookingForSlot(date, time)
                const isPast = new Date(`${date.toDateString()} ${time}`) < new Date()

                return (
                  <div
                    key={`${dateIndex}-${time}`}
                    onClick={() => !isPast && handleSlotClick(date, time)}
                    className={`
                      p-3 border-l border-gray-200 min-h-[60px] text-xs
                      ${isPast ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                      ${booking ? 'bg-blue-100' : ''}
                    `}
                  >
                    {booking && (
                      <div className="text-blue-900 font-medium">
                        {booking.user.name}
                        {booking.user.isMember && (
                          <span className="ml-1 text-blue-600">(회원)</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 예약 모달 */}
      {selectedSlot && (
        <BookingModal
          spaceName={spaceName}
          date={selectedSlot.date}
          startTime={selectedSlot.time}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => {
            setSelectedSlot(null)
            // 예약 목록 새로고침
            setCurrentWeek(new Date(currentWeek))
          }}
        />
      )}
    </div>
  )
}
