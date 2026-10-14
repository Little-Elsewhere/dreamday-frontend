'use client'

import { type SubmitEvent, useState } from 'react'

import type { TripActivityFormValues } from '@/features/trips/types/components'
import type { TripActivity } from '@/features/trips/types/trip'
import {
  createInitialTripActivity,
  createUuidV4,
  sortTripActivities,
} from '@/features/trips/utils/trip'

type Props = {
  initialActivities: TripActivity[]
  dates: string[]
}

export const useTripActivities = ({ initialActivities, dates }: Props) => {
  const [activities, setActivities] = useState<TripActivity[]>(initialActivities)
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityValues, setActivityValues] = useState<TripActivityFormValues>(
    createInitialTripActivity(''),
  )

  const patchActivityValues = (patch: Partial<TripActivityFormValues>) =>
    setActivityValues((current) => ({ ...current, ...patch }))

  const openActivity = (activity?: TripActivity, date?: string) => {
    setActivityValues(
      activity ? { ...activity } : createInitialTripActivity(date ?? dates[0] ?? ''),
    )
    setActivityOpen(true)
  }

  const handleActivitySubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO: Persist the activity with the API.
    const activity = { ...activityValues, id: activityValues.id ?? createUuidV4() }
    setActivities((current) => {
      const exists = current.some((item) => item.id === activity.id)
      return sortTripActivities(
        exists
          ? current.map((item) => (item.id === activity.id ? activity : item))
          : [...current, activity],
      )
    })
    setActivityOpen(false)
  }

  const handleDeleteActivity = (activityId: string) => {
    // TODO: Delete the activity through the API.
    setActivities((current) => current.filter((activity) => activity.id !== activityId))
  }

  const updateActivity = (activity: TripActivity, patch: Partial<TripActivityFormValues>) => {
    // TODO: Persist activity edits through the API.
    setActivities((current) =>
      sortTripActivities(
        current.map((item) =>
          item.id === activity.id ? { ...item, ...patch, id: activity.id } : item,
        ),
      ),
    )
  }

  const moveActivity = (activity: TripActivity, targetDate: string) => {
    if (targetDate !== activity.activityDate) updateActivity(activity, { activityDate: targetDate })
  }

  return {
    data: { activities, activityOpen, activityValues },
    statuses: { isPending: false },
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
