'use client'

import { useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { useTranslations } from 'next-intl'

import { deleteTripActivity, saveTripActivity } from '@/features/trips/actions/trips'
import type { TripActivityFormValues } from '@/features/trips/types/components'
import type { TripActivity } from '@/features/trips/types/trip'
import { createInitialTripActivity, sortTripActivities } from '@/features/trips/utils/trip'
import type { ActionResult } from '@/types/action-result'

type Props = {
  initialActivities: TripActivity[]
  tripId: string | null
  dates: string[]
  setError: Dispatch<SetStateAction<string>>
}

export const useTripActivities = ({ initialActivities, tripId, dates, setError }: Props) => {
  const t = useTranslations('trips')
  const [activities, setActivities] = useState<TripActivity[]>(initialActivities)
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityValues, setActivityValues] = useState<TripActivityFormValues>(
    createInitialTripActivity(''),
  )
  const [isPending, setIsPending] = useState(false)
  const mutationPendingRef = useRef(false)

  const patchActivityValues = (patch: Partial<TripActivityFormValues>): void =>
    setActivityValues((current) => ({ ...current, ...patch }))

  const openActivity = (activity?: TripActivity, date?: string): void => {
    setActivityValues(
      activity ? { ...activity } : createInitialTripActivity(date ?? dates[0] ?? ''),
    )
    setActivityOpen(true)
  }

  const runActivityMutation = async <TData>(
    mutation: (tripId: string) => Promise<ActionResult<TData>>,
    onSuccess: (data: TData) => void,
  ): Promise<void> => {
    if (!tripId || mutationPendingRef.current) return

    mutationPendingRef.current = true
    setIsPending(true)
    try {
      const result = await mutation(tripId)
      if (!result.success) {
        setError(t('create.errors.activitySaveFailed'))
        return
      }

      onSuccess(result.data)
      setError('')
    } catch {
      setError(t('create.errors.activitySaveFailed'))
    } finally {
      mutationPendingRef.current = false
      setIsPending(false)
    }
  }

  const handleActivitySubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    await runActivityMutation(
      (currentTripId) =>
        saveTripActivity({
          ...activityValues,
          tripId: currentTripId,
          activityId: activityValues.id,
        }),
      (savedActivity) => {
        setActivities((current) => {
          const exists = current.some((activity) => activity.id === savedActivity.id)
          const nextActivities = exists
            ? current.map((activity) =>
                activity.id === savedActivity.id ? savedActivity : activity,
              )
            : [...current, savedActivity]
          return sortTripActivities(nextActivities)
        })
        setActivityOpen(false)
      },
    )
  }

  const handleDeleteActivity = async (activityId: string): Promise<void> => {
    await runActivityMutation(
      (currentTripId) => deleteTripActivity({ tripId: currentTripId, activityId }),
      () => setActivities((current) => current.filter((activity) => activity.id !== activityId)),
    )
  }

  const updateActivity = async (
    activity: TripActivity,
    patch: Partial<TripActivityFormValues>,
  ): Promise<void> => {
    await runActivityMutation(
      (currentTripId) =>
        saveTripActivity({
          ...activity,
          ...patch,
          tripId: currentTripId,
          activityId: activity.id,
        }),
      (savedActivity) =>
        setActivities((current) =>
          sortTripActivities(
            current.map((item) => (item.id === activity.id ? savedActivity : item)),
          ),
        ),
    )
  }

  const moveActivity = (activity: TripActivity, targetDate: string): void => {
    if (targetDate !== activity.activityDate)
      void updateActivity(activity, { activityDate: targetDate })
  }

  return {
    data: { activities, activityOpen, activityValues },
    statuses: { isPending },
    handlers: {
      handleActivitySubmit,
      handleDeleteActivity,
      moveActivity,
      openActivity,
      patchActivityValues,
      setActivityOpen,
      updateActivity,
    },
  }
}
