'use client'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu"
import { Button } from "@/components/ui/button"
import { Package, Folder, Truck, HomeIcon } from "lucide-react"

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Statistics', icon: <Folder className="w-5 h-5" /> },
        { href: '/approvisionnements', label: 'Approvisionnements', icon: <Folder className="w-5 h-5" /> },
        { href: '/sorties-stock', label: 'Sorties stock', icon: <Folder className="w-5 h-5" /> },
        { href: '/produits', label: 'Produits', icon: <Folder className="w-5 h-5" /> },
        { href: '/categories', label: 'Catégories', icon: <Package className="w-5 h-5" /> },
        { href: '/fournisseurs', label: 'Fournisseurs', icon: <Truck className="w-5 h-5" /> },
    ]

    return (
        <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-8 text-center text-blue-500 flex items-center gap-2">
                <HomeIcon />
                Nest Stock
            </h1>

            {/* Navigation Radix UI */}
            <NavigationMenu className="flex justify-end mb-8">
                <NavigationMenuList className="flex gap-4">
                    {navItems.map(({ href, label, icon }) => (
                        <NavigationMenuItem key={href}>
                            <NavigationMenuLink asChild>
                                <Link href={href}>
                                    <Button
                                        variant={pathname === href ? "default" : "outline"}
                                        className={`flex gap-2 items-center ${pathname === href ? 'bg-blue-500 text-white' : ''}`}
                                    >
                                        {icon}
                                        {label}
                                    </Button>
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}
