/* eslint-disable max-statements */
import * as fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import * as zlib from 'node:zlib'
import _ from 'lodash'
import * as LZString from 'lz-string'
import { describe, expect, test } from 'vitest'

// Promisify the fs and zlib functions for better async/await support
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)

const inputDataStr =
  '{"turns":[{"EventsUntilStartState":[],"StartState":{"IsGameOver":false,"IsGameLost":false,"IsGameWon":false,"Timeline":{"CurrentTurn":1},"Assets":{"Money":500,"Intel":0,"Funding":20,"Support":30,"CurrentTransportCapacity":4,"MaxTransportCapacity":4,"Agents":[]},"MissionSites":[],"Missions":[],"TerminatedAgents":[],"Factions":[{"Id":0,"Name":"Black Lotus cult","Power":200,"MissionSiteCountdown":3,"PowerClimb":4,"PowerAcceleration":8,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":1,"Name":"Red Dawn remnants","Power":300,"MissionSiteCountdown":3,"PowerClimb":5,"PowerAcceleration":5,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":2,"Name":"EXALT","Power":400,"MissionSiteCountdown":9,"PowerClimb":6,"PowerAcceleration":4,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":3,"Name":"Zombies","Power":100,"MissionSiteCountdown":6,"PowerClimb":1,"PowerAcceleration":20,"AccumulatedPowerAcceleration":0,"IntelInvested":0}],"UpdateCount":0},"EventsInTurn":[],"EndState":{"IsGameOver":false,"IsGameLost":false,"IsGameWon":false,"Timeline":{"CurrentTurn":1},"Assets":{"Money":500,"Intel":0,"Funding":20,"Support":30,"CurrentTransportCapacity":4,"MaxTransportCapacity":4,"Agents":[]},"MissionSites":[],"Missions":[],"TerminatedAgents":[],"Factions":[{"Id":0,"Name":"Black Lotus cult","Power":200,"MissionSiteCountdown":3,"PowerClimb":4,"PowerAcceleration":8,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":1,"Name":"Red Dawn remnants","Power":300,"MissionSiteCountdown":3,"PowerClimb":5,"PowerAcceleration":5,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":2,"Name":"EXALT","Power":400,"MissionSiteCountdown":9,"PowerClimb":6,"PowerAcceleration":4,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":3,"Name":"Zombies","Power":100,"MissionSiteCountdown":6,"PowerClimb":1,"PowerAcceleration":20,"AccumulatedPowerAcceleration":0,"IntelInvested":0}],"UpdateCount":0},"AdvanceTimeEvent":null}]}'

describe('compression tests', () => {
  test('test lz-string string to local storage round-trip', async () => {
    expect.hasAssertions()

    const repoDir = path.normalize(`${import.meta.dirname}/../../..`)

    const strFromFile = await getStrFromInputFile(repoDir)

    const inputData = strFromFile.length > 0 ? strFromFile : inputDataStr

    const compressed = LZString.compressToUTF16(inputData)
    localStorage.clear()
    localStorage.setItem('compressed', compressed)
    const read = localStorage.getItem('compressed')!
    const roundTripped = LZString.decompressFromUTF16(read)

    console.log(
      `lz-string test: ` +
        `inputData.length: ${inputData.length}, compressed.length: ${compressed.length}, roundTripped.length: ${roundTripped.length}`,
    )

    logReduction(inputData.length, compressed.length)

    expect(roundTripped.length).toBe(inputData.length)
    expect(roundTripped).toBe(inputData)
  })

  test('test node:zlip:gzip string to file round-trip', async () => {
    expect.hasAssertions()

    const repoDir = path.normalize(`${import.meta.dirname}/../../..`)
    const outputFilePath = path.normalize(`${repoDir}/output.gzip`)
    const parsedOutputFilePath = path.normalize(`${repoDir}/output.json`)

    console.log(`repo dir: '${repoDir}'`)

    try {
      const strFromFile = await getStrFromInputFile(repoDir)

      const inputData = strFromFile.length > 2 ? strFromFile : inputDataStr
      console.log(
        `strFromFile.length: ${strFromFile.length}, inputData.length: ${inputData.length}`,
      )

      // Act
      // Compress the JSON data using gzip
      const compressedData: Buffer = await gzip(inputData)

      console.log(
        `output file: '${outputFilePath}', compressedData.length: ${compressedData.length}`,
      )

      // Example compression reduction observed:
      // minifiedData.length:   3_533_324
      // compressedData.length:   129_308
      // reduction to: 3.66 %
      //
      // or
      //
      // minifiedData.length:   4_963_132
      // compressedData.length:   231_230
      // reduction to: 4.66 %
      // With test runtime of 351ms:
      //   Duration  3.29s (transform 150ms, setup 776ms, collect 33ms, tests 351ms, environment 1.48s, prepare 239ms)
      logReduction(inputData.length, compressedData.length)

      // Write the compressed data to the output file
      await writeFile(outputFilePath, compressedData)
      const readData: Buffer = await readFile(outputFilePath)

      const unzippedData: Buffer = await gunzip(readData)

      const parsedData = JSON.stringify(
        JSON.parse(unzippedData.toString('utf8')),
      )

      await writeFile(parsedOutputFilePath, parsedData, 'utf8')
      expect(parsedData.length).toBe(inputData.length)
      expect(parsedData).toBe(inputData)
    } finally {
      const filesToDelete = [outputFilePath, parsedOutputFilePath]
      await Promise.all(
        _.map(filesToDelete, async (file) => fs.promises.unlink(file)),
      )
    }
  })
})

