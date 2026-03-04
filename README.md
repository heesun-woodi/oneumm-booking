# 온음 공간 예약 시스템

놀터와 방음실을 예약할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Hosting**: Vercel
- **Notification**: 카카오톡 알림톡 (Aligo API)

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```env
DATABASE_URL="your-neon-postgresql-url"
NEXTAUTH_SECRET="random-secret-string"
ALIGO_API_KEY="your-aligo-api-key"
ALIGO_USER_ID="your-aligo-user-id"
ALIGO_SENDER="your-sender-phone"
ADMIN_PHONE="admin-phone-number"
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4. 초기 데이터 추가

```bash
npx prisma studio
```

Prisma Studio에서 Space 테이블에 다음 데이터를 추가:

- name: "놀터", hourlyRate: 14000, password: "#5204"
- name: "방음실", hourlyRate: 14000

### 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 주요 기능

### 1. 예약 캘린더
- 주간 뷰 (일요일~토요일)
- 시간 슬롯 (09:00~23:00)
- 놀터/방음실 탭 전환

### 2. 회원/비회원 구분
- **회원**: 7세대 (201-501호), 월 3회 무료
- **비회원**: 시간당 14,000원, 24시간 전 예약 필수

### 3. 입금 확인 플로우
- 예약 → 입금 대기 → 24시간 전 확인 요청 → 확정
- 미입금 시 자동 취소

### 4. 자동 알림 (카카오톡 알림톡)
- 예약 확인
- 입금 확인
- 이용 안내 (30분 전)
- 정리 안내 (종료 30분 전)

### 5. 관리자 대시보드
- 예약 관리
- 입금 확인
- 통계

## 디렉토리 구조

```
oneumm-booking/
├── app/
│   ├── api/
│   │   └── bookings/
│   │       └── route.ts
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── calendar/
│   │   └── WeeklyCalendar.tsx
│   └── booking/
│       └── BookingModal.tsx
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── docs/
│   ├── BUILD-PLAN.md
│   ├── OFFICIAL-RULES.md
│   └── kakao-templates.md
└── README.md
```

## 배포

### Vercel 배포

1. GitHub에 푸시
2. Vercel에서 Import
3. 환경 변수 설정
4. Deploy

## 라이선스

MIT
