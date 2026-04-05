// Created: 2026-03-11 14:00

// ──────────────────────────────────────────
// MNIST 데이터 로더
// ──────────────────────────────────────────
const IMAGE_SIZE = 784; // 28 x 28
const NUM_CLASSES = 10;
const NUM_DATASET_ELEMENTS = 65000;
const TRAIN_TEST_RATIO = 5 / 6;
const NUM_TRAIN_ELEMENTS = Math.floor(TRAIN_TEST_RATIO * NUM_DATASET_ELEMENTS);
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

const MNIST_IMAGES_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
const MNIST_LABELS_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';

class MnistData {
  async load() {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const imgRequest = new Promise((resolve) => {
      img.crossOrigin = '';
      img.onload = () => {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        const datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4);
        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * IMAGE_SIZE * chunkSize * 4,
            IMAGE_SIZE * chunkSize
          );
          ctx.drawImage(img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize);
          const imageData = ctx.getImageData(0, 0, canvas.width, chunkSize);
          for (let j = 0; j < imageData.data.length / 4; j++) {
            datasetBytesView[j] = imageData.data[j * 4] / 255;
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer);
        resolve();
      };
      img.src = MNIST_IMAGES_PATH;
    });

    const labelsRequest = fetch(MNIST_LABELS_PATH);
    const [, labelsResponse] = await Promise.all([imgRequest, labelsRequest]);
    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

    this.trainIndices = tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS);
    this.testIndices = tf.util.createShuffledIndices(NUM_TEST_ELEMENTS);
    this.shuffledTrainIndex = 0;
    this.shuffledTestIndex = 0;

    this.trainImages = this.datasetImages.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
    this.testImages  = this.datasetImages.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS);
    this.trainLabels = this.datasetLabels.slice(0, NUM_CLASSES * NUM_TRAIN_ELEMENTS);
    this.testLabels  = this.datasetLabels.slice(NUM_CLASSES * NUM_TRAIN_ELEMENTS);
  }

  nextBatch(batchSize, data, indexFn) {
    const batchImages = new Float32Array(batchSize * IMAGE_SIZE);
    const batchLabels = new Uint8Array(batchSize * NUM_CLASSES);
    for (let i = 0; i < batchSize; i++) {
      const idx = indexFn();
      batchImages.set(data[0].slice(idx * IMAGE_SIZE, idx * IMAGE_SIZE + IMAGE_SIZE), i * IMAGE_SIZE);
      batchLabels.set(data[1].slice(idx * NUM_CLASSES, idx * NUM_CLASSES + NUM_CLASSES), i * NUM_CLASSES);
    }
    return {
      xs: tf.tensor2d(batchImages, [batchSize, IMAGE_SIZE]),
      labels: tf.tensor2d(batchLabels, [batchSize, NUM_CLASSES]),
    };
  }

  nextTrainBatch(batchSize) {
    return this.nextBatch(batchSize, [this.trainImages, this.trainLabels], () => {
      this.shuffledTrainIndex = (this.shuffledTrainIndex + 1) % this.trainIndices.length;
      return this.trainIndices[this.shuffledTrainIndex];
    });
  }

  nextTestBatch(batchSize) {
    return this.nextBatch(batchSize, [this.testImages, this.testLabels], () => {
      this.shuffledTestIndex = (this.shuffledTestIndex + 1) % this.testIndices.length;
      return this.testIndices[this.shuffledTestIndex];
    });
  }
}

