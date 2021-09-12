import { some, none, fromNullable, map } from "fp-ts/lib/Option"
import { dropLeft, takeLeft } from "fp-ts/lib/Array"
export * as webColors from "./web-colors.json"
export type WEBColor = {
  index: number
  name: string
  href: string
  hexa: string
  rgb: string
}
export type RGBColor = {
  system: "rgb"
  red: number
  green: number
  blue: number
}
export const RGBPalette = Array

export const make = (red: number, green: number, blue: number): RGBColor => ({
  system: "rgb",
  red,
  green,
  blue,
})

export const toTuple = (c: RGBColor): Array<number> => [c.red, c.green, c.blue]
export const fromTuple = (tuple: Array<number>): RGBColor => make(...tuple)
export const fromCSSNotation = (css: string): RGBColor =>
  css.match(/RGB\(([0-9+]\),([0-9+]\),([0-9+]\)\)/)
export const fromName = (colorName: string): RGBColor =>
  pipe(
    fromNullable(webColors[colorName]?.find(o => o.name === colorName)),
    map(o => o.rgb),
    map(as.map(a => Number(a))),
    map(dropLeft(1)),
    map(takeLeft(3)),
    fromTuple
  )
