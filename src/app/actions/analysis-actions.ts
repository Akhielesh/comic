'use server'

import { prisma } from "@/lib/db";
import { aiService } from "@/lib/ai-service";
import { revalidatePath } from "next/cache";

// Types expected from AI
interface AnalyzedScene {
  title: string;
  synopsis: string;
  setting: string;
  characters: string[];
}

interface AnalysisResult {
  scenes: AnalyzedScene[];
  characters: { name: string; description: string }[];
  locations: { name: string; description: string }[];
  items: { name: string; description: string }[];
}

export async function saveScript(projectId: string, script: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { script }
  });
  revalidatePath(`/editor/${projectId}`);
}

export async function analyzeScriptAction(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || !project.script) throw new Error("Project or script not found");

  // 1. Call AI
  const prompt = `
    Analyze the following comic script.
    Break it down into Scenes.
    Extract major Characters (with physical descriptions), Locations (visual descriptions), and Key Items.

    Script:
    "${project.script}"
  `;

  const schema = `
    {
      "scenes": [
        { "title": "string", "synopsis": "string", "setting": "string", "characters": ["string (names only)"] }
      ],
      "characters": [
        { "name": "string", "description": "string (visual physical description)" }
      ],
      "locations": [
        { "name": "string", "description": "string (visual description)" }
      ],
      "items": [
        { "name": "string", "description": "string (visual description)" }
      ]
    }
  `;

  const result = await aiService.generateJSON<AnalysisResult>(prompt, schema);

  // 2. Save to DB transactionally
  await prisma.$transaction(async (tx) => {
    // Clear old analysis
    await tx.scene.deleteMany({ where: { projectId } });
    await tx.entity.deleteMany({ where: { projectId } });

    // Insert Scenes
    for (const [index, scene] of result.scenes.entries()) {
      await tx.scene.create({
        data: {
          projectId,
          order: index + 1,
          title: scene.title,
          synopsis: scene.synopsis,
          setting: scene.setting,
          characters: JSON.stringify(scene.characters),
        }
      });
    }

    // Insert Entities
    for (const char of result.characters) {
      await tx.entity.create({
        data: { projectId, type: "CHARACTER", name: char.name, description: char.description }
      });
    }
    for (const loc of result.locations) {
      await tx.entity.create({
        data: { projectId, type: "LOCATION", name: loc.name, description: loc.description }
      });
    }
    for (const item of result.items) {
      await tx.entity.create({
        data: { projectId, type: "ITEM", name: item.name, description: item.description }
      });
    }
  });

  revalidatePath(`/editor/${projectId}`);
}
