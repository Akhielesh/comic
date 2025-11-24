'use client'

import { useState, useTransition } from "react";
import { generateComicAction } from "@/app/actions/generate-actions";
import { Loader2, Zap } from "lucide-react";
import { Panel, Scene } from "@prisma/client";

export function ComicGenerator({ projectId, scenes, panels }: { projectId: string, scenes: Scene[], panels: Panel[] }) {
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      await generateComicAction(projectId);
    });
  };

  // Group panels by scene
  const panelsByScene = scenes.map(scene => ({
    scene,
    panels: panels.filter(p => p.sceneId === scene.id).sort((a, b) => a.order - b.order)
  }));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-yellow-400 uppercase">Step 4: Generation</h2>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black text-lg flex items-center gap-2 rounded shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
        >
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
          {panels.length > 0 ? "Regenerate Comic" : "GENERATE COMIC"}
        </button>
      </div>

      {isPending && (
        <div className="p-4 bg-blue-900/20 border border-blue-500/50 text-blue-400 text-center rounded animate-pulse">
          Generating panels... This might take a moment.
        </div>
      )}

      {/* Comic Display */}
      <div className="space-y-12">
        {panelsByScene.map(({ scene, panels }) => (
          panels.length > 0 && (
            <div key={scene.id} className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-400 border-b border-zinc-800 pb-2">
                Scene {scene.order}: {scene.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {panels.map((panel) => (
                   <div key={panel.id} className="relative group bg-zinc-950 border-2 border-zinc-800 rounded overflow-hidden">
                      <div className="aspect-[4/3] bg-zinc-900 flex items-center justify-center">
                        {panel.imageUrl ? (
                           /* eslint-disable-next-line @next/next/no-img-element */
                           <img src={panel.imageUrl} alt={`Panel ${panel.order}`} className="w-full h-full object-cover" />
                        ) : (
                           <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-zinc-500 mb-1">Panel {panel.order}</p>
                        <p className="text-sm text-zinc-300 line-clamp-2">{panel.description}</p>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
