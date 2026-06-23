import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const sourcePath = path.join(root, "src", "data", "mockData.ts");
const outputDir = path.join(root, "data");
const outputPath = path.join(outputDir, "platformData.json");

const source = fs
  .readFileSync(sourcePath, "utf8")
  .replace(/^import type.*$/gm, "")
  .replace(/export const (\w+): [^=]+ =/g, "globalThis.$1 =")
  .replace(/export const (\w+) =/g, "globalThis.$1 =");

const context = vm.createContext({});
vm.runInContext(source, context, { filename: sourcePath });

const data = {
  countries: context.countries ?? [],
  treaties: context.treaties ?? [],
  datasets: context.datasets ?? [],
  ecsRecords: context.ecsRecords ?? [],
  treatyProgress: context.treatyProgress ?? [],
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Exported platform data to ${outputPath}`);
