import { useEffect } from 'react'
import { fetchCTImageIds, fetchPTImageIds } from '../helpers/fetchImageIds'
import { RenderingEngine } from '@cornerstonejs/core'
import {
    renderingEngineId,
    toolGroupId,
    toolGroupId2,
    synchronizerId,
} from '../constants'
import { ToolGroupManager, synchronizers } from '@cornerstonejs/tools'

const { createSlabThicknessSynchronizer } = synchronizers

export default function useRetrieveImageIds({
    renderingEngine,
    ctImageIds,
    ptImageIds,
    setRenderingEngine,
    setCtImageIds,
    setPtImageIds,
    setSyncronizer,
}) {
    useEffect(() => {
        if (ctImageIds.length === 0) {
            ;(async () => setCtImageIds(await fetchCTImageIds()))()
        } else if (ptImageIds.length === 0) {
            ;(async () => setPtImageIds(await fetchPTImageIds()))()
        } else {
            if (!renderingEngine) {
                setRenderingEngine(new RenderingEngine(renderingEngineId))
                setSyncronizer(createSlabThicknessSynchronizer(synchronizerId))
                ToolGroupManager.createToolGroup(toolGroupId)
                ToolGroupManager.createToolGroup(toolGroupId2)
            }
        }
    }, [
        ctImageIds,
        ptImageIds,
        renderingEngine,
        setRenderingEngine,
        setCtImageIds,
        setPtImageIds,
        setSyncronizer,
    ])
}
