export type AIPlayerOption = 'Basic' | 'DoNothing'

export const aiPlayerOptionLabel: {
  [key in AIPlayerOption]: string
} = {
  Basic: 'Basic',
  DoNothing: 'Do nothing',
}
