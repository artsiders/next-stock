import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader';
import './globals.css'
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'nest-stock',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader
          color="#2299DD"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          template='<div class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          zIndex={1600}
          showAtBottom={false}
        />
        <div className="container mx-auto px-2 py-10">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
