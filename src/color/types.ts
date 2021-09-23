
export type HSLColor = {
  system: "hsl"
  hue: number
  saturation: number
  lightness: number
}
export type RGBColor = {
  system: "rgb"
  red: number
  green: number
  blue: number
}
export type Color = RGBColor | HSLColor

export type RGBTuple = [red:number, green:number, blue:number]

export type WEBColor = {
  index: number
  name: string
  href: string
  hexa: string
  rgb: string
}

export type RGBPalette = Array<RGBColor>

