import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Folder, Truck } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-500">Nest Stock</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <Link href="/produits" className="w-full">
          <Button variant="outline" className="w-full h-32 flex flex-col gap-2">
            <Folder className="h-10 w-10 text-3xl" />
            <span className="text-lg">Gérer les Produits</span>
          </Button>
        </Link>
        <Link href="/categories" className="w-full">
          <Button variant="outline" className="w-full h-32 flex flex-col gap-2">
            <Package className="h-10 w-10 text-3xl" />
            <span className="text-lg">Gérer le Catégories</span>
          </Button>
        </Link>
        <Link href="/fournisseurs" className="w-full">
          <Button variant="outline" className="w-full h-32 flex flex-col gap-2">
            <Truck className="h-10 w-10 text-3xl" />
            <span className="text-lg">Gérer le Fournisseurs</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
