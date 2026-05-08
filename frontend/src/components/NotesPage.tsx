import { Plus, Search, Pin, Trash2, X, StickyNote } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  color: string;
  isPinned: boolean;
  date: string;
}

const NOTE_COLORS = ["#FCD34D", "#F472B6", "#A855F7", "#10B981", "#3B82F6", "#F97316", "#EF4444"];

const FOLDER_NAMES = ["Todas", "Universitário", "Pessoal", "Trabalho", "Metas", "Receitas"];

let nextNoteId = 10;

const initialNotes: Note[] = [
  { id: nextNoteId++, title: "Ideias para TCC", content: "Pesquisar sobre machine learning aplicado a saúde mental. Verificar datasets disponíveis.", category: "Universitário", color: "#FCD34D", isPinned: true, date: "28 Abr" },
  { id: nextNoteId++, title: "Lista de Compras", content: "Leite, ovos, frutas, pão integral, café", category: "Pessoal", color: "#F472B6", isPinned: false, date: "27 Abr" },
  { id: nextNoteId++, title: "Objetivos 2026", content: "Terminar faculdade, ler 24 livros, aprender React avançado, começar inglês", category: "Metas", color: "#A855F7", isPinned: true, date: "01 Jan" },
  { id: nextNoteId++, title: "Receita Bolo", content: "3 ovos, 2 xícaras açúcar, 1 xícara óleo, 3 xícaras farinha, 1 colher fermento", category: "Receitas", color: "#10B981", isPinned: false, date: "20 Abr" },
  { id: nextNoteId++, title: "Projeto Freelance", content: "Cliente quer landing page responsiva. Prazo: 15 dias. Valor: R$ 800", category: "Trabalho", color: "#3B82F6", isPinned: false, date: "25 Abr" },
];

export function NotesPage() {
  const { currentTheme } = useTheme();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedFolder, setSelectedFolder] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "Pessoal", color: NOTE_COLORS[0], isPinned: false });

  const filteredNotes = notes.filter((note) => {
    const matchesFolder = selectedFolder === "Todas" || note.category === selectedFolder;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const regularNotes = filteredNotes.filter((n) => !n.isPinned);

  const addNote = () => {
    if (!form.title.trim()) return;
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    setNotes((prev) => [{ id: nextNoteId++, ...form, date }, ...prev]);
    setForm({ title: "", content: "", category: "Pessoal", color: NOTE_COLORS[0], isPinned: false });
    setShowAdd(false);
  };

  const deleteNote = (id: number) => setNotes((prev) => prev.filter((n) => n.id !== id));
  const togglePin = (id: number) => setNotes((prev) => prev.map((n) => n.id === id ? { ...n, isPinned: !n.isPinned } : n));

  const folderCount = (name: string) => name === "Todas" ? notes.length : notes.filter((n) => n.category === name).length;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: currentTheme.colors.background }}>
      {/* Sidebar */}
      <div className="w-60 border-r p-5 overflow-y-auto flex-shrink-0" style={{ background: currentTheme.colors.surface, borderColor: `${currentTheme.colors.primary}20` }}>
        <h2 className="font-display mb-4 text-xl font-semibold" style={{ color: currentTheme.colors.text }}>Notas</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2.5 rounded-full text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all mb-5"
          style={{ background: currentTheme.colors.primary }}
        >
          <Plus className="w-4 h-4" />
          Nova Nota
        </button>

        <div className="space-y-1">
          {FOLDER_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedFolder(name)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
              style={{
                background: selectedFolder === name ? currentTheme.colors.primaryLight : "transparent",
                color: selectedFolder === name ? currentTheme.colors.primaryDark : currentTheme.colors.text,
              }}
            >
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                <span className="text-sm font-medium">{name}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>
                {folderCount(name)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: currentTheme.colors.textMuted }} />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-transparent outline-none transition-all"
            style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}
            onFocus={(e) => (e.target.style.borderColor = currentTheme.colors.primary)}
            onBlur={(e) => (e.target.style.borderColor = "transparent")}
          />
        </div>

        {pinnedNotes.length > 0 && (
          <div className="mb-6">
            <h3 className="flex items-center gap-2 mb-3 text-base font-semibold" style={{ color: currentTheme.colors.text }}>
              <Pin className="w-4 h-4" style={{ color: currentTheme.colors.primary }} />
              Fixadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard key={note.id} note={note} theme={currentTheme} onDelete={deleteNote} onTogglePin={togglePin} />
              ))}
            </div>
          </div>
        )}

        {regularNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && <h3 className="mb-3 text-base font-semibold" style={{ color: currentTheme.colors.text }}>Outras Notas</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regularNotes.map((note) => (
                <NoteCard key={note.id} note={note} theme={currentTheme} onDelete={deleteNote} onTogglePin={togglePin} />
              ))}
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="text-center py-20">
            <StickyNote className="w-16 h-16 mx-auto mb-4" style={{ color: currentTheme.colors.textMuted }} />
            <p className="font-display mb-2 text-2xl" style={{ color: currentTheme.colors.text }}>Nenhuma nota encontrada</p>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Crie sua primeira nota clicando no botão acima</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ background: currentTheme.colors.surface }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold" style={{ color: currentTheme.colors.text }}>Nova Nota</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" style={{ color: currentTheme.colors.textMuted }} /></button>
            </div>

            <input autoFocus type="text" placeholder="Título" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm mb-3" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
            <textarea placeholder="Conteúdo da nota..." value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm resize-none mb-3" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>Categoria</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }}>
                {["Pessoal", "Universitário", "Trabalho", "Metas", "Receitas"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Cor</label>
              <div className="flex gap-2">
                {NOTE_COLORS.map((c) => (
                  <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))} className="w-8 h-8 rounded-full transition-all hover:scale-110" style={{ background: c, border: form.color === c ? `3px solid ${currentTheme.colors.text}` : "3px solid transparent" }} />
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: currentTheme.colors.text }}>Fixar nota</span>
            </label>

            <div className="flex gap-3">
              <button onClick={addNote} className="flex-1 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all" style={{ background: currentTheme.colors.primary }}>Salvar</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-full font-semibold hover:opacity-80 transition-all" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, theme, onDelete, onTogglePin }: { note: Note; theme: any; onDelete: (id: number) => void; onTogglePin: (id: number) => void }) {
  return (
    <div className="p-5 rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-lg relative group" style={{ background: note.color + "20", border: `2px solid ${note.color}40`, minHeight: "180px" }}>
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={() => onTogglePin(note.id)} className="p-1 rounded-lg hover:bg-black/10">
          <Pin className="w-3.5 h-3.5" style={{ color: note.isPinned ? note.color : "#aaa" }} fill={note.isPinned ? note.color : "none"} />
        </button>
        <button onClick={() => onDelete(note.id)} className="p-1 rounded-lg hover:bg-black/10">
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>

      <div className="mb-3">
        <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ background: note.color }}>{note.category}</span>
      </div>
      <h4 className="font-display mb-2 text-base font-semibold" style={{ color: theme.colors.text }}>{note.title}</h4>
      <p className="text-sm leading-relaxed mb-3" style={{ color: theme.colors.textMuted }}>{note.content}</p>
      <span className="text-xs" style={{ color: theme.colors.textMuted }}>{note.date}</span>
    </div>
  );
}
