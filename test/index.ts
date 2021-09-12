import { resolve } from "path"
import { runFiles } from "@xaviervia/micro-snapshots"

runFiles([resolve(__dirname, "makeEvaluator.spec.ts"), resolve(__dirname, "toLatexString.spec.ts")])
