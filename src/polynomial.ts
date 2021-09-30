import { makeExponentsArray } from "./exponents"
import { Matrix, makeEmptyMatrix, appendRow, get, row, makeRowVector, tr, solve } from "@juanvia/matrix"

const js = JSON.stringify

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

export const transformToComplete = (p: Polynomial): Polynomial => {
  if (p.degree > 9) throw new Error(`Degree ${p.degree} is too big (max allowed is 9)`)
  if (p.dimension > 5) throw new Error(`Dimension ${p.dimension} is too big (max allowed is 5)`)
  return {
    ...p,
    terms: makeExponentsArray(p.dimension, p.degree).map(exponents => ({
      coefficient: undefined,
      exponents,
    })),
  }
}

export const make = (dimension: number, degree: number): Polynomial =>
  transformToComplete({
    dimension,
    degree,
    terms: [],
  })

const validateFromPoints = (p: Polynomial, points: Matrix) => {
  if (points.rows < p.terms.length) {
    throw new Error(`Under-determinated, not enough points, we need at least ${p.terms.length}`)
  }
}
export const makeFromPoints = (degree: number, D: Matrix): Polynomial => {
  const dimension = D.cols - 1 // last col is the values
  const p = make(dimension, degree)

  validateFromPoints(p, D)

  let A = makeEmptyMatrix()
  const b = tr(row(D.cols - 1, tr(D)))
  for (let i = 0; i < D.rows; ++i) {
    const rowArray = []
    for (let j = 0; j < p.terms.length; ++j) {
      let element = 1
      for (let k = 0; k < p.terms[j].exponents.length; ++k) {
        const variableValue = get(D,i,k)
        const exponent = p.terms[j].exponents[k]
        element *= variableValue**exponent
      }
      rowArray.push(element)
    }
    const rowVector = makeRowVector(p.terms.length, rowArray)
    A = appendRow(A, rowVector)
  }
  const x = solve(A,b)
  return {...p, terms:p.terms.map((term,i)=>({...term, coefficient: get(x,i)}))}
}

const validatePolynomial = (p: Polynomial) => {
  p.terms.forEach((term, index) => {
    if (term.exponents.length !== p.dimension) {
      throw `The term #${index + 1} has ${term.exponents.length} variables but it must have ${
        p.dimension
      }`
    }
    const exponentsDegreeOk =
      Math.max(
        ...p.terms
          .map(term => term.exponents)
          .map(xs => xs.reduce((sum, another) => sum + another, 0))
      ) <= p.degree
    if (!exponentsDegreeOk)
      throw new Error(`${js(p)}: terms degree is greater than polynomial degree ${p.degree}`)
  }, 0)
}

const validateEvaluablePolynomial = (p: Polynomial) => {
  if (p.terms.some(term => typeof term.coefficient === "undefined"))
    throw new Error(`Some term has uninitialized coefficient`)
}

export const evaluate = (p: Polynomial, values: Matrix): number => {
  const evalTerm = (t: Term, values: Matrix) =>
    (t.coefficient || 0) * t.exponents.reduce((a, x, i) => a * values.data[i] ** x, 1)
  const evalPolynomial = (p: Polynomial) =>
    p.terms.reduce((sum, term) => sum + evalTerm(term, values), 0)

  validatePolynomial(p)
  validateEvaluablePolynomial(p)

  return evalPolynomial(p)
}

export const toLatexString = (p: Polynomial): string => {
  const toLatexSubindex = (i: number) =>
    i
      .toString()
      .split("")
      .map(digit => `_${digit}`)
      .join("")

  const mayBeSubindex = (index: number, degree: number) => (degree > 1 ? `_${index + 1}` : "")

  const mayBeExponent = (exponent: number) => (exponent > 1 ? `^${exponent}` : ``)

  const factor = (index: number, exponent: number, degree: number): string =>
    exponent > 0 ? `x${mayBeSubindex(index, degree)}${mayBeExponent(exponent)}` : ``

  return p.terms.reduce(
    (latex: string, term: Term, index: number) =>
      `${latex}${index > 0 ? " + " : ""}${
        term.coefficient !== 1 || term.exponents.reduce((a, b) => a + b) === 0
          ? term.coefficient || `a${toLatexSubindex(p.terms.length - 1 - index)}`
          : ""
      }${term.exponents.reduce(
        (factors: string, exponent: number, index: number): string =>
          factors + factor(index, exponent, p.degree),
        ""
      )}`,
    ""
  )
}
