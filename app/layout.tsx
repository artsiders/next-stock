import type { Metadata } from 'next'
import NextTopLoader from 'nextjs-toploader';
import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu"
import { Button } from "@/components/ui/button"
import { Package, Folder, Truck, HomeIcon } from "lucide-react"
import './globals.css'

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
        <div className="container mx-auto py-10">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-8 text-center text-blue-500 flex items-center gap-2"><HomeIcon />Nest Stock</h1>

            {/* Navigation Radix UI */}
            <NavigationMenu className="flex justify-end mb-8">
              <NavigationMenuList className="flex gap-4">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/">
                      <Button variant="outline" className="flex gap-2 items-center">
                        <Folder className="w-5 h-5" />
                        Statistics
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/approvisionnements">
                      <Button variant="outline" className="flex gap-2 items-center">
                        <Folder className="w-5 h-5" />
                        approvisionnements
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/produits">
                      <Button variant="outline" className="flex gap-2 items-center">
                        <Folder className="w-5 h-5" />
                        Produits
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/categories">
                      <Button variant="outline" className="flex gap-2 items-center">
                        <Package className="w-5 h-5" />
                        Catégories
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/fournisseurs">
                      <Button variant="outline" className="flex gap-2 items-center">
                        <Truck className="w-5 h-5" />
                        Fournisseurs
                      </Button>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
