import _ from 'lodash'
import { logIds } from './renderGameEvent'

export function formatString(
  template: string,
  ids?: number[] | undefined,
  targetId?: number | undefined,
): string {
  let formatted = template
  if (!_.isNil(ids)) {
    if (!_.isEmpty(ids)) {
      for (const index of _.rangeRight(ids.length)) {
        formatted = _.replace(
          formatted,
          `$IDs[${index}]`,
          ids[index]!.toString(),
        )
      }
    }
    formatted = _.replace(formatted, '$IDs[1..]', logIds(ids.slice(1)))
    formatted = _.replace(formatted, '$IDs', logIds(ids))
  }
  if (!_.isNil(targetId)) {
    formatted = _.replace(formatted, '$TargetID+1', (targetId + 1).toString())
    formatted = _.replace(formatted, '$TargetID', targetId.toString())
  }
  return formatted
}
