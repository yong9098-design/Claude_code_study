# 📋 할일 앱 — Claude Code 단계별 프롬프트

> 최종 버전(todo_3.html) 기반 | 순수 HTML/CSS/Vanilla JS | localStorage 영속성
> 각 단계를 순서대로 Claude Code에 붙여넣어 사용하세요.

---

## STEP 1 of 5 — 프로젝트 구조 + HTML/CSS 기반 레이아웃

```
다음 명세에 따라 개인 할일 관리 앱의 기반 파일을 생성해줘.

【파일 구성】
- 단일 파일: todo_3.html (CSS, JS 모두 포함)
- 외부 라이브러리 없음, 순수 HTML5 + CSS3 + Vanilla JS

【HTML 구조 — 아래 섹션을 순서대로 구성】
1. <header>: 앱 타이틀 "📋 현용의 할일 관리" + 우측에 날짜/요일 표시 영역
   - <h1>📋 현용의 할일 관리</h1>
   - <div id="current-date">
       <span class="date-num"></span>
       <span class="date-day"></span>
     </div>
2. <section id="dashboard">: 진행률 표시 영역 (JS로 채울 자리 확보)
3. <nav id="category-tabs">: 탭 버튼 5개
   (전체 / 🏢 업무 / 🏠 개인 / 📚 공부 / 🤝 원우회)
4. <section id="input-area">:
   - 텍스트 입력창 (id="task-input", maxlength="100")
   - 카테고리 드롭다운 (id="category-select", 업무/개인/공부/원우회)
   - 추가 버튼 (id="add-btn")
   - 자동분류 힌트 영역 (<span id="auto-hint">)
   - 완료일 입력 영역 (.input-due-wrap > label + input[type=date]#due-date-input)
5. <div id="date-toggle-bar">: 완료일 보기/숨기기 토글 버튼 (id="date-toggle-btn")
6. <ul id="task-list">: 할일 목록 컨테이너 (비어있어도 됨)
7. <footer>: "완료 항목 일괄 삭제" 버튼 (id="clear-btn")

【CSS 요구사항】
- 전체 배경: #F8F9FA, 최대 너비 640px, 가운데 정렬
- 카드/컨테이너: 흰색(#FFFFFF) + box-shadow

▸ 헤더
  - display: flex; align-items: center; justify-content: center; position: relative;
  - #current-date: position: absolute; right: 0; top: 50%; transform: translateY(-50%);
  - .date-num: font-size: 1rem; font-weight: 700; color: #4A90D9; display: block;
  - .date-day: font-size: 0.78rem; color: #888; display: block;

▸ 카테고리 배지 색상
  - 업무(work):    #2196F3 (파랑)
  - 개인(personal):#4CAF50 (초록)
  - 공부(study):   #FF9800 (주황)
  - 원우회(club):  #9C27B0 (보라)

▸ 드래그 핸들
  - .drag-handle: cursor: grab; color: #CFCFCF; font-size: 1.1rem; user-select: none;
  - .drag-handle:hover { color: #4A90D9; }
  - .drag-handle:active { cursor: grabbing; }

▸ 드래그 앤 드롭 피드백
  - .task-item.dragging: opacity: 0.35; box-shadow: 0 6px 20px rgba(74,144,217,0.25);
  - .task-item.drag-over-top: border-top: 3px solid #4A90D9;
  - .task-item.drag-over-bottom: border-bottom: 3px solid #4A90D9;

▸ 할일 아이템
  - .task-item: background #fff, border-radius 10px, padding 10px 14px 10px 12px
  - .task-item.completed: opacity 0.6
  - .task-main-row: display flex, align-items center, gap 10px
  - .task-text: flex 1, font-size 0.95rem, color #333, cursor pointer
  - .task-text.overdue: color #E53935; font-weight 600  ← 기한 초과 텍스트 붉은색
  - .task-item.completed .task-text: color #9E9E9E; text-decoration line-through
  - .edit-input: 인라인 수정용 input 스타일 (border: 2px solid #4A90D9)

▸ 완료일 행
  - .task-date-row: border-top, margin-top 8px, padding-top 8px
  - .task-date-input 상태별 색상:
    - .date-overdue: color #E53935; border-color #FFCDD2; background #FFF5F5
    - .date-today:   color #E65100; border-color #FFE0B2; background #FFF8F0
    - .date-future:  color #2E7D32; border-color #C8E6C9; background #F1F8E9
  - .date-status.overdue/today/future/done: 각각 색상 다르게

▸ 완료일 토글 버튼 (#date-toggle-btn)
  - 기본: border 2px solid #E0E0E0; border-radius 20px; color #9E9E9E
  - .active: border-color #4A90D9; background #4A90D9; color #fff

▸ 진행률 바
  - .progress-bar-fill: background #4A90D9; border-radius 8px; height 12px; transition width 0.4s
  - .progress-bar-fill.complete: background #4CAF50
  - .mini-bar-fill.work/personal/study/club: 각 카테고리 색상
  - .progress-categories: display flex; gap 12px; flex-wrap wrap
  - .cat-progress: flex 1; min-width 120px

▸ 버튼
  - 추가 버튼: background #4A90D9
  - 삭제 버튼: background #EF5350
  - 탭 활성 상태(active): border-color #4A90D9; background #4A90D9; color #fff

▸ 반응형 (max-width: 480px)
  - #input-area: flex-direction column
  - .progress-categories: flex-direction column; gap 8px

【이 단계에서 JS는 작성하지 않아도 됨 — 레이아웃 확인이 목적】

완성 후 todo_3.html 파일을 저장해줘.
```

