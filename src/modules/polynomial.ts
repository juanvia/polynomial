import { right, left, chain, Either, fold } from "fp-ts/lib/Either"
import { identity } from "fp-ts/lib/function"
import { pipe } from "fp-ts/lib/pipeable"
import { makeExponentsArray } from "./exponents"

const js = JSON.stringify

//#region Types

export type Term = {
  coefficient: number
  exponents: Array<number>
}

export type Polynomial = {
  dimension: number
  degree: number
  values: Array<number>
  terms: Array<Term>
}

//#endregion

//#region Evaluation

const exponentsDimensionOk = (p: Polynomial): Either<Error, Polynomial> =>
  p.terms.every(term => term.exponents.length === p.dimension)
    ? right(p)
    : left(
        new Error(
          `Some term has its exponents list length not equal to the polynomial dimension (${p.dimension})`
        )
      )

const exponentsDegreeOk = (p: Polynomial): Either<Error, Polynomial> =>
  Math.max(
    ...p.terms.map(term => term.exponents).map(xs => xs.reduce((sum, another) => sum + another, 0))
  ) <= p.degree
    ? right(p)
    : left(new Error(`${js(p)}: terms degree is greater than polynomial degree ${p.degree}`))

const hasValues = (p: Polynomial): Either<Error, Polynomial> =>
  p.values && Array.isArray(p.values) && p.values.length === p.dimension
    ? right(p)
    : left(new Error(`The polynomial ${js(p)} has no valid values to evaluate`))

const addValues = (p: Polynomial, values: Array<number> | number): Either<Error, Polynomial> => {
  const x = Array.isArray(values) ? values : [values]
  return x.length !== p.dimension
    ? left(new Error(`Cannot add values ${js(x)} to polynomial ${js(p)}`))
    : right({ ...p, values: x })
}

/**
 * Evaluate a Polynomial with given values
 */
export const evaluate = (p: Polynomial): Either<Error, number> => {
  try {
    return right(
      // A polynomial is a sum of terms
      p.terms.reduce(
        (polynomialSum: number, term: Term): number =>
          polynomialSum +
          // A term is a product of coefficient and powers of
          // evaluated variables
          term.coefficient *
            term.exponents.reduce(
              (termProduct: number, exponent: number, index: number): number =>
                termProduct * p.values[index] ** exponent,
              1
            ),
        0
      )
    )
  } catch (error) {
    return left(
      error instanceof Error
        ? error
        : typeof error === "string"
        ? new Error(error)
        : new Error(`Error evaluating polynomial ${js(p)} using value ${js(p.values)}`)
    )
  }
}

export type EitherlyEvaluatorFunction = (x: number | Array<number>) => Either<Error, number>
export type MakeEitherlyEvaluatorFunction = (p: Polynomial) => EitherlyEvaluatorFunction

export type EvaluatorFunction = (x: number | Array<number>) => number
export type MakeEvaluatorFunction = (p: Polynomial) => EvaluatorFunction

const thrower = (e: Error) => {
  throw e
}

export const makeEitherlyEvaluator: MakeEitherlyEvaluatorFunction = polynomial => values =>
  pipe(
    addValues(polynomial, values),
    chain(hasValues),
    chain(exponentsDimensionOk),
    chain(exponentsDegreeOk),
    chain(evaluate)
  )
export const makeEvaluator: MakeEvaluatorFunction = p => x =>
  pipe(x, makeEitherlyEvaluator(p), fold(thrower, identity))
//#endregion

//#region Transform to complete
export const eitherlyTransformToComplete = (p: Polynomial): Either<Error, Polynomial> => {
  return p.degree > 9
    ? left(new Error(`Degree ${p.degree} is too big (max allowed is 9)`))
    : p.dimension > 5
    ? left(new Error(`Dimension ${p.dimension} is too big (max allowed is 5)`))
    : right({
        ...p,
        terms: makeExponentsArray(p.dimension, p.degree).map(exponents => ({
          coefficient: 1,
          exponents,
        })),
      })
}
export const transformToComplete = (p: Polynomial): Polynomial =>
  pipe(p, eitherlyTransformToComplete, fold(thrower, identity))
//#endregion

//#region Printing

export const eitherlyToLatexString = (p: Polynomial): Either<Error, string> => {
  const mayBeSubindex = (index: number, degree: number): string =>
    degree > 1 ? `_${index + 1}` : ""

  const mayBeExponent = (exponent: number): string => (exponent > 1 ? `^${exponent}` : ``)

  const factor = (index: number, exponent: number, degree: number): string =>
    exponent > 0 ? `x${mayBeSubindex(index, degree)}${mayBeExponent(exponent)}` : ``

  return right(
    p.terms.reduce(
      (latex: string, term: Term, index: number) =>
        `${latex}${index > 0 ? " + " : ""}${
          term.coefficient !== 1 || term.exponents.reduce((a, b) => a + b) === 0
            ? term.coefficient
            : ""
        }${term.exponents.reduce(
          (factors: string, exponent: number, index: number): string =>
            factors + factor(index, exponent, p.degree),
          ""
        )}`,
      ""
    )
  )
}
export const toLatexString = (p: Polynomial): string =>
  pipe(p, eitherlyToLatexString, fold(thrower, identity))

//#endregion
