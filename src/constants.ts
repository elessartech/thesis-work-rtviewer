export const renderingEngineId = 'myRenderingEngine'
export const axialViewportId = 'CT_AXIAL_STACK'
export const sagitalViewportId = 'CT_SAGITAL_STACK'
export const coronalViewportId = 'CT_CORONAL_STACK'
export const viewportId3 = 'CT_3D_STACK'
export const viewportId = 'CT_VIEWPORT'
const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'
const volumeName = 'CT_VOLUME_ID'
export const volumeId = `${volumeLoaderScheme}:${volumeName}`
export const ptVolumeName = 'PT_VOLUME_ID'
export const ptVolumeId = `${volumeLoaderScheme}:${ptVolumeName}`
export const toolGroupId = 'CT_TOOLGROUP'
export const toolGroupId2 = 'CT_TOOLGROUP2'
export const segmentationId = 'MY_SEGMENTATION_ID'
export const cameraSynchronizerId = 'CAMERA_SYNCHRONIZER_ID'
export const voiSynchronizerId = 'VOI_SYNCHRONIZER_ID'
export const synchronizerId = 'MY_SYNCHRONIZER_ID'
export const viewportColors = {
    [axialViewportId]: 'rgb(200, 0, 0)',
    [sagitalViewportId]: 'rgb(200, 200, 0)',
    [coronalViewportId]: 'rgb(0, 200, 0)',
}
