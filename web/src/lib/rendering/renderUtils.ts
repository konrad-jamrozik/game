import type { SxProps, Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import _ from 'lodash'
import type { AgentState, Assets, MissionState } from '../codesync/GameState'
import { agentStateColors } from './renderAgentState'
import { assetNameColors } from './renderAssets'
import { missionStateColors } from './renderMissionState'

export const defaultComponentHeight = 600

// In Chrome DevTools Settings / Devices:
// Legend: Width x Height (pixel ratio)
// Mobile S: 320px x _
// "My 15.6'' Razer laptop": 1536px x 695px
// "Pixel 5": 393px x 850px (2.75)
export const defaultComponentMinWidth = '250px'

type MiscValues = 'Cost' | 'Difficulty'

type AllStylableValues = keyof Assets | AgentState | MissionState | MiscValues

export const miscColors: { [key in MiscValues]: string } = {
  Cost: 'red',
  Difficulty: 'red',
}

const allColors: { [key in AllStylableValues]: string } = {
  ...assetNameColors,
  ...agentStateColors,
  ...missionStateColors,
  ...miscColors,
}

export function getSx(key: AllStylableValues): SxProps<Theme> {
  return { color: allColors[key] }
}

export function sxClassesFromColors(
  valueToColorMap: Partial<{
    [key in AllStylableValues]: string
  }>,
): SystemStyleObject<Theme> {
  const valueToColorPairs: [string, { color: string }][] = _.map(
    valueToColorMap,
    (color, valueToStyle) => [`& .${valueToStyle}`, { color }],
  ) as [string, { color: string }][]
  const sxClasses = Object.fromEntries(valueToColorPairs)
  return sxClasses as SystemStyleObject<Theme>
}

// Future work: I might like to have a list of all the GameState type property keys
// (recursively over all its children, including Assets property keys etc.)
// for compile-time exhaustiveness checking to ensure all GameState properties
// have rendering logic defined for them.
//
// To do that, I could leverage 'keyof' and 'Uncapitalize':
// https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
// https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
// And if I want to pick a subset:
// https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
// One idea is to have a function that takes as input GameState
// schema and requires defining a type for each each key.
// Like "GameStateRenderData" or similar.
// In pseudocode:
// For each key in GameState, recursively, define a function
// that takes as input an array of its value type (so for Money key it is going to be number[])
// and returns RenderData type, which says how to compute it and metadata like label and color.
// Note I said "array of its value type" because it is going to be an array of all its occurrences
// over time.