// ──────────────────────────────────────────
// CNN 모델 정의
// ──────────────────────────────────────────
function createModel() {
  const model = tf.sequential();

  model.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    kernelSize: 5, filters: 8, strides: 1,
    activation: 'relu', kernelInitializer: 'varianceScaling',
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

  model.add(tf.layers.conv2d({
    kernelSize: 5, filters: 16, strides: 1,
    activation: 'relu', kernelInitializer: 'varianceScaling',
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({
    units: NUM_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax',
  }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
}

// ──────────────────────────────────────────
// 학습
// ──────────────────────────────────────────
async function trainModel(model, data, onEpochEnd) {
  const TRAIN_SIZE = 5500;
  const TEST_SIZE  = 1000;
  const EPOCHS = 10;

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = data.nextTrainBatch(TRAIN_SIZE);
    return [d.xs.reshape([TRAIN_SIZE, 28, 28, 1]), d.labels];
  });
  const [testXs, testYs] = tf.tidy(() => {
    const d = data.nextTestBatch(TEST_SIZE);
    return [d.xs.reshape([TEST_SIZE, 28, 28, 1]), d.labels];
  });

  await model.fit(trainXs, trainYs, {
    batchSize: 512,
    validationData: [testXs, testYs],
    epochs: EPOCHS,
    shuffle: true,
    callbacks: { onEpochEnd },
  });

  [trainXs, trainYs, testXs, testYs].forEach(t => t.dispose());
}

// ──────────────────────────────────────────
// 캔버스 설정
// ──────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resetCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
resetCanvas();

ctx.strokeStyle = 'white';
ctx.lineWidth   = 20;
ctx.lineCap     = 'round';
ctx.lineJoin    = 'round';

let isDrawing = false;
let lastX = 0, lastY = 0;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY,
  };
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ({ x: lastX, y: lastY } = getPos(e));
});
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
});
canvas.addEventListener('mouseup',  () => { isDrawing = false; });
canvas.addEventListener('mouseout', () => { isDrawing = false; });

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDrawing = true;
  ({ x: lastX, y: lastY } = getPos(e));
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!isDrawing) return;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
}, { passive: false });
canvas.addEventListener('touchend', () => { isDrawing = false; });

// ──────────────────────────────────────────
// UI 이벤트
// ──────────────────────────────────────────
let model = null;

const trainBtn   = document.getElementById('train-btn');
const clearBtn   = document.getElementById('clear-btn');
const predictBtn = document.getElementById('predict-btn');
const statusDiv  = document.getElementById('status');
const metricsDiv = document.getElementById('metrics');
const progressBar = document.getElementById('progress-bar');
const resultDiv  = document.getElementById('result');

trainBtn.addEventListener('click', async () => {
  trainBtn.disabled = true;
  progressBar.style.width = '0%';
  metricsDiv.textContent = '';
  resultDiv.innerHTML = '';

  setStatus('MNIST 데이터 로딩 중...');
  const data = new MnistData();
  await data.load();

  setStatus('모델 생성 중...');
  model = createModel();

  setStatus('학습 중...');
  const EPOCHS = 10;
  await trainModel(model, data, (epoch, logs) => {
    const pct = Math.round(((epoch + 1) / EPOCHS) * 100);
    progressBar.style.width = pct + '%';
    metricsDiv.textContent =
      `에포크 ${epoch + 1}/${EPOCHS}  |  ` +
      `손실: ${logs.loss.toFixed(4)}  |  ` +
      `정확도: ${(logs.acc * 100).toFixed(1)}%  |  ` +
      `검증 정확도: ${(logs.val_acc * 100).toFixed(1)}%`;
  });

  setStatus('학습 완료! 아래 캔버스에 숫자를 그리고 [인식하기]를 눌러보세요.');
  trainBtn.textContent = '재학습';
  trainBtn.disabled = false;
});

clearBtn.addEventListener('click', () => {
  resetCanvas();
  resultDiv.innerHTML = '';
});

predictBtn.addEventListener('click', () => {
  if (!model) {
    resultDiv.innerHTML = '<p class="error">먼저 모델을 학습시켜주세요!</p>';
    return;
  }

  const scores = tf.tidy(() => {
    const tensor = tf.browser.fromPixels(canvas, 1)
      .resizeBilinear([28, 28])
      .div(255.0)
      .reshape([1, 28, 28, 1]);
    return model.predict(tensor).dataSync();
  });

  const predicted  = scores.indexOf(Math.max(...scores));
  const confidence = (Math.max(...scores) * 100).toFixed(1);

  let barsHTML = '<div class="bars">';
  for (let i = 0; i < 10; i++) {
    const pct = (scores[i] * 100).toFixed(1);
    barsHTML += `
      <div class="bar-row ${i === predicted ? 'highlight' : ''}">
        <span class="bar-label">${i}</span>
        <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
        <span class="bar-pct">${pct}%</span>
      </div>`;
  }
  barsHTML += '</div>';

  resultDiv.innerHTML = `
    <div class="prediction">
      <div class="pred-number">${predicted}</div>
      <div class="pred-label">
        <span>예측: ${predicted}</span>
        신뢰도: ${confidence}%
      </div>
    </div>
    ${barsHTML}`;
});

function setStatus(msg) {
  statusDiv.textContent = msg;
}
