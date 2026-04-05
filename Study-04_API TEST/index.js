const dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  console.error('.env 파일 로드 실패:', dotenvResult.error.message);
  process.exit(1);
}

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('OPENROUTER_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

console.log('API 키 로드 성공: [설정됨]');
