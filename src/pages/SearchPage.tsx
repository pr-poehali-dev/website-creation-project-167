import { useAuth } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

interface SearchPageProps {
  query: string;
  setQuery: (q: string) => void;
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
}

export default function SearchPage({ query, setQuery, setPage, setActiveVideo }: SearchPageProps) {
  const { videos } = useAuth();

  const results = query.trim()
    ? videos.filter(v =>
        v.title.toLowerCase().includes(query.toLowerCase()) ||
        v.authorName.toLowerCase().includes(query.toLowerCase()) ||
        v.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div>
      {/* Mobile search input */}
      <div className="md:hidden mb-5">
        <div className="flex items-center bg-secondary rounded-xl px-3 gap-2 h-10">
          <Icon name="Search" size={16} className="text-muted-foreground" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Поиск видео..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <Icon name="X" size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {query.trim() ? (
        <>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="font-semibold">Результаты для: <span className="text-primary">«{query}»</span></h2>
            <span className="text-muted-foreground text-sm">· {results.length}</span>
          </div>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => { setActiveVideo(video.id); setPage('watch'); }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <Icon name="SearchX" size={40} className="text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Ничего не найдено</h3>
              <p className="text-sm text-muted-foreground">Попробуйте другой запрос</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Icon name="Search" size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Найдите видео</h3>
          <p className="text-sm text-muted-foreground">Введите запрос выше чтобы найти видео</p>
        </div>
      )}
    </div>
  );
}
