import { right, left, chain, Either } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"

//#region Types

export type Term = {
  coefficient: number
  exponents: Array<number>
}

export type Polynomial = {
  dimension: number
  degree: number
  values?: Array<number>
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
    ...p.terms
      .map(term => term.exponents)
      .map(exponentList =>
        exponentList.reduce((exponentsSum, exp) => exponentsSum + exp, 0)
      )
  ) <= p.degree
    ? right(p)
    : left(
        new Error(
          `There is at least one term whose exponents sum is greater than the polynomial degree ${p.degree}`
        )
      )

const hasValues = (p: Polynomial): Either<Error, Polynomial> =>
  p.values && Array.isArray(p.values) && p.values.length === p.dimension
    ? right(p)
    : left(new Error(`The polynomial has no valid values to evaluate`))

const addValues = (
  p: Polynomial,
  values: Array<number> | number
): Either<Error, Polynomial> => {
  const x = Array.isArray(values) ? values : [values]
  if (x.length !== p.dimension)
    return left(
      new Error(
        `Cannot add values ${JSON.stringify(x)} to polynomial ${JSON.stringify(
          p
        )} (see dimension property)`
      )
    )
  return right({ ...p, values: x })
}

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
                termProduct * p.values![index] ** exponent,
              1
            ),
        0
      )
    )
  } catch (error) {
    if (error instanceof Error) return left(error)
    if (typeof error === "string") return left(new Error(error))
    else
      return left(
        new Error(
          `Error evaluating polynomial ${JSON.stringify(
            p
          )} using value ${JSON.stringify(p.values)}`
        )
      )
  }
}

export type EvaluatorFunction = (
  x: number | Array<number>
) => Either<Error, number>

export type MakeEvaluatorFunction = (p: Polynomial) => EvaluatorFunction

export const makeEvaluator: MakeEvaluatorFunction = p => x =>
  pipe(
    addValues(p, x),
    chain(hasValues),
    chain(exponentsDimensionOk),
    chain(exponentsDegreeOk),
    chain(evaluate)
  )
//#endregion

//#region Printing

export const printLaTex = (p: Polynomial): Either<Error, string> => {
  const factor = (index: number, exponent: number, degree: number): string =>
    exponent > 0
      ? "x" +
        (degree > 1 ? "_" + (index + 1).toString() : "") +
        (exponent > 1 ? "^" + exponent.toString() : "")
      : ""
  return right(
    p.terms.reduce(
      (latex: string, term: Term, index: number) =>
        `${latex}${index > 0 ? " + " : ""}${
          term.coefficient !== 1 ? term.coefficient : ""
        }${term.exponents.reduce(
          (factors: string, exponent: number, index: number): string =>
            factors + factor(index, exponent, p.degree),
          ""
        )}`,
      ""
    )
  )
}

//#endregion
