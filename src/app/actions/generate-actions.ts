'use server'

import { prisma } from "@/lib/db";
import { storageService } from "@/lib/storage-service";
import { revalidatePath } from "next/cache";
import { Scene, Entity } from "@prisma/client";

// Helper to generate mock image (same as before)
async function generateImageFromPrompt(prompt: string): Promise<ArrayBuffer> {
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

export async function generateComicAction(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { scenes: true, entities: true }
  });

  if (!project) throw new Error("Project not found");

  // 1. Prepare Panel Prompts
  // For MVP, we will just assume 1 Scene = 4 Panels automatically.
  // In a real app, we'd use AI to break scenes into panels first.

  const panelsToGenerate = [];

  // Clear existing panels
  await prisma.panel.deleteMany({ where: { projectId } });

  for (const scene of project.scenes) {
     for (let i = 1; i <= 4; i++) {
        panelsToGenerate.push({
           sceneId: scene.id,
           order: i,
           description: `Panel ${i} of ${scene.title}. ${scene.synopsis}. Style: ${project.stylePrompt}`
        });
     }
  }

  // 2. Generate (Simulating "All at once" loop)
  // In production, this should be a background job or queue.
  // Here we loop and await.

  for (const p of panelsToGenerate) {
    // Create Panel Record
    const panel = await prisma.panel.create({
      data: {
        projectId,
        sceneId: p.sceneId,
        order: p.order,
        description: p.description,
        status: "GENERATING"
      }
    });

    try {
      // Generate Image
      const buffer = await generateImageFromPrompt(p.description);

      // Save as SVG for mock
      const url = await storageService.saveImage(buffer, `panel_${panel.id}`, 'svg');

      // Update Panel
      await prisma.panel.update({
        where: { id: panel.id },
        data: {
          imageUrl: url,
          status: "COMPLETED"
        }
      });
    } catch (e) {
      console.error("Failed panel gen", e);
      await prisma.panel.update({ where: { id: panel.id }, data: { status: "FAILED" } });
    }
  }

  revalidatePath(`/editor/${projectId}`);
}
