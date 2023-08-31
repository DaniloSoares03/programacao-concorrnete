const fs = require('fs');
const { Worker, isMainThread, parentPort } = require('worker_threads');

const filePath = 'resultados.csv';

if (isMainThread) {
  const workerCount = 4; // Número de workers a serem criados
  let completedWorkers = 0;
  const sequenceCounts = {
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
    "10": 0,
    "11": 0,
    "12": 0,
    "13": 0,
    "14": 0,
    "15": 0
  };

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erro ao ler o arquivo:', err);
      return;
    }

    const lines = data.split(/\r?\n/);

    // Dividir as linhas entre os workers
    const linesPerWorker = Math.ceil(lines.length / workerCount);
    const workers = [];

    for (let i = 0; i < workerCount; i++) {
      const startIdx = i * linesPerWorker;
      const endIdx = startIdx + linesPerWorker - 1;
      const worker = new Worker(__filename, {
        workerData: { lines: lines.slice(startIdx, endIdx + 1) }
      });

      workers.push(worker);

      worker.on('message', (result) => {
        completedWorkers++;
        for (const key in result) {
          sequenceCounts[key] += result[key];
        }
        
        if (completedWorkers === workerCount) {
          console.log(sequenceCounts);
        }
      });
    }
  });
} else {
  const { lines } = require('worker_threads').workerData;

  // Processar as linhas em cada worker
  const sequenceCounts = {
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
    "10": 0,
    "11": 0,
    "12": 0,
    "13": 0,
    "14": 0,
    "15": 0
  };

  lines.forEach((line) => {
    const columns = line.split(',').map(Number);
    let count = 0;
    let max = 0;

    columns.forEach((value, i, arr) => {
      if (i === 0) return;
      const prevValue = arr[i - 1];

      if (value === prevValue + 1) {
        count++;
        max = Math.max(max, count);
      } else {
        count = 0;
      }
    });

    if (max >= 2 && max <= 15) {
      sequenceCounts[max.toString()]++;
    }
  });

  parentPort.postMessage(sequenceCounts);
}

