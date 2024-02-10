import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // This:
    //   include: ['@mui/material/Tooltip', '@emotion/styled', '@mui/material/Unstable_Grid2'],
    // Is to workaround this bug:
    // https://github.com/mui/material-ui/issues/32727#issuecomment-1894957054
    include: ['@mui/material/Tooltip', '@emotion/styled', '@mui/material/Unstable_Grid2'],
  },  
})
