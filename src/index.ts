#!/usr/bin/env node
import { Polynomial, makeEvaluator, toLatexString, transformToComplete } from "./modules/polynomial"
const example: Polynomial = {
  dimension: 3,
  degree: 2,
  values: [],
  terms: [
    { coefficient: 1, exponents: [2, 0, 0] },
    { coefficient: 5, exponents: [0, 0, 0] },
  ],
}

console.log(makeEvaluator(example)([2, 1, 1]))
console.log(toLatexString(transformToComplete(example)))

// https://js.tensorflow.org/api/latest/#linalg.qr
// https://github.com/samhh/fp-ts-std/blob/master/docs/ramda-comparison.md
