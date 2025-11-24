'use client'

import { useState, useTransition } from "react";
import { generateReferenceImage } from "@/app/actions/image-actions";
import { Entity } from "@prisma/client";
import { Loader2, RefreshCw, Image as ImageIcon } from "lucide-react";

export function ReferenceBuilder({ projectId, entities, stylePrompt }: { projectId: string, entities: Entity[], stylePrompt: string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-yellow-400 uppercase">Step 3: World Builder</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => (
          <EntityCard key={entity.id} entity={entity} stylePrompt={stylePrompt} />
        ))}
      </div>
    </div>
  );
}

function EntityCard({ entity, stylePrompt }: { entity: Entity, stylePrompt: string }) {
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      await generateReferenceImage(entity.id, stylePrompt);
    });
  };

  return (
    <div className="bg-zinc-900 border-2 border-zinc-800 p-4 rounded flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase bg-zinc-950 px-2 py-1 rounded">{entity.type}</span>
          <h3 className="text-lg font-bold text-white mt-2">{entity.name}</h3>
        </div>
      </div>

      <div className="aspect-square bg-zinc-950 border border-zinc-800 rounded flex items-center justify-center overflow-hidden relative group">
        {entity.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={entity.imageUrl} alt={entity.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button onClick={handleGenerate} className="bg-white text-black px-3 py-1 text-xs font-bold rounded flex items-center gap-1">
                 <RefreshCw className="w-3 h-3" /> Regenerate
               </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <ImageIcon className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <button
              onClick={handleGenerate}
              disabled={isPending}
              className="text-xs text-yellow-400 hover:underline disabled:opacity-50"
            >
              {isPending ? "Generating..." : "Generate Reference"}
            </button>
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-400 line-clamp-3 bg-zinc-950 p-2 rounded border border-zinc-800">
        {entity.description}
      </p>
    </div>
  );
}
