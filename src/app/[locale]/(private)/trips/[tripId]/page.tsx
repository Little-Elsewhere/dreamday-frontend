import { io } from 'next/cache'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFormatter, getLocale, getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'
import { z } from 'zod'
import { HugeiconsIcon } from '@hugeicons/react'
import { Input } from '@/components/ui/input'
import {
  Add01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'

import { addChecklist } from '@/features/trips/actions/checklists'
import { checklistSchema } from '@/features/trips/schemas/checklist'
import { getTrip } from '@/features/trips/data/queries'
import { formatMinor } from '@/features/trips/utils/money'
import { tripStatus } from '@/features/trips/utils/trip-status'
import { Link } from '@/i18n/navigation'
import { ActionForm } from '@/features/trips/components/forms/action-form'
import { BudgetForm } from '@/features/trips/components/forms/budget-form'
import { ExpenseForm } from '@/features/trips/components/forms/expense-form'
import { InviteForm } from '@/features/trips/components/forms/invite-form'
import { ScheduleForm } from '@/features/trips/components/forms/schedule-form'
import { TaskForm } from '@/features/trips/components/forms/task-form'
import { ToggleTask } from '@/features/trips/components/forms/toggle-task'
import { EditTripForm } from '@/features/trips/components/forms/edit-trip-form'

interface TripPageProps {
  params: Promise<{ tripId: string }>
}

export const generateMetadata = async ({ params }: TripPageProps): Promise<Metadata> => {
  await io()
  const { tripId } = await params
  if (!z.uuid().safeParse(tripId).success) notFound()
  const { trip } = await getTrip(tripId)
  return { title: trip.name }
}

const TripPage = async ({ params }: TripPageProps): Promise<ReactElement> => {
  await io()
  const { tripId } = await params
  if (!z.uuid().safeParse(tripId).success) notFound()
  const [{ trip, membership, profiles }, t, formatter, locale] = await Promise.all([
    getTrip(tripId),
    getTranslations('trips'),
    getFormatter(),
    getLocale(),
  ])
  const manage = membership.role === 'owner' || membership.role === 'editor'
  const contribute = manage || membership.role === 'member'
  const profileById = new Map(profiles.map((profile) => [profile.userId, profile]))
  const members = trip.memberships.map((item) => ({
    id: item.id,
    label: profileById.get(item.userId)?.displayName ?? item.userId.slice(0, 8),
  }))
  const memberById = new Map(members.map((member) => [member.id, member.label]))
  const date = (instant: Date): string =>
    formatter.dateTime(instant, { dateStyle: 'medium', timeZone: 'UTC' })
  const dateTime = (instant: Date, zone: string): string =>
    formatter.dateTime(instant, { dateStyle: 'medium', timeStyle: 'short', timeZone: zone })
  const amount = (minor: bigint): string =>
    formatMinor(minor, trip.currencyCode, trip.currencyExponent, locale)
  const expenses = trip.fund?.expenses ?? []
  const spent = expenses.reduce((sum, expense) => sum + expense.amountMinor, 0n)
  const balances = new Map(trip.memberships.map((item) => [item.id, 0n]))
  for (const expense of expenses) {
    balances.set(
      expense.paidByMembershipId,
      (balances.get(expense.paidByMembershipId) ?? 0n) + expense.amountMinor,
    )
    for (const split of expense.splits)
      balances.set(split.membershipId, (balances.get(split.membershipId) ?? 0n) - split.amountMinor)
  }
  const budgetMinor = trip.fund?.budgetMinor
  const divisor = 10n ** BigInt(trip.currencyExponent)
  const budgetInput =
    budgetMinor === null || budgetMinor === undefined
      ? ''
      : `${budgetMinor / divisor}${trip.currencyExponent ? `.${(budgetMinor % divisor).toString().padStart(trip.currencyExponent, '0')}` : ''}`

  return (
    <main className="bg-paper text-ink min-h-svh">
      <header className="border-line bg-surface border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-10">
          <Link href="/trips" className="text-primary text-xl font-semibold tracking-tighter">
            {t('common.labels.brand')}
          </Link>
          <Link
            href="/trips"
            className="text-ink-soft hover:text-primary inline-flex items-center gap-2 text-sm"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} aria-hidden="true" />
            {t('common.actions.back')}
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="bg-primary relative overflow-hidden rounded-2xl px-7 py-12 text-white md:px-12 md:py-16">
          <div
            className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.17),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="text-champagne-soft text-xs font-semibold tracking-[0.2em] uppercase">
              {trip.destination}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-6xl">
              {trip.name}
            </h1>
            {trip.description && (
              <p className="mt-5 max-w-2xl leading-relaxed text-white/80">{trip.description}</p>
            )}
            <div className="mt-9 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/25 px-3 py-2">
                {date(trip.startsOn)} — {date(trip.endsOn)}
              </span>
              <span className="rounded-full border border-white/25 px-3 py-2">{trip.timeZone}</span>
              <span className="rounded-full border border-white/25 px-3 py-2">
                {trip.currencyCode}
              </span>
              <span className="rounded-full border border-white/25 px-3 py-2">
                {t(`trip.labels.status.${tripStatus(trip)}`)}
              </span>
            </div>
          </div>
        </div>

        {manage && (
          <details className="border-line bg-surface mt-5 rounded-xl border p-5">
            <summary className="text-primary cursor-pointer font-semibold">
              {t('trip.actions.edit')}
            </summary>
            <div className="mt-5">
              <EditTripForm
                tripId={trip.id}
                name={trip.name}
                destination={trip.destination}
                description={trip.description}
                startsOn={trip.startsOn.toISOString().slice(0, 10)}
                endsOn={trip.endsOn.toISOString().slice(0, 10)}
                timeZone={trip.timeZone}
                currencyCode={trip.currencyCode}
                currencyLocked={expenses.length > 0}
              />
            </div>
          </details>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="flex min-w-0 flex-col gap-8">
            <section className="border-line bg-surface rounded-xl border p-6 md:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-primary text-2xl font-medium">{t('schedule.content.title')}</h2>
                <span className="text-ink-soft text-sm">{trip.schedules.length}</span>
              </div>
              {trip.schedules.length === 0 ? (
                <p className="text-ink-soft mt-6 text-sm">{t('schedule.messages.empty')}</p>
              ) : (
                <ol className="mt-6 flex flex-col gap-3">
                  {trip.schedules.map((item) => (
                    <li key={item.id} className="border-line bg-paper rounded-lg border p-4">
                      <div className="flex flex-col justify-between gap-2 md:flex-row">
                        <div>
                          <h3 className="text-primary font-semibold">{item.title}</h3>
                          {item.location && (
                            <p className="text-ink-soft mt-1 text-sm">{item.location}</p>
                          )}
                        </div>
                        <time
                          dateTime={item.startsAt.toISOString()}
                          className="text-ink-soft text-sm"
                        >
                          {dateTime(item.startsAt, item.startTimeZone)}{' '}
                          <span className="text-xs">({item.startTimeZone})</span>
                        </time>
                      </div>
                      {item.endsAt && (
                        <p className="text-ink-soft mt-2 inline-flex items-center gap-1 text-xs">
                          <HugeiconsIcon icon={ArrowRight02Icon} size={14} aria-hidden="true" />
                          {dateTime(item.endsAt, item.endTimeZone)} ({item.endTimeZone})
                        </p>
                      )}
                      {item.note && <p className="mt-3 text-sm">{item.note}</p>}
                    </li>
                  ))}
                </ol>
              )}
              {manage && (
                <details className="border-line mt-6 border-t pt-5">
                  <summary className="text-primary inline-flex cursor-pointer items-center gap-1 font-semibold">
                    <HugeiconsIcon icon={Add01Icon} size={16} aria-hidden="true" />
                    {t('schedule.actions.add')}
                  </summary>
                  <div className="mt-5">
                    <ScheduleForm
                      tripId={trip.id}
                      timeZone={trip.timeZone}
                      startsOn={trip.startsOn.toISOString().slice(0, 10)}
                      endsOn={trip.endsOn.toISOString().slice(0, 10)}
                    />
                  </div>
                </details>
              )}
            </section>

            <section className="border-line bg-surface rounded-xl border p-6 md:p-8">
              <h2 className="text-primary text-2xl font-medium">{t('checklists.content.title')}</h2>
              {trip.checklists.length === 0 && (
                <p className="text-ink-soft mt-5">{t('checklists.messages.empty')}</p>
              )}
              <div className="mt-6 flex flex-col gap-6">
                {trip.checklists.map((checklist) => (
                  <div key={checklist.id} className="border-line bg-paper rounded-lg border p-5">
                    <h3 className="text-primary font-semibold">{checklist.title}</h3>
                    <ul className="mt-4 flex flex-col gap-3">
                      {checklist.tasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-3 text-sm">
                          {contribute &&
                          (manage ||
                            task.assigneeMembershipId === membership.id ||
                            task.createdBy === membership.userId) ? (
                            <ToggleTask
                              tripId={trip.id}
                              taskId={task.id}
                              isDone={task.isDone}
                              title={task.title}
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="border-line-strong flex size-5 shrink-0 items-center justify-center rounded border"
                            >
                              {task.isDone && (
                                <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
                              )}
                            </span>
                          )}
                          <div>
                            <span
                              className={task.isDone ? 'text-ink-soft line-through' : 'text-ink'}
                            >
                              {task.title}
                            </span>
                            {(task.assigneeMembershipId || task.dueAt) && (
                              <p className="text-ink-soft mt-1 text-xs">
                                {task.assigneeMembershipId &&
                                  memberById.get(task.assigneeMembershipId)}
                                {task.dueAt &&
                                  ` · ${dateTime(task.dueAt, task.dueTimeZone ?? trip.timeZone)}`}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {contribute && (
                      <details className="border-line mt-5 border-t pt-4">
                        <summary className="text-primary inline-flex cursor-pointer items-center gap-1 text-sm font-semibold">
                          <HugeiconsIcon icon={Add01Icon} size={16} aria-hidden="true" />
                          {t('checklists.actions.tasks.add')}
                        </summary>
                        <div className="mt-4">
                          <TaskForm
                            tripId={trip.id}
                            checklistId={checklist.id}
                            timeZone={trip.timeZone}
                            members={members}
                          />
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
              {manage && (
                <div className="border-line mt-6 border-t pt-5">
                  <ActionForm
                    action={addChecklist}
                    schema={checklistSchema}
                    defaultValues={{ tripId: trip.id, title: '' }}
                    submitLabel={t('checklists.actions.create')}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <Input
                      id="new-checklist"
                      name="title"
                      label={t('checklists.labels.newTitle')}
                      labelClassName="sr-only"
                      containerClassName="flex-1"
                      required
                      maxLength={120}
                      placeholder={t('checklists.labels.newTitle')}
                      className="min-h-10 flex-1"
                    />
                  </ActionForm>
                </div>
              )}
            </section>

            <section className="border-line bg-surface rounded-xl border p-6 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-primary text-2xl font-medium">{t('fund.content.title')}</h2>
                  <p className="text-ink-soft mt-2 text-sm">
                    {t('fund.labels.spent')}: <strong className="text-ink">{amount(spent)}</strong>
                  </p>
                </div>
                <p className="text-ink-soft text-sm">
                  {t('fund.content.budget.title')}:{' '}
                  {budgetMinor === null || budgetMinor === undefined ? '—' : amount(budgetMinor)}
                </p>
              </div>
              {manage && (
                <details className="mt-5">
                  <summary className="text-primary cursor-pointer text-sm font-semibold">
                    {t('fund.actions.budget.save')}
                  </summary>
                  <div className="mt-4 max-w-sm">
                    <BudgetForm
                      tripId={trip.id}
                      amount={budgetInput}
                      currencyCode={trip.currencyCode}
                      exponent={trip.currencyExponent}
                    />
                  </div>
                </details>
              )}
              {expenses.length === 0 ? (
                <p className="text-ink-soft mt-6 text-sm">{t('fund.messages.noExpenses')}</p>
              ) : (
                <ul className="divide-line mt-6 divide-y">
                  {expenses.map((expense) => (
                    <li
                      key={expense.id}
                      className="flex items-center justify-between gap-4 py-4 text-sm"
                    >
                      <div>
                        <strong className="text-primary font-semibold">{expense.title}</strong>
                        <p className="text-ink-soft mt-1">
                          {t('fund.labels.expenses.paidBy')}:{' '}
                          {memberById.get(expense.paidByMembershipId)} ·{' '}
                          {dateTime(expense.incurredAt, trip.timeZone)}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold">{amount(expense.amountMinor)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {expenses.length > 0 && (
                <div className="bg-paper mt-5 rounded-lg p-4">
                  <h3 className="text-primary font-semibold">{t('fund.content.balances.title')}</h3>
                  <ul className="mt-3 flex flex-col gap-2">
                    {members.map((member) => {
                      const balance = balances.get(member.id) ?? 0n
                      return (
                        <li key={member.id} className="flex justify-between gap-3 text-sm">
                          <span>{member.label}</span>
                          <span>
                            {balance >= 0n
                              ? t('fund.labels.balances.credit')
                              : t('fund.labels.balances.debit')}
                            : {amount(balance >= 0n ? balance : -balance)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              {contribute && (
                <details className="border-line mt-6 border-t pt-5">
                  <summary className="text-primary inline-flex cursor-pointer items-center gap-1 font-semibold">
                    <HugeiconsIcon icon={Add01Icon} size={16} aria-hidden="true" />
                    {t('fund.actions.expenses.add')}
                  </summary>
                  <div className="mt-5 max-w-md">
                    <ExpenseForm
                      tripId={trip.id}
                      currencyCode={trip.currencyCode}
                      exponent={trip.currencyExponent}
                      members={members}
                    />
                  </div>
                </details>
              )}
            </section>
          </div>
          <aside className="flex flex-col gap-8">
            <section className="border-line bg-surface rounded-xl border p-6">
              <h2 className="text-primary text-xl font-medium">{t('members.content.title')}</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {trip.memberships.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className="bg-paper text-primary flex size-9 items-center justify-center rounded-full font-semibold"
                    >
                      {(profileById.get(item.userId)?.displayName ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {profileById.get(item.userId)?.displayName ?? item.userId.slice(0, 8)}
                      <span className="text-ink-soft block text-xs">
                        {t(`members.labels.roles.${item.role}`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {trip.invitations.length > 0 && (
                <div className="border-line mt-6 border-t pt-4">
                  <h3 className="text-sm font-semibold">
                    {t('members.labels.pendingInvitations')}
                  </h3>
                  <ul className="text-ink-soft mt-3 flex flex-col gap-2 text-xs">
                    {trip.invitations.map((invite) => (
                      <li key={invite.id} className="break-all">
                        {invite.emailNormalized} · {t(`members.labels.roles.${invite.role}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {manage && (
                <details className="border-line mt-6 border-t pt-4">
                  <summary className="text-primary inline-flex cursor-pointer items-center gap-1 text-sm font-semibold">
                    <HugeiconsIcon icon={Add01Icon} size={16} aria-hidden="true" />
                    {t('members.actions.invite')}
                  </summary>
                  <div className="mt-5">
                    <InviteForm tripId={trip.id} tripName={trip.name} />
                  </div>
                </details>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default TripPage
