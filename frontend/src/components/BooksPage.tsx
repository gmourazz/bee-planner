import { PlusCircle, Star, BookOpen, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Book {
  id: number;
  title: string;
  author: string;
  month: string;
  rating: number;
  review: string;
  genre: string[];
  color: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, #F472B6 0%, #EC4899 100%)",
  "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
  "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
  "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
  "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
];

let nextBookId = 10;

const initialBooks: Book[] = [
  { id: nextBookId++, title: 'A Sutil Arte de Ligar o F*da-se', author: 'Mark Manson', month: 'Abril 2026', rating: 5, review: 'Um livro transformador sobre aceitar nossas limitações e focar no que realmente importa.', genre: ['Autoajuda', 'Filosofia'], color: GRADIENTS[0] },
  { id: nextBookId++, title: 'Atomic Habits', author: 'James Clear', month: 'Março 2026', rating: 5, review: 'Insights práticos sobre como criar hábitos bons e eliminar os ruins. Muito aplicável!', genre: ['Autoajuda', 'Produtividade'], color: GRADIENTS[1] },
  { id: nextBookId++, title: 'O Poder do Hábito', author: 'Charles Duhigg', month: 'Fevereiro 2026', rating: 4, review: 'Explicação científica de como os hábitos funcionam. Complementa bem o Atomic Habits.', genre: ['Psicologia', 'Autoajuda'], color: GRADIENTS[2] },
];

export function BooksPage() {
  const { currentTheme } = useTheme();
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', rating: 5, review: '', genre: '', colorIdx: 0 });
  const [hoverRating, setHoverRating] = useState(0);

  const avgRating = books.length > 0 ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1) : '0.0';

  const addBook = () => {
    if (!form.title.trim() || !form.author.trim()) return;
    const now = new Date();
    const month = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    setBooks((prev) => [
      ...prev,
      {
        id: nextBookId++,
        title: form.title.trim(),
        author: form.author.trim(),
        month: month.charAt(0).toUpperCase() + month.slice(1),
        rating: form.rating,
        review: form.review.trim(),
        genre: form.genre.split(',').map((g) => g.trim()).filter(Boolean),
        color: GRADIENTS[form.colorIdx],
      },
    ]);
    setForm({ title: '', author: '', rating: 5, review: '', genre: '', colorIdx: 0 });
    setShowAdd(false);
  };

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: currentTheme.colors.background }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display mb-4 text-[40px] font-bold" style={{ color: currentTheme.colors.text }}>
          Minha Estante
        </h1>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="rounded-2xl px-6 py-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Total de Livros</p>
            <p className="text-[28px] font-bold" style={{ color: currentTheme.colors.text }}>{books.length} livro{books.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-2xl px-6 py-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Média de Avaliação</p>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" fill={currentTheme.colors.primary} style={{ color: currentTheme.colors.primary }} />
              <p className="text-[28px] font-bold" style={{ color: currentTheme.colors.text }}>{avgRating}</p>
            </div>
          </div>
          <div className="rounded-2xl px-6 py-4" style={{ background: currentTheme.colors.surface, boxShadow: `0 2px 16px ${currentTheme.colors.primary}10` }}>
            <p className="text-sm" style={{ color: currentTheme.colors.textMuted }}>Meta Mensal</p>
            <div className="flex items-center gap-2">
              <p className="text-[28px] font-bold" style={{ color: currentTheme.colors.primary }}>2/3</p>
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: currentTheme.colors.primaryLight }}>
                <div className="h-full rounded-full" style={{ width: '67%', background: currentTheme.colors.primary }} />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-3 rounded-full text-white flex items-center gap-2 hover:opacity-90 transition-all"
          style={{ background: currentTheme.colors.primary }}
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar Livro
        </button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="rounded-2xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
            style={{ background: currentTheme.colors.surface, boxShadow: `0 4px 24px ${currentTheme.colors.primary}12` }}
          >
            <div className="h-48 flex items-center justify-center p-6" style={{ background: book.color }}>
              <BookOpen className="w-16 h-16 text-white opacity-80" />
            </div>
            <div className="p-6">
              <h3 className="font-display mb-1 text-lg font-semibold" style={{ color: currentTheme.colors.text }}>{book.title}</h3>
              <p className="text-sm mb-2" style={{ color: currentTheme.colors.textMuted }}>{book.author}</p>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{ color: i < book.rating ? currentTheme.colors.primary : currentTheme.colors.primaryLight }} fill={i < book.rating ? currentTheme.colors.primary : currentTheme.colors.primaryLight} />
                ))}
              </div>
              {book.review && (
                <p className="italic mb-3 text-[13px] leading-[1.5]" style={{ color: currentTheme.colors.textMuted }}>"{book.review}"</p>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                {book.genre.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>{tag}</span>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: currentTheme.colors.textMuted }}>Lido em: {book.month}</p>
            </div>
          </div>
        ))}

        {/* Empty Add Card */}
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-12 cursor-pointer hover:opacity-80 transition-all"
          style={{ borderColor: currentTheme.colors.primary + "50", minHeight: '360px', background: currentTheme.colors.primaryLight + "50" }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: currentTheme.colors.primaryLight }}>
            <BookOpen className="w-8 h-8" style={{ color: currentTheme.colors.primary }} />
          </div>
          <p className="font-display text-center mb-2 text-xl font-semibold" style={{ color: currentTheme.colors.text }}>Adicionar livro</p>
          <p className="text-center text-sm" style={{ color: currentTheme.colors.textMuted }}>Registre sua próxima leitura</p>
        </button>
      </div>

      {/* Add Book Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" style={{ background: currentTheme.colors.surface }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold" style={{ color: currentTheme.colors.text }}>Novo Livro</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5" style={{ color: currentTheme.colors.textMuted }} /></button>
            </div>

            {[
              { label: "Título", field: "title", placeholder: "Nome do livro" },
              { label: "Autor", field: "author", placeholder: "Nome do autor" },
              { label: "Gêneros (separados por vírgula)", field: "genre", placeholder: "Autoajuda, Ficção..." },
              { label: "Resenha (opcional)", field: "review", placeholder: "O que achou do livro?" },
            ].map(({ label, field, placeholder }) => (
              <div key={field} className="mb-3">
                <label className="block text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>{label}</label>
                {field === "review" ? (
                  <textarea rows={3} placeholder={placeholder} value={form[field as keyof typeof form] as string} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm resize-none" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
                ) : (
                  <input type="text" placeholder={placeholder} value={form[field as keyof typeof form] as string} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.text }} />
                )}
              </div>
            ))}

            <div className="mb-3">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Avaliação</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setForm((f) => ({ ...f, rating: s }))}>
                    <Star className="w-7 h-7 transition-all" style={{ color: s <= (hoverRating || form.rating) ? currentTheme.colors.primary : currentTheme.colors.primaryLight }} fill={s <= (hoverRating || form.rating) ? currentTheme.colors.primary : currentTheme.colors.primaryLight} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.colors.text }}>Cor da capa</label>
              <div className="flex gap-2">
                {GRADIENTS.map((g, i) => (
                  <button key={i} onClick={() => setForm((f) => ({ ...f, colorIdx: i }))} className="w-8 h-8 rounded-full transition-all hover:scale-110 relative" style={{ background: g }}>
                    {form.colorIdx === i && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={addBook} className="flex-1 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-all" style={{ background: currentTheme.colors.primary }}>Salvar</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-full font-semibold hover:opacity-80 transition-all" style={{ background: currentTheme.colors.primaryLight, color: currentTheme.colors.primaryDark }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
