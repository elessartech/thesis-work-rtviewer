import { useEffect } from 'react'
import {
    axialViewportId,
    coronalViewportId,
    ptVolumeId,
    sagitalViewportId,
    volumeId,
} from '../constants'
import { setVolumesForViewports } from '@cornerstonejs/core'
import setCtTransferFunctionForVolumeActor from '../domain/setCtTransferFunctionForVolumeActor'
import setPetColorMapTransferFunctionForVolumeActor from '../domain/setPetColorMapTransferFunctionForVolumeActor'

export default function useTogglePetModality({ renderingEngine, isFused }) {
    useEffect(() => {
        if (renderingEngine) {
            const axialViewport = renderingEngine.getViewport(axialViewportId)
            const sagittalViewport =
                renderingEngine.getViewport(sagitalViewportId)
            const coronalViewport =
                renderingEngine.getViewport(coronalViewportId)
            if (axialViewport && sagittalViewport && coronalViewport) {
                if (!isFused) {
                    axialViewport.removeVolumeActors([ptVolumeId], true)
                    sagittalViewport.removeVolumeActors([ptVolumeId], true)
                    coronalViewport.removeVolumeActors([ptVolumeId], true)
                    ;(async () =>
                        await setVolumesForViewports(
                            renderingEngine,
                            [
                                {
                                    volumeId: volumeId,
                                    callback:
                                        setCtTransferFunctionForVolumeActor,
                                },
                            ],
                            [
                                axialViewportId,
                                sagitalViewportId,
                                coronalViewportId,
                            ]
                        ))()
                    renderingEngine.renderViewports([
                        axialViewportId,
                        sagitalViewportId,
                        coronalViewportId,
                    ])
                } else {
                    (async () =>
                        await setVolumesForViewports(
                            renderingEngine,
                            [
                                {
                                    volumeId: ptVolumeId,
                                    callback:
                                        setPetColorMapTransferFunctionForVolumeActor,
                                },
                            ],
                            [
                                axialViewportId,
                                sagitalViewportId,
                                coronalViewportId,
                            ]
                        ))()
                    renderingEngine.renderViewports([
                        axialViewportId,
                        sagitalViewportId,
                        coronalViewportId,
                    ])
                }
            }
        }
    }, [isFused, renderingEngine])
}
