import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import ts from "typescript";

const source = readFileSync("src/core/navigation.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2015 },
}).outputText;
const navigation = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const origin = { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 };
const median = (samples) => samples.sort((a, b) => a - b)[Math.floor(samples.length / 2)];
for (const size of [100, 1000]) {
  const candidates = Array.from({ length: size }, (_, index) => ({
    value: index,
    box: {
      left: index % 30,
      top: 110 + ((index * 7) % 1000),
      right: 100 + (index % 30),
      bottom: 210 + ((index * 7) % 1000),
      width: 100,
      height: 100,
    },
  }));
  const measure = (pick) => {
    for (let n = 0; n < 100; n += 1) {
      pick();
    }
    const samples = [];
    for (let sample = 0; sample < 15; sample += 1) {
      const start = performance.now();
      for (let iteration = 0; iteration < 500; iteration += 1) {
        pick();
      }
      samples.push((performance.now() - start) / 500);
    }
    return median(samples);
  };
  const analysis = measure(
    () => navigation.analyzeNearest("down", origin, candidates).ranked[0]?.value,
  );
  const direct = measure(() => navigation.pickNearest("down", origin, candidates));
  console.log(
    JSON.stringify({
      candidates: size,
      sortedAnalysisMedianMs: analysis,
      directPickMedianMs: direct,
    }),
  );
}
