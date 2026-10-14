'use client'

import { useEffect, useRef, useState } from 'react'

import { MAX_TRIP_COVER_SIZE_BYTES } from '@/features/trips/constants/trips'

export const useTripCover = (initialCoverUrl: string | null) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    },
    [],
  )

  const chooseCover = (file: File): boolean => {
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > MAX_TRIP_COVER_SIZE_BYTES
    ) {
      return false
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const previewUrl = URL.createObjectURL(file)
    previewUrlRef.current = previewUrl
    setCoverUrl(previewUrl)
    return true
  }

  const removeCover = () => {
    // TODO: Upload or remove trip covers through the API.
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setCoverUrl(null)
  }

  return {
    data: { coverUrl },
    handlers: { chooseCover, removeCover },
    statuses: { isUploading: false },
  }
}
