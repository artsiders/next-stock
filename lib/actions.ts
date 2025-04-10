"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function createProject(data: { name: string; description?: string }) {
  await prisma.project.create({
    data,
  })
  revalidatePath("/projects")
}

export async function updateProject(id: number, data: { name: string; description?: string }) {
  await prisma.project.update({
    where: { id },
    data,
  })
  revalidatePath("/projects")
}

export async function deleteProject(id: number) {
  // First update any stock items that reference this project
  await prisma.stockItem.updateMany({
    where: { projectId: id },
    data: { projectId: null },
  })

  // Then delete the project
  await prisma.project.delete({
    where: { id },
  })

  revalidatePath("/projects")
  revalidatePath("/stock")
}

export async function createStockItem(data: {
  name: string
  quantity: number
  projectId: number | null
}) {
  await prisma.stockItem.create({
    data,
  })
  revalidatePath("/stock")
}

export async function updateStockItem(
  id: number,
  data: {
    name: string
    quantity: number
    projectId: number | null
  },
) {
  await prisma.stockItem.update({
    where: { id },
    data,
  })
  revalidatePath("/stock")
}

export async function deleteStockItem(id: number) {
  await prisma.stockItem.delete({
    where: { id },
  })
  revalidatePath("/stock")
}
