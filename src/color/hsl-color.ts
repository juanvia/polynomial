//#region Types
export type HSLColor = {
  system: "hsl"
  hue: number
  saturation: number
  lightness: number
}
//#endregion
export const makeRGB = (red: number, green: number, blue: number): RGBColor => ({
  system: "rgb",
  red,
  green,
  blue,
})

export const toTuple = (c: Color): Array<number> | undefined =>
  c.system === "rgb"
    ? [c.red, c.green, c.blue]
    : c.system === "hsl"
    ? [c.hue, c.saturation, c.lightness]
    : undefined
