import { useEffect, useState, useRef } from 'react'
import { RenderingEngine } from '@cornerstonejs/core'
import { IRenderingEngine } from '@cornerstonejs/core/dist/esm/types'
import { fetchImageIds } from '../../helpers/fetchImageIds'
import { FaAdjust, FaAngleDown, FaRegCircle } from 'react-icons/fa'
import {
    renderingEngineId,
    toolGroupId,
    toolGroupId2,
    synchronizerId,
} from '../../constants'
import * as cornerstoneTools from '@cornerstonejs/tools'
import { CrosshairsTool } from '@cornerstonejs/tools'
import useSetUpViewports from '../../hooks/useSetUpViewports'
import { Box, Button, HStack, VStack } from '@chakra-ui/react'
import { TbRulerMeasure } from 'react-icons/tb'
import { MdOutlineRectangle } from 'react-icons/md'
import { PiLineSegmentsBold } from 'react-icons/pi'
import { FaLocationCrosshairs } from 'react-icons/fa6'
import { IoIosBrush } from 'react-icons/io'

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
                // @ts-expect-error - Synchronizer is badly typed
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
        setActiveTool,
    })

    return (
        <VStack spacing="4" align="center" mb="4" mt="4">
            <HStack spacing="4">
                <Button
                    leftIcon={<FaAngleDown />}
                    onClick={() => setActiveTool(AngleTool.toolName)}
                    bg={
                        activeTool === AngleTool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Angle
                </Button>
                <Button
                    leftIcon={<TbRulerMeasure />}
                    onClick={() => setActiveTool(LengthTool.toolName)}
                    bg={
                        activeTool === LengthTool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Length
                </Button>
                <Button
                    leftIcon={<FaRegCircle />}
                    onClick={() => setActiveTool(CircleROITool.toolName)}
                    bg={
                        activeTool === CircleROITool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Circle
                </Button>
                <Button
                    leftIcon={<MdOutlineRectangle />}
                    onClick={() => setActiveTool(RectangleROITool.toolName)}
                    bg={
                        activeTool === RectangleROITool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Rectangle
                </Button>
                <Button
                    leftIcon={<FaLocationCrosshairs />}
                    onClick={() => setActiveTool(CrosshairsTool.toolName)}
                    bg={
                        activeTool === CrosshairsTool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Crosshair
                </Button>
                <Button
                    leftIcon={<PiLineSegmentsBold />}
                    onClick={() =>
                        setActiveTool(
                            PlanarFreehandContourSegmentationTool.toolName
                        )
                    }
                    bg={
                        activeTool ===
                        PlanarFreehandContourSegmentationTool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Segmentation
                </Button>
                <Button
                    leftIcon={<FaAdjust />}
                    onClick={() => setActiveTool(WindowLevelTool.toolName)}
                    bg={
                        activeTool === WindowLevelTool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Window Level
                </Button>
                <Button
                    leftIcon={<IoIosBrush />}
                    onClick={() => setActiveTool(BrushTool.toolName)}
                    bg={
                        activeTool === BrushTool.toolName
                            ? '#1b7d42'
                            : '#7d1b56'
                    }
                    color="#fff"
                    _hover={{ bg: '#1b7d42' }}
                >
                    Brush
                </Button>
            </HStack>
            <HStack spacing="4">
                <Box
                    className="viewportElement"
                    ref={axialCanvasWrapRef}
                    w="480px"
                    h="480px"
                    border="3px solid #7d1b56"
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={'#000'}
                ></Box>
                <Box
                    className="viewportElement"
                    ref={sagitalCanvasWrapRef}
                    w="480px"
                    h="480px"
                    border="3px solid #7d1b56"
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={'#000'}
                ></Box>
            </HStack>
            <HStack spacing="4">
                <Box
                    className="viewportElement"
                    ref={coronalCanvasWrapRef}
                    w="480px"
                    h="480px"
                    border="3px solid #7d1b56"
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={'#000'}
                ></Box>
                <Box
                    className="viewportElement"
                    ref={threeDCanvasWrapRef}
                    w="480px"
                    h="480px"
                    border="3px solid #7d1b56"
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={'#000'}
                ></Box>
            </HStack>
        </VStack>
    )
}

export default Viewer
