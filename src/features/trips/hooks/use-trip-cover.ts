'use client'

import { useEffect, useRef, useState } from 'react'

import { saveTripDraft } from '@/features/trips/actions/trips'
import { MAX_TRIP_COVER_SIZE_BYTES } from '@/features/trips/constants/trips'
import type { TripDraftFormValues } from '@/features/trips/types/components'
import { createUuidV4 } from '@/features/trips/utils/trip'
import { createClient } from '@/lib/supabase/client'

type OnDraftSaved = (coverPath: string | null, draftId: string) => void

export const useTripCover = (initialCoverUrl: string | null) => {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl)
  const [isUploading, setIsUploading] = useState(false)
  const pendingFileRef = useRef<File | null>(null)
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

    const previewUrl = URL.createObjectURL(file)
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = previewUrl
    pendingFileRef.current = file
    setCoverUrl(previewUrl)
    return true
  }

  const clearPendingCover = (): boolean => {
    if (!pendingFileRef.current) return false

    pendingFileRef.current = null
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setCoverUrl(null)
    return true
  }

  const persistPendingCover = async (
    tripId: string,
    values: TripDraftFormValues,
    onDraftSaved: OnDraftSaved,
  ): Promise<boolean> => {
    const file = pendingFileRef.current
    if (!file) return true

    setIsUploading(true)
    const supabase = createClient()
    let uploadedPath: string | null = null

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Missing user')

      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.slice('image/'.length)
      const path = `${user.id}/${tripId}/${createUuidV4()}.${extension}`
      const { error: uploadError } = await supabase.storage.from('trip-covers').upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })
      if (uploadError) throw new Error('Upload failed')

      uploadedPath = path
      const result = await saveTripDraft({ ...values, coverPath: path })
      if (!result.success) throw new Error('Could not save cover')

      uploadedPath = null
      pendingFileRef.current = null
      onDraftSaved(path, result.data.id)

      if (values.coverPath) {
        try {
          await supabase.storage.from('trip-covers').remove([values.coverPath])
        } catch {
          // Keep the saved cover even if the old file cannot be cleaned up.
        }
      }
      return true
    } catch {
      if (uploadedPath) {
        try {
          await supabase.storage.from('trip-covers').remove([uploadedPath])
        } catch {
          // The upload was not saved, so cleanup is best-effort.
        }
      }
      return false
    } finally {
      setIsUploading(false)
    }
  }

  const removeSavedCover = async (
    values: TripDraftFormValues,
    onDraftSaved: OnDraftSaved,
  ): Promise<boolean> => {
    if (!values.coverPath) return false

    const result = await saveTripDraft({ ...values, coverPath: null })
    if (!result.success) return false

    const previousPath = values.coverPath
    pendingFileRef.current = null
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setCoverUrl(null)
    onDraftSaved(null, result.data.id)

    try {
      await createClient().storage.from('trip-covers').remove([previousPath])
    } catch {
      // The draft no longer references this file, so cleanup is best-effort.
    }
    return true
  }

  return {
    data: { coverUrl },
    handlers: { chooseCover, clearPendingCover, persistPendingCover, removeSavedCover },
    statuses: { isUploading },
  }
}