---

## STEP 2 of 5 — 핵심 데이터 로직 + localStorage 연동

```
todo_3.html의 <script> 섹션에 아래 데이터 로직을 구현해줘.
기존 HTML/CSS는 건드리지 말고 JS만 추가할 것.

【상수 정의】
const STORAGE_KEY = 'todoApp_v3_tasks';
const CAT_NAMES = { work: '업무', personal: '개인', study: '공부', club: '원우회' };
const CAT_ICONS = { work: '🏢', personal: '🏠', study: '📚', club: '🤝' };

【데이터 구조 — Task 객체】
{
  id: Date.now().toString(),
  text: "할일 내용",
  category: "work",     // "work" | "personal" | "study" | "club"
  completed: false,
  createdAt: Date.now(),
  dueDate: null         // "YYYY-MM-DD" 형식 또는 null
}

【전역 상태】
let tasks = loadFromStorage();
let currentFilter = 'all';
let showDueDates = false;

【localStorage 함수】
1. loadFromStorage()
   - try/catch로 JSON 파싱 오류 방어
   - localStorage 키: "todoApp_v3_tasks"
   - 없으면 빈 배열 반환

2. saveToStorage(arr)
   - JSON.stringify해서 localStorage에 저장

【날짜 유틸 함수】
3. todayStr()
   - new Date().toISOString().slice(0, 10) 반환 (YYYY-MM-DD)

4. dateStatus(dateStr, completed)
   - dateStr 없으면 null 반환
   - completed이면 'done' 반환
   - dateStr < todayStr() → 'overdue'
   - dateStr === todayStr() → 'today'
   - 그 외 → 'future'

5. dateStatusLabel(status)
   - 'overdue' → '⚠ 기한 초과'
   - 'today'   → '오늘까지'
   - 'future'  → '예정'
   - 'done'    → '완료됨'
   - 나머지 → ''

【CRUD 함수】
6. addTask(text, category, dueDate)
   - text.trim() 후 빈 값이면 alert("할일 내용을 입력해주세요.") 후 리턴
   - Task 객체 생성 (dueDate: dueDate || null) → tasks.push → saveToStorage
   - task-input, due-date-input 초기화 후 task-input 포커스

7. deleteTask(id)
   - id로 tasks 배열에서 제거 → saveToStorage

8. toggleTask(id)
   - id의 completed 값 반전 → saveToStorage

9. editTask(id, newText)
   - newText.trim() 빈 값이면 저장 안 함
   - 해당 id의 text 업데이트 → saveToStorage

10. setDueDate(id, dateStr)
    - 해당 id의 dueDate 업데이트 (dateStr || null) → saveToStorage

【필터 함수】
11. getFilteredTasks()
    - currentFilter === 'all'이면 tasks 전체
    - 아니면 category로 필터링
```

---

## STEP 3 of 5 — DOM 렌더링 + 이벤트 연결

