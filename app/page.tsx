'use client'

import { useState } from 'react'
import WeeklyCalendar from '@/components/calendar/WeeklyCalendar'

export default function Home() {
  const [selectedSpace, setSelectedSpace] = useState<'놀터' | '방음실'>('놀터')

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">온음 공간 예약</h1>
          <p className="mt-1 text-sm text-gray-600">
            놀터와 방음실을 간편하게 예약하세요
          </p>
        </div>
      </header>

      {/* 공간 선택 탭 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedSpace('놀터')}
            className={`pb-4 px-4 font-medium transition-colors ${
              selectedSpace === '놀터'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            놀터
          </button>
          <button
            onClick={() => setSelectedSpace('방음실')}
            className={`pb-4 px-4 font-medium transition-colors ${
              selectedSpace === '방음실'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            방음실
          </button>
        </div>

        {/* 캘린더 */}
        <div className="mt-8">
          <WeeklyCalendar spaceName={selectedSpace} />
        </div>
      </div>

      {/* 안내사항 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            예약 안내
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>회원</strong>: 7세대 (201-501호), 월 3회 무료</li>
            <li>• <strong>비회원</strong>: 시간당 14,000원, 24시간 전 예약 필수</li>
            <li>• <strong>운영시간</strong>: 09:00 ~ 23:00</li>
            <li>• <strong>계좌</strong>: 카카오뱅크 7979-72-56275 (정상은)</li>
            <li>• <strong>주차</strong>: 불가</li>
            <li>• <strong>반려동물</strong>: 사전 고지 필수</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
