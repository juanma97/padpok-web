import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Padpok Web App',
  description: 'Aplicación web desarrollada con Next.js y TypeScript',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <div id="__next">
          <main className="app-container">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
