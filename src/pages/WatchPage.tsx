import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

interface WatchPageProps {
  videoId: string;
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} ч назад`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} дн назад`;
  return `${Math.floor(d / 30)} мес назад`;
}

export default function WatchPage({ videoId, setPage, setActiveVideo }: WatchPageProps) {
  const { videos, user, comments, addComment, deleteComment, react, reactions, addView, toggleFavorite, favorites, toggleSubscription, subscriptions } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showDesc, setShowDesc] = useState(false);

  const video = videos.find(v => v.id === videoId);
  const videoComments = comments.filter(c => c.videoId === videoId);
  const related = videos.filter(v => v.id !== videoId).slice(0, 8);

  useEffect(() => {
    if (video) addView(videoId);
  }, [videoId]);

  if (!video) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="VideoOff" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg">Видео не найдено</h2>
      <button onClick={() => setPage('home')} className="mt-4 px-4 py-2 rounded-xl bg-secondary text-sm">На главную</button>
    </div>
  );

  const myReaction = reactions[videoId];
  const isFav = favorites.includes(videoId);
  const isSubscribed = subscriptions.includes(video.authorId);

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    addComment(videoId, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Video player */}
        <div className="rounded-2xl overflow-hidden bg-black aspect-video mb-4">
          {video.url ? (
            <video
              src={video.url}
              controls
              className="w-full h-full object-contain"
              poster={video.thumbnail}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="Play" size={56} className="text-white/20" />
            </div>
          )}
        </div>

        {/* Title & actions */}
        <h1 className="text-lg font-bold mb-2 leading-tight">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Author */}
          <div className="flex items-center gap-3">
            {video.authorAvatar ? (
              <img src={video.authorAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {video.authorName?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold text-sm">{video.authorName}</div>
              <div className="text-xs text-muted-foreground">{timeAgo(video.createdAt)}</div>
            </div>
            {user && user.id !== video.authorId && (
              <button
                onClick={() => toggleSubscription(video.authorId)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${isSubscribed ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground shadow-md shadow-primary/25'}`}
              >
                {isSubscribed ? 'Отписаться' : 'Подписаться'}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
              <button
                onClick={() => user && react(videoId, 'like')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-muted transition-colors ${myReaction === 'like' ? 'text-primary' : ''}`}
              >
                <Icon name="ThumbsUp" size={15} />
                {video.likes}
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => user && react(videoId, 'dislike')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium hover:bg-muted transition-colors ${myReaction === 'dislike' ? 'text-destructive' : ''}`}
              >
                <Icon name="ThumbsDown" size={15} />
                {video.dislikes}
              </button>
            </div>
            <button
              onClick={() => user && toggleFavorite(videoId)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-muted transition-colors ${isFav ? 'text-primary' : ''}`}
            >
              <Icon name={isFav ? 'BookmarkCheck' : 'Bookmark'} size={15} />
              <span className="hidden sm:inline">{isFav ? 'Сохранено' : 'Сохранить'}</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-secondary rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span>{video.views} просмотров</span>
            <span>·</span>
            <span>{timeAgo(video.createdAt)}</span>
            {video.category && <span className="px-2 py-0.5 rounded-full bg-muted">{video.category}</span>}
          </div>
          <p className={`text-sm text-foreground leading-relaxed ${!showDesc ? 'line-clamp-2' : ''}`}>
            {video.description || 'Описание отсутствует.'}
          </p>
          {video.description && video.description.length > 100 && (
            <button onClick={() => setShowDesc(!showDesc)} className="text-xs font-semibold mt-1 text-foreground">
              {showDesc ? 'Свернуть' : 'Ещё'}
            </button>
          )}
        </div>

        {/* Comments */}
        <div>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="MessageSquare" size={17} />
            Комментарии · {videoComments.length}
          </h2>

          {user ? (
            <form onSubmit={submitComment} className="flex gap-3 mb-5">
              {user.avatar ? (
                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 flex gap-2">
                <input
                  className="flex-1 h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
                  placeholder="Написать комментарий..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  <Icon name="Send" size={15} />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-5 p-3 rounded-xl bg-secondary text-sm text-muted-foreground text-center">
              <button onClick={() => setPage('auth')} className="text-primary font-medium">Войдите</button>, чтобы оставить комментарий
            </div>
          )}

          <div className="space-y-3">
            {videoComments.map(c => (
              <div key={c.id} className="flex gap-3">
                {c.authorAvatar ? (
                  <img src={c.authorAvatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {c.authorName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold">{c.authorName}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                    {user && (user.id === c.authorId || user.id === video.authorId) && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icon name="Trash2" size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar related */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <h3 className="font-semibold text-sm mb-3">Рекомендуем</h3>
        <div className="space-y-3">
          {related.map(v => (
            <div
              key={v.id}
              className="flex gap-2.5 cursor-pointer group hover-scale"
              onClick={() => { setActiveVideo(v.id); }}
            >
              <div className="w-36 aspect-video rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                {v.thumbnail ? (
                  <img src={v.thumbnail} className="w-full h-full object-cover video-thumb" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Play" size={20} className="text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{v.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{v.authorName}</p>
                <p className="text-xs text-muted-foreground">{v.views} просм.</p>
              </div>
            </div>
          ))}
          {related.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет других видео</p>
          )}
        </div>
      </aside>
    </div>
  );
}
