import { useEffect, useState, useRef } from 'react'
import {
    Enums,
    RenderingEngine,
    setVolumesForViewports,
    volumeLoader,
    CONSTANTS,
    utilities,
    Types,
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
    viewportId3,
    toolGroupId2,
} from '../constants'
import * as cornerstoneTools from '@cornerstonejs/tools'
import { MouseBindings } from '@cornerstonejs/tools/dist/esm/enums'
import { createStackImageSynchronizer } from '@cornerstonejs/tools/dist/esm/synchronizers'
import setCtTransferFunctionForVolumeActor from '../helpers/metadata/setCtTransferFunctionForVolumeActor'
import addManipulationBindings from '../helpers/metadata/addManipulationBindings'

const {
    addTool,
    SegmentationDisplayTool,
    ToolGroupManager,
    Enums: csToolsEnums,
    segmentation,
    PanTool,
    WindowLevelTool,
    RectangleROITool,
    LengthTool,
    AngleTool,
    CircleROITool,
    SynchronizerManager,
    PlanarFreehandContourSegmentationTool,
    SegmentSelectTool,
} = cornerstoneTools

const Main = () => {
    const threeDCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const sagitalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const coronalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const axialCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const [ctImageIds, setCtImageIds] = useState<string[]>([])
    const [renderingEngine, setRenderingEngine] =
        useState<IRenderingEngine | null>(null)
    const [activeTool, setActiveTool] = useState<string | null>(null)

    useEffect(() => {
        if (ctImageIds.length === 0) {
            (async () => setCtImageIds(await fetchImageIds()))()
        } else {
            if (!renderingEngine) {
                setRenderingEngine(new RenderingEngine(renderingEngineId))
                addTools()
            }
        }
    }, [ctImageIds])

    useEffect(() => {
        if (renderingEngine) {
            (async () => await setImage())()
        }
    }, [renderingEngine])

    useEffect(() => {
        if (activeTool) {
            const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
            const currActivePrimaryBtnTool =
                toolGroup.getActivePrimaryMouseButtonTool()
            if (currActivePrimaryBtnTool)
                toolGroup.setToolDisabled(currActivePrimaryBtnTool)
            toolGroup.setToolActive(activeTool, {
                bindings: [{ mouseButton: MouseBindings.Primary }],
            })
        }
    }, [activeTool])

    const addTools = () => {
        ToolGroupManager.createToolGroup(toolGroupId)
        ToolGroupManager.createToolGroup(toolGroupId2)
        addTool(PlanarFreehandContourSegmentationTool)
        addTool(SegmentationDisplayTool)
        addTool(SegmentSelectTool)
    }

    const setImage = async () => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
        const toolGroup2 = ToolGroupManager.getToolGroup(toolGroupId2)
        toolGroup.addTool(PlanarFreehandContourSegmentationTool.toolName)
        toolGroup.addTool(WindowLevelTool.toolName)

        addManipulationBindings(toolGroup)
        addManipulationBindings(toolGroup2, { is3DViewport: true })

        toolGroup.addTool(SegmentationDisplayTool.toolName)
        toolGroup.addTool(SegmentSelectTool.toolName)
        toolGroup2.addTool(SegmentationDisplayTool.toolName)

        toolGroup.setToolEnabled(SegmentationDisplayTool.toolName)
        toolGroup.setToolActive(SegmentSelectTool.toolName)

        toolGroup2.setToolEnabled(SegmentationDisplayTool.toolName)

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

        toolGroup.setToolActive(
            PlanarFreehandContourSegmentationTool.toolName,
            {
                bindings: [
                    {
                        mouseButton: MouseBindings.Primary,
                    },
                ],
            }
        )

        createStackImageSynchronizer(stackImageSyncronizerId)
        const axialViewportElement = axialCanvasWrapRef.current
        const sagitalViewportElement = sagitalCanvasWrapRef.current
        const coronalViewportElement = coronalCanvasWrapRef.current
        const threeDViewportElement = threeDCanvasWrapRef.current
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
            {
                viewportId: viewportId3,
                type: ViewportType.VOLUME_3D,
                element: threeDViewportElement,
                defaultOptions: {
                    background: CONSTANTS.BACKGROUND_COLORS.slicer3D,
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
        await segmentation.addSegmentations([
            {
                segmentationId,
                representation: {
                    type: csToolsEnums.SegmentationRepresentations.Contour,
                },
            },
        ])

        renderingEngine.setViewports(viewportInput)
        toolGroup.addViewport(axialViewportId, renderingEngineId)
        toolGroup.addViewport(sagitalViewportId, renderingEngineId)
        toolGroup.addViewport(coronalViewportId, renderingEngineId)
        toolGroup2.addViewport(viewportId3, renderingEngineId)
        synchronizer.add({ renderingEngineId, viewportId: axialViewportId })
        synchronizer.add({ renderingEngineId, viewportId: sagitalViewportId })
        synchronizer.add({ renderingEngineId, viewportId: coronalViewportId })
        volume.load()

        await setVolumesForViewports(
            renderingEngine,
            [{ volumeId, callback: setCtTransferFunctionForVolumeActor }],
            [axialViewportId, sagitalViewportId, coronalViewportId, viewportId3]
        )

        const volumeActor = renderingEngine
            .getViewport(viewportId3)
            .getDefaultActor().actor as Types.VolumeActor
        utilities.applyPreset(
            volumeActor,
            CONSTANTS.VIEWPORT_PRESETS.find(
                (preset) => preset.name === 'CT-Bone'
            )
        )

        await segmentation.addSegmentationRepresentations(toolGroupId, [
            {
                segmentationId,
                type: csToolsEnums.SegmentationRepresentations.Contour,
            },
        ])

        segmentation.config.setToolGroupSpecificConfig(toolGroupId, {
            renderInactiveSegmentations: true,
            representations: {
                CONTOUR: {
                    outlineWidthActive: 5,
                    outlineDashActive: '10, 10',
                },
            },
        })

        renderingEngine.renderViewports([
            axialViewportId,
            sagitalViewportId,
            coronalViewportId,
            viewportId3,
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
                        onClick={() => setActiveTool(CircleROITool.toolName)}
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
                <div
                    id="viewportElement"
                    className="viewportElement"
                    ref={threeDCanvasWrapRef}
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
