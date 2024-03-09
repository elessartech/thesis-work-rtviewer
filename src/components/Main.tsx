import { useEffect, useState, useRef } from 'react'
// @ts-ignore
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import { RenderingEngine, Enums} from '@cornerstonejs/core'
import { renderingEngineId, viewportId } from '../constants'


type UploadedFile = {
    lastModified: string
    lastModifiedDate: object
    name: string
    size: number
    type: string
    webkitRelativePath: string
}

const Main = () => {
    const uploaderRef = useRef<HTMLInputElement>(null)
    const canvasWrapRef = useRef<HTMLDivElement>(null)
    const [uploadedDataFiles, setUploadedDataFiles] = useState<UploadedFile[]>(
        []
    )
    const [ctImageIds, setCtImageIds] = useState<string[]>([])
    const [currentImageIdIdx, setCurrentImageIdIdx] = useState<number | null>(
        null
    )
    const [renderingEngine, setRenderingEngine] =
        useState<any>(null)

    useEffect(() => {
        if (uploadedDataFiles.length > 0) {
            loadFiles()
        }
    }, [uploadedDataFiles])

    useEffect(() => {
        if (ctImageIds.length > 0) {
            ;(async () => {
                await setImage()
            })()
            const canvas = canvasWrapRef.current
            canvas.onwheel = onCanvasWrapMouseWeel
        }
    }, [ctImageIds])

    useEffect(() => {
        if (currentImageIdIdx && ctImageIds.length > 0) {
            ;(async () => {
                await setImage()
            })()
        }
    }, [currentImageIdIdx])

    const loadFiles = () => {
        let fileJsonArray = []
        for (const [, file] of Object.entries(uploadedDataFiles)) {
            const fileName = parseFloat(file.webkitRelativePath.split('.')[11])
            const imageId =
                cornerstoneDICOMImageLoader.wadouri.fileManager.add(file)
            const fileJson = {
                fileName: fileName,
                imageId: imageId,
            }
            fileJsonArray.push(fileJson)
        }
        fileJsonArray.sort((a, b) => a.fileName - b.fileName)

        const imageIds = fileJsonArray.map((file) => file.imageId)
        setRenderingEngine(new RenderingEngine(renderingEngineId))
        setCurrentImageIdIdx(Math.floor(imageIds.length / 2))
        setCtImageIds(imageIds)
    }

    const uploadDataFiles = (e: any) => {
        const files = e.target.files
        setUploadedDataFiles(files)
    }

    const setImage = async () => {
        const element = canvasWrapRef.current
        const viewportInputs = [
            {
                viewportId,
                element,
                type: Enums.ViewportType.STACK,
            },
        ]
        renderingEngine.setViewports(viewportInputs)
        const viewport = renderingEngine.getViewport(
            viewportInputs[0].viewportId
        )
        // @ts-ignore
        await viewport.setStack(ctImageIds, currentImageIdIdx)
        renderingEngine.render()
    }

    const onCanvasWrapMouseWeel = (e) => {
        e.stopPropagation()
        e.preventDefault()
        if (e.deltaY < 0) {
            setCurrentImageIdIdx((idx) =>
                idx < ctImageIds.length - 1 ? idx + 1 : idx
            )
        } else {
            setCurrentImageIdIdx((idx) => (idx > 0 ? idx - 1 : idx))
        }
    }
    return (
        <div className="wrapper">
            <div className="uploader-wrapper">
                <input
                    type="file"
                    ref={uploaderRef}
                    name="fileList"
                    multiple
                    onChange={(e) => {
                        uploadDataFiles(e)
                    }}
                />
            </div>
            <div className="container">
                <div className="tool-container">
                    <button onClick={() => {}}>Angle</button>
                    <button onClick={() => {}}>Length</button>
                    <button onClick={() => {}}>Circle</button>
                    <button onClick={() => {}}>Rectangle</button>
                    <button onClick={() => {}}>Erase</button>
                </div>
                <div className="tool-container">
                    <button onClick={() => {}}>Toggle Invert</button>
                    <button onClick={() => {}}>Horizontal Flip</button>
                    <button onClick={() => {}}>Vertical Flip</button>
                    <button onClick={() => {}}>Rotate 90</button>
                </div>
            </div>
            <div className="container">
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={canvasWrapRef}
                    style={{ width: '512px', height: '512px' }}
                    onContextMenu={(e) => e.preventDefault()}
                ></div>
            </div>
        </div>
    )
}

export default Main
