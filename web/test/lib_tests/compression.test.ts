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

const inputDataStr =
  '{"turns":[{"EventsUntilStartState":[],"StartState":{"IsGameOver":false,"IsGameLost":false,"IsGameWon":false,"Timeline":{"CurrentTurn":1},"Assets":{"Money":500,"Intel":0,"Funding":20,"Support":30,"CurrentTransportCapacity":4,"MaxTransportCapacity":4,"Agents":[]},"MissionSites":[],"Missions":[],"TerminatedAgents":[],"Factions":[{"Id":0,"Name":"Black Lotus cult","Power":200,"MissionSiteCountdown":3,"PowerClimb":4,"PowerAcceleration":8,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":1,"Name":"Red Dawn remnants","Power":300,"MissionSiteCountdown":3,"PowerClimb":5,"PowerAcceleration":5,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":2,"Name":"EXALT","Power":400,"MissionSiteCountdown":9,"PowerClimb":6,"PowerAcceleration":4,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":3,"Name":"Zombies","Power":100,"MissionSiteCountdown":6,"PowerClimb":1,"PowerAcceleration":20,"AccumulatedPowerAcceleration":0,"IntelInvested":0}],"UpdateCount":0},"EventsInTurn":[],"EndState":{"IsGameOver":false,"IsGameLost":false,"IsGameWon":false,"Timeline":{"CurrentTurn":1},"Assets":{"Money":500,"Intel":0,"Funding":20,"Support":30,"CurrentTransportCapacity":4,"MaxTransportCapacity":4,"Agents":[]},"MissionSites":[],"Missions":[],"TerminatedAgents":[],"Factions":[{"Id":0,"Name":"Black Lotus cult","Power":200,"MissionSiteCountdown":3,"PowerClimb":4,"PowerAcceleration":8,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":1,"Name":"Red Dawn remnants","Power":300,"MissionSiteCountdown":3,"PowerClimb":5,"PowerAcceleration":5,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":2,"Name":"EXALT","Power":400,"MissionSiteCountdown":9,"PowerClimb":6,"PowerAcceleration":4,"AccumulatedPowerAcceleration":0,"IntelInvested":0},{"Id":3,"Name":"Zombies","Power":100,"MissionSiteCountdown":6,"PowerClimb":1,"PowerAcceleration":20,"AccumulatedPowerAcceleration":0,"IntelInvested":0}],"UpdateCount":0},"AdvanceTimeEvent":null}]}'

describe('compression tests', () => {
  // eslint-disable-next-line max-statements
  test('test json-gzip compression file round-trip', async () => {
    const repoDir = path.normalize(`${import.meta.dirname}/../../..`)
    const inputFilePath = path.normalize(`${repoDir}/input.json`)
    const outputFilePath = path.normalize(`${repoDir}/output.gzip`)
    const parsedOutputFilePath = path.normalize(`${repoDir}/output.json`)

    try {
      await writeFile(inputFilePath, inputDataStr, 'utf8')
      const inputData = await readFile(inputFilePath, 'utf8')
      const minInputData = JSON.stringify(JSON.parse(inputData))
      console.log(`repo dir: '${repoDir}'`)
      console.log(
        `input file: '${inputFilePath}', minifiedData.length: ${minInputData.length}`,
      )

      // Act
      // Compress the JSON data using gzip
      const compressedData: Buffer = await gzip(minInputData)

      console.log(
        `output file: '${outputFilePath}', compressedData.length: ${compressedData.length}`,
      )

      // Example compression reduction observed:
      // minifiedData.length:   3_533_324
      // compressedData.length:   129_308
      // reduction to: 3.66 %
      //
      // or
      // minifiedData.length:   4_963_132
      // compressedData.length:   231_230
      // reduction to: 4.66 %
      // With test runtime of 351ms:
      //   Duration  3.29s (transform 150ms, setup 776ms, collect 33ms, tests 351ms, environment 1.48s, prepare 239ms)
      console.log(
        `reduction to: ${((compressedData.length / minInputData.length) * 100).toFixed(2)} %`,
      )

      // Write the compressed data to the output file
      await writeFile(outputFilePath, compressedData)
      const readData: Buffer = await readFile(outputFilePath)

      const unzippedData: Buffer = await gunzip(readData)

      const parsedData = JSON.stringify(
        JSON.parse(unzippedData.toString('utf8')),
      )

      await writeFile(parsedOutputFilePath, parsedData, 'utf8')
      expect(parsedData.length).toBe(minInputData.length)
      expect(parsedData).toBe(minInputData)
    } finally {
      const filesToDelete = [
        inputFilePath,
        outputFilePath,
        parsedOutputFilePath,
      ]
      await Promise.all(
        _.map(filesToDelete, async (file) => fs.promises.unlink(file)),
      )
    }
  })
})
