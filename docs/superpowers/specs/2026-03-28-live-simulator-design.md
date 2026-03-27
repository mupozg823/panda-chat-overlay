# 라이브 시뮬레이터 패널 설계

## 개요

기존 정적 미리보기 옆에 **라이브 시뮬레이터** 패널을 추가한다. 실제 팬더TV DOM 구조로 렌더링하며, 채팅/후원/추천이 동적으로 계속 올라오는 시뮬레이션을 보여준다. 현재 설정의 CSS가 실시간 반영되어 "실제 방송에서 어떻게 보이는지" 확인할 수 있다.

## 목적

- 설정기에서 만든 CSS가 실제 팬더TV DOM에 어떻게 적용되는지 검증
- 정적 미리보기로는 확인 불가능한 동적 요소(메시지 스크롤, 후원 이미지, 추천 애니메이션) 확인
- 사용자가 OBS에 적용하기 전에 결과를 신뢰할 수 있도록 함

## 레이아웃

```
┌─────────────────────────────────────────────────────┐
│ 미리보기 헤더 (OBS URL 복사, 채팅 주소, 설정관리)      │
├──────────────────────┬──────────────────────────────┤
│ 기존 미리보기 (정적)   │ 라이브 시뮬레이터 (동적)       │
│ - 클릭 편집 가능      │ - 실제 팬더TV DOM 구조         │
│ - 설정 즉시 반영      │ - 채팅/후원/추천 자동 생성      │
│                      │ - 속도 조절 슬라이더            │
│                      │ - 일시정지/재생/초기화 버튼      │
├──────────────────────┴──────────────────────────────┤
│ CSS 출력 영역                                        │
└─────────────────────────────────────────────────────┘
```

## DOM 구조 (실제 팬더TV 일치)

### 일반 채팅 메시지

```html
<li class="message__wrapper chat fadeIn default hide__opacity"
    style="text-align:left; font-family:'Jeju Gothic';">
  <p class="message__nick hide__opacity">
    <div class="mr-1 inline-block w-max align-text-bottom">
      <div><svg ...badge icon...></svg></div>
    </div>
    <span class="message__name" style="color:rgb(241,241,241); ...">닉네임</span>
    <span style="color:rgb(241,241,241); ...">:&nbsp;&nbsp;</span>
    <span class="message__text" style="color:rgb(241,241,241); ...">
      <span>메시지 내용</span>
    </span>
  </p>
</li>
```

### 후원 메시지 (하트)

```html
<li
  class="default chat heart__wrapper animated hide__opacity min-h-max w-max fadeIn break-keep"
  style="display:flex; flex-direction:column; ..."
>
  <div
    class="haert__image hide__opacity flex max-h-[360px] w-full flex-col text-left items-start"
    style="display:flex; ..."
  >
    <img
      alt="heart_image"
      width="240"
      height="300"
      src="...donation_icon.png"
    />
    <div>
      <p
        class="hide__opacity heart__text p-0 mt-2"
        style="color:rgb(122,112,244); ..."
      >
        <span>닉네임</span>님께서&nbsp;100개를&nbsp;선물하셨습니다.
      </p>
    </div>
  </div>
</li>
```

### 추천/알림

```html
<li
  class="chat__notice--list chat whitespace-break-spaces fadeIn default hide__opacity"
  style="text-align:left; font-family:'Jeju Gothic';"
>
  <p class="notice__text hide__opacity" style="color:rgb(122,112,244); ...">
    <span>닉네임</span>님께서&nbsp;추천하셨습니다.
  </p>
</li>
```

### 핵심 차이점 (기존 미리보기와)

- `message__box` wrapper 없음 (default 테마)
- `message__id` span 없음
- 구분자 span에 클래스 없음 (`.message__separator` 아님)
- 뱃지: `div.mr-1 > div > svg` (span이 아님)
- `haert__image` 오타 유지
- `p.message__nick` (div가 아닌 p 태그 — invalid HTML)

## 시뮬레이션 이벤트 타이밍

| 이벤트         | 기본 간격    | 속도 0.5x | 속도 3x |
| -------------- | ------------ | --------- | ------- |
| 일반 채팅      | 1~3초 랜덤   | 2~6초     | 0.3~1초 |
| 후원 (하트)    | 10~20초 랜덤 | 20~40초   | 3~7초   |
| 추천           | 15~30초 랜덤 | 30~60초   | 5~10초  |
| 등급 변경 알림 | 30~60초 랜덤 | 60~120초  | 10~20초 |

## 시뮬레이션 데이터

### 닉네임 풀 (10개+)

한국어 방송 채팅에서 흔한 닉네임들 사용.

### 메시지 풀 (20개+)

일상적 채팅 메시지 ("안녕하세요~", "ㅋㅋㅋ", "와 대박", 이모지 포함 등).

### 뱃지 종류

- BJ 뱃지 (ico_class_bj.svg — 주황)
- 회장 뱃지 (ico_chairman.svg — 특수)
- 일반 등급 뱃지 (ico_class_m.svg — 어두운)
- 뱃지 없음 (일반 시청자)

### 후원 이미지

기본 placeholder 이미지 1~2개 사용 (assets/ 폴더에 저장).

## CSS 반영 방식

1. `generateCssText(getValues())`로 현재 설정의 CSS를 생성
2. 시뮬레이터 패널 내부의 `<style id="simCssInjection">` 태그에 주입
3. 기존 `update()` 함수의 `updateCSS()` 호출 시 시뮬레이터 CSS도 함께 업데이트
4. 설정 변경 → 80ms 디바운스 → CSS 재생성 → 시뮬레이터에 반영

## 컨트롤 UI

- **속도 슬라이더**: `0.5x` ~ `3x` (기본 `1x`), 레인지 입력
- **재생/일시정지 버튼**: 시뮬레이션 토글
- **초기화 버튼**: 메시지 클리어 + 처음부터 다시 시작
- 시뮬레이터 컨테이너 크기: `width:400px, height:600px` (OBS 권장 크기와 유사)

## 메시지 관리

- 최대 표시 메시지 수: 50개 (초과 시 가장 오래된 것부터 DOM에서 제거)
- 새 메시지는 아래에 추가, 컨테이너는 `flex-direction:column; justify-content:flex-end`
- 메시지 추가 시 `fadeIn` 애니메이션 적용 (실제 팬더TV 동작)

## 파일 구조

- `scripts/live-simulator.js` — 시뮬레이터 엔진 (새 파일)
  - 메시지 생성기, 타이머 관리, DOM 조작, CSS 주입
- `overlay-settings.html` — 시뮬레이터 패널 HTML + 초기화 연결
  - 미리보기 영역 레이아웃 변경 (2컬럼)
  - `update()` 함수에 시뮬레이터 CSS 업데이트 연결

## 테스트

- 시뮬레이터 DOM 구조가 실제 팬더TV와 일치하는지 검증하는 테스트 추가
- CSS 주입이 시뮬레이터에 정상 적용되는지 확인
- 속도 조절, 일시정지, 초기화 동작 검증
