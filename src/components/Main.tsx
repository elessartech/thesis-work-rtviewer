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
    viewportId3,
    toolGroupId2,
    synchronizerId,
} from '../constants'
import * as cornerstoneTools from '@cornerstonejs/tools'
import setCtTransferFunctionForVolumeActor from '../helpers/metadata/setCtTransferFunctionForVolumeActor'
import addManipulationBindings from '../helpers/metadata/addManipulationBindings'
import { CrosshairsTool } from '@cornerstonejs/tools'

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
    PlanarFreehandContourSegmentationTool,
    SegmentSelectTool,
    synchronizers
} = cornerstoneTools

const { createSlabThicknessSynchronizer } = synchronizers;

const viewportReferenceLineControllable = [
    axialViewportId,
    sagitalViewportId,
    coronalViewportId,
];

const viewportColors = {
    [axialViewportId]: 'rgb(200, 0, 0)',
    [sagitalViewportId]: 'rgb(200, 200, 0)',
    [coronalViewportId]: 'rgb(0, 200, 0)',
};


function getReferenceLineColor(viewportId) {
    return viewportColors[viewportId];
  }
  
  function getReferenceLineControllable(viewportId) {
    const index = viewportReferenceLineControllable.indexOf(viewportId);
    return index !== -1;
  }
  
  function getReferenceLineDraggableRotatable(viewportId) {
    const index = viewportReferenceLineControllable.indexOf(viewportId);
    return index !== -1;
  }
  
  function getReferenceLineSlabThicknessControlsOn(viewportId) {
    const index =
        viewportReferenceLineControllable.indexOf(viewportId);
    return index !== -1;
  }


const Main = () => {
    const threeDCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const sagitalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const coronalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const axialCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const [ctImageIds, setCtImageIds] = useState<string[]>([])
    const [renderingEngine, setRenderingEngine] =
        useState<IRenderingEngine | null>(null)
    const [activeTool, setActiveTool] = useState<string | null>(null)
    const [synchronizer, setSyncronizer] = useState<any | null>(null)

    useEffect(() => {
        if (ctImageIds.length === 0) {
            ;(async () => setCtImageIds(await fetchImageIds()))()
        } else {
            if (!renderingEngine) {
                setRenderingEngine(new RenderingEngine(renderingEngineId))
                setSyncronizer(createSlabThicknessSynchronizer(synchronizerId))
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

    const setUpSynchronizers = () => {
        [axialViewportId, sagitalViewportId, coronalViewportId].forEach((viewportId) => {
          synchronizer.add({
            renderingEngineId,
            viewportId,
          });
        });
        // Normally this would be left on, but here we are starting the demo in the
        // default state, which is to not have a synchronizer enabled.
        synchronizer.setEnabled(true);
    }

    const addTools = () => {
        ToolGroupManager.createToolGroup(toolGroupId)
        ToolGroupManager.createToolGroup(toolGroupId2)
        addTool(PlanarFreehandContourSegmentationTool)
        addTool(SegmentationDisplayTool)
        addTool(SegmentSelectTool)
        addTool(CrosshairsTool);
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
                    mouseButton: csToolsEnums.MouseBindings.Primary, // Left Click
                },
            ],
        })
        toolGroup.setToolActive(PanTool.toolName, {
            bindings: [
                {
                    mouseButton: csToolsEnums.MouseBindings.Auxiliary, // Middle Click
                },
            ],
        })

        /*toolGroup.setToolActive(
            PlanarFreehandContourSegmentationTool.toolName,
            {
                bindings: [
                    {
                        mouseButton: csToolsEnums.MouseBindings.Primary,
                    },
                ],
            }
        )*/

        const axialViewportElement = axialCanvasWrapRef.current
        const sagitalViewportElement = sagitalCanvasWrapRef.current
        const coronalViewportElement = coronalCanvasWrapRef.current
        const threeDViewportElement = threeDCanvasWrapRef.current
        const viewportInput = [
            {
                viewportId: axialViewportId,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                element: axialViewportElement,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.AXIAL,
                },
            },
            {
                viewportId: sagitalViewportId,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                element: sagitalViewportElement,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.SAGITTAL,
                },
            },
            {
                viewportId: coronalViewportId,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                element: coronalViewportElement,
                defaultOptions: {
                    orientation: Enums.OrientationAxis.CORONAL,
                },
            },
            {
                viewportId: viewportId3,
                type: Enums.ViewportType.VOLUME_3D,
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

        const isMobile = window.matchMedia('(any-pointer:coarse)').matches;

        toolGroup.addTool(CrosshairsTool.toolName, {
          getReferenceLineColor,
          getReferenceLineControllable,
          getReferenceLineDraggableRotatable,
          getReferenceLineSlabThicknessControlsOn,
          mobile: {
            enabled: isMobile,
            opacity: 0.8,
            handleRadius: 9,
          },
        });
      
        toolGroup.setToolActive(CrosshairsTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
        });
      
        setUpSynchronizers()

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
