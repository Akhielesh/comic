import { prisma } from "@/lib/db";
import { ScriptInput } from "@/components/wizard/ScriptInput";
import { StyleSelection } from "@/components/wizard/StyleSelection";
import { ReferenceBuilder } from "@/components/wizard/ReferenceBuilder";
import { ComicGenerator } from "@/components/wizard/ComicGenerator";
import { Entity, Scene } from "@prisma/client";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { scenes: true, entities: true, panels: true }
  });

  if (!project) return <div className="text-white">Project not found</div>;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b-2 border-zinc-800 bg-zinc-900 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
           <span className="font-black text-yellow-400 text-xl tracking-tighter">DREAMSTREAM</span>
           <span className="text-zinc-600">/</span>
           <span className="font-bold text-zinc-200">{project.name}</span>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          AUTO-SAVE ENABLED
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-zinc-900 border-r-2 border-zinc-800 flex flex-col p-4 gap-2 shrink-0 overflow-y-auto">
           <div className="font-bold text-xs text-zinc-500 uppercase tracking-widest mb-2">Workflow</div>
           <a href="#script" className="text-left px-4 py-3 font-bold text-sm rounded transition-all text-zinc-400 hover:bg-zinc-800 block">1. Script & Story</a>
           <a href="#style" className="text-left px-4 py-3 font-bold text-sm rounded transition-all text-zinc-400 hover:bg-zinc-800 block">2. Style Selection</a>
           <a href="#world" className="text-left px-4 py-3 font-bold text-sm rounded transition-all text-zinc-400 hover:bg-zinc-800 block">3. World Builder</a>
           <a href="#generate" className="text-left px-4 py-3 font-bold text-sm rounded transition-all text-zinc-400 hover:bg-zinc-800 block">4. Generate Comic</a>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-8 space-y-24">

          <section id="script" className="min-h-[80vh]">
             <ScriptInput
               projectId={project.id}
               initialScript={project.script}
               hasScenes={project.scenes.length > 0}
             />
          </section>

          {project.scenes.length > 0 && (
            <>
              <section id="style" className="min-h-[50vh] border-t-2 border-zinc-800 pt-12">
                <StyleSelection projectId={project.id} currentStyle={project.stylePrompt} />
              </section>

              <section id="world" className="min-h-[80vh] border-t-2 border-zinc-800 pt-12">
                <ReferenceBuilder
                  projectId={project.id}
                  entities={project.entities}
                  stylePrompt={project.stylePrompt}
                />
              </section>

              <section id="generate" className="min-h-[80vh] border-t-2 border-zinc-800 pt-12">
                <ComicGenerator
                  projectId={project.id}
                  scenes={project.scenes}
                  panels={project.panels}
                />
              </section>
            </>
          )}

        </main>

        {/* Right Sidebar: Analysis Context */}
        {project.scenes.length > 0 && (
            <div className="w-80 border-l-2 border-zinc-800 bg-zinc-900 p-6 overflow-y-auto shrink-0 hidden xl:block">
              <h3 className="font-bold text-lg mb-4 text-zinc-300">Story Context</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Scenes</h4>
                  <div className="space-y-2">
                    {project.scenes.map((scene: Scene) => (
                      <div key={scene.id} className="bg-zinc-950 p-3 border border-zinc-800 rounded text-xs text-zinc-400">
                        <span className="font-bold text-yellow-500 block mb-1">Scene {scene.order}</span>
                        {scene.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
