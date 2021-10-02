import { makeExponentsArray } from "./exponents"
import {
  Matrix,
  makeEmptyMatrix,
  appendRow,
  get,
  row,
  makeRowVector,
  tr,
  qr,
  backSubstitution,
  mul,
} from "@juanvia/matrix"

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
    // console.log({ p: JSON.stringify(p), points })
    throw new Error(`Under-determinated, not enough points, we need at least ${p.terms.length}`)
  }
}
const fixr = (x: number): number => (Math.abs(x - Math.round(x)) < 1e-10 ? Math.round(x) : x)

export const makeFromPoints = (
  degree: number,
  D: Matrix,
  rangeDimension = 1
): Array<Polynomial> => {
  // Generate from dimension D.cols-rangeDimension, because last cols of D is the values), and degree.
  const p = make(D.cols - rangeDimension, degree)
  validateFromPoints(p, D)

  // The b in Ax=B
  let B = makeEmptyMatrix()
  for (let i = -rangeDimension; i < 0; ++i) {
    B = appendRow(B, row(D.cols + i, tr(D)))
  }
  B = tr(B)

  // The A in Ax=b
  let A = makeEmptyMatrix()
  for (let i = 0; i < D.rows; ++i) {
    const rowArray = []
    for (let j = 0; j < p.terms.length; ++j) {
      let element = 1
      for (let k = 0; k < p.terms[j].exponents.length; ++k) {
        const variableValue = get(D, i, k)
        const exponent = p.terms[j].exponents[k]
        element *= variableValue ** exponent
      }
      rowArray.push(element)
    }
    A = appendRow(A, makeRowVector(p.terms.length, rowArray))
  }

  // The X in Ax=B
  // const x = solve(A, B)

  const [Q, R] = qr(A)
  //console.log({ A, B, p: js(p), Q, R })
  const trB = tr(B)
  const trQ = tr(Q)
  const ps: Array<Polynomial> = []
  //console.log({ Q, R, trB, trQ, ps: js(ps) })
  for (let i = 0; i < B.cols; ++i) {
    const b = tr(row(i, trB))
    const x = backSubstitution(R, mul(trQ, b))
    ps.push({ ...p, terms: p.terms.map((term, i) => ({ ...term, coefficient: fixr(get(x, i)) })) })
  }
  return ps
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

export const evaluate = (p: Polynomial, values: Matrix): number => {
  const validateEvaluablePolynomial = (p: Polynomial) => {
    if (p.terms.some(term => typeof term.coefficient === "undefined"))
      throw new Error(`Some term has uninitialized coefficient`)
  }

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

  const mayBeSubindex = (index: number, p: Polynomial) => (p.dimension > 1 ? `_${index + 1}` : "")

  const mayBeExponent = (exponent: number) => (exponent > 1 ? `^${exponent}` : ``)

  const factor = (index: number, exponent: number, p: Polynomial): string =>
    exponent > 0 ? `x${mayBeSubindex(index, p)}${mayBeExponent(exponent)}` : ``

  return p.terms.reduce(
    (latex: string, term: Term, index: number) =>
      typeof term.coefficient !== "undefined" && term.coefficient !== 0
        ? `${latex}${latex !== "" ? " + " : ""}${
            term.coefficient !== 1 || term.exponents.reduce((a, b) => a + b) === 0
              ? typeof term.coefficient === "undefined"
                ? `a${toLatexSubindex(p.terms.length - 1 - index)}`
                : term.coefficient
              : ""
          }${term.exponents.reduce(
            (factors: string, exponent: number, index: number): string =>
              factors + factor(index, exponent, p),
            ""
          )}`
        : "",
    ""
  )
}
