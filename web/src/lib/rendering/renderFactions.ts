import type { factionMap } from '../codesync/GameState'

type FactionMapKeys = keyof typeof factionMap

export const factionsRenderMap: {
  [key in FactionMapKeys]: { label: string; color: string }
} = {
  0: { label: 'Black Lotus', color: 'White' },
  1: { label: 'Red Dawn', color: 'Red' },
  2: { label: 'EXALT', color: 'Blue' },
  3: { label: 'Zombies', color: 'LimeGreen' },
}
