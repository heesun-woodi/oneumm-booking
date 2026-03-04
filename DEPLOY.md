# 배포 가이드

## 1. Neon PostgreSQL 데이터베이스 생성

1. [Neon Console](https://console.neon.tech/)에 접속
2. 새 프로젝트 생성
3. Connection String 복사 (예: `postgresql://user:pass@ep-xx.neon.tech/dbname`)

## 2. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수 설정:

```
DATABASE_URL=postgresql://user:pass@ep-xx.neon.tech/dbname
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=random-secret-string-here
ALIGO_API_KEY=your-aligo-api-key
ALIGO_USER_ID=your-aligo-user-id
ALIGO_SENDER=your-sender-phone
MEMBER_UNITS=201,301,302,401,402,501
NEXT_PUBLIC_MEMBER_UNITS=201,301,302,401,402,501
ADMIN_PHONE=admin-phone-number
```

## 3. Vercel 배포

1. GitHub 저장소 연결
2. Framework: Next.js 자동 감지
3. Build Command: `npm run build`
4. Install Command: `npm install`
5. Deploy 클릭

## 4. 데이터베이스 마이그레이션

Vercel 배포 후, 로컬에서:

```bash
# DATABASE_URL을 Neon으로 설정
export DATABASE_URL="your-neon-connection-string"

# 마이그레이션 실행
npx prisma migrate deploy

# 초기 데이터 추가
npx prisma studio
# Space 테이블에 "놀터", "방음실" 추가
```

## 5. 카카오톡 알림톡 설정

1. 카카오 비즈니스 센터에서 7개 템플릿 등록 (docs/kakao-templates.md 참고)
2. 승인 대기 (1-3일)
3. Aligo API 키 발급 및 환경 변수 설정

## 트러블슈팅

### Prisma Client 에러

```bash
npx prisma generate
```

### 빌드 실패

Node modules 권한 문제 시:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 완료 체크리스트

- [ ] Neon DB 생성
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] DB 마이그레이션
- [ ] 초기 데이터 추가 (놀터, 방음실)
- [ ] 알림톡 템플릿 승인
- [ ] 테스트 예약 생성
- [ ] 도메인 연결 (선택)
