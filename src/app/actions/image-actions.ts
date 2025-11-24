'use server'

import { prisma } from "@/lib/db";
import { storageService } from "@/lib/storage-service";
import { revalidatePath } from "next/cache";
import { Entity } from "@prisma/client";

async function generateImageFromPrompt(prompt: string): Promise<ArrayBuffer> {
  // MOCK IMPLEMENTATION (For Sandbox reliability)
  console.log("Mock Generating Image for:", prompt);
  const width = 512;
  const height = 512;
  const color = Math.floor(Math.random()*16777215).toString(16);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${color}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">
        ${prompt.slice(0, 30)}...
      </text>
    </svg>
  `;

  const buffer = Buffer.from(svg);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

export async function generateReferenceImage(entityId: string, stylePrompt: string) {
  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity) throw new Error("Entity not found");

  const prompt = `Character Concept Art, ${entity.description}, ${stylePrompt}, white background, detailed, full body`;

  try {
    const imageBuffer = await generateImageFromPrompt(prompt);

    // Save to storage as SVG since our mock produces SVG text
    const url = await storageService.saveImage(imageBuffer, `ref_${entity.type}_${entity.name}`, 'svg');

    // Update DB
    await prisma.entity.update({
      where: { id: entityId },
      data: { imageUrl: url }
    });

    revalidatePath(`/editor/${entity.projectId}`);
    return { success: true, url };
  } catch (e) {
    console.error("Image Gen Failed", e);
    return { success: false, error: "Failed to generate image" };
  }
}

export async function updateStyle(projectId: string, stylePrompt: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { stylePrompt }
  });
  revalidatePath(`/editor/${projectId}`);
}
