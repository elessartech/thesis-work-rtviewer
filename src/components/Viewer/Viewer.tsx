import { useState, useRef } from 'react'
import { IRenderingEngine } from '@cornerstonejs/core/dist/esm/types'
import { FaAdjust, FaAngleDown, FaRegCircle } from 'react-icons/fa'
import * as cornerstoneTools from '@cornerstonejs/tools'
import { CrosshairsTool } from '@cornerstonejs/tools'
import useSetUpViewports from '../../hooks/useSetUpViewports'
import { Box, Button, HStack, useTheme, VStack } from '@chakra-ui/react'
import { TbRulerMeasure } from 'react-icons/tb'
import { MdOutlineRectangle } from 'react-icons/md'
import { PiLineSegmentsBold } from 'react-icons/pi'
import { FaLocationCrosshairs } from 'react-icons/fa6'
import { IoIosBrush } from 'react-icons/io'
import useTogglePetModality from '../../hooks/useTogglePetModality'
import useSelectActiveTool from '../../hooks/useSelectActiveTool'
import useRetrieveImageIds from '../../hooks/useRetrieveImageIds'
const {
    WindowLevelTool,
    RectangleROITool,
    LengthTool,
    AngleTool,
    CircleROITool,
    PlanarFreehandContourSegmentationTool,
    BrushTool,
    Synchronizer,
} = cornerstoneTools

const Viewer = () => {
    const theme = useTheme()
    const threeDCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const sagitalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const coronalCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const axialCanvasWrapRef = useRef<HTMLDivElement | null>(null)
    const [ctImageIds, setCtImageIds] = useState<string[]>([])
    const [ptImageIds, setPtImageIds] = useState<string[]>([])
    const [renderingEngine, setRenderingEngine] =
        useState<IRenderingEngine | null>(null)
    const [activeTool, setActiveTool] = useState<string | null>(null)
    const [synchronizer, setSyncronizer] = useState<typeof Synchronizer | null>(
        null
    )
    const [isFused, setIsFused] = useState<boolean>(false)

    useRetrieveImageIds({
        renderingEngine,
        ctImageIds,
        ptImageIds,
        setRenderingEngine,
        setCtImageIds,
        setPtImageIds,
        setSyncronizer,
    })

    useSelectActiveTool({ activeTool })

    useSetUpViewports({
        renderingEngine,
        synchronizer,
        axialCanvasWrapRef,
        sagitalCanvasWrapRef,
        coronalCanvasWrapRef,
        threeDCanvasWrapRef,
        ctImageIds,
        setActiveTool,
        ptImageIds,
    })

    useTogglePetModality({ renderingEngine, isFused })

    return (
        <VStack spacing="4" align="center" mb="4" mt="4">
            <HStack spacing="4">
                <Button
                    onClick={() => setIsFused(!isFused)}
                    bg={
                        isFused
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{
                        bg: !isFused
                            ? theme.colors.customGreen
                            : theme.colors.customPurple,
                    }}
                >
                    Toggle PET
                </Button>
                <Button
                    leftIcon={<FaAngleDown />}
                    onClick={() => setActiveTool(AngleTool.toolName)}
                    bg={
                        activeTool === AngleTool.toolName
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
                >
                    Angle
                </Button>
                <Button
                    leftIcon={<TbRulerMeasure />}
                    onClick={() => setActiveTool(LengthTool.toolName)}
                    bg={
                        activeTool === LengthTool.toolName
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
                >
                    Length
                </Button>
                <Button
                    leftIcon={<FaRegCircle />}
                    onClick={() => setActiveTool(CircleROITool.toolName)}
                    bg={
                        activeTool === CircleROITool.toolName
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
                >
                    Circle
                </Button>
                <Button
                    leftIcon={<MdOutlineRectangle />}
                    onClick={() => setActiveTool(RectangleROITool.toolName)}
                    bg={
                        activeTool === RectangleROITool.toolName
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
                >
                    Rectangle
                </Button>
                <Button
                    leftIcon={<FaLocationCrosshairs />}
                    onClick={() => setActiveTool(CrosshairsTool.toolName)}
                    bg={
                        activeTool === CrosshairsTool.toolName
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
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
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
                >
                    Segmentation
                </Button>
                <Button
                    leftIcon={<FaAdjust />}
                    onClick={() => setActiveTool(WindowLevelTool.toolName)}
                    bg={
                        activeTool === WindowLevelTool.toolName
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
                >
                    Window Level
                </Button>
                <Button
                    leftIcon={<IoIosBrush />}
                    onClick={() => setActiveTool(BrushTool.toolName)}
                    bg={
                        activeTool === BrushTool.toolName
                            ? theme.colors.customGreen
                            : theme.colors.customPurple
                    }
                    color={theme.colors.customWhite}
                    _hover={{ bg: theme.colors.customGreen }}
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
                    border={`3px solid ${theme.colors.customPurple}`}
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={theme.colors.customDark}
                ></Box>
                <Box
                    className="viewportElement"
                    ref={sagitalCanvasWrapRef}
                    w="480px"
                    h="480px"
                    border={`3px solid ${theme.colors.customPurple}`}
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={theme.colors.customDark}
                ></Box>
            </HStack>
            <HStack spacing="4">
                <Box
                    className="viewportElement"
                    ref={coronalCanvasWrapRef}
                    w="480px"
                    h="480px"
                    border={`3px solid ${theme.colors.customPurple}`}
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={theme.colors.customDark}
                ></Box>
                <Box
                    className="viewportElement"
                    ref={threeDCanvasWrapRef}
                    w="480px"
                    h="480px"
                    border={`3px solid ${theme.colors.customPurple}`}
                    padding="5px"
                    onContextMenu={(e) => e.preventDefault()}
                    bg={theme.colors.customDark}
                ></Box>
            </HStack>
        </VStack>
    )
}

export default Viewer
