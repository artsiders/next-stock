import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StockForm from "@/components/stock-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getProjects } from "@/lib/data"

export default async function NewStockItemPage() {
  const projects = await getProjects()

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
          <CardTitle>Nouvel Article</CardTitle>
        </CardHeader>
        <CardContent>
          <StockForm projects={projects} />
        </CardContent>
      </Card>
    </div>
  )
}
