// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

// 각 테스트 전 localStorage 초기화
test.beforeEach(async ({ page }) => {
  await page.goto(FILE_URL);
  await page.evaluate(() => localStorage.removeItem('shopping-list'));
  await page.reload();
});

// ─────────────────────────────────────────────
// 테스트 1: 초기 상태
// ─────────────────────────────────────────────
test('초기 상태 - 빈 리스트와 통계 확인', async ({ page }) => {
  console.log('\n[TEST 1] 초기 상태 확인');

  const statTotal  = await page.locator('#stat-total').textContent();
  const statDone   = await page.locator('#stat-done').textContent();
  const statRemain = await page.locator('#stat-remain').textContent();

  console.log(`  ✔ 전체: "${statTotal}"`);
  console.log(`  ✔ 완료: "${statDone}"`);
  console.log(`  ✔ 남은것: "${statRemain}"`);

  expect(statTotal).toContain('0');
  expect(statDone).toContain('0');
  expect(statRemain).toContain('0');

  // 빈 상태 메시지 표시 확인
  await expect(page.locator('.empty-state')).toBeVisible();
  console.log('  ✔ 빈 상태 메시지 표시됨');
});

// ─────────────────────────────────────────────
// 테스트 2: 아이템 추가 - Enter 키
// ─────────────────────────────────────────────
test('아이템 추가 - Enter 키로 추가', async ({ page }) => {
  console.log('\n[TEST 2] Enter 키로 아이템 추가');

  const input = page.locator('#input-item');
  await input.fill('사과');
  await input.press('Enter');

  await expect(page.locator('.item')).toHaveCount(1);
  await expect(page.locator('.item-text').first()).toContainText('사과');
  console.log('  ✔ "사과" 아이템 추가됨');

  const statTotal = await page.locator('#stat-total').textContent();
  expect(statTotal).toContain('1');
  console.log('  ✔ 전체 통계 1로 업데이트됨');

  // 입력창 비워짐 확인
  await expect(input).toHaveValue('');
  console.log('  ✔ 입력창 초기화됨');
});

// ─────────────────────────────────────────────
// 테스트 3: 아이템 추가 - 추가 버튼 클릭
// ─────────────────────────────────────────────
test('아이템 추가 - 추가 버튼으로 추가', async ({ page }) => {
  console.log('\n[TEST 3] 추가 버튼으로 아이템 추가');

  await page.locator('#input-item').fill('바나나');
  await page.locator('.btn-add').click();

  await expect(page.locator('.item')).toHaveCount(1);
  await expect(page.locator('.item-text').first()).toContainText('바나나');
  console.log('  ✔ "바나나" 아이템 추가됨');
});

// ─────────────────────────────────────────────
// 테스트 4: 여러 아이템 추가
// ─────────────────────────────────────────────
test('여러 아이템 추가 - 3개 순차 추가', async ({ page }) => {
  console.log('\n[TEST 4] 여러 아이템 추가');

  const items = ['우유', '달걀', '빵'];
  const input = page.locator('#input-item');

  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }

  await expect(page.locator('.item')).toHaveCount(3);
  console.log('  ✔ 3개 아이템 추가됨');

  const statTotal = await page.locator('#stat-total').textContent();
  expect(statTotal).toContain('3');
  const statRemain = await page.locator('#stat-remain').textContent();
  expect(statRemain).toContain('3');
  console.log('  ✔ 전체 3, 남은것 3으로 통계 업데이트됨');
});

// ─────────────────────────────────────────────
// 테스트 5: 빈 문자열 추가 방지
// ─────────────────────────────────────────────
test('빈 입력 방지 - 공백 입력시 추가 안됨', async ({ page }) => {
  console.log('\n[TEST 5] 빈 입력 방지');

  await page.locator('#input-item').fill('   ');
  await page.locator('.btn-add').click();

  await expect(page.locator('.item')).toHaveCount(0);
  console.log('  ✔ 공백만 입력시 아이템 추가 안됨');
});

// ─────────────────────────────────────────────
// 테스트 6: 체크(완료) 기능
// ─────────────────────────────────────────────
test('체크 기능 - 아이템 완료/미완료 토글', async ({ page }) => {
  console.log('\n[TEST 6] 체크 기능');

  // 아이템 추가
  await page.locator('#input-item').fill('오렌지');
  await page.locator('#input-item').press('Enter');

  const checkbox = page.locator('.checkbox').first();
  const itemText = page.locator('.item-text').first();
  const item     = page.locator('.item').first();

  // 체크 전 확인
  await expect(item).not.toHaveClass(/done/);
  console.log('  ✔ 체크 전: 완료 상태 아님');

  // 체크 클릭
  await checkbox.click();
  await expect(item).toHaveClass(/done/);
  console.log('  ✔ 체크 후: 완료 상태 (done 클래스 적용)');

  // 취소선 확인 (CSS는 부모 .item.done으로 적용 - computed style 체크)
  const textDecoration = await itemText.evaluate(el => getComputedStyle(el).textDecoration);
  expect(textDecoration).toContain('line-through');
  console.log('  ✔ 텍스트에 취소선 스타일 적용됨 (computed: ' + textDecoration + ')');

  // 통계 업데이트 확인
  const statDone   = await page.locator('#stat-done').textContent();
  const statRemain = await page.locator('#stat-remain').textContent();
  expect(statDone).toContain('1');
  expect(statRemain).toContain('0');
  console.log('  ✔ 완료 1, 남은것 0으로 통계 업데이트됨');

  // 다시 클릭하여 토글 (미완료로 복귀)
  await checkbox.click();
  await expect(item).not.toHaveClass(/done/);
  console.log('  ✔ 재클릭으로 미완료 상태 복귀됨 (토글 동작 확인)');
});

