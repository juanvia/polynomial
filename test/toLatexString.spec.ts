import { make, toLatexString, transformToComplete } from "../src"
import { examplePolynomial } from "./examplePolynomial"

export const tests = [
  [
    "toLatexString: with example polynomial",
    () => toLatexString(transformToComplete(examplePolynomial)),
  ],
  ["toLatexString: 2, 2", () => toLatexString(transformToComplete(make(2, 2)))],
]
