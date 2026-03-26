# PandaTV Chat Overlay

팬더TV 채팅 위젯을 OBS에서 예쁘게 꾸밀 수 있는 CSS 오버레이 설정기입니다.

팬더TV 자체에서 지원하지 않는 말풍선, 닉네임 캡슐, 아바타, 그라데이션 배경 등의
커스터마이징을 설정기에서 조정하고 OBS에 바로 붙여넣을 수 있습니다.

## 시작하기

### Windows
`start.bat` 더블클릭

### macOS
`start.command` 더블클릭

> Node.js나 Python이 없어도 `overlay-settings.html`을 브라우저에서 직접 열 수 있습니다.

## 사용법

1. 설정기에서 프리셋을 선택하거나 직접 커스터마이징합니다.
2. **CSS 복사하기** 버튼을 클릭합니다.
3. OBS Studio에서 브라우저 소스의 **사용자 지정 CSS**에 붙여넣습니다.
4. 적용 후 브라우저 소스를 새로고침해 확인합니다.

## 라이브 위젯 래퍼

실제 PandaTV 위젯의 mixed layout / invalid markup 문제를 CSS만으로 덮는 대신,
로컬 same-origin 프록시 + DOM repair 래퍼를 사용할 수 있습니다.

1. `npm run serve` 또는 `node scripts/serve.js 4173`
2. OBS 브라우저 소스를 아래처럼 설정
3. `http://127.0.0.1:4173/live-wrapper.html?target=https://p.pandahp.kr/chat/...`

이 래퍼는 로컬 서버가 팬더TV 위젯을 프록시하고, 부모 페이지에서 iframe DOM에 직접 접근해
`message__nick` 구조 복구와 테마별 레이아웃 정규화를 수행합니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `overlay-settings.html` | 채팅 오버레이 CSS 설정기 |
| `overlay.css` | 기본 프리셋 CSS (직접 붙여넣기용) |
| `start.bat` | Windows 실행 스크립트 |
| `start.command` | macOS 실행 스크립트 |

## 주요 기능

- 30+ 프리셋 (말풍선, 캡슐, 분리형 등)
- 말풍선 배경/투명도/둥글기/블러 조정
- 닉네임 캡슐/아바타/아이콘 커스터마이징
- 후원/알림 메시지 별도 스타일링
- 그라데이션 배경, 페이드아웃 방지
- 설정 저장/불러오기 (브라우저, JSON 파일)
- 팬더TV 전체 7개 테마 호환

## License

MIT
