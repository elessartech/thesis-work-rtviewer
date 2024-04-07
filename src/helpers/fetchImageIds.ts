import createImageIdsAndCacheMetaData from '../domain/createImageIdsAndCacheMetaData'

const fetchCTImageIds = async () => {
    const wadoRsRoot = 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb'
    const StudyInstanceUID =
        '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463'
    const ctImageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID,
        SeriesInstanceUID:
            '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
        wadoRsRoot,
    })
    return ctImageIds
}

const fetchPTImageIds = async () => {
    const wadoRsRoot = 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb'
    const StudyInstanceUID =
        '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463'
    const ptImageIds = await createImageIdsAndCacheMetaData({
        StudyInstanceUID,
        SeriesInstanceUID:
            '1.3.6.1.4.1.14519.5.2.1.7009.2403.879445243400782656317561081015',
        wadoRsRoot,
    })
    return ptImageIds
}

export { fetchCTImageIds, fetchPTImageIds }
