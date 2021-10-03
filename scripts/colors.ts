#!/usr/bin/env node
import { flatten } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { makeFromPoints, evaluate } from "../src"
import { makeMatrix, fromArray } from "@juanvia/matrix"
import chalk from "chalk"
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

export const colors = (): void => {
  // -----------------------------------------------------------------------------

  const D = makeMatrix(examples.length, 6, flatten(flatten(examples)))
  const [polyRed, polyGreen, polyBlue] = makeFromPoints(2, D, 3)

  // -----------------------------------------------------------------------------

  const format = (name: string, rgb: number[]) =>
    chalk.bgRgb(rgb[0], rgb[1], rgb[2]).hex("#404040")(
      name + " (" + rgb.map(color => color.toString().padStart(3)).join(",") + ") "
    )

  // -----------------------------------------------------------------------------

  examples.forEach(([departure, arrival]) => {
    const x      = fromArray([departure])
    const red    = pipe(evaluate(polyRed,   x), Math.round)
    const green  = pipe(evaluate(polyGreen, x), Math.round)
    const blue   = pipe(evaluate(polyBlue,  x), Math.round)
    const mapped = [red, green, blue]

    process.stdout.write(
      " " 
      + format("", departure) 
      + "" 
      + format("", arrival) 
      + "" 
      + format("", mapped) 
      + " \n"
    )
  })

  // -----------------------------------------------------------------------------
}
