import { makePolynomial, toLatexString } from "../src"
import { examplePolynomial } from "./examplePolynomial"

export const tests = [
  [
    "toLatexString: with example polynomial",
    ():string => toLatexString(transformToComplete(examplePolynomial)),
  ],
  ["toLatexString: 2, 2", ():string => toLatexString(makePolynomial(2, 2))],
]
