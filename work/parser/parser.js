import fs from 'fs'
import parser from "node-html-parser"
const { parse } = parser

const root = parse(fs.readFileSync('./color.html'))

const webColors = root.querySelectorAll('tr').map((tr,index) => {
  const name = tr.querySelector('td[title]')?.attributes.title
  const href = tr.querySelector('a')?.attributes.href
  const hexa = tr.querySelectorAll('td')[2]?.textContent
  const rgb = tr.querySelectorAll('td')[3]?.textContent
  return {index, name, href, hexa, rgb}
})

console.log(JSON.stringify(webColors))