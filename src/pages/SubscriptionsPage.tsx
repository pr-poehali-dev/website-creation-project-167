import { useAuth } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

interface SubscriptionsPageProps {
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
}

export default function SubscriptionsPage({ setPage, setActiveVideo }: SubscriptionsPageProps) {
  const { user, videos, subscriptions, users } = useAuth();

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="Rss" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg mb-2">Нужен аккаунт</h2>
      <button onClick={() => setPage('auth')} className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm">Войти</button>
    </div>
  );

  const subVideos = videos.filter(v => subscriptions.includes(v.authorId));
  const subUsers = users.filter(u => subscriptions.includes(u.id));

  return (
    <div>
      <h1 className="font-bold text-xl mb-6 flex items-center gap-2">
        <Icon name="Rss" size={20} className="text-primary" />
        Подписки
      </h1>

      {subUsers.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 mb-6">
          {subUsers.map(u => (
            <div key={u.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              {u.avatar ? (
                <img src={u.avatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30" alt="" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-center font-medium max-w-16 truncate">{u.name}</span>
            </div>
          ))}
        </div>
      )}

      {subVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subVideos.map(v => (
            <VideoCard key={v.id} video={v} onClick={() => { setActiveVideo(v.id); setPage('watch'); }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20 text-center">
          <Icon name="UserPlus" size={40} className="text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Нет подписок</h3>
          <p className="text-sm text-muted-foreground">Подпишитесь на авторов, чтобы видеть их видео</p>
          <button onClick={() => setPage('home')} className="mt-4 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm">На главную</button>
        </div>
      )}
    </div>
  );
}
