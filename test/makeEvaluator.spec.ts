import { makeEvaluator } from "../src"
import { examplePolynomial } from "./examplePolynomial"

export const tests = [["makeEvaluator: 2, 1, 1", () => makeEvaluator(examplePolynomial)([2, 1, 1])]]
// https://js.tensorflow.org/api/latest/#linalg.qr
// https://github.com/samhh/fp-ts-std/blob/master/docs/ramda-comparison.md