function logReduction(original: number, reduced: number): void {
  console.log(`reduction to: ${((reduced / original) * 100).toFixed(2)} %`)
}

async function getStrFromInputFile(repoDir: string): Promise<string> {
  const inputFilePath = path.normalize(`${repoDir}/input.json`)
  // check if file at inputFilePath exists
  const inputFileExists = fs.existsSync(inputFilePath)

  const rawStrFromFile = inputFileExists
    ? await readFile(inputFilePath, 'utf8')
    : '{}'

  const strFromFile = JSON.stringify(JSON.parse(rawStrFromFile))

  console.log(
    `getStrFromInputFile: input file: '${inputFilePath}', rawStrFromFile.length: ${rawStrFromFile.length}, strFromFile.length: ${strFromFile.length}`,
  )
  return strFromFile
}

// Research:
// https://pieroxy.net/blog/pages/lz-string/index.html

/*

  // Skipped as it doesn't work.
  // Based on:
  // - https://stackoverflow.com/questions/50681564/gzip-a-string-in-javascript-using-pako-js
  // - https://github.com/nodeca/pako#examples--api
  // - https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string
  // - https://chatgpt.com/c/7c58252d-c8f5-48c2-a622-32849f217372
  test.skip('test pako string round-trip', () => {
    const inputData = JSON.stringify(JSON.parse(inputDataStr))
    const compressedData = pakoInflate(inputData)
    console.log(
      `pako: inputDataStr.length: ${inputDataStr.length}, inputData.length: ${inputData.length}, compressedData.length: ${compressedData.length}`,
    )
    const decompressedData = pakoDeflate(compressedData)
    expect(decompressedData.length).toBe(inputData.length)
    expect(decompressedData).toBe(inputData)
  })

  function pakoInflate(inputStr: string): string {
    // Compress the JSON string
  
    const deflated: Uint8Array = pako.deflate(inputStr)
  
    const decoder = new TextDecoder('utf8')
    const decoded = decoder.decode(deflated)
  
    console.log(
      `compressJson: inputStr.length: ${inputStr.length}, deflated.length: ${deflated.length}, ` +
        `decoded.length: ${decoded.length}`,
    )
  
    return decoded
  }
  
  function pakoDeflate(compressedString: string): string {
    const encoder = new TextEncoder()
  
    const encoded = encoder.encode(compressedString)
  
    const inflated = pako.inflate(encoded)
  
    const decoder = new TextDecoder('utf8')
    const decoded = decoder.decode(inflated)
  
    console.log(
      `decompressJson: compressedString.length: ${compressedString.length}, encoded.length: ${encoded.length}, ` +
        `inflated.length: ${inflated.length}, decoded.length: ${decoded.length}`,
    )
    return decoded
  }

*/
