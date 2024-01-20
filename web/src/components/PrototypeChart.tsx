/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LineChart } from '@mui/x-charts/LineChart'
export type PrototypeChartProps = object

export function PrototypeChart(): React.JSX.Element {
  return (
    <LineChart
      xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
      series={[
        {
          data: [2, 5.5, 2, 8.5, 1.5, 5],
        },
      ]}
      width={500}
      height={300}
    />
  )
}
