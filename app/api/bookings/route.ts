import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/bookings - 예약 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const spaceName = searchParams.get('space')
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!spaceName || !startDate || !endDate) {
      return NextResponse.json(
        { error: '필수 파라미터가 없습니다' },
        { status: 400 }
      )
    }

    // 공간 조회
    const space = await prisma.space.findUnique({
      where: { name: spaceName },
    })

    if (!space) {
      return NextResponse.json(
        { error: '공간을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 예약 조회
    const bookings = await prisma.booking.findMany({
      where: {
        spaceId: space.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          in: ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED'],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            isMember: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('예약 조회 실패:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - 예약 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spaceName, date, startTime, endTime, hours, user } = body

    // 유효성 검사
    if (!spaceName || !date || !startTime || !endTime || !hours || !user) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 공간 조회/생성
    let space = await prisma.space.findUnique({
      where: { name: spaceName },
    })

    if (!space) {
      space = await prisma.space.create({
        data: {
          name: spaceName,
          password: spaceName === '놀터' ? '#5204' : null,
        },
      })
    }

    // 사용자 조회/생성
    const memberUnits = (process.env.MEMBER_UNITS || '201,301,302,401,402,501').split(',')
    const isMember = user.unit ? memberUnits.includes(user.unit) : false

    let existingUser = await prisma.user.findUnique({
      where: { phone: user.phone },
    })

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          name: user.name,
          phone: user.phone,
          unit: user.unit || null,
          isMember,
        },
      })
    } else {
      // 기존 사용자 정보 업데이트
      existingUser = await prisma.user.update({
        where: { phone: user.phone },
        data: {
          name: user.name,
          unit: user.unit || null,
          isMember,
        },
      })
    }

    // 중복 예약 체크
    const existingBooking = await prisma.booking.findFirst({
      where: {
        spaceId: space.id,
        date: new Date(date),
        status: {
          in: ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: '이미 예약된 시간입니다' },
        { status: 409 }
      )
    }

    // 회원 무료 횟수 체크
    let isFree = false
    if (isMember) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const monthlyBookings = await prisma.booking.count({
        where: {
          userId: existingUser.id,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          isFree: true,
          status: {
            notIn: ['CANCELLED'],
          },
        },
      })

      isFree = monthlyBookings < 3
    }

    // 금액 계산
    const hourlyRate = space.hourlyRate
    const amount = isFree ? 0 : hourlyRate * hours

    // 입금 기한 (24시간 후)
    const bookingDate = new Date(date)
    const paymentDeadline = new Date(bookingDate)
    paymentDeadline.setHours(
      parseInt(startTime.split(':')[0]),
      parseInt(startTime.split(':')[1])
    )
    paymentDeadline.setHours(paymentDeadline.getHours() - 24)

    // 예약 생성
    const booking = await prisma.booking.create({
      data: {
        userId: existingUser.id,
        spaceId: space.id,
        date: new Date(date),
        startTime,
        endTime,
        hours,
        amount,
        isFree,
        paymentDeadline: isFree ? null : paymentDeadline,
        status: isFree ? 'CONFIRMED' : 'PENDING',
      },
      include: {
        user: true,
        space: true,
      },
    })

    // TODO: 알림톡 발송 (예약 확인)

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('예약 생성 실패:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
