import { useAuth } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

interface FavoritesPageProps {
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
}

export default function FavoritesPage({ setPage, setActiveVideo }: FavoritesPageProps) {
  const { user, videos, favorites } = useAuth();

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="Bookmark" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg mb-2">Нужен аккаунт</h2>
      <button onClick={() => setPage('auth')} className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm">Войти</button>
    </div>
  );

  const favVideos = videos.filter(v => favorites.includes(v.id));

  return (
    <div>
      <h1 className="font-bold text-xl mb-6 flex items-center gap-2">
        <Icon name="Bookmark" size={20} className="text-primary" />
        Избранное
      </h1>
      {favVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favVideos.map(v => (
            <VideoCard key={v.id} video={v} onClick={() => { setActiveVideo(v.id); setPage('watch'); }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <Icon name="BookmarkX" size={40} className="text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Избранное пусто</h3>
          <p className="text-sm text-muted-foreground">Сохраняйте видео, нажав на закладку</p>
        </div>
      )}
    </div>
  );
}
