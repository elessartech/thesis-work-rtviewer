import { useEffect, useState, useRef } from 'react'
import { RenderingEngine } from '@cornerstonejs/core'
import { IRenderingEngine } from '@cornerstonejs/core/dist/esm/types'
import { fetchImageIds } from '../../helpers/fetchImageIds'
import {
    renderingEngineId,
    toolGroupId,
    toolGroupId2,
    synchronizerId,
} from '../../constants'
import * as cornerstoneTools from '@cornerstonejs/tools'
import { CrosshairsTool } from '@cornerstonejs/tools'
import useSetUpViewports from '../../hooks/useSetUpViewports'

const {
    ToolGroupManager,
    Enums: csToolsEnums,
    WindowLevelTool,
    RectangleROITool,
    LengthTool,
    AngleTool,
    CircleROITool,
    PlanarFreehandContourSegmentationTool,
    synchronizers,
    BrushTool,
    Synchronizer,
} = cornerstoneTools

const { createSlabThicknessSynchronizer } = synchronizers

const Viewer = () => {
    const threeDCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const sagitalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const coronalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const axialCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const [ctImageIds, setCtImageIds] = useState<string[]>([])
    const [renderingEngine, setRenderingEngine] =
        useState<IRenderingEngine | null>(null)
    const [activeTool, setActiveTool] = useState<string | null>(null)
    const [synchronizer, setSyncronizer] = useState<typeof Synchronizer | null>(
        null
    )

    useEffect(() => {
        if (ctImageIds.length === 0) {
            (async () => setCtImageIds(await fetchImageIds()))()
        } else {
            if (!renderingEngine) {
                setRenderingEngine(new RenderingEngine(renderingEngineId))
                // @ts-expect-error - ToolGroupManager is not typed
                setSyncronizer(createSlabThicknessSynchronizer(synchronizerId))
                ToolGroupManager.createToolGroup(toolGroupId)
                ToolGroupManager.createToolGroup(toolGroupId2)
            }
        }
    }, [ctImageIds, renderingEngine])

    useEffect(() => {
        if (activeTool) {
            const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
            const currActivePrimaryBtnTool =
                toolGroup.getActivePrimaryMouseButtonTool()
            if (currActivePrimaryBtnTool)
                toolGroup.setToolDisabled(currActivePrimaryBtnTool)
            toolGroup.setToolActive(activeTool, {
                bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
            })
        }
    }, [activeTool])

    useSetUpViewports({
        renderingEngine,
        synchronizer,
        axialCanvasWrapRef,
        sagitalCanvasWrapRef,
        coronalCanvasWrapRef,
        threeDCanvasWrapRef,
        ctImageIds,
    })

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

                    <button
                        onClick={() => setActiveTool(CrosshairsTool.toolName)}
                    >
                        Crosshair
                    </button>

                    <button
                        onClick={() =>
                            setActiveTool(
                                PlanarFreehandContourSegmentationTool.toolName
                            )
                        }
                    >
                        Segmentation Planar Freehand Contour Tool
                    </button>

                    <button
                        onClick={() => setActiveTool(WindowLevelTool.toolName)}
                    >
                        Window Level Tool
                    </button>

                    <button onClick={() => setActiveTool(BrushTool.toolName)}>
                        Brush tool
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

export default Viewer
