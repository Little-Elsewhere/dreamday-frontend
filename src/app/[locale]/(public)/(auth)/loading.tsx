import Image from 'next/image'
import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { AuthLoading } from '@/features/auth/components/common/auth-loading'

const AuthRouteLoading = (): ReactElement => (
  <main
    className="bg-surface text-ink auth-wide:grid-cols-[minmax(560px,52%)_minmax(600px,48%)] grid min-h-screen grid-cols-1 antialiased lg:grid-cols-[minmax(390px,46%)_minmax(520px,54%)]"
    aria-busy="true"
  >
    <section
      className="bg-primary relative hidden overflow-hidden lg:flex lg:min-h-svh"
      aria-hidden="true"
    >
      <Image
        className="absolute inset-0 size-full object-cover object-[52%_center] brightness-[.68] contrast-[1.04] saturate-[.72]"
        src="/images/lan-ha-bay.jpg"
        alt=""
        fill
        sizes="(min-width: 1440px) 52vw, (min-width: 1024px) 46vw, 0px"
        priority
        loading="eager"
      />
      <div className="bg-shade/25 absolute inset-0" />
      <div className="relative z-10 mt-auto w-full p-10 lg:p-[clamp(40px,6vw,88px)]">
        <Skeleton className="bg-champagne-soft/70 mb-6 h-px w-14 rounded-none motion-reduce:animate-none" />
        <div className="grid max-w-sm gap-3">
          <Skeleton className="rounded-auth h-9 w-full bg-white/35 motion-reduce:animate-none" />
          <Skeleton className="rounded-auth h-9 w-4/5 bg-white/35 motion-reduce:animate-none" />
          <Skeleton className="rounded-auth h-9 w-2/3 bg-white/35 motion-reduce:animate-none" />
        </div>
        <Skeleton className="rounded-auth mt-6 h-4 w-36 bg-white/25 motion-reduce:animate-none" />
      </div>
    </section>

    <section className="auth-wide:pl-[clamp(72px,8vw,136px)] auth-wide:pr-[clamp(72px,8vw,136px)] flex min-w-0 flex-col pt-[max(24px,env(safe-area-inset-top))] pr-[max(20px,env(safe-area-inset-right))] pb-[max(24px,env(safe-area-inset-bottom))] pl-[max(20px,env(safe-area-inset-left))] md:pt-8 md:pr-[clamp(32px,7vw,80px)] md:pb-8 md:pl-[clamp(32px,7vw,80px)] lg:min-h-svh">
      <div className="flex w-full flex-1 items-center self-center">
        <div className="w-full">
          <AuthLoading />
        </div>
      </div>
      <div className="text-ink-soft" aria-hidden="true">
        <Skeleton className="bg-skeleton rounded-auth h-4 w-52 motion-reduce:animate-none" />
      </div>
    </section>
  </main>
)

export default AuthRouteLoading
