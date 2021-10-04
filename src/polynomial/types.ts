export type Term = {
  coefficient: number | undefined
  exponents: Array<number>
}

export type Polynomial = {
  dimension: number
  degree: number
  terms: Array<Term>
  coefficientNames?: Array<string>
}
