
'use client'

import { useState, useTransition } from "react";
import { saveScript, analyzeScriptAction } from "@/app/actions/analysis-actions";
import { Loader2, Sparkles, Save } from "lucide-react";

interface Props {
  projectId: string;
  initialScript: string;
  hasScenes: boolean;
}

export function ScriptInput({ projectId, initialScript, hasScenes }: Props) {
  const [script, setScript] = useState(initialScript);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveScript(projectId, script);
    });
  };

  const handleAnalyze = () => {
    startTransition(async () => {
      await saveScript(projectId, script); // Ensure latest is saved
      await analyzeScriptAction(projectId);
    });
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-yellow-400 uppercase">Step 1: Script Input</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold flex items-center gap-2 rounded"
          >
             <Save className="w-4 h-4" /> Save
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isPending || !script.trim()}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm flex items-center gap-2 rounded shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analyze Script
          </button>
        </div>
      </div>

      <textarea
        className="flex-1 w-full bg-zinc-900 border-2 border-zinc-700 p-6 text-zinc-300 font-mono text-lg focus:outline-none focus:border-yellow-400 resize-none"
        placeholder="Paste your story here..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      {hasScenes && (
        <div className="p-4 bg-green-900/20 border border-green-500/50 text-green-400 text-sm rounded">
          ✓ Analysis complete. Proceed to next steps.
        </div>
      )}
    </div>
  );
}
