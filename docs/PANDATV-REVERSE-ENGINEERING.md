# PandaTV Chat Widget Reverse Engineering (2026-03-28)

## 인프라

| 키                | 운영 값                                         |
| ----------------- | ----------------------------------------------- |
| API_URL           | `https://api.pandahp.kr`                        |
| PANDA_CHAT_SOCKET | `wss://chat-ws.neolive.kr/connection/websocket` |
| PANDATV_BASE_URL  | `https://p.pandahp.kr`                          |
| 프로토콜          | Centrifugo WebSocket                            |

## 인증 흐름

```
1. hash URL → GET api.pandahp.kr/new-token/chat?key={hash}&type=NEW
2. 응답: { chatToken: "JWT..." }
3. JWT 디코딩 → { info: { channel: "..." } }
4. Centrifugo WebSocket 연결 (token 기반)
5. channel 구독 → 메시지 수신
```

## 메시지 타입 (module 22302)

| 타입        | 설명        | DOM                  |
| ----------- | ----------- | -------------------- |
| `bj`        | BJ 채팅     | message\_\_wrapper   |
| `manager`   | 매니저 채팅 | message\_\_wrapper   |
| `chatter`   | 일반 채팅   | message\_\_wrapper   |
| `SponCoin`  | 후원 (하트) | heart\_\_wrapper     |
| `ItemCoin`  | 아이템 선물 | heart\_\_wrapper     |
| `Recommend` | 추천        | chat\_\_notice--list |
| `Info`      | 정보 알림   | chat\_\_notice--list |
| `FanIn`     | 팬 가입     | chat\_\_notice--list |
| `KingFanIn` | 킹팬 가입   | chat\_\_notice--list |
| `FanUp`     | 팬 승급     | chat\_\_notice--list |
| `KingFanUp` | 킹팬 승급   | chat\_\_notice--list |
| `Mission`   | 미션 완료   | chat\_\_notice--list |
| `helper`    | 시스템 제어 | (렌더링 안함)        |

## 메시지 데이터 구조

### 채팅 메시지 (bj/manager/chatter)

```json
{
  "data": {
    "type": "chatter",
    "nk": "닉네임",
    "id": "아이디",
    "lev": "등급코드",
    "message": "채팅 내용",
    "emoticon": {
      "block": {
        "img": "url",
        "anim": "url",
        "format": "gif|png",
        "width": 100,
        "height": 100
      }
    }
  },
  "offset": 12345
}
```

### 후원 메시지 (SponCoin)

```json
{
  "data": {
    "type": "SponCoin",
    "message": {
      "nick": "후원자닉",
      "id": "후원자ID",
      "coin": 1000,
      "ut": "userType",
      "lev": "등급",
      "rk": "랭크"
    }
  }
}
```

### 엑셀 후원 (SponCoin + excelNick)

```json
{
  "data": {
    "type": "SponCoin",
    "message": {
      "nick": "보낸사람닉",
      "excelNick": "받는사람닉",
      "excelType": "plus|minus",
      "coin": 500
    }
  }
}
```

### 추천 (Recommend)

```json
{
  "data": {
    "type": "Recommend",
    "message": { "nick": "추천자닉", "id": "추천자ID" }
  }
}
```

## 4가지 레이아웃 모드 (module 89881)

### chatInline (default 테마)

```html
<li class="message__wrapper chat {effect} {theme}">
  <p class="message__nick hide__opacity {animation}">
    <div class="mr-1 inline-block w-max align-text-bottom">
      <div><svg data-src="/icons/ico_class_{lev}.svg" ...></svg></div>
    </div>
    <span class="message__name" style="{nickStyle}">{nick}</span>
    <span class="message__id" style="{nickStyle}">({maskedId})</span>  <!-- 조건부: showId 설정 -->
    <span style="{nickStyle}">:&nbsp;&nbsp;</span>
    <img src="{emoticon}" class="my-1">  <!-- 조건부: emoticon 존재 시 -->
    <span class="message__text" style="{textStyle}">{message}</span>
  </p>
</li>
```

### chatLineBreak (kakaotalk 등)

```html
<li class="message__wrapper chat {effect} {theme} hide__opacity {animation}">
  <div class="message__box">
    <p class="message__nick hide__opacity {animation}">
      {badge} <span class="message__name">{nick}</span>
      <span class="message__id">({id})</span>
      <span>:&nbsp;&nbsp;</span>
    </p>
    <p class="message__text hide__opacity {animation}" style="{textStyle}">
      <img class="my-1" /> {message}
    </p>
  </div>
</li>
```

### chatIndentation (들여쓰기)

```html
<li class="message__wrapper chat {effect} {theme} hide__opacity {animation}">
  <div class="message__box" style="display:flex">
    <p class="message__nick" style="white-space:nowrap; flex-shrink:0">
      {badge} <span class="message__name">{nick}</span>
      <span class="message__id">({id})</span>
      <span>:&nbsp;&nbsp;</span>
    </p>
    <p class="message__text" style="flex-shrink:1">
      <img class="my-1 block" /> {message}
    </p>
  </div>
</li>
```

### nicknameRightAlignment (닉 우측정렬)

