# PandaTV Chat Overlay (팬더TV 채팅 오버레이)

OBS Studio 브라우저 소스용 팬더TV 채팅 오버레이 CSS + 비주얼 설정기

## 파일 구성

| 파일 | 설명 |
|------|------|
| `팬더TV_채팅_오버레이.css` | OBS 브라우저 소스 사용자 지정 CSS (직접 붙여넣기용) |
| `팬더TV_채팅_오버레이_설정기.html` | 비주얼 CSS 생성기 (브라우저에서 열어서 사용) |

## 주요 기능

- **6가지 테마 프리셋**: 핑크, 캐릭터, 다크, 네온, 글래스, 미니멀
- **말풍선 커스터마이징**: 배경색, 투명도, 테두리, 둥글기
- **2줄 레이아웃**: 닉네임과 채팅을 별도 줄로 분리
- **닉네임 아이콘**: 이모지 또는 커스텀 이미지 (URL/파일 업로드)
- **그라데이션 배경**: 방향 및 색상 커스터마이징
- **후원/알림 스타일**: 별도 커스터마이징
- **7개 테마 완전 대응**: default, kakaotalk, neon, box, roundbox, balloon, board
- **인라인 스타일 11종 오버라이드**: `!important`로 팬더TV 내장 스타일 완전 덮어쓰기
- **페이드아웃 방지**: `hide__opacity` 비활성화

## 사용법

### 방법 1: CSS 직접 사용
1. `팬더TV_채팅_오버레이.css` 내용 복사
2. OBS Studio → 소스 → 브라우저 → 사용자 지정 CSS에 붙여넣기

### 방법 2: 설정기로 커스텀 CSS 생성
1. `팬더TV_채팅_오버레이_설정기.html`을 브라우저에서 열기
2. 좌측 패널에서 원하는 스타일 설정
3. 우측 하단 "CSS 복사" 버튼으로 생성된 CSS 복사
4. OBS 브라우저 소스 사용자 지정 CSS에 붙여넣기

## 채팅 위젯 URL

팬더TV 방송 관리 → 채팅 위젯에서 URL 복사 후 OBS 브라우저 소스에 입력

## 기술 노트

- 팬더TV 채팅 위젯은 Next.js SSR 앱 (`p.pandahp.kr/chat/{hash}`)
- 인라인 스타일 11종(color, font-size, text-shadow, width, display, flex-direction, align-items, transition, font-family, text-align, fill)을 `!important`로 오버라이드
- CSS `::before` 의사 요소로 닉네임 아이콘 구현
- `linear-gradient()`로 그라데이션 배경 구현

## License

MIT
