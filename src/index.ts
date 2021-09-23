export * from "./exponents"
export * from "./polynomial"
import * as RGBColor from "./color/rgb-color"
// console.log(RGBColor.make(200,100,0))
// console.log(RGBColor.fromName('RebeccaPurple'))
console.log(RGBColor.makeFromCSSNotation('RGB(1,2,4)'))
console.log(RGBColor.makeFromCSSNotation('RGB(245,255,250)'))
console.log(RGBColor.makeFromName('MintCream'))
