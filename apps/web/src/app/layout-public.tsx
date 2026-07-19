import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ErrorBoundary } from '@/components/shared/error-boundary'

export default function PublicLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ErrorBoundary>
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  )
}
