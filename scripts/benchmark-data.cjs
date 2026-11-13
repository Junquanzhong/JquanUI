'use strict';
const { performance } = require('perf_hooks');
const { createCollection } = require('../dist/data/jquan-data.cjs');

function measure(label, task) {
  const start = performance.now();
  const result = task();
  const elapsed = performance.now() - start;
  console.log(`[JquanUI] ${label}: ${elapsed.toFixed(2)}ms`);
  return result;
}

const sizes = process.argv.includes('--large') ? [1000000] : [10000, 100000];
for (const size of sizes) {
  const rows = Array.from({ length: size }, (_, id) => ({ id, status: id % 5 === 0 ? 'active' : 'idle', score: id % 1000 }));
  const collection = createCollection(`benchmark-${size}`, { indexes: ['status'] });
  measure(`${size} insert`, () => collection.insert(rows));
  measure(`${size} indexed query`, () => collection.query({ status: 'active' }).count());
  measure(`${size} sorted page`, () => collection.query().orderBy({ score: 'desc' }).paginate(1, 50));
  const stop = collection.liveQuery({ status: 'active' }, () => {}, { immediate: false });
  measure(`${size} liveQuery update`, () => collection.update({ id: 0 }, { score: 1001 }));
  stop();
}