```
todo_3.html의 JS에 렌더링 함수와 이벤트 리스너를 추가해줘.
기존 데이터 함수(Step 2)는 수정하지 말 것.

【renderTasks() 함수 구현】
① 탭 카운터 업데이트
  - 각 탭 버튼의 미완료 개수 배지 표시
  - 전체 탭: tasks.filter(t => !t.completed).length
  - 카테고리 탭: 해당 category + !completed
  - 형식: "🏢 업무 (3)" — 0개면 배지 없음

② 빈 상태 처리
  - filtered.length === 0일 때
  - currentFilter === 'all': "할일이 없습니다 🎉"
  - 카테고리 필터: "{카테고리명} 카테고리에 할일이 없습니다."
  - <li class="empty-state"> 로 표시 후 return

③ 할일 아이템 렌더링 (getFilteredTasks() 기준)
  - li.draggable = true  ← 드래그 앤 드롭 활성화
  - li.dataset.id = task.id
  - li.className = "task-item" (완료 시 "completed" 추가)
  - 내부 구조:
    <div class="task-main-row">
      <span class="drag-handle" title="드래그하여 순서 변경">⠿</span>
      <input type="checkbox" [checked if completed]>
      <span class="task-text [overdue if status==='overdue']">{task.text}</span>
      <span class="category-badge {category}">{CAT_NAMES[category]}</span>
      <button class="btn-delete">🗑</button>
    </div>
    [showDueDates 일 때만]
    <div class="task-date-row">
      <label>📅 완료일</label>
      <input type="date" class="task-date-input [date-{status}]" value="{dueDate}" data-role="due-date">
      [dueDate 있을 때] <button class="btn-clear-date" data-role="clear-date">✕</button>
      [statusLabel 있을 때] <span class="date-status {status}">{statusLabel}</span>
    </div>
  - escapeHtml()로 XSS 방지

④ 렌더링 후: updateProgress() + updateClearBtn() 호출

【보조 함수】
- updateClearBtn(): completed 항목 없으면 clear-btn disabled
- escapeHtml(str): &, <, >, " 이스케이프

【이벤트 리스너 연결】
1. add-btn 클릭 → addTask(입력값, 카테고리, 완료일) → renderTasks()
2. task-input keydown Enter → add-btn.click()
3. task-list 이벤트 위임 (click):
   - checkbox → toggleTask(id) → renderTasks()
   - .btn-delete → deleteTask(id) → renderTasks()
   - [data-role="clear-date"] → setDueDate(id, null) → renderTasks()
4. task-list 이벤트 위임 (change):
   - [data-role="due-date"] → setDueDate(id, value || null) → renderTasks()
5. task-list 이벤트 위임 (dblclick):
   - .task-text → startEdit(li, id, span.textContent) 호출
6. category-tabs 클릭 → currentFilter 업데이트 → active 클래스 전환 → renderTasks()
7. date-toggle-btn 클릭 → showDueDates 토글 → updateDateToggleBtn() → renderTasks()
8. clear-btn 클릭 → completed 항목 전체 제거 → saveToStorage → renderTasks()

【초기화】
DOMContentLoaded: renderTasks() + task-input.focus()

완성 후 할일 추가/삭제/완료 체크가 동작하고 새로고침해도 데이터가 유지되어야 함.
```

---

## STEP 4 of 5 — 인라인 수정 + 진행률 대시보드 + 날짜/요일 표시

```
todo_3.html에 인라인 수정 기능, 진행률 대시보드, 헤더 날짜 표시를 추가해줘.

【인라인 수정 — startEdit(li, id, currentText)】
트리거: .task-text 더블클릭 (Step 3 이벤트 위임에서 호출)

동작 순서:
1. li.classList.contains('completed')이면 리턴 (완료 항목 수정 불가)
2. <span class="task-text">를 <input class="edit-input" value="{현재 텍스트}">로 교체
3. input.focus() + input.select()
4. let saved = false 플래그로 중복 실행 방지
5. 저장 조건 (Enter / blur): editTask(id, input.value) → renderTasks()
6. 취소 조건 (Esc): 저장 없이 renderTasks()

【updateDateToggleBtn()】
- showDueDates true: btn.classList.add('active'), 텍스트 "📅 완료일 숨기기"
- showDueDates false: btn.classList.remove('active'), 텍스트 "📅 완료일 보기"

【updateProgress() 함수 구현】
- #dashboard 영역 업데이트
- tasks.length === 0이면: "할일을 추가해서 오늘을 계획해보세요! ✨" 표시

전체 진행률:
- done / total 계산, 퍼센트 Math.round
- 기한 초과 카운트: !completed && dueDate && dueDate < todayStr()
- overdueCount > 0이면 "⚠ 기한 초과 N건" 텍스트를 빨간색으로 표시
- progress-bar-fill: width = pct%; 100%일 때 .complete 클래스 추가
- 100% 달성 시 "🎉 모든 할일을 완료했습니다!" 메시지 표시

카테고리별 미니 진행률 (work / personal / study / club 4개):
- 카테고리 완료수 / 전체수 (0개면 "할일 없음")
- 미니 바 (mini-bar-fill.{category}) width = catPct%
- .progress-categories 안에 4개 .cat-progress 배치 (flex-wrap: wrap)

renderTasks() 마지막에 updateProgress() 호출 확인

【날짜/요일 표시 — updateCurrentDate()】
const DAY_NAMES = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];

function updateCurrentDate() {
  const now = new Date();
  document.querySelector('#current-date .date-num').textContent = `${now.getMonth()+1}월 ${now.getDate()}일`;
  document.querySelector('#current-date .date-day').textContent = DAY_NAMES[now.getDay()];
}

【DOMContentLoaded 수정】
updateCurrentDate() 추가 호출
setInterval(updateCurrentDate, 60000) 추가 (1분마다 갱신)

완성 후:
- 할일 텍스트 더블클릭 → 수정 가능 (완료 항목 제외)
- 상단 대시보드에 실시간 진행률 + 기한 초과 카운트 표시
- 헤더 우측에 현재 날짜(파란색)와 요일(회색) 표시
```

