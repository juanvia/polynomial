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

// import { makeMatrix } from "@juanvia/matrix"
// import { makeFromPoints, toLatexString } from "../src"
// const D=makeMatrix(6,2,[2,5,5,5,7,8,11,7,14,9,18,7])

// const p1=makeFromPoints(1,D)[0]
// console.log(toLatexString(p1)) // renders:
//                                //   0.17183098591549267x
//                                // + 5.200938967136154

// const p2=makeFromPoints(2,D)[0]
// console.log(toLatexString(p2)) // renders:
//                                //  -0.02820496411306621x_1^2
//                                // + 0.7363275211924957x_1
//                                // + 3.2181167482203867

// const js = JSON.stringify

// import { makeMatrix } from "@juanvia/matrix"
// import { makeFromPoints, toLatexString } from "../src"
// const D = makeMatrix(6, 2, [
//   2, 5,
//   5, 5,
//   7, 8,
//   11, 7,
//   14, 9,
//   18, 7
// ])
// console.log(toLatexString(makeFromPoints(1, D)[0]))

// import { makeMatrix } from "@juanvia/matrix"
// import { makeFromPoints, toLatexString } from "../src"
// const D = makeMatrix(3, 4, [
//   2, /**/ 9, 10, 7,
//   1, /**/ 7,  7, 3,
//   0, /**/ 5,  4, 1,
// ])
// console.log(toLatexString(makeFromPoints(2, D, 3)[0]))
// console.log(toLatexString(makeFromPoints(2, D, 3)[1]))
// console.log(toLatexString(makeFromPoints(2, D, 3)[2]))

import { makeMatrix, toArray } from "@juanvia/matrix"
import { flatten } from "fp-ts/lib/Array"
import { makeFromPoints, toLatexString } from "../src"

const examples = [
  [
    [235, 111, 147],
    [225, 106, 142],
  ],
  [
    [110, 152, 150],
    [96, 142, 140],
  ],
  [
    [255, 255, 255],
    [204, 204, 204],
  ],
  [
    [240, 238, 234],
    [234, 231, 228],
  ],
  [
    [234, 231, 228],
    [226, 222, 218],
  ],
  [
    [209, 208, 206],
    [120, 116, 113],
  ],
  [
    [151, 148, 147],
    [114, 110, 109],
  ],
  [
    [120, 116, 113],
    [81, 78, 75],
  ],
  [
    [23, 18, 15],
    [0, 0, 0],
  ],
  [
    [255, 236, 228],
    [252, 231, 219],
  ],
  [
    [252, 128, 100],
    [241, 115, 82],
  ],
  [
    [255, 245, 223],
    [252, 243, 216],
  ],
  [
    [226, 172, 98],
    [214, 155, 63],
  ],
  [
    [240, 249, 222],
    [236, 244, 215],
  ],
  [
    [130, 188, 126],
    [109, 173, 111],
  ],
]

const D = makeMatrix(examples.length, 6, flatten(flatten(examples)))
const [polyRed, polyGreen, polyBlue] = makeFromPoints(2,D,3)
console.log(toLatexString(polyRed))

