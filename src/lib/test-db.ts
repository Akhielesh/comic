
import { prisma } from "./db";

async function main() {
  try {
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        script: "A hero stands on a cliff.",
      }
    });
    console.log("Created project:", project);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
