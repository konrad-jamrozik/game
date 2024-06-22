import * as fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import * as zlib from 'node:zlib'
import _ from 'lodash'
import { describe, expect, test } from 'vitest'

// Promisify the fs and zlib functions for better async/await support
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

describe('scratchpad tests', () => {
  test.only('test compression', async () => {
    const repoDir = path.normalize(`${import.meta.dirname}/../../..`)
    const inputFilePath = path.normalize(`${repoDir}/input.json`)
    const outputFilePath = path.normalize(`${repoDir}/output.gzip`)

    const inputData = await readFile(inputFilePath, 'utf8')
    const minInputData = JSON.stringify(JSON.parse(inputData))
    console.log(`repo dir: '${repoDir}'`)
    console.log(
      `input file: '${inputFilePath}', minifiedData.length: ${minInputData.length}`,
    )
    // Compress the JSON data using gzip
    const compressedData: Buffer = await gzip(minInputData)

    console.log(
      `output file: '${outputFilePath}', compressedData.length: ${compressedData.length}`,
    )

    // Example compression reduction observed:
    // minifiedData.length: 3533324
    // compressedData.length: 129308
    // reduction to: 3.66 %
    console.log(
      `reduction to: ${((compressedData.length / minInputData.length) * 100).toFixed(2)} %`,
    )

    // Write the compressed data to the output file
    await writeFile(outputFilePath, compressedData)
    const readData: Buffer = await readFile(outputFilePath)

    const unzippedData: Buffer = await gunzip(readData)

    const parsedData = JSON.stringify(unzippedData)

    expect(minInputData.length).toBe(parsedData.length)

    //const parsedData = JSON.parse(unzippedData.toString('utf8'))

    //expect(parsedData).toBe(minInputData)
  })
})
