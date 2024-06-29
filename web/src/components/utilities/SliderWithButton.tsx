/** This file was originally adapted from
 * https://mui.com/material-ui/react-slider/#slider-with-input-field
 */
import { Button, Stack, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import _ from 'lodash'
import { useState } from 'react'
import { formatString } from '../../lib/rendering/formatString'
import { Icon, type IconName } from './Icon'

const textFieldWidth = 110

export type SliderWithButtonProps = {
  readonly defaultValue: number
  readonly onClick: (value: number) => Promise<void>
  readonly minValue: number
  readonly maxValue: number
  readonly iconName: IconName
  readonly label: string
  readonly loading: boolean
}

export default function SliderWithButton(
  props: SliderWithButtonProps,
): React.JSX.Element {
  const [value, setValue] = useState(props.defaultValue)
  const clampedValue = _.clamp(value, props.minValue, props.maxValue)
  if (value !== clampedValue) {
    setValue(clampedValue)
  }

  function handleSliderChange(
    _event: Event,
    newValue: number | number[],
  ): void {
    setValue(newValue as number)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.valueAsNumber)
  }

  function handleBlur(): void {
    if (value < props.minValue) {
      setValue(props.minValue)
    } else if (value > props.maxValue) {
      setValue(props.maxValue)
    }
  }

  return (
    <Box
      sx={{
        bgcolor: 'rgba(20,20,20,0.2)',
        padding: '12px',
        borderRadius: '10px',
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Icon iconName={props.iconName} />
          <Slider
            sx={{ width: 120 }}
            value={value}
            onChange={handleSliderChange}
            min={props.minValue}
            max={props.maxValue}
            aria-labelledby="input-slider"
          />
          <TextField
            sx={{ width: textFieldWidth }}
            value={value}
            label="Amount"
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 1,
              min: props.minValue,
              max: props.maxValue,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />
        </Stack>
        <Button
          variant="contained"
          id="input-slider"
          disabled={
            props.loading ||
            value > props.maxValue ||
            value < props.minValue ||
            value === 0
          }
          onClick={async () => props.onClick(value)}
        >
          {formatString('Invest $TargetID intel', undefined, value)}
        </Button>
      </Stack>
    </Box>
  )
}
