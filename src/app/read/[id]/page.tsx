import { prisma } from "@/lib/db";
import { ComicViewer } from "@/components/reader/ComicViewer";

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { scenes: true, panels: true }
  });

  if (!project) return <div>Project not found</div>;

  return (
    <ComicViewer scenes={project.scenes} panels={project.panels} />
  );
}
