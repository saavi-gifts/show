"use client"

import { useState, useRef } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getApiPath } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (imageUrl: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(getApiPath('/api/upload'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { imageUrl } = await response.json()
      onChange(imageUrl)
      setPreviewUrl(imageUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
      setPreviewUrl('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl('')
    onRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <PhotoIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={previewUrl}
              alt="Upload preview"
              fill
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-sm font-medium">Uploading...</div>
            </div>
          )}
        </div>
      )}

      {/* Upload status */}
      {isUploading && !previewUrl && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Uploading image...
        </div>
      )}
    </div>
  )
}