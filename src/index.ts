#!/usr/bin/env node
import chalk from "chalk"
import clear from "clear"
import figlet from "figlet"
import path from "path"
import { Polynomial, makeEvaluator, printLaTex } from "./modules/polynomial"

clear()
console.log(
  chalk.red(figlet.textSync("some, more or less", { horizontalLayout: "full" }))
)

const example: Polynomial = {
  dimension: 3,
  degree: 2,
  terms: [
    { coefficient: 1, exponents: [2, 0, 0] },
    { coefficient: 5, exponents: [0, 0, 0] },
  ],
}

console.log(makeEvaluator(example)([2, 1, 1]))
console.log(printLaTex(example))
// https://js.tensorflow.org/api/latest/#linalg.qr
// https://github.com/samhh/fp-ts-std/blob/master/docs/ramda-comparison.md

