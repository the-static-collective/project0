import { conformanceExitCode, renderConformance, runConformance } from "../src/reference-kernel/index.js";

const results = runConformance();
console.log(renderConformance(results));
process.exitCode = conformanceExitCode(results);
