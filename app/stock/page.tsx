import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { getStockItems } from "@/lib/data"
import StockList from "@/components/stock-list"

export default async function StockPage() {
  const stockItems = await getStockItems()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Stock</h1>
        <Link href="/stock/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvel Article
          </Button>
        </Link>
      </div>
      <StockList items={stockItems} />
    </div>
  )
}
