import Compressor from 'compressorjs';

/**
 * @param image 图片
 * @param backType 需要返回的类型blob,file
 * @param quality 图片压缩比 0-1,数字越小，图片压缩越小
 * @returns
 */
static compressorImage(image: File, backType?:string, quality?: number) {
  return new Promise((resolve, reject) => {
    new Compressor(image, {
      quality: quality || 0.8,
      success(result) {
        let file = new File([result], image.name, { type: image.type })

        if (!backType || backType == 'blob') {
          resolve(result)
        } else if (backType == 'file') {
          resolve(file)
        } else {
          resolve(file)
        }
      },
      error(err){
        console.log('图片压缩失败---->>>>>',err)
        reject(err)
      }
    })
  })
}
