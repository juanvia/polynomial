#!/usr/bin/env node
import { Polynomial, makeEvaluator, printLaTex, transformToComplete } from "./modules/polynomial"
import { fold } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
const example: Polynomial = {
  dimension: 3,
  degree: 2,
  values: [],
  terms: [
    { coefficient: 1, exponents: [2, 0, 0] },
    { coefficient: 5, exponents: [0, 0, 0] },
  ],
}

const thrower = (e: Error) => {
  throw e
}

console.log(makeEvaluator(example)([2, 1, 1]))
console.log(
  pipe(
    example,
    transformToComplete,
    fold(thrower, printLaTex)
  )
)

// https://js.tensorflow.org/api/latest/#linalg.qr
// https://github.com/samhh/fp-ts-std/blob/master/docs/ramda-comparison.md
