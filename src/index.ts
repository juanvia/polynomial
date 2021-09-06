#!/usr/bin/env node
import chalk from "chalk"
import clear from "clear"
import figlet from "figlet"
import path from "path"
import { Polynomial, makeEvaluator } from "./modules/polynomial"

clear()
console.log(
  chalk.red(figlet.textSync("some, more or less", { horizontalLayout: "full" }))
)

const example: Polynomial = {
  dimension: 3,
  degree: 3,
  terms: [
    { coefficient: 1, exponents: [3, 0, 0] },
    { coefficient: 1, exponents: [2, 1, 0] },
    { coefficient: 1, exponents: [1, 2, 0] },
    { coefficient: 1, exponents: [0, 2, 1] },
    { coefficient: 1, exponents: [0, 1, 2] },
  ],
}

console.log(makeEvaluator(example)([1, 1, 1]))
