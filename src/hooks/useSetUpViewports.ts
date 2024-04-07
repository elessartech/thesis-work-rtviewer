import {
    Enums,
    setVolumesForViewports,
    volumeLoader,
    CONSTANTS,
    utilities,
    Types,
} from '@cornerstonejs/core'
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
    viewportColors,
} from '../constants'
import * as cornerstoneTools from '@cornerstonejs/tools'
import setCtTransferFunctionForVolumeActor from '../domain/setCtTransferFunctionForVolumeActor'
import addManipulationBindings from '../domain/addManipulationBindings'
import { CrosshairsTool } from '@cornerstonejs/tools'
import { useEffect, useState } from 'react'

const {
    SegmentationDisplayTool,
    ToolGroupManager,
    Enums: csToolsEnums,
    segmentation,
    WindowLevelTool,
    PlanarFreehandContourSegmentationTool,
    BrushTool
} = cornerstoneTools


export default function useSetUpViewports({renderingEngine, synchronizer, axialCanvasWrapRef, sagitalCanvasWrapRef, coronalCanvasWrapRef, threeDCanvasWrapRef, ctImageIds}) {
    const viewportReferenceLineControllable = [
        axialViewportId,
        sagitalViewportId,
        coronalViewportId,
    ];

    useEffect(() => {
        if (renderingEngine) {
            ;(async () => await setUpViewports())()
        }
    }, [renderingEngine])

    const getReferenceLineColor = (viewportId) => {
        return viewportColors[viewportId];
      }
      
      const getReferenceLineControllable= (viewportId) => {
        const index = viewportReferenceLineControllable.indexOf(viewportId);
        return index !== -1;
    }
    
    const getReferenceLineDraggableRotatable= (viewportId) => {
        const index = viewportReferenceLineControllable.indexOf(viewportId);
        return index !== -1;
    }
    
    const getReferenceLineSlabThicknessControlsOn= (viewportId) => {
        const index =
            viewportReferenceLineControllable.indexOf(viewportId);
        return index !== -1;
    }

    const setUpViewports = async () => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
        const toolGroup2 = ToolGroupManager.getToolGroup(toolGroupId2)
        toolGroup.addTool(PlanarFreehandContourSegmentationTool.toolName)
        toolGroup.addTool(WindowLevelTool.toolName)
        toolGroup.addTool(BrushTool.toolName)

        addManipulationBindings(toolGroup)
        addManipulationBindings(toolGroup2, { is3DViewport: true })

        toolGroup2.addTool(SegmentationDisplayTool.toolName)

        toolGroup2.setToolEnabled(SegmentationDisplayTool.toolName)

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

    const setUpSynchronizers = () => {
        [axialViewportId, sagitalViewportId, coronalViewportId].forEach((viewportId) => {
          synchronizer.add({
            renderingEngineId,
            viewportId,
          });
        });
        synchronizer.setEnabled(true);
    }
}