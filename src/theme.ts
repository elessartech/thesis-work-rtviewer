import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    styles: {
        global: {
            body: {
                bg: '#160929', // Set the background color here
            },
        },
    },
    colors: {
        customGreen: '#1b7d42',
        customPurple: '#7d1b56',
        customWhite: '#f5f5f5',
        customDark: '#000000',
    },
})

export default theme
