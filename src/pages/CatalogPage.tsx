import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

const CATEGORIES = ['Все', 'Игры', 'Музыка', 'Спорт', 'Технологии', 'Кино', 'Образование', 'Влог', 'Новости'];

interface CatalogPageProps {
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
}

export default function CatalogPage({ setPage, setActiveVideo }: CatalogPageProps) {
  const { videos } = useAuth();
  const [cat, setCat] = useState('Все');
  const [sort, setSort] = useState<'new' | 'views' | 'likes'>('new');

  const filtered = cat === 'Все' ? [...videos] : videos.filter(v => v.category === cat);

  if (sort === 'views') filtered.sort((a, b) => b.views - a.views);
  else if (sort === 'likes') filtered.sort((a, b) => b.likes - a.likes);
  else filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${cat === c ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['new', 'views', 'likes'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                ${sort === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
            >
              {s === 'new' ? 'Новые' : s === 'views' ? 'Просмотры' : 'Лайки'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(v => (
            <VideoCard key={v.id} video={v} onClick={() => { setActiveVideo(v.id); setPage('watch'); }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <Icon name="LayoutGrid" size={40} className="text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Видео не найдено</h3>
          <p className="text-sm text-muted-foreground">В этой категории ещё нет видео</p>
        </div>
      )}
    </div>
  );
}
