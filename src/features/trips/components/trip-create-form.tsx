'use client'

import type { ReactElement } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { FeedbackMessage } from '@/components/common/feedback-message'
import { cn } from '@/utils/cn'
import type { TripDraft } from '@/features/trips/types/trip'
import { TripActivityDialog } from '@/features/trips/components/create/trip-activity-dialog'
import { TripDetailsFields } from '@/features/trips/components/create/trip-details-fields'
import { TripItinerarySection } from '@/features/trips/components/create/trip-itinerary-section'
import { TripNoteSection } from '@/features/trips/components/create/trip-note-section'
import { useTripCreateForm } from '@/features/trips/hooks/use-trip-create-form'

type Props = {
  initialDraft: TripDraft | null
}

export const TripCreateForm = ({ initialDraft }: Props): ReactElement => {
  const t = useTranslations('trips')
  const {
    data: { activityOpen, activityValues, activities, coverUrl, dates, draftId, step, values },
    handlers: {
      handleActivitySubmit,
      handleCancel,
      handleContinue,
      handleCover,
      handleDeleteActivity,
      handlePublish,
      handleRemoveCover,
      handleSaveDraft,
      handleSaveNote,
      moveActivity,
      openActivity,
      patchActivityValues,
      patchValues,
      setActivityOpen,
      setStep,
      updateActivity,
    },
    statuses: { coverUploading, error, notice, pending },
  } = useTripCreateForm(initialDraft)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-6 pb-12 sm:px-6 md:pt-8 lg:px-8 2xl:pt-10">
      <div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-champagne-ink text-xs font-semibold tracking-[0.12em] uppercase">
            {t('create.eyebrow')}
          </p>
          <h1 className="text-primary mt-2 text-2xl font-medium tracking-[-0.025em] sm:text-3xl">
            {step === 1 ? t('create.title') : t('create.scheduleTitle')}
          </h1>
          <p className="text-ink-soft mt-2">
            {step === 1 ? t('create.intro') : t('create.scheduleIntro')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending}
            onClick={() => void handleSaveDraft()}
            type="button"
            variant="outline"
          >
            {t('create.actions.saveDraft')}
          </Button>
        </div>
      </div>

      <nav
        aria-label={t('create.steps.label')}
        className="border-line mb-6 flex items-center gap-2 border-b pb-5 sm:gap-6"
      >
        {[1, 2].map((item) => (
          <div className="contents" key={item}>
            <Button
              aria-current={step === item ? 'step' : undefined}
              className={cn(
                'rounded-auth min-h-16 min-w-0 flex-1 justify-start border px-2 py-2 text-left transition-colors sm:px-4 sm:py-3',
                step === item
                  ? 'border-line bg-muted text-primary hover:bg-muted'
                  : 'text-ink-soft hover:border-line-strong hover:bg-paper border-transparent',
              )}
              disabled={pending}
              onClick={() => {
                if (item === step) return
                if (item === 1) setStep(1)
                else void handleContinue()
              }}
              type="button"
              variant="ghost"
            >
              <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full border text-sm font-medium tabular-nums sm:size-10',
                    step === item
                      ? 'border-primary bg-primary text-white'
                      : item < step
                        ? 'border-champagne bg-paper text-champagne-ink'
                        : 'border-line-strong bg-surface text-ink-soft',
                  )}
                >
                  {String(item).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate text-sm font-medium sm:text-base',
                      step === item ? 'text-primary' : 'text-ink-soft',
                    )}
                  >
                    {t(`create.steps.step${item}`)}
                  </span>
                  <span className="text-ink-soft hidden text-xs sm:block">
                    {t(
                      step === item
                        ? 'create.steps.current'
                        : item < step
                          ? 'create.steps.complete'
                          : 'create.steps.upcoming',
                    )}
                  </span>
                </span>
              </span>
            </Button>
            {item === 1 && (
              <span aria-hidden="true" className="bg-line h-px min-w-3 flex-1 max-sm:hidden" />
            )}
          </div>
        ))}
      </nav>

      {error && <FeedbackMessage isError message={error} />}
      {notice && <FeedbackMessage isError={false} message={notice} />}

      {step === 1 ? (
        <form className="grid gap-6" onSubmit={(event) => void handleContinue(event)}>
          <TripDetailsFields
            coverUploading={coverUploading}
            coverUrl={coverUrl}
            onChange={patchValues}
            onChooseCover={handleCover}
            onRemoveCover={handleRemoveCover}
            pending={pending}
            values={values}
          />
          <div className="border-line mt-2 flex flex-col-reverse justify-between gap-3 border-t pt-5 sm:flex-row">
            <Button disabled={pending} onClick={handleCancel} type="button" variant="ghost">
              {t('create.actions.cancel')}
            </Button>
            <Button className="min-w-40" disabled={pending} loading={pending} type="submit">
              {t('create.actions.continue')}
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-6">
          <TripItinerarySection
            activities={activities}
            canAddActivity={Boolean(draftId)}
            dates={dates}
            onDeleteActivity={handleDeleteActivity}
            onMoveActivity={moveActivity}
            onOpenActivity={openActivity}
            onUpdateActivity={updateActivity}
          />
          <TripNoteSection
            note={values.note}
            onChange={(note) => patchValues({ note })}
            onSave={handleSaveNote}
            pending={pending}
          />

          <div className="border-line mt-2 flex flex-col-reverse justify-between gap-3 border-t pt-5 sm:flex-row">
            <Button disabled={pending} onClick={() => setStep(1)} type="button" variant="outline">
              {t('create.actions.back')}
            </Button>
            <Button
              disabled={pending}
              loading={pending}
              onClick={() => void handlePublish()}
              type="button"
            >
              {t('create.actions.publish')}
            </Button>
          </div>
        </div>
      )}

      <TripActivityDialog
        dates={dates}
        onChange={patchActivityValues}
        onOpenChange={setActivityOpen}
        onSubmit={handleActivitySubmit}
        open={activityOpen}
        pending={pending}
        values={activityValues}
      />
    </div>
  )
}
