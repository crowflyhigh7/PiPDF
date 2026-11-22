# PiPDF (PiPDF.iamchang.me) 📄✨

> **iLovePDF 급의 강력한 PDF 도구를 100% 브라우저 로컬에서 안전하고 빠르게.**

PiPDF는 전 세계 수억 명이 사용하는 iLovePDF의 기능과 사용자 경험을 분석하여, 외부 서버로 문서를 단 1바이트도 업로드하지 않고 100% 클라이언트사이드(WebAssembly / JavaScript)에서 안전하게 처리하는 모던 오픈소스 PDF 웹 애플리케이션입니다.

배포 도메인: [https://PiPDF.iamchang.me](https://PiPDF.iamchang.me)

---

## 🚀 주요 기능 (iLovePDF 완벽 대응)

### 1. 📁 정리 & 병합 (Organize)
- **PDF 병합 (Merge PDF)**: 여러 PDF 문서를 원하는 순서대로 하나의 완성된 파일로 결합
- **PDF 분할 (Split PDF)**: 페이지 범위 지정(예: `1-3, 5, 8-10`) 또는 개별 낱장 ZIP 일괄 분할
- **페이지 정리 (Organize Pages)**: 썸네일 그리드에서 마우스 드래그로 순서 변경, 개별 회전, 삭제
- **페이지 삭제 (Remove Pages)**: 불필요한 페이지만 시각적으로 쏙 골라서 제거

### 2. ⚡ 최적화 (Optimize)
- **PDF 압축 (Compress PDF)**: 극대 압축, 권장 압축, 최소 압축 3단계 최적화로 화질을 보존하며 용량 획기적 절감 (용량 비교 및 절감률 시각화)

### 3. 🔄 변환 (Convert)
- **PDF to JPG**: 각 페이지를 고화질(1x, 2x, 3x) JPG 이미지로 변환, 개별 또는 ZIP 다운로드
- **JPG to PDF**: 여러 장의 이미지(JPG, PNG, WebP)를 용지 방향(세로/가로) 및 여백 옵션과 함께 단일 PDF로 변환
- **PDF to Text**: 문서 내 텍스트 레이어를 순수 텍스트로 추출하여 원클릭 클립보드 복사 및 TXT 파일 저장

### 4. ✏️ 편집 & 서명 (Edit)
- **PDF 회전 (Rotate PDF)**: 모든 페이지 또는 홀수/짝수 페이지만 90°, 180°, 270° 일괄 회전
- **페이지 번호 추가 (Page Numbers)**: 6개 위치, 4가지 서식(`1`, `1 / n`, `Page 1`, `Page 1 of n`), 시작 번호, 폰트 크기 커스텀 삽입
- **워터마크 각인 (Watermark)**: 문구, 폰트 크기, 투명도, 각도, 색상, 격자 반복 또는 6분할 위치 설정
- **전자 서명 (Sign PDF)**: 캔버스에 직접 마우스/터치로 서명 작성 후 원하는 페이지와 위치에 스탬프 날인

### 5. 🔒 보안 (Security)
- **PDF 암호 설정 (Protect PDF)**: 문서에 비밀번호를 설정하여 비인가 열람 및 유출 방지
- **PDF 잠금 해제 (Unlock PDF)**: 암호가 설정된 문서의 잠금을 해제하여 자유롭게 활용

---

## 🛡️ 왜 PiPDF인가요? (핵심 가치)

1. **100% 클라이언트 사이드 프라이버시 보장**
   - 일반 온라인 PDF 변환 사이트와 달리 파일이 서버로 전송되지 않습니다.
   - 금융/계약/인적사항 등 민감한 기밀 문서도 회사 보안 규정 위반 걱정 없이 안심하고 사용할 수 있습니다.
2. **초고속 & 무제한 용량**
   - 업로드/다운로드 트래픽 대기가 없으므로 수백 메가바이트의 대형 문서도 즉시 처리됩니다.
3. **영구 무료 & 광고 없음**
   - 불필요한 결제 유도나 팝업 광고가 없는 쾌적한 작업 환경을 제공합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **PDF Engine**: `pdf-lib`, `pdfjs-dist` (Mozilla PDF.js)
- **Utilities**: `jszip`, `file-saver`
- **Infrastructure**: Cloudflare Pages, GitHub Actions / Wrangler

---

## 💻 로컬 개발 환경 실행

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 🌐 Cloudflare Pages 배포 및 커스텀 도메인 설정

1. **빌드 명령**: `npm run build`
2. **빌드 출력 디렉토리**: `dist`
3. **커스텀 도메인**: Cloudflare Pages 대시보드 > Custom Domains > `PiPDF.iamchang.me` 등록
