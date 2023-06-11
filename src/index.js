module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('imgbb-uploader', {
      handle,
      name: 'Imgbb',
      config
    })
  }
  const postOptions = (Key, fileName, image) => {
    return {
      method: 'POST',
      url: 'https://api.imgbb.com/1/upload',
      headers: {
        contentType: 'multipart/form-data',
        'User-Agent': 'PicGo'
      },
      formData: {
        image: {
          value: image,
          options: {
            filename: fileName
          }
        },
        ssl: 'true',
        key: Key
      }
    }
  }
  const handle = async (ctx) => {
    const userConfig = ctx.getConfig('picBed.imgbb-uploader')
    if (!userConfig) {
      throw new Error('Can\'t find uploader config')
    }
    const Key = userConfig.Key
    const imgList = ctx.output
    for (const i in imgList) {
      let image = imgList[i].buffer
      if (!image && imgList[i].base64Image) {
        image = Buffer.from(imgList[i].base64Image, 'base64')
      }
      const postConfig = postOptions(Key, imgList[i].fileName, image)
      let body = await ctx.Request.request(postConfig)

      body = JSON.parse(body)
      if (body.status === 200) {
        delete imgList[i].base64Image
        delete imgList[i].buffer
        imgList[i].imgUrl = body.data.url
      } else {
        ctx.emit('notification', {
          title: '上传失败',
          body: body.message
        })
        throw new Error(body.message)
      }
    }
    return ctx
  }

  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.imgbb-uploader')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'Key',
        type: 'input',
        default: userConfig.Key,
        required: true,
        message: 'API key',
        alias: 'API key'
      }
    ]
  }
  return {
    uploader: 'imgbb-uploader',
    // config: config,
    register
  }
}
