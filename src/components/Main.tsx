import { useEffect, useState, useRef } from 'react'
import {
    Enums,
    RenderingEngine,
    setVolumesForViewports,
    volumeLoader,
    CONSTANTS
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
} from '../constants'
import * as cornerstoneTools from '@cornerstonejs/tools';
import {
    MouseBindings,
    SegmentationRepresentations,
} from '@cornerstonejs/tools/dist/esm/enums'
import { createStackImageSynchronizer } from '@cornerstonejs/tools/dist/esm/synchronizers'
import setCtTransferFunctionForVolumeActor from '../helpers/metadata/setCtTransferFunctionForVolumeActor'
import addManipulationBindings from '../helpers/metadata/addManipulationBindings'

const {
    addTool,
    SegmentationDisplayTool,
    ToolGroupManager,
    Enums: csToolsEnums,
    segmentation,
    BrushTool,
    PanTool,
    ZoomTool,
    StackScrollMouseWheelTool,
    WindowLevelTool,
    BidirectionalTool,
    RectangleROITool,
    EllipticalROITool,
    LengthTool,
    ProbeTool,
    AngleTool,
    CircleROITool,
    SynchronizerManager,
    PlanarFreehandContourSegmentationTool,
    SegmentSelectTool
  } = cornerstoneTools;

const Main = () => {
    const sagitalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const coronalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const axialCanvasWrapRef = useRef<HTMLDivElement | null>(null)
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
    }, [renderingEngine])

    useEffect(() => {
        if (activeTool) {
            const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
            const currActivePrimaryBtnTool = toolGroup.getActivePrimaryMouseButtonTool();
            if (currActivePrimaryBtnTool) toolGroup.setToolDisabled(currActivePrimaryBtnTool);
            toolGroup.setToolActive(activeTool, {
                bindings: [{ mouseButton: MouseBindings.Primary }],
            });
        }
    }, [activeTool])

    const addTools = () => {
        ToolGroupManager.createToolGroup(toolGroupId)
        addTool(PlanarFreehandContourSegmentationTool)
        addTool(SegmentationDisplayTool);
        addTool(SegmentSelectTool);
    }

    const setImage = async () => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
        toolGroup.addTool(PlanarFreehandContourSegmentationTool.toolName);
        addManipulationBindings(toolGroup);


        toolGroup.addTool(SegmentationDisplayTool.toolName);
        toolGroup.addTool(SegmentSelectTool.toolName);


        toolGroup.setToolEnabled(SegmentationDisplayTool.toolName);
        toolGroup.setToolActive(SegmentSelectTool.toolName);


        toolGroup.setToolActive(PlanarFreehandContourSegmentationTool.toolName, {
            bindings: [
              {
                mouseButton: MouseBindings.Primary,
              },
            ],
          });


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
          });
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
          ]);

        renderingEngine.setViewports(viewportInput)
        toolGroup.addViewport(axialViewportId, renderingEngineId)
        toolGroup.addViewport(sagitalViewportId, renderingEngineId)
        toolGroup.addViewport(coronalViewportId, renderingEngineId)
        //synchronizer.add({ renderingEngineId, viewportId: axialViewportId })
        //synchronizer.add({ renderingEngineId, viewportId: sagitalViewportId })
        //synchronizer.add({ renderingEngineId, viewportId: coronalViewportId })
        volume.load()

        await setVolumesForViewports(
            renderingEngine,
            [{ volumeId, callback: setCtTransferFunctionForVolumeActor }],
            [axialViewportId, sagitalViewportId, coronalViewportId]
          );
          await segmentation.addSegmentationRepresentations(
            toolGroupId,
            [
              {
                segmentationId,
                type: csToolsEnums.SegmentationRepresentations.Contour,
              },
            ]
          );

          segmentation.config.setToolGroupSpecificConfig(toolGroupId, {
            renderInactiveSegmentations: true,
            representations: {
              CONTOUR: {
                outlineWidthActive: 5,
                outlineDashActive: '10, 10',
              },
            },
          });
        
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
        </div>
    )
}

export default Main
