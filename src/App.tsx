import { Box, ChakraProvider } from '@chakra-ui/react'
import Viewer from './components/Viewer/Viewer'
import useInitCornerstone from './hooks/useInitCornerstone'
import theme from './theme'

function App() {
    const { loading } = useInitCornerstone()
    return (
        <ChakraProvider theme={theme}>
            <Box>{!loading && <Viewer />}</Box>
        </ChakraProvider>
    )
}

export default App
