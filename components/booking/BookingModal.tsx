'use client'

import { useState } from 'react'
import { formatDate, formatAmount, isBookingAllowed } from '@/lib/utils'

interface BookingModalProps {
  spaceName: string
  date: Date
  startTime: string
  onClose: () => void
  onSuccess: () => void
}

export default function BookingModal({
  spaceName,
  date,
  startTime,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    unit: '',
    hours: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 회원 여부 확인
  const memberUnits = (process.env.NEXT_PUBLIC_MEMBER_UNITS || '201,301,302,401,402,501').split(',')
  const isMember = memberUnits.includes(formData.unit)

  // 예약 가능 여부 체크
  const bookingCheck = isBookingAllowed(
    new Date(`${date.toDateString()} ${startTime}`),
    isMember
  )

  // 금액 계산
  const hourlyRate = 14000
  const totalAmount = isMember ? 0 : hourlyRate * formData.hours

  // 종료 시간 계산
  const [startHour] = startTime.split(':').map(Number)
  const endHour = startHour + formData.hours
  const endTime = `${endHour.toString().padStart(2, '0')}:00`

  // 예약 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bookingCheck.allowed) {
      setError(bookingCheck.reason || '예약할 수 없습니다')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceName,
          date: date.toISOString(),
          startTime,
          endTime,
          hours: formData.hours,
          user: {
            name: formData.name,
            phone: formData.phone,
            unit: formData.unit || null,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || '예약에 실패했습니다')
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {spaceName} 예약하기
        </h2>

        {/* 예약 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">날짜</span>
            <span className="font-medium">{formatDate(date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">시간</span>
            <span className="font-medium">{startTime} ~ {endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">금액</span>
            <span className="font-medium text-blue-600">
              {totalAmount === 0 ? '무료' : `${formatAmount(totalAmount)}원`}
            </span>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호 *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-1234-5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              세대 (회원인 경우)
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="201, 301, 302, 401, 402, 501"
            />
            {isMember && (
              <p className="mt-1 text-xs text-green-600">
                ✓ 회원 세대입니다 (월 3회 무료)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예약 시간
            </label>
            <select
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((h) => (
                <option key={h} value={h}>
                  {h}시간 {!isMember && `(${formatAmount(hourlyRate * h)}원)`}
                </option>
              ))}
            </select>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* 입금 안내 (비회원) */}
          {!isMember && totalAmount > 0 && (
            <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md">
              <p className="font-medium mb-1">💰 입금 안내</p>
              <p>카카오뱅크 7979-72-56275 (정상은)</p>
              <p className="mt-1 text-xs">
                예약 후 24시간 내 입금해주세요
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !bookingCheck.allowed}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '예약 중...' : '예약하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
