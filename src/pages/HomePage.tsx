import { useAuth } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

const CATEGORIES = ['Все', 'Игры', 'Музыка', 'Спорт', 'Технологии', 'Кино', 'Образование', 'Влог', 'Новости'];

interface HomePageProps {
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
  category: string;
  setCategory: (c: string) => void;
}

export default function HomePage({ setPage, setActiveVideo, category, setCategory }: HomePageProps) {
  const { videos } = useAuth();

  const filtered = category === 'Все' ? videos : videos.filter(v => v.category === category);

  return (
    <div>
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all
              ${category === cat
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => { setActiveVideo(video.id); setPage('watch'); }}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Icon name="Video" size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Видео пока нет</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Здесь будут отображаться загруженные видео. Станьте первым!
          </p>
          <button
            onClick={() => setPage('upload')}
            className="mt-4 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Загрузить видео
          </button>
        </div>
      )}
    </div>
  );
}
