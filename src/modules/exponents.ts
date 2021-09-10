import { repeat, sort, sum, reduce, add, } from 'ramda'

/**
 * Helper for sorting the result
 */
const relevance = (row: number[]): number => {
  return sum(row) * 1000000
    + reduce(Math.max, Number.MIN_VALUE)(row) * 1000
    + row.reduce((prev, cur, idx, arr) => prev + 2 ** (arr.length - idx) * cur, 0)
}

/**
 * Criteria for sorting
 * @param a Fist element
 * @param b Second element
 */
const byRelevance = (a: number[], b: number[]): number => relevance(b) - relevance(a)





/**
 * Returns the points in non-negative integer n-dimensional space (n < 6)
 * of size m  whose digts sum <= m (m < 10))
 * Believe it or not that's useful
 *
 * @remarks
 * Let A be a n-dimensional space of integers in the range (0...m)
 * Where n < 6 and m < 10 (i.e. the elements of V are digits)
 * The function below gives us a subset of A whose points p fullfill the contstraint:
 * "The sum of digits of p is less or equal to m"
 * 
 * Example:
 * 
 * ```
 * 2      (2,0)  (2,1)  (2,2)
 * 1      (1,0)  (1,1)  (1,2)
 * 0      (0,0)  (0,1)  (0,2)
 *
 *          0      1      2
 * ```
 * @param dim The number of dimensions the phase space A
 * @param deg Must be the max value the coordinates that the points of A can have
 * @returns The valid points in a `n`-dimensional and `n`ic phase space
 *
 */

const takeValidPoints = (dimensions: number, totalDegree: number): number[][] => {

  
  const appendAnotherDimension = (totalDegree: number, oldSpacePoints: number[][]): number[][] => {
    
    // Append one more dimension replacing each point with (totalDegree+1) new dimensions points
    
    const newSpacePoints: number[][] = []

    oldSpacePoints.forEach(seedPoint => {
      
      // use all possible values to generate new points
      for (let value = 0; value <= totalDegree; ++value)
        newSpacePoints.push(seedPoint.concat([value]))
        
    })
    
    return newSpacePoints
  
  }


  // Initialize the list of valid points to empty
  let points: number[][] = [[]]

  for (let dim = 1; dim <= dimensions; ++dim) {
    points = appendAnotherDimension(totalDegree, points)
  }

  return points.filter(point => point.reduce(add, 0) <= totalDegree)


}


/**
 * Returns a matrix where each row is a exponents array for each term in the polynomial.
 * A 'exponents array' is a vector containing the powers at which the correspondent 
 * independent variable must be raised
 *
 * @remarks
 * 
 * This matrix is all you need in order to generate/calculate a Polynomial
 *
 * @param dimensions The number of dimensions the phase space A
 * @param degree Must be the max value the coordinates that the points of A can have
 * @returns The valid points in a `dimensions`-dimensional and `degree`ic phase space
 *
 */
export const makeExponentsArray = (dimensions: number, degree: number): number[][] => {

  // Add zero degree case
  if (degree === 0) {
    return [repeat(0, dimensions)]
  }

  // Gathering the points whose sum of elements is less or equal to the given degree
  const stack = takeValidPoints(dimensions, degree)

  // On delivery be polite and give a neat, ordered list
  return sort(byRelevance, stack)

}

export default makeExponentsArray



