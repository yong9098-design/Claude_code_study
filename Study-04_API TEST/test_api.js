const dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  console.error('.env 파일 로드 실패:', dotenvResult.error.message);
  process.exit(1);
}

const apiKey = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemma-3-27b-it:free';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(messages) {
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  return res.json();
}

async function testText() {
  console.log('\n=== [1] 텍스트 인식 테스트 ===');
  const messages = [
    { role: 'user', content: '안녕하세요! 간단하게 자기소개를 해주세요.' }
  ];
  const data = await callOpenRouter(messages);
  const reply = data.choices?.[0]?.message?.content;
  console.log('모델 응답:', reply);
  console.log('사용 토큰:', data.usage);
}

async function testImage() {
  console.log('\n=== [2] 이미지 인식 테스트 ===');
  // 공개 샘플 이미지 (Wikipedia - 고양이)
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/320px-Cat_November_2010-1a.jpg';
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: '이 이미지에 무엇이 있나요? 한국어로 설명해주세요.' }
      ]
    }
  ];
  const data = await callOpenRouter(messages);
  const reply = data.choices?.[0]?.message?.content;
  console.log('이미지 설명:', reply);
  console.log('사용 토큰:', data.usage);
}

(async () => {
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY가 없습니다.');
    process.exit(1);
  }
  console.log(`모델: ${MODEL}`);
  console.log('API 키: [설정됨]');

  const results = await Promise.allSettled([
    testText(),
    testImage(),
  ]);

  if (results[0].status === 'rejected') {
    console.error('텍스트 테스트 실패:', results[0].reason.message);
  }
  if (results[1].status === 'rejected') {
    console.error('이미지 테스트 실패:', results[1].reason.message);
  }

  console.log('\n=== 테스트 완료 ===');
})();
