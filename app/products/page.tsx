import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { getProduits } from "@/lib/data"
import ProductList from "@/components/product-list"

export default async function ProjectsPage() {
  const products = await getProduits()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product</h1>
        <Link href="/products/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Product
          </Button>
        </Link>
      </div>
      <ProductList products={products} />
    </div>
  )
}