```html
<li class="message__wrapper chat {effect} {theme}">
  <p class="message__nick hide__opacity {animation}" style="padding-right:0">
    <span class="message__text">{message}</span>
    <span>:&nbsp;&nbsp;</span>
    <!-- 구분자가 텍스트 뒤에! -->
    <span class="message__name">{nick}</span>
    {badge}
  </p>
</li>
```

## 후원 DOM (heart\_\_wrapper)

```html
<li
  class="{theme} chat heart__wrapper animated hide__opacity min-h-max w-max {effect} break-keep"
  style="font-family: {font}"
>
  <div
    class="haert__image hide__opacity flex max-h-[360px] w-full flex-col text-left {alignment}"
  >
    <!-- Lottie 애니메이션 또는 이미지 -->
    <img alt="heart_image" width="240" height="300" src="{heartIconUrl}" />
    <div>
      <p class="hide__opacity heart__text mt-0 p-0" style="{noticeStyle}">
        <span>{nick}</span>님께서&nbsp;{coin}개를&nbsp;선물하셨습니다.
      </p>
      <!-- 엑셀 후원 시 추가 줄 -->
      <p
        class="hide__opacity heart__text relative top-2 mb-2 whitespace-nowrap p-0"
      >
        <span>{excelNick}</span>님에게 <span class="mx-1">{coin}</span>
        <span class="mr-1">{플러스|마이너스}</span> 선물!
      </p>
    </div>
  </div>
</li>
```

## 알림 DOM (chat\_\_notice--list)

```html
<li
  class="chat__notice--list chat whitespace-break-spaces {effect} {theme} hide__opacity {animation}"
>
  <p class="notice__text hide__opacity {animation}" style="{noticeStyle}">
    <span>{nick}</span>님께서&nbsp;추천하셨습니다.
  </p>
</li>
```

## 스타일 변수 (module 89881)

### 닉네임 스타일 (K)

```javascript
{
  color: showRainbowNick ? rainbowColor(offset) : nickColor(type, chatTextColor, lev),
  fontSize: `${fontSizeInPixels}px`,
  textShadow: generateTextShadow(fontShadowThickness, fontShadowColor),
  fontFamily: isJapanese(nick) ? `"${font}", "Noto Sans SC", "Microsoft YaHei", sans-serif` : selectedFont
}
```

### 텍스트 스타일 (q)

```javascript
{
  color: textColor(type, chatTextColor, lev),
  fontSize: `${fontSizeInPixels}px`,
  textShadow: generateTextShadow(fontShadowThickness, fontShadowColor),
  fontFamily: isJapanese(message) ? `"${font}", "Noto Sans SC", "Microsoft YaHei", sans-serif` : selectedFont
}
```

### text-shadow 생성 (module 47538)

```javascript
function generateTextShadow(size, color = "rgba(0, 0, 0, 0.8)") {
  const offsets = [-1, -0.5, 0, 0.5, 1]; // 5x5 그리드 = 25방향
  const shadows = [];
  for (const x of offsets) {
    for (const y of offsets) {
      shadows.push(`${x * size}px ${y * size}px ${size}px ${color}`);
    }
  }
  return shadows.join(", ");
}
```

## 뱃지 매핑 (data-src)

| 등급 코드          | SVG 경로                | 색상    |
| ------------------ | ----------------------- | ------- |
| bj                 | /icons/ico_class_bj.svg | #ff9912 |
| manager / chairman | /icons/ico_chairman.svg | (특수)  |
| m                  | /icons/ico_class_m.svg  | #303031 |
| n                  | /icons/ico_class_n.svg  | 일반    |
| b                  | /icons/ico_class_b.svg  | 브론즈  |
| s                  | /icons/ico_class_s.svg  | 실버    |
| g                  | /icons/ico_class_g.svg  | 골드    |
| d                  | /icons/ico_class_d.svg  | 다이아  |
| v                  | /icons/ico_class_v.svg  | VIP     |

## UL 컨테이너 인라인 스타일

```css
opacity: 1;
display: flex;
flex-direction: column;
justify-content: flex-end;
align-items: flex-start;
font-weight: normal;
overflow-y: hidden;
background-repeat: no-repeat;
background-size: cover;
background-position: center center;
```

## 설정 항목 (configData)

- `chatStyles.chatTheme` — 테마 (default, kakaotalk, neon, ...)
- `chatStyles.chatEffect` — 효과 (fadeIn, ...)
- `chatAlignment.chatDirection` — 정렬 (left, right)
- `chatAlignment.chatMode` — 레이아웃 모드 (chatInline, chatLineBreak, chatIndentation, nicknameRightAlignment)
- `chatFontAndBackground.fontSizeInPixels` — 폰트 크기
- `chatFontAndBackground.fontShadowThickness` — 외곽선 두께
- `chatFontAndBackground.fontShadowColor` — 외곽선 색상
- `chatFontAndBackground.selectedFont` — 선택 폰트
- `chatFontAndBackground.fontBold` — 볼드 여부
- `chatTextColor` — 텍스트 색상 (등급별 분리)
- `chatOption.showBJIcon` / `showManagerIcon` / `showRankIcon` — 뱃지 표시
- `chatOption.showId` — 아이디 표시