// ─────────────────────────────────────────────
// 테스트 7: 아이템 삭제
// ─────────────────────────────────────────────
test('삭제 기능 - 아이템 개별 삭제', async ({ page }) => {
  console.log('\n[TEST 7] 삭제 기능');

  // 2개 추가
  for (const item of ['포도', '딸기']) {
    await page.locator('#input-item').fill(item);
    await page.locator('#input-item').press('Enter');
  }
  await expect(page.locator('.item')).toHaveCount(2);
  console.log('  ✔ 2개 아이템 추가됨');

  // 첫 번째 삭제 (가장 최근 추가 = '딸기')
  await page.locator('.btn-delete').first().click();
  await expect(page.locator('.item')).toHaveCount(1);
  console.log('  ✔ 1개 삭제 후 1개 남음');

  // 남은 아이템 확인
  await expect(page.locator('.item-text').first()).toContainText('포도');
  console.log('  ✔ 남은 아이템 "포도" 확인');

  // 통계 업데이트 확인
  const statTotal = await page.locator('#stat-total').textContent();
  expect(statTotal).toContain('1');
  console.log('  ✔ 전체 통계 1로 업데이트됨');

  // 마지막 아이템 삭제
  await page.locator('.btn-delete').first().click();
  await expect(page.locator('.item')).toHaveCount(0);
  await expect(page.locator('.empty-state')).toBeVisible();
  console.log('  ✔ 마지막 아이템 삭제 후 빈 상태 메시지 표시됨');
});

// ─────────────────────────────────────────────
// 테스트 8: 필터 기능
// ─────────────────────────────────────────────
test('필터 기능 - 전체/미완료/완료 필터링', async ({ page }) => {
  console.log('\n[TEST 8] 필터 기능');

  // 3개 추가
  for (const item of ['사과', '배', '감']) {
    await page.locator('#input-item').fill(item);
    await page.locator('#input-item').press('Enter');
  }

  // '사과'와 '배'를 완료 처리 (최신순: 감, 배, 사과)
  const checkboxes = page.locator('.checkbox');
  await checkboxes.nth(1).click(); // 배
  await checkboxes.nth(2).click(); // 사과
  console.log('  ✔ 3개 중 2개 완료 처리');

  // [미완료 필터]
  await page.locator('.filter-btn', { hasText: '미완료' }).click();
  await expect(page.locator('.item')).toHaveCount(1);
  await expect(page.locator('.item-text').first()).toContainText('감');
  console.log('  ✔ 미완료 필터: 1개만 표시됨 ("감")');

  // [완료 필터]
  await page.getByRole('button', { name: '완료', exact: true }).click();
  await expect(page.locator('.item')).toHaveCount(2);
  console.log('  ✔ 완료 필터: 2개 표시됨');

  // [전체 필터]
  await page.locator('.filter-btn', { hasText: '전체' }).click();
  await expect(page.locator('.item')).toHaveCount(3);
  console.log('  ✔ 전체 필터: 3개 모두 표시됨');
});

// ─────────────────────────────────────────────
// 테스트 9: 완료 항목 일괄 삭제
// ─────────────────────────────────────────────
test('완료 항목 일괄 삭제 기능', async ({ page }) => {
  console.log('\n[TEST 9] 완료 항목 일괄 삭제');

  for (const item of ['아이템1', '아이템2', '아이템3']) {
    await page.locator('#input-item').fill(item);
    await page.locator('#input-item').press('Enter');
  }

  // 처음에는 완료 항목 삭제 버튼 비활성화
  await expect(page.locator('#btn-clear')).toBeDisabled();
  console.log('  ✔ 완료 항목 없을 때 삭제 버튼 비활성화됨');

  // 2개 완료 처리 (최신순: 아이템3, 아이템2, 아이템1)
  await page.locator('.checkbox').nth(0).click(); // 아이템3
  await page.locator('.checkbox').nth(1).click(); // 아이템2

  // 버튼 활성화 확인
  await expect(page.locator('#btn-clear')).toBeEnabled();
  console.log('  ✔ 완료 항목 생기면 삭제 버튼 활성화됨');

  // 일괄 삭제
  await page.locator('#btn-clear').click();
  await expect(page.locator('.item')).toHaveCount(1);
  await expect(page.locator('.item-text').first()).toContainText('아이템1');
  console.log('  ✔ 완료 2개 삭제 후 미완료 1개("아이템1")만 남음');
});

// ─────────────────────────────────────────────
// 테스트 10: localStorage 유지
// ─────────────────────────────────────────────
test('localStorage - 페이지 새로고침 후 데이터 유지', async ({ page }) => {
  console.log('\n[TEST 10] localStorage 데이터 유지');

  await page.locator('#input-item').fill('새로고침 테스트');
  await page.locator('#input-item').press('Enter');
  await page.locator('.checkbox').first().click(); // 완료 처리
  console.log('  ✔ 아이템 추가 및 완료 처리');

  // 새로고침
  await page.reload();

  await expect(page.locator('.item')).toHaveCount(1);
  await expect(page.locator('.item-text').first()).toContainText('새로고침 테스트');
  await expect(page.locator('.item').first()).toHaveClass(/done/);
  console.log('  ✔ 새로고침 후에도 아이템과 완료 상태 유지됨');
});
