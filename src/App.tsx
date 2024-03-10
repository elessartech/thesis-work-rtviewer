import { useEffect, useState } from 'react'
import Main from './components/Main'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import dicomParser from 'dicom-parser'
import { volumeLoader } from '@cornerstonejs/core'
import {
    cornerstoneStreamingImageVolumeLoader,
    cornerstoneStreamingDynamicImageVolumeLoader,
} from '@cornerstonejs/streaming-image-volume-loader'
import ptScallingMetaProvider from './ptScallingMetaProvider'

function App() {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        if (loading) {
            ;(async () => initCornerstone())()
        }
    }, [loading])
    const initCornerstone = async () => {
        const { calibratedPixelSpacingMetadataProvider } = cornerstone.utilities
        const { preferSizeOverAccuracy, useNorm16Texture } =
            cornerstone.getConfiguration().rendering

        cornerstone.metaData.addProvider(
            ptScallingMetaProvider.get.bind(ptScallingMetaProvider),
            11000
        )
        cornerstone.metaData.addProvider(
            calibratedPixelSpacingMetadataProvider.get.bind(
                calibratedPixelSpacingMetadataProvider
            ),
            10000
        )

        volumeLoader.registerUnknownVolumeLoader(
            cornerstoneStreamingImageVolumeLoader
        )
        volumeLoader.registerVolumeLoader(
            'cornerstoneStreamingImageVolume',
            cornerstoneStreamingImageVolumeLoader
        )
        volumeLoader.registerVolumeLoader(
            'cornerstoneStreamingDynamicImageVolume',
            cornerstoneStreamingDynamicImageVolumeLoader
        )

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
        cornerstoneDICOMImageLoader.configure({
            useWebWorkers: true,
            decodeConfig: {
                convertFloatPixelDataToInt: false,
                use16BitDataType: preferSizeOverAccuracy || useNorm16Texture,
            },
        })
        cornerstoneDICOMImageLoader.webWorkerManager.initialize(config)
        await cornerstone.init()
        await cornerstoneTools.init()
        setLoading(false)
    }
    return <div className="App">{!loading && <Main />}</div>
}

export default App
