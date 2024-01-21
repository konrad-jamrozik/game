// Copy-pasted from:
// https://github.com/mui/mui-x/blob/70f236bd78b9dbcc1f138644018d06996412d2b9/packages/x-charts/src/models/helpers.ts#L1
// As it is not exported:
// https://github.com/mui/mui-x/blob/70f236bd78b9dbcc1f138644018d06996412d2b9/packages/x-charts/src/models/index.ts
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>