---

## STEP 5 of 5 — 마무리: 드래그앤드롭 + 자동 카테고리 분류 + 엣지케이스

```
todo_3.html의 완성도를 높이는 드래그앤드롭, 자동분류, UX 마무리 작업을 해줘.

【자동 카테고리 분류】

const CATEGORY_KEYWORDS = {
  work: [
    '회의','미팅','스탠드업','발표','보고','브리핑','컨퍼런스콜','화상회의',
    '보고서','제안서','계획서','이메일','메일','문서','ppt','엑셀','스프레드시트',
    '슬랙','slack','zoom','줌','지라','jira','노션','confluence',
    '업무','출장','프로젝트','기획','마감','납기','일정','결재','승인','계약',
    '고객','팀','부서','상사','동료','거래처','클라이언트','파트너',
    '배포','릴리즈','스프린트','칸반','온보딩','인터뷰','채용','코드리뷰',
    'pr','풀리퀘','이슈','버그','핫픽스','인프라','서버','운영','모니터링',
    '급여','연봉','인사','평가','kpi','okr','분기','연간'
  ],
  personal: [
    '운동','헬스','요가','필라테스','수영','러닝','조깅','자전거','등산','산책',
    '병원','치과','한의원','약','건강검진','다이어트','스트레칭','명상',
    '청소','빨래','장보기','쇼핑','요리','설거지','분리수거','청구서',
    '택배','이사','집수리','인테리어','가전','가구',
    '친구','가족','부모님','연인','데이트','약속','모임','파티',
    '영화','드라마','유튜브','게임','여행','캠핑','독서','취미',
    '예약','보험','세금','환불','카드','통장','저축','용돈','생일','기념일',
    '여권','비자','운전면허','주민등록','공과금'
  ],
  study: [
    '공부','학습','복습','예습','암기','정리','노트','필기','요약',
    '시험','퀴즈','과제','레포트','논문','발표준비',
    '영어','토익','토플','오픽','일본어','중국어','스페인어',
    '수학','통계','미적분','선형대수',
    '코딩','프로그래밍','알고리즘','자료구조','파이썬','python',
    'javascript','자바스크립트','java','자바','리액트','react',
    'sql','데이터베이스','머신러닝','딥러닝','ai','인공지능',
    '강의','수업','강좌','튜토리얼','인강','유데미','udemy','책','독서',
    '자격증','정보처리기사','컴활','어학','단어','문법','문제풀기'
  ],
  club: [
    '원우회','동문','동창','동기','선배','후배','동문회','총동창회',
    '모임','정기모임','총회','정기총회','임원회','간사','총무','회장','부회장',
    '회비','회비납부','찬조','기부','후원','회원','명부','연락망',
    '행사','이벤트','봉사','봉사활동','체육대회','골프','산악회','등산모임',
    '소식지','뉴스레터','동문소식','홈커밍','축하','기념','송년','신년'
  ]
};

function detectCategory(text) {
  const lower = text.toLowerCase();
  const scores = { work: 0, personal: 0, study: 0, club: 0 };
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[cat]++;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : null;
}

자동분류 힌트 이벤트 (task-input의 input 이벤트):
- detectCategory(e.target.value) 호출
- 감지되면: category-select.value 자동 변경 + auto-hint에 "✨ 자동 분류: {아이콘} {이름}" 표시
- 감지 없으면: auto-hint 비움

【드래그 앤 드롭 — initDragDrop()】
let dragSrcId = null;

function initDragDrop() {
  const list = document.getElementById('task-list');

  // dragstart: 드래그 시작 시 소스 ID 저장, .dragging 클래스 추가
  list.addEventListener('dragstart', e => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    dragSrcId = li.dataset.id;
    setTimeout(() => li.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
  });

  // dragend: 모든 드래그 관련 클래스 제거
  list.addEventListener('dragend', () => {
    document.querySelectorAll('.task-item').forEach(item =>
      item.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom')
    );
    dragSrcId = null;
  });

  // dragover: 삽입 위치 표시 (상반부 → drag-over-top, 하반부 → drag-over-bottom)
  list.addEventListener('dragover', e => {
    e.preventDefault();
    const li = e.target.closest('.task-item');
    if (!li || li.dataset.id === dragSrcId) return;
    document.querySelectorAll('.task-item').forEach(item =>
      item.classList.remove('drag-over-top', 'drag-over-bottom')
    );
    const rect = li.getBoundingClientRect();
    li.classList.add(e.clientY < rect.top + rect.height / 2 ? 'drag-over-top' : 'drag-over-bottom');
  });

  // dragleave: 클래스 제거
  list.addEventListener('dragleave', e => {
    const li = e.target.closest('.task-item');
    if (li) li.classList.remove('drag-over-top', 'drag-over-bottom');
  });

  // drop: tasks 배열 순서 변경 후 저장 및 렌더링
  list.addEventListener('drop', e => {
    e.preventDefault();
    const targetLi = e.target.closest('.task-item');
    if (!targetLi || !dragSrcId || targetLi.dataset.id === dragSrcId) return;

    const targetId = targetLi.dataset.id;
    const rect = targetLi.getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;

    const srcIdx = tasks.findIndex(t => t.id === dragSrcId);
    const [removed] = tasks.splice(srcIdx, 1);
    const tgtIdx = tasks.findIndex(t => t.id === targetId);
    tasks.splice(insertBefore ? tgtIdx : tgtIdx + 1, 0, removed);

    saveToStorage(tasks);
    renderTasks();
  });
}

DOMContentLoaded에 initDragDrop() 추가 호출

【엣지 케이스 처리】
- 할일 텍스트 최대 100자 (input maxlength="100" 이미 설정됨)
- 공백만 입력 시 trim() 후 빈 값으로 간주 → alert
- 완료된 항목 더블클릭 수정 불가 (startEdit에서 completed 체크)
- localStorage 파싱 오류 시 try/catch → 빈 배열로 초기화
- "완료 항목 일괄 삭제" 버튼: completed 0개일 때 disabled

【최종 점검 체크리스트】
코드 완성 후 아래 항목을 직접 확인하고 결과를 알려줘:
☐ 할일 추가 → 새로고침 → 데이터 유지
☐ 카테고리 탭 전환 → 필터링 정상 동작 (탭에 미완료 카운터 표시)
☐ 더블클릭 수정 → Enter 저장 / Esc 취소 (완료 항목은 수정 불가)
☐ 완료 체크 시 진행률 실시간 업데이트 + 기한 초과 카운트 반영
☐ 기한 초과 할일 텍스트가 붉은색으로 표시됨
☐ 빈 입력창으로 추가 시도 → alert 에러 처리
☐ 완료 항목 일괄 삭제 동작 + 0개일 때 버튼 비활성화
☐ 드래그 핸들(⠿)로 할일 순서 변경 → 새로고침 후에도 순서 유지
☐ 헤더 우측에 "N월 N일 / X요일" 표시
☐ 할일 입력 시 자동 카테고리 감지 힌트 표시
☐ 모바일 화면(480px)에서 레이아웃 깨짐 없음
```

---

## 💡 사용 팁

- **각 단계는 독립적으로 실행** — 이전 단계 결과물 위에 누적 적용
- **단계 사이에 브라우저로 직접 확인** — `open todo_3.html` 또는 드래그 앤 드롭
- **문제 발생 시** Claude Code에 오류 메시지를 그대로 붙여넣으면 자동 수정
- **Step 1~2 완료 후** 콘솔에서 `addTask("테스트", "work", null)` 로 데이터 로직 검증 가능
- **드래그 앤 드롭**은 Step 5에서 구현 — 카테고리 필터 상태에서도 순서 변경 후 localStorage에 저장됨
