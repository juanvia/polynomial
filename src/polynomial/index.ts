import { Polynomial, Term } from "./types"
export { Polynomial, Term }
import { makeExponentsArray } from "./exponents"
import {
  Matrix,
  makeEmptyMatrix,
  appendRow,
  get,
  makeRowVector,
  tr,
  qr,
  backSubstitution,
  mul,
  column,
} from "@juanvia/matrix"

const js = JSON.stringify


/**
 * Returns an empty Polynomial. You give two numbers, the dimension and the degree.
 *
 * The _dimension_ is the number of variables it contains.
 *
 * In mathematics, the _degree_ of a polynomial is the highest of the degrees
 * of the polynomial's monomials (individual terms) with non-zero coefficients.
 * The degree of a term is the sum of the exponents of the variables that appear in it,
 * and thus is a non-negative integer. [(Wikipedia)](https://en.wikipedia.org/wiki/Degree_of_a_polynomial)
 *
 * The polynomial returned is not _well formed_. After this you have work to do (fill the terms).
 *
 * @param  {number} dimension Or how many variables it uses
 * @param  {number} degree Max of the term's exponents sum you can find inspecting each of them.
 * @returns Polynomial
 * @example
 */
export const makeEmptyPolynomial = (dimension: number, degree: number): Polynomial => ({
  dimension,
  degree,
  terms: [],
})
/**
 * From the given Polynomial returns another with its terms replaced. The new ones form
 * a [complete homogeneous symmetric polynomial](https://mathoverflow.net/questions/225953/number-of-polynomial-terms-for-certain-degree-and-certain-number-of-variables)
 * plus an independent term. The number of terms is the combinatorial number _nCr_ where _n=dimension+degree_ and _r=degree_
 * @param  {Polynomial} p
 * @returns Polynomial
 */
export const populate = (p: Polynomial): Polynomial => {
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
/**
 * Makes an empty Polynomial and return it populated with the terms needed to form
 * a [complete homogeneous symmetric polynomial](https://mathoverflow.net/questions/225953/number-of-polynomial-terms-for-certain-degree-and-certain-number-of-variables)
 * plus an independent term.
 * @param  {number} dimension
 * @param  {number} degree
 * @returns Polynomial
 */
export const makePolynomial = (dimension: number, degree: number): Polynomial =>
  populate(makeEmptyPolynomial(dimension, degree))
/**
 * Verify that the given points were enough to calculate the coefficients of the
 * given Polynomial.
 * @param  {Polynomial} p
 * @param  {Matrix} points
 * @throws an Error if the points Matrix has less rows than the polynomial terms.
 */
const validateFromPoints = (p: Polynomial, points: Matrix) => {
  if (points.rows < p.terms.length) {
    throw new Error(`Under-determinated, not enough points, we need at least ${p.terms.length}`)
  }
}
export const clone = ({ dimension, degree, terms }: Polynomial): Polynomial => ({
  dimension,
  degree,
  terms: terms.map(term => ({ ...term, exponents: [...term.exponents] })),
})
/**
 * Sticks a number with an integer if it's close enough and returns that integer.
 * 1/10 000 000 000 close _is_ enough, you can't complain.
 * @param  {number} x
 * @returns number
 */
const stick = (x: number): number => (Math.abs(x - Math.round(x)) < 1e-10 ? Math.round(x) : x)
/**
 * @param  {number} degree
 * @param  {Matrix} D
 * @param  {} rangeDimension=1
 * @returns Array
 */
export const makeFromPoints = (
  degree: number,
  D: Matrix,
  rangeDimension = 1
): Array<Polynomial> => {
  // Generate from dimension D.cols-rangeDimension, because last cols of D is the values), and degree.
  const templatePolynomial = makePolynomial(D.cols - rangeDimension, degree)
  validateFromPoints(templatePolynomial, D)

  // STEP 1. Calculate A, the matrix with rows formed by evaluate the terms with
  //         values from the first columns of the data matrix D
  let A = makeEmptyMatrix()
  for (let i = 0; i < D.rows; ++i) {
    const rowArray = []
    for (let j = 0; j < templatePolynomial.terms.length; ++j) {
      let element = 1
      for (let k = 0; k < templatePolynomial.terms[j].exponents.length; ++k) {
        const variableValue = get(D, i, k)
        const exponent = templatePolynomial.terms[j].exponents[k]
        element *= variableValue ** exponent
      }
      rowArray.push(element)
    }
    A = appendRow(A, makeRowVector(templatePolynomial.terms.length, rowArray))
  }

  // STEP 2. Generate the polynomials *one by one* solving the equation Ax=b for each dependent variable
  //         - The matrix 'A' in the equation has been created in the previous step.
  //         - The vector 'b' comes from the last column (if 'rangeDimension' == 1) or columns of 'D', *one by one*
  //         - The vector 'x', the incognita, contains the coefficients of the correspondent polynomial terms
  //         The solution of the 'Ax=b' equation is achieved using the QR decomposition
  //         Remember: A=Q.R -> A.x=b === Q.R.x=b -> trQ.Q.R.x=trQ.b -> R.x=trQ.b -> R.x=_b 
  //         In the process the vector '_b' is created multiplying the traspose of 'Q' by that 'b' (the column of 'D')
  //         With '_b' and 'R' we obtain the coefficients 'x' by back substitution.
  //         With 'x' calculated we updated the coefficients of a fresh copy of the early generated template polynomial
  //         And then add this new polynomial to the list.

  const [Q, R] = qr(A)
  const trQ = tr(Q)
  const thePolynomials: Array<Polynomial> = []

  for (let j = 0; j < rangeDimension; ++j) {
    const b = column(D.cols - rangeDimension + j, D)
    const _b = mul(trQ, b)
    const x = backSubstitution(R, _b)

    const newPolynomial = clone(templatePolynomial)
    for (let i = 0; i < newPolynomial.terms.length; ++i) {
      newPolynomial.terms[i].coefficient = stick(get(x, i))
    }
    thePolynomials.push(newPolynomial)
  }

  // now the list "thePolynomials" are done

  return thePolynomials
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
