'use client'

import { useState, useTransition } from "react";
import { updateStyle } from "@/app/actions/image-actions";
import { Palette } from "lucide-react";

export function StyleSelection({ projectId, currentStyle }: { projectId: string, currentStyle: string }) {
  const [style, setStyle] = useState(currentStyle);
  const [isPending, startTransition] = useTransition();

  const styles = [
    "Manga, Black and White, High Contrast",
    "Western Comic, Modern, Vibrant Colors",
    "Noir, Dark, Gritty, Shadowy",
    "Webtoon, Vertical, Soft Shading, Anime-influenced",
    "Watercolor, Artistic, Dreamy",
    "Cyberpunk, Neon, Futuristic, Sharp"
  ];

  const handleSave = () => {
    startTransition(async () => {
      await updateStyle(projectId, style);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-yellow-400 uppercase">Step 2: Style Selection</h2>
        <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm flex items-center gap-2 rounded"
        >
          <Palette className="w-4 h-4" /> {isPending ? "Saving..." : "Confirm Style"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {styles.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`p-4 border-2 rounded text-left text-sm transition-all ${style === s ? 'border-yellow-400 bg-zinc-800' : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase">Custom Style Prompt</label>
        <textarea
          className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 text-zinc-300 text-sm focus:outline-none focus:border-yellow-400"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
