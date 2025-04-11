'use client'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu"
import { Button } from "@/components/ui/button"
import { Package, Folder, Truck, HomeIcon, ChartArea, ArrowDownToLine, ArrowUpToLine } from "lucide-react"

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Statistics', icon: <ChartArea className="w-5 h-5" /> },
        { href: '/approvisionnements', label: 'Approvisionnements', icon: <ArrowDownToLine className="w-5 h-5" /> },
        { href: '/sorties-stock', label: 'Sorties stock', icon: <ArrowUpToLine className="w-5 h-5" /> },
        { href: '/produits', label: 'Produits', icon: <Folder className="w-5 h-5" /> },
        { href: '/categories', label: 'Catégories', icon: <Package className="w-5 h-5" /> },
        { href: '/fournisseurs', label: 'Fournisseurs', icon: <Truck className="w-5 h-5" /> },
    ]

    return (
        <div className="flex justify-between">
            <NavigationMenu className="flex justify-end mb-8">
                <NavigationMenuList className="flex gap-4">
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href={"/"}>
                                <Button
                                    variant={"default"}
                                    className={`flex gap-2 items-center bg-blue-500 text-white`}
                                >
                                    <HomeIcon className="w-5 h-5" />
                                    Nest Stock
                                </Button>
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

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
