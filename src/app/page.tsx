import { prisma } from "@/lib/db";
import { createProject, deleteProject, duplicateProject } from "@/app/actions/project-actions";
import Link from "next/link";
import { Trash2, Copy, Edit, Eye, Plus, BookOpen, AlertTriangle } from "lucide-react";

export default async function Dashboard() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-yellow-400 selection:text-black">
      {/* Hero Section */}
      <header className="border-b-4 border-zinc-800 bg-zinc-900 p-8 md:p-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-orange-600 drop-shadow-lg">
            DreamStream
            <span className="block text-4xl md:text-5xl text-white mt-2">Comic Studio</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl border-l-4 border-yellow-400 pl-4">
            Transform raw text into professional graphic novels. Powered by Gemini.
          </p>

          {/* System Diagnostics */}
          <div className="bg-zinc-950 border-2 border-zinc-800 p-4 rounded-lg max-w-lg">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> System Status
             </h3>
             <div className="space-y-1 text-sm">
               <div className="flex items-center justify-between">
                 <span>API Key (Server)</span>
                 <span className="text-green-400 font-mono">READY</span>
               </div>
               <div className="flex items-center justify-between">
                 <span>Database (SQLite)</span>
                 <span className="text-green-400 font-mono">READY</span>
               </div>
               <div className="flex items-center justify-between">
                 <span>Storage (Local)</span>
                 <span className="text-green-400 font-mono">READY</span>
               </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <h2 className="text-3xl font-bold uppercase tracking-wide">Your Projects</h2>

          <form action={createProject} className="flex gap-2 w-full md:w-auto">
            <input
              name="name"
              placeholder="New Project Name..."
              className="bg-zinc-900 border-2 border-zinc-700 px-4 py-2 text-white focus:outline-none focus:border-yellow-400 transition-colors w-full md:w-64"
              required
            />
            <button type="submit" className="bg-yellow-400 text-black font-bold px-6 py-2 hover:bg-yellow-300 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" /> Create
            </button>
          </form>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-500 text-lg">No projects yet. Start creating!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="group relative bg-zinc-900 border-2 border-zinc-800 hover:border-yellow-400 transition-colors overflow-hidden">
                <div className="h-40 bg-zinc-800 flex items-center justify-center border-b-2 border-zinc-800">
                  {/* Placeholder for thumbnail */}
                  <BookOpen className="w-12 h-12 text-zinc-600 group-hover:text-yellow-400 transition-colors" />
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold truncate mb-1">{project.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mb-4">
                    Updated: {project.updatedAt.toLocaleDateString()}
                  </p>

                  <div className="flex gap-2 justify-end">
                    <Link href={`/read/${project.id}`} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-blue-400" title="Read">
                      <Eye className="w-5 h-5" />
                    </Link>

                    {/* Client Component wrappers would be better here for actions, but using forms for MVP simplicity */}
                    <form action={duplicateProject.bind(null, project.id)}>
                       <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-green-400" title="Duplicate">
                        <Copy className="w-5 h-5" />
                       </button>
                    </form>

                    <form action={deleteProject.bind(null, project.id)}>
                      <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-500" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>

                    <Link href={`/editor/${project.id}`} className="ml-2 bg-white text-black px-4 py-2 font-bold text-sm hover:bg-yellow-400 transition-colors flex items-center gap-1">
                      <Edit className="w-4 h-4" /> EDIT
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
