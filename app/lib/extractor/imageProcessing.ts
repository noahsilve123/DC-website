import { PreprocessingOptions } from './types'

const DEFAULT_OPTIONS: PreprocessingOptions = {
  targetWidth: 2000,
  gamma: 1.2,
  binarizationMethod: 'none',
}

const toGrayscale = (data: Uint8ClampedArray) => {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
}

const maximizeContrast = (data: Uint8ClampedArray) => {
  let min = 255
  let max = 0

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i]
    if (val < min) min = val
    if (val > max) max = val
  }

  if (max === min) return

  const scale = 255 / (max - min)

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i]
    const newVal = (val - min) * scale
    data[i] = newVal
    data[i + 1] = newVal
    data[i + 2] = newVal
  }
}

export const processImageForOCR = async (
  file: File,
  onProgress: (msg: string) => void,
  options: PreprocessingOptions = {},
): Promise<Blob> => {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas context unavailable')

        onProgress('Optimizing resolution...')
        const minDimension = Math.min(img.width, img.height)
        let scaleFactor = 1
        if (opts.targetWidth && minDimension < opts.targetWidth) {
          scaleFactor = Math.min(2.5, opts.targetWidth / minDimension)
        }

        canvas.width = Math.round(img.width * scaleFactor)
        canvas.height = Math.round(img.height * scaleFactor)

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        onProgress('Enhancing contrast...')
        toGrayscale(data)
        maximizeContrast(data)

        ctx.putImageData(imageData, 0, 0)

        onProgress('Finalizing image buffer...')
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Image processing failed'))
        }, 'image/png')
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}
