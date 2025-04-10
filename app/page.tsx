import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Folder } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Nest-Stock</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link href="/projects" className="w-full">
          <Button variant="outline" className="w-full h-32 flex flex-col gap-2">
            <Folder className="h-8 w-8" />
            <span className="text-lg">Gérer les Projets</span>
          </Button>
        </Link>
        <Link href="/stock" className="w-full">
          <Button variant="outline" className="w-full h-32 flex flex-col gap-2">
            <Package className="h-8 w-8" />
            <span className="text-lg">Gérer le Stock</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
