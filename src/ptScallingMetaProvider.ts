import { utilities as csUtils } from '@cornerstonejs/core'
const scalingPerImageId = {}

function addInstance(imageId, scalingMetaData) {
    const imageURI = csUtils.imageIdToURI(imageId)
    scalingPerImageId[imageURI] = scalingMetaData
}

function get(type, imageId) {
    const imageURI = csUtils.imageIdToURI(imageId)
    if (type === 'scalingModule') {
        return scalingPerImageId[imageURI]
    }
}

export default { addInstance, get }
