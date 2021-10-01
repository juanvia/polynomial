#!/usr/bin/env node
// import { Polynomial, toLatexString, transformToComplete, make } from "../src"
// const example: Polynomial = {
//   dimension: 3,
//   degree: 2,
//   terms: [
//     { coefficient: 1, exponents: [2, 0, 0] },
//     { coefficient: 5, exponents: [0, 0, 0] },
//   ],
// }

// console.log(toLatexString(transformToComplete(example)))
// console.log(toLatexString(transformToComplete(make(2, 2))))
// console.log(JSON.stringify(make(3,3)))
// console.log('Ha!!')

// import { toLatexString, make } from "../src"
// const p = make(3,3)
// const latex = toLatexString(p)
// console.log({ p: JSON.stringify(p), latex })

import { makeMatrix } from "@juanvia/matrix"
import { makeFromPoints, toLatexString } from "../src"
const D=makeMatrix(6,2,[2,5,5,5,7,8,11,7,14,9,18,7])

const p1=makeFromPoints(1,D)[0]
console.log(toLatexString(p1)) // renders:
                               //   0.17183098591549267x 
                               // + 5.200938967136154

const p2=makeFromPoints(2,D)[0]
console.log(toLatexString(p2)) // renders:
                               //  -0.02820496411306621x_1^2 
                               // + 0.7363275211924957x_1 
                               // + 3.2181167482203867