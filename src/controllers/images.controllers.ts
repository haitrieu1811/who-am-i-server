import { Request, Response } from 'express'

import { ServeImageRequestParams } from '~/models/requests/utils.requests'
import mediasService from '~/services/images.services'
import { sendFileFromS3 } from '~/utils/s3'

// Tải ảnh lên
export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadImages(req)
  res.json({
    message: 'Tải ảnh lên thành công.',
    data: result
  })
}

// Lấy ảnh từ AWS S3
export const serveImageController = async (req: Request<ServeImageRequestParams>, res: Response) => {
  const { name } = req.params
  sendFileFromS3(res, `images/${name}`)
}
