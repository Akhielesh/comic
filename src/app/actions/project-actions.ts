
'use server'

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;

  if (!name) {
    throw new Error("Project name is required");
  }

  const project = await prisma.project.create({
    data: {
      name,
    }
  });

  revalidatePath("/");
  redirect(`/editor/${project.id}`);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/");
}

export async function duplicateProject(id: string) {
  const original = await prisma.project.findUnique({
    where: { id },
    include: { scenes: true, entities: true }
  });

  if (!original) throw new Error("Project not found");

  await prisma.project.create({
    data: {
      name: `${original.name} (Copy)`,
      script: original.script,
      layoutMode: original.layoutMode,
      stylePrompt: original.stylePrompt,
      stylePreset: original.stylePreset,
      // For a real duplicate, we would need to deep clone scenes/entities/panels too
      // For MVP, we just clone metadata
    }
  });
  revalidatePath("/");
}
