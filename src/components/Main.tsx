import { useEffect, useState, useRef } from 'react'
import {
    Enums,
    RenderingEngine,
    setVolumesForViewports,
    volumeLoader,
} from '@cornerstonejs/core'
import { ViewportType } from '@cornerstonejs/core/dist/esm/enums'
import { IRenderingEngine } from '@cornerstonejs/core/dist/esm/types'
import { fetchImageIds } from '../helpers/data/fetchImageIds'
import {
    renderingEngineId,
    axialViewportId,
    sagitalViewportId,
    coronalViewportId,
    volumeId,
    toolGroupId,
    segmentationId,
    stackImageSyncronizerId,
} from '../constants'
import {
    AngleTool,
    BidirectionalTool,
    BrushTool,
    CircleROITool,
    EllipticalROITool,
    LengthTool,
    PanTool,
    ProbeTool,
    RectangleROITool,
    SegmentationDisplayTool,
    StackScrollMouseWheelTool,
    SynchronizerManager,
    ToolGroupManager,
    WindowLevelTool,
    ZoomTool,
    addTool,
    segmentation,
} from '@cornerstonejs/tools'
import {
    MouseBindings,
    SegmentationRepresentations,
} from '@cornerstonejs/tools/dist/esm/enums'
import { createStackImageSynchronizer } from '@cornerstonejs/tools/dist/esm/synchronizers'

