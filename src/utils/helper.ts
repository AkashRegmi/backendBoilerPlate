import fs from 'fs'
import path from 'path'
import { UPLOAD_ROOT } from '../utils/constant'
import { getEnvironmentImageUrl } from './imageUrl'
import mongoose from 'mongoose'
import { AppError } from './error'

export const generatePassword = (length: number = 8): string => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$&*'

  if (length < 4) {
    throw new Error(
      'Password length must be at least 4 to include all character types',
    )
  }

  // Ensure at least one of each type
  let password = ''
  password += upper[Math.floor(Math.random() * upper.length)]
  password += lower[Math.floor(Math.random() * lower.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly from all types
  const all = upper + lower + numbers + special
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle password so the first 4 characters aren't predictable
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')

  return password
}

export const moveFile = (
  file: Express.Multer.File,
  destFolder: string,
): string => {
  const targetDir = path.join(UPLOAD_ROOT, destFolder)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }
  const fileName = path.basename(file.path)
  const targetPath = path.join(targetDir, fileName)
  fs.renameSync(file.path, targetPath)
  return path.join(destFolder, fileName).replace(/\\/g, '/')
}

export const deleteImage = (imageUrlOrPath: string) => {
  const envUrl = getEnvironmentImageUrl()
  let relativePath = imageUrlOrPath
  if (imageUrlOrPath.startsWith(envUrl)) {
    relativePath = imageUrlOrPath.replace(envUrl, '')
  }
  if (relativePath.startsWith('/') || relativePath.startsWith('\\')) {
    relativePath = relativePath.substring(1)
  }
  const fullPath = path.join(UPLOAD_ROOT, relativePath)
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath)
      return true
    } catch (e) {
      console.error('Failed to delete image', e)
      return false
    }
  }
  return false
}

export const combineDateAndTime = (
  date?: Date | string,
  timeStr?: string,
): Date => {
  if (!date) return new Date(0)
  const d = new Date(date)
  if (isNaN(d.getTime())) return new Date(0)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const time = timeStr && /^\d{2}:\d{2}$/.test(timeStr) ? timeStr : '00:00'

  return new Date(`${year}-${month}-${day}T${time}:00+05:45`)
}

export const validateId = (id?: string, resourceName: string = "Id") => {
  if (!id) {
    throw new AppError(`${resourceName} is required`, 400);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${resourceName}`, 400);
  }
};