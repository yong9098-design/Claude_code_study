const dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  console.error('.env 파일 로드 실패:', dotenvResult.error.message);
  process.exit(1);
}

const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENROUTER_API_KEY;
const MODEL = 'google/gemma-3-27b-it:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DB_PATH = path.join(__dirname, 'data', 'profiles.json');

if (!apiKey) {
  console.error('OPENROUTER_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/v2', express.static(path.join(__dirname, 'public_1')));

// ── 데이터 저장소 ─────────────────────────────────────────────
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { profiles: {} };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── OpenRouter 호출 ───────────────────────────────────────────
async function callOpenRouter(messages, timeoutMs = 30000) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, messages }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  return res.json();
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON을 찾을 수 없습니다.');
  return JSON.parse(match[0]);
}

// ── POST /api/analyze-image ───────────────────────────────────
app.post('/api/analyze-image', async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: '이미지 데이터가 없습니다.' });

  const dataUrl = `data:${mimeType || 'image/jpeg'};base64,${image}`;
  const messages = [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: dataUrl } },
      {
        type: 'text',
        text: '이 냉장고 사진에서 보이는 모든 식재료를 파악해주세요.\n결과는 반드시 다음 JSON 형식으로만 응답하세요:\n{"ingredients": ["재료1", "재료2", ...]}\n식재료가 불분명하거나 보이지 않으면 빈 배열로 응답하세요.\nJSON 외에 다른 텍스트는 절대 포함하지 마세요.',
      },
    ],
  }];

  try {
    const data = await callOpenRouter(messages, 20000);
    const raw = data.choices?.[0]?.message?.content || '';
    let parsed;
    try { parsed = extractJson(raw); } catch { parsed = { ingredients: [] }; }
    return res.json({ ingredients: parsed.ingredients || [], raw_description: raw });
  } catch (err) {
    console.error('analyze-image error:', err.message);
    return res.status(500).json({ error: '재료 분석에 실패했습니다. 잠시 후 다시 시도하거나 재료를 직접 추가해주세요.' });
  }
});

// ── POST /api/generate-recipes ────────────────────────────────
app.post('/api/generate-recipes', async (req, res) => {
  const { ingredients, options = {} } = req.body;
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: '레시피를 만들려면 재료가 1개 이상 필요해요.' });
  }

  const { servings = 2, max_time_minutes = 30, category = '전체' } = options;
  const prompt = `다음 재료로 만들 수 있는 요리 레시피를 3가지 추천해주세요.

재료: ${ingredients.join(', ')}
인원수: ${servings}명
조리 시간: ${max_time_minutes}분 이내
카테고리: ${category}

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 포함하지 마세요:
{"recipes":[{"name":"요리명","time_minutes":숫자,"difficulty":"쉬움","summary":"한 줄 소개","ingredients":[{"name":"재료명","amount":"양"}],"steps":["1단계","2단계"],"tip":"요리 팁"}]}`;

  const tryGenerate = async () => {
    const data = await callOpenRouter([{ role: 'user', content: prompt }], 30000);
    const raw = data.choices?.[0]?.message?.content || '';
    return extractJson(raw);
  };

  try {
    let parsed;
    try { parsed = await tryGenerate(); } catch { parsed = await tryGenerate(); } // 1회 재시도
    const recipes = (parsed.recipes || []).map(r => ({ ...r, id: randomUUID() }));
    return res.json({ recipes });
  } catch (err) {
    console.error('generate-recipes error:', err.message);
    return res.status(500).json({ error: '레시피 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' });
  }
});

// ── POST /api/profile ─────────────────────────────────────────
app.post('/api/profile', (req, res) => {
  const { nickname, avatar } = req.body;
  if (!nickname || !nickname.trim()) {
    return res.status(400).json({ error: '닉네임을 입력해주세요.' });
  }
  const db = readDB();
  const id = randomUUID();
  const profile = { id, nickname: nickname.trim(), avatar: avatar || '🍳', created_at: new Date().toISOString(), recipes: [] };
  db.profiles[id] = profile;
  writeDB(db);
  const { recipes, ...profileInfo } = profile;
  res.status(201).json(profileInfo);
});

// ── GET /api/profile/:id ──────────────────────────────────────
app.get('/api/profile/:id', (req, res) => {
  const db = readDB();
  const profile = db.profiles[req.params.id];
  if (!profile) return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
  const { recipes, ...profileInfo } = profile;
  res.json({ ...profileInfo, recipe_count: recipes.length });
});

// ── PATCH /api/profile/:id ────────────────────────────────────
app.patch('/api/profile/:id', (req, res) => {
  const db = readDB();
  const profile = db.profiles[req.params.id];
  if (!profile) return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
  if (req.body.nickname) profile.nickname = req.body.nickname.trim();
  if (req.body.avatar)   profile.avatar   = req.body.avatar;
  writeDB(db);
  const { recipes, ...profileInfo } = profile;
  res.json({ ...profileInfo, recipe_count: profile.recipes.length });
});

// ── GET /api/profile/:id/recipes ──────────────────────────────
app.get('/api/profile/:id/recipes', (req, res) => {
  const db = readDB();
  const profile = db.profiles[req.params.id];
  if (!profile) return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
  res.json({ recipes: profile.recipes });
});

// ── POST /api/profile/:id/recipes ─────────────────────────────
app.post('/api/profile/:id/recipes', (req, res) => {
  const db = readDB();
  const profile = db.profiles[req.params.id];
  if (!profile) return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
  if (profile.recipes.length >= 50) {
    return res.status(400).json({ error: '저장 공간이 가득 찼어요 (최대 50개). 오래된 레시피를 삭제한 후 다시 저장해주세요.' });
  }
  const { recipe, source_image_ingredients } = req.body;
  if (!recipe || !recipe.name) {
    return res.status(400).json({ error: '레시피 데이터가 올바르지 않습니다.' });
  }
  const saved = { ...recipe, id: randomUUID(), saved_at: new Date().toISOString(), source_image_ingredients: source_image_ingredients || [] };
  profile.recipes.unshift(saved);
  writeDB(db);
  res.status(201).json(saved);
});

// ── DELETE /api/profile/:id/recipes/:recipeId ─────────────────
app.delete('/api/profile/:id/recipes/:recipeId', (req, res) => {
  const db = readDB();
  const profile = db.profiles[req.params.id];
  if (!profile) return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
  const before = profile.recipes.length;
  profile.recipes = profile.recipes.filter(r => r.id !== req.params.recipeId);
  if (profile.recipes.length === before) {
    return res.status(404).json({ error: '레시피를 찾을 수 없습니다.' });
  }
  writeDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
