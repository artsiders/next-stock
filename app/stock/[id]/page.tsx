import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StockForm from "@/components/stock-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getStockItemById, getProjects } from "@/lib/data"
import { notFound } from "next/navigation"

export default async function EditStockItemPage({ params }: { params: { id: string } }) {
  const stockItem = await getStockItemById(Number.parseInt(params.id))
  const projects = await getProjects()

  if (!stockItem) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <Link href="/stock">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au stock
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Modifier Article</CardTitle>
        </CardHeader>
        <CardContent>
          <StockForm item={stockItem} projects={projects} />
        </CardContent>
      </Card>
    </div>
  )
}
