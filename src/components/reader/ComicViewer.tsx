'use client'

import { useState } from "react";
import { Scene, Panel } from "@prisma/client";
import jsPDF from "jspdf";
import { Download, ArrowLeft, ArrowRight } from "lucide-react";

export function ComicViewer({ scenes, panels }: { scenes: Scene[], panels: Panel[] }) {
  const [viewMode, setViewMode] = useState<"GRID" | "WEBTOON">("GRID");

  const panelsByScene = scenes.map(scene => ({
    scene,
    panels: panels.filter(p => p.sceneId === scene.id).sort((a, b) => a.order - b.order)
  }));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let pageHeight = doc.internal.pageSize.getHeight();
    let cursorY = 10;

    doc.setFontSize(24);
    doc.text("DreamStream Comic", 10, cursorY);
    cursorY += 20;

    // Very basic PDF export logic for MVP
    // In reality, we would use html2canvas on the rendered DOM for fidelity
    doc.setFontSize(12);
    doc.text("See full comic in the web reader.", 10, cursorY);
    doc.save("comic.pdf");
    alert("PDF Export initiated (Basic Text Mode for MVP to avoid large payload issues in sandbox). Real app would capture canvas.");
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-black font-sans">
      {/* Reader Controls */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-50 shadow-sm">
         <h1 className="font-black uppercase tracking-tighter text-xl">DreamStream Reader</h1>

         <div className="flex gap-4">
           <div className="bg-zinc-100 p-1 rounded flex">
             <button
               onClick={() => setViewMode("GRID")}
               className={`px-3 py-1 text-xs font-bold rounded ${viewMode === "GRID" ? "bg-white shadow text-black" : "text-zinc-500"}`}
             >
               GRID
             </button>
             <button
               onClick={() => setViewMode("WEBTOON")}
               className={`px-3 py-1 text-xs font-bold rounded ${viewMode === "WEBTOON" ? "bg-white shadow text-black" : "text-zinc-500"}`}
             >
               WEBTOON
             </button>
           </div>

           <button
             onClick={handleExportPDF}
             className="bg-black text-white px-4 py-2 text-xs font-bold rounded hover:bg-zinc-800 flex items-center gap-2"
           >
             <Download className="w-4 h-4" /> PDF
           </button>
         </div>
      </div>

      {/* Comic Content */}
      <div className={`pt-24 pb-20 max-w-4xl mx-auto px-6 ${viewMode === "WEBTOON" ? "space-y-0" : "space-y-12"}`}>
        {panelsByScene.map(({ scene, panels }) => (
          panels.length > 0 && (
             <div key={scene.id} className={viewMode === "WEBTOON" ? "mb-0" : ""}>
               {viewMode === "GRID" && (
                 <h2 className="text-2xl font-bold mb-4 text-center uppercase tracking-widest border-b-2 border-black pb-2 inline-block w-full">
                   {scene.title}
                 </h2>
               )}

               <div className={`
                 ${viewMode === "GRID" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col items-center gap-0"}
               `}>
                 {panels.map((panel) => (
                   <div key={panel.id} className={`
                     relative bg-white
                     ${viewMode === "GRID" ? "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-2" : "w-full max-w-2xl border-x-4 border-black p-0 shadow-2xl"}
                   `}>
                      {panel.imageUrl ? (
                         /* eslint-disable-next-line @next/next/no-img-element */
                         <img src={panel.imageUrl} alt="Comic Panel" className="w-full h-auto block" />
                      ) : (
                         <div className="aspect-square bg-zinc-200 flex items-center justify-center text-zinc-400 italic">
                           Image processing...
                         </div>
                      )}

                      {/* Text Overlay Mockup - In real app this would be draggable bubbles */}
                      {viewMode === "GRID" && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white border-2 border-black p-2 text-sm font-comic shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                           <p className="uppercase font-bold text-xs text-zinc-500 mb-1">ACTION</p>
                           {panel.description.slice(0, 80)}...
                        </div>
                      )}
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
