/** This file was originally adapted from
 * https://mui.com/material-ui/react-slider/#slider-with-input-field
 */
import { Button, Stack, SvgIcon, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import { useState } from 'react'
import { assetNameColors } from '../../lib/rendering/renderAssets'
import { Icon } from '../Icon/Icon'

const textFieldWidth = 110

export type InputSliderProps = {
  readonly defaultValue: number
  readonly onClick: (value: number) => Promise<void>
  readonly minValue: number
  readonly maxValue: number
}

export default function InputSlider(
  props: InputSliderProps,
): React.JSX.Element {
  const [value, setValue] = useState(props.defaultValue)

  function handleSliderChange(event: Event, newValue: number | number[]): void {
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
          <Icon iconName="Intel" />
          <Slider
            sx={{ width: '120px' }}
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
          disabled={value > props.maxValue || value < props.minValue}
          onClick={async () => props.onClick(value)}
        >
          Invest intel
        </Button>
      </Stack>
    </Box>
  )
}
