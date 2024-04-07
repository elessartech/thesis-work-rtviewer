import { useEffect } from 'react'
import { toolGroupId } from '../constants'
import * as cornerstoneTools from '@cornerstonejs/tools'
const { ToolGroupManager, Enums: csToolsEnums } = cornerstoneTools

export default function useSelectActiveTool({ activeTool }) {
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
}
