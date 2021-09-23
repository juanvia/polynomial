import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/Option"
import { pipe } from "fp-ts/pipeable"
import webColors from "./web-colors"
import { match } from "fp-ts-contrib/RegExp"
import { RGBColor, WEBColor } from "./types"
const js = JSON.stringify
export const make = (red: number, green: number, blue: number): E.Either<Error, RGBColor> =>
  red >= 0 && green >= 0 && blue >= 0 && red <= 255 && green <= 255 && blue <= 255
    ? E.right({
        system: "rgb",
        red,
        green,
        blue,
      })
    : pipe(new Error(`${js([red, green, blue])} is not a correct RGB specification`), E.left)

export const makeFromArray = (x: number[]): E.Either<Error, RGBColor> =>
  x.length < 3
    ? E.left(new Error(`The vector ${js(x)} cannot be converted to a RGBColor`))
    : make(x[0], x[1], x[2])

export const makeFromCSSNotation = (css: string): E.Either<Error, RGBColor> => {
  return pipe(
    css.trim().replaceAll(/[ \t\n\f]/g,''),
    match(/RGB\(([0-9]+),([0-9]+),([0-9]+)\)/),
    O.map(Array.from),
    E.fromOption(() => new Error(`'${css}' is a bad, ugly CSS RGB notation'`)),
    E.filterOrElse(
      as => as.length === 4,
      () => new Error("The derived array length is less than four")
    ),
    E.map(xs => xs.map(x => Number(x)).slice(1, 4)),
    E.chain(makeFromArray)
  )
}
export const makeFromName = (colorName: string): E.Either<Error, RGBColor> =>
  pipe(
    webColors.find(o => o.name === colorName),
    E.fromNullable(new Error(`"${colorName} is not a web color name`)),
    E.map((o: WEBColor) => o.rgb),
    E.chain(makeFromCSSNotation)
  )
