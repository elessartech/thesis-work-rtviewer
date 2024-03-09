import Main from './components/Main'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
// @ts-ignore
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import dicomParser from 'dicom-parser'
import { init as csRenderInit } from '@cornerstonejs/core'
import { init as csToolsInit } from '@cornerstonejs/tools'

const maxWebWorkers = 1
const config = {
    maxWebWorkers,
    startWebWorkersOnDemand: false,
    taskConfiguration: {
        decodeTask: {
            initializeCodecsOnStartup: false,
            strict: false,
        },
    },
}
cornerstoneDICOMImageLoader.external.cornerstone = cornerstone
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser
cornerstoneDICOMImageLoader.webWorkerManager.initialize(config)
cornerstone.init()
cornerstoneTools.init()
csRenderInit()
csToolsInit()

function App() {
    return (
        <div className="App">
            <Main />
        </div>
    )
}

export default App
