# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MNIST 손글씨 인식 웹 버전. 브라우저에서 직접 손글씨를 그리고 숫자를 인식하는 웹 애플리케이션.

## Stack

- TensorFlow.js (CDN) — 브라우저에서 CNN 모델 학습 및 추론
- Vanilla JS / HTML / CSS — 별도 프레임워크 없음
- MNIST 데이터: Google Storage에서 PNG 스프라이트 + 레이블 파일 로드

## 실행 방법

`index.html`을 직접 열면 외부 데이터 fetch가 CORS 정책으로 차단됩니다. **반드시 로컬 서버를 통해 실행하세요.**

```bash
# Python (권장)
python -m http.server 8080
# 브라우저에서 http://localhost:8080 접속

# Node.js
npx serve .
```

## 파일 구조

- `index.html` — UI 레이아웃
- `style.css` — 스타일 (다크 테마)
- `app.js` — MnistData 로더, CNN 모델 정의, 학습 루프, 캔버스 드로잉, 예측 로직

## Coding Rules

- 새로 생성하는 모든 파일의 상단에 생성 날짜와 시간을 주석으로 표기한다.
  - Python: `# Created: YYYY-MM-DD HH:MM`
  - JavaScript/TypeScript: `// Created: YYYY-MM-DD HH:MM`
  - HTML/CSS: `<!-- Created: YYYY-MM-DD HH:MM -->`