const Main = () => {
    const sagitalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const coronalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const axialCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const sagitalPetCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const coronalPetCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const axialPetCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const [ctImageIds, setCtImageIds] = useState<string[]>([])
    const [renderingEngine, setRenderingEngine] =
        useState<IRenderingEngine | null>(null)
    const [activeTool, setActiveTool] = useState<string | null>(null)
    
    useEffect(() => {
        if (ctImageIds.length === 0) {
            ;(async () => setCtImageIds(await fetchImageIds()))()
        } else {
            if (!renderingEngine) {
                setRenderingEngine(new RenderingEngine(renderingEngineId))
                addTools()
            }
        }
    }, [ctImageIds])

    useEffect(() => {
        if (renderingEngine) {
            ;(async () => await setImage())()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderingEngine])

    useEffect(() => {
        if (activeTool) {
            const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
            const currActivePrimaryBtnTool = toolGroup.getActivePrimaryMouseButtonTool();
            console.log(currActivePrimaryBtnTool)
            if (currActivePrimaryBtnTool) toolGroup.setToolDisabled(currActivePrimaryBtnTool);
            console.log(activeTool)
            toolGroup.setToolActive(activeTool, {
                bindings: [{ mouseButton: MouseBindings.Primary }],
            });
        }
    }, [activeTool])

    const addTools = () => {
        ToolGroupManager.createToolGroup(toolGroupId)
        addTool(SegmentationDisplayTool)
        addTool(BrushTool)
        addTool(StackScrollMouseWheelTool)
        addTool(WindowLevelTool)
        addTool(BidirectionalTool)
        addTool(RectangleROITool)
        addTool(EllipticalROITool)
        addTool(PanTool)
        addTool(LengthTool)
        addTool(ProbeTool)
        addTool(ZoomTool)
        addTool(AngleTool)
        addTool(CircleROITool)
    }

    const setImage = async () => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
        toolGroup.addTool(StackScrollMouseWheelTool.toolName, { loop: true })
        toolGroup.addTool(WindowLevelTool.toolName)
        toolGroup.addTool(PanTool.toolName)
        toolGroup.addTool(ZoomTool.toolName)
        toolGroup.addTool(AngleTool.toolName)
        toolGroup.addTool(LengthTool.toolName)
        toolGroup.addTool(CircleROITool.toolName)
        toolGroup.addTool(RectangleROITool.toolName)
        toolGroup.setToolEnabled(StackScrollMouseWheelTool.toolName)
        toolGroup.setToolActive(StackScrollMouseWheelTool.toolName)
        toolGroup.setToolActive(WindowLevelTool.toolName, {
            bindings: [
                {
                    mouseButton: MouseBindings.Primary, // Left Click
                },
            ],
        })
        toolGroup.setToolActive(PanTool.toolName, {
            bindings: [
                {
                    mouseButton: MouseBindings.Auxiliary, // Middle Click
                },
            ],
        })
        toolGroup.setToolActive(ZoomTool.toolName, {
            bindings: [
                {
                    mouseButton: MouseBindings.Secondary, // Right Click
                },
            ],
        })
        createStackImageSynchronizer(stackImageSyncronizerId)
        const axialViewportElement = axialCanvasWrapRef.current
        const sagitalViewportElement = sagitalCanvasWrapRef.current
        const coronalViewportElement = coronalCanvasWrapRef.current
        const viewportInput = [
            {
                viewportId: axialViewportId,
                type: ViewportType.ORTHOGRAPHIC,
                element: axialViewportElement,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.AXIAL,
                },
            },
            {
                viewportId: sagitalViewportId,
                type: ViewportType.ORTHOGRAPHIC,
                element: sagitalViewportElement,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.SAGITTAL,
                },
            },
            {
                viewportId: coronalViewportId,
                type: ViewportType.ORTHOGRAPHIC,
                element: coronalViewportElement,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.CORONAL,
                },
            },
        ]
        const volume = await volumeLoader.createAndCacheVolume(volumeId, {
            imageIds: ctImageIds,
        })
        await volumeLoader.createAndCacheDerivedVolume(volumeId, {
            volumeId: segmentationId,
        })
        const synchronizer = SynchronizerManager.getSynchronizer(
            stackImageSyncronizerId
        )
        if (!synchronizer) {
            return
        }
        segmentation.addSegmentations([
            {
                segmentationId,
                representation: {
                    type: SegmentationRepresentations.Labelmap,
                    data: {
                        volumeId: segmentationId,
                    },
                },
            },
        ])
        renderingEngine.setViewports(viewportInput)
        toolGroup.addViewport(axialViewportId, renderingEngineId)
        toolGroup.addViewport(sagitalViewportId, renderingEngineId)
        toolGroup.addViewport(coronalViewportId, renderingEngineId)
        synchronizer.add({ renderingEngineId, viewportId: axialViewportId })
        synchronizer.add({ renderingEngineId, viewportId: sagitalViewportId })
        synchronizer.add({ renderingEngineId, viewportId: coronalViewportId })
        volume.load()
        await setVolumesForViewports(
            renderingEngine,
            [{ volumeId }],
            [axialViewportId, sagitalViewportId, coronalViewportId]
        )
        await segmentation.addSegmentationRepresentations(toolGroupId, [
            {
                segmentationId,
                type: SegmentationRepresentations.Labelmap,
            },
        ])
        renderingEngine.renderViewports([
            axialViewportId,
            sagitalViewportId,
            coronalViewportId,
        ])
    }

    return (
        <div className="wrapper">
            <div className="container">
                <div className="tool-container">
                    <button onClick={() => setActiveTool(AngleTool.toolName)}>
                        Angle
                    </button>
                    <button onClick={() => setActiveTool(LengthTool.toolName)}>
                        Length
                    </button>
                    <button
                        onClick={() =>
                            setActiveTool(CircleROITool.toolName)
                        }
                    >
                        Circle
                    </button>
                    <button
                        onClick={() => setActiveTool(RectangleROITool.toolName)}
                    >
                        Rectangle
                    </button>
                </div>
            </div>
            <div
                className="container"
                style={{ display: 'flex', flexDirection: 'row' }}
            >
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={axialCanvasWrapRef}
                    style={{
                        width: '512px',
                        height: '512px',
                        margin: 'auto 1em',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                ></div>
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={sagitalCanvasWrapRef}
                    style={{
                        width: '512px',
                        height: '512px',
                        margin: 'auto 1em',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                ></div>
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={coronalCanvasWrapRef}
                    style={{
                        width: '512px',
                        height: '512px',
                        margin: 'auto 1em',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                ></div>
            </div>
            <div
                className="container"
                style={{ display: 'flex', flexDirection: 'row' }}
            >
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={axialPetCanvasWrapRef}
                    style={{
                        width: '512px',
                        height: '512px',
                        margin: 'auto 1em',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                ></div>
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={sagitalPetCanvasWrapRef}
                    style={{
                        width: '512px',
                        height: '512px',
                        margin: 'auto 1em',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                ></div>
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={coronalPetCanvasWrapRef}
                    style={{
                        width: '512px',
                        height: '512px',
                        margin: 'auto 1em',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                ></div>
            </div>
        </div>
    )
}

export default Main
