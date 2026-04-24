import { useEffect, useState, useRef } from 'react';
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

const QUALITY_OPTIONS = ['Авто', '1080p', '720p', '480p', '360p', '144p'];

export default function WatchPage({ videoId, setPage, setActiveVideo }: WatchPageProps) {
  const { videos, user, comments, playlists, addComment, deleteComment, react, reactions, addView, toggleFavorite, favorites, toggleSubscription, subscriptions, addVideoToPlaylist, removeVideoFromPlaylist } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showDesc, setShowDesc] = useState(false);
  const [quality, setQuality] = useState('Авто');
  const [showQuality, setShowQuality] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const video = videos.find(v => v.id === videoId);
  const videoComments = comments.filter(c => c.videoId === videoId);
  const related = videos.filter(v => v.id !== videoId).slice(0, 8);
  const myPlaylists = playlists.filter(p => p.authorId === user?.id);

  useEffect(() => {
    if (video) addView(videoId);
    setCommentText('');
    setShowDesc(false);
    setShowQuality(false);
    setShowShare(false);
    setAgeConfirmed(false);
    setShowPlaylistMenu(false);
  }, [videoId]);

  if (!video) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="VideoOff" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg">Видео не найдено</h2>
      <button onClick={() => setPage('home')} className="mt-4 px-4 py-2 rounded-xl bg-secondary text-sm">На главную</button>
    </div>
  );

  // 18+ gate
  if (video.ageRestricted && !ageConfirmed) return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-destructive/10 border-2 border-destructive flex items-center justify-center mb-5">
        <span className="text-3xl font-black text-destructive">18+</span>
      </div>
      <h2 className="font-bold text-xl mb-2">Ограничение по возрасту</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Это видео содержит контент для взрослых. Подтвердите, что вам исполнилось 18 лет.
      </p>
      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={() => setAgeConfirmed(true)}
          className="w-full py-2.5 rounded-xl bg-destructive text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Мне есть 18 лет — смотреть
        </button>
        <button
          onClick={() => setPage('home')}
          className="w-full py-2.5 rounded-xl bg-secondary text-sm font-medium"
        >
          На главную
        </button>
      </div>
    </div>
  );

  const myReaction = reactions[videoId];
  const isFav = favorites.includes(videoId);
  const isSubscribed = subscriptions.includes(video.authorId);
  const shareUrl = `${window.location.origin}?v=${videoId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
      setShowShare(false);
    });
  };

  const handleShareNative = () => {
    if (navigator.share) navigator.share({ title: video.title, url: shareUrl });
    else handleCopyLink();
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    addComment(videoId, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {/* Share toast */}
      {shareToast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl animate-fade-in flex items-center gap-2">
          <Icon name="Check" size={14} /> Ссылка скопирована!
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Video player */}
        <div className="rounded-2xl overflow-hidden bg-black aspect-video mb-4 relative group">
          {video.url ? (
            <>
              <video
                ref={videoRef}
                src={video.url}
                controls
                className="w-full h-full object-contain"
                poster={video.thumbnail}
              />
              {/* Quality overlay */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button
                    onClick={() => setShowQuality(q => !q)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-black/60 text-white hover:bg-black/80 backdrop-blur shadow transition-colors"
                  >
                    <Icon name="Settings2" size={13} />
                    {quality}
                  </button>
                  {showQuality && (
                    <div className="absolute right-0 bottom-full mb-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-10 animate-scale-in">
                      {QUALITY_OPTIONS.map(q => (
                        <button
                          key={q}
                          onClick={() => { setQuality(q); setShowQuality(false); }}
                          className={`w-full px-4 py-2 text-xs text-left hover:bg-secondary transition-colors
                            ${quality === q ? 'text-primary font-semibold' : ''}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="Play" size={56} className="text-white/20" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="flex items-start gap-2 mb-2">
          {video.ageRestricted && (
            <span className="mt-1 flex-shrink-0 px-1.5 py-0.5 rounded-md bg-destructive text-white text-[10px] font-black">18+</span>
          )}
          <h1 className="text-lg font-bold leading-tight">{video.title}</h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Author */}
          <div className="flex items-center gap-3 flex-wrap">
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
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all
                  ${isSubscribed ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground shadow-md shadow-primary/25'}`}
              >
                {isSubscribed ? 'Отписаться' : 'Подписаться'}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Likes */}
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

            {/* Favorite */}
            <button
              onClick={() => user && toggleFavorite(videoId)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-muted transition-colors ${isFav ? 'text-primary' : ''}`}
            >
              <Icon name={isFav ? 'BookmarkCheck' : 'Bookmark'} size={15} />
              <span className="hidden sm:inline">{isFav ? 'Сохранено' : 'Сохранить'}</span>
            </button>

            {/* Add to playlist */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowPlaylistMenu(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Icon name="ListPlus" size={15} />
                  <span className="hidden sm:inline">Плейлист</span>
                </button>
                {showPlaylistMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowPlaylistMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl z-40 animate-scale-in overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-border">
                        <p className="text-xs font-semibold text-muted-foreground">Добавить в плейлист</p>
                      </div>
                      {myPlaylists.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-muted-foreground">
                          Нет плейлистов.{' '}
                          <button onClick={() => { setPage('playlists'); setShowPlaylistMenu(false); }} className="text-primary">Создать</button>
                        </div>
                      ) : (
                        myPlaylists.map(pl => {
                          const inList = pl.videoIds.includes(videoId);
                          return (
                            <button
                              key={pl.id}
                              onClick={() => {
                                if (inList) removeVideoFromPlaylist(pl.id, videoId);
                                else addVideoToPlaylist(pl.id, videoId);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-secondary transition-colors text-left"
                            >
                              <Icon name={inList ? 'CheckSquare' : 'Square'} size={13} className={inList ? 'text-primary' : 'text-muted-foreground'} />
                              <span className="truncate">{pl.title}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quality — mobile */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowQuality(q => !q)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-muted transition-colors"
              >
                <Icon name="Settings2" size={15} />
                {quality}
              </button>
              {showQuality && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowQuality(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-40 animate-scale-in">
                    {QUALITY_OPTIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => { setQuality(q); setShowQuality(false); }}
                        className={`w-full px-5 py-2.5 text-sm text-left hover:bg-secondary transition-colors ${quality === q ? 'text-primary font-semibold' : ''}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setShowShare(s => !s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-muted transition-colors"
              >
                <Icon name="Share2" size={15} />
                <span className="hidden sm:inline">Поделиться</span>
              </button>
              {showShare && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowShare(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl p-3 z-40 animate-scale-in">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground">Поделиться видео</p>
                    <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2 mb-3">
                      <span className="text-xs text-muted-foreground truncate flex-1">{shareUrl}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <Icon name="Copy" size={13} />
                        Копировать
                      </button>
                      <button
                        onClick={handleShareNative}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <Icon name="Share" size={13} />
                        Поделиться
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-secondary rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
            <span>{video.views} просмотров</span>
            <span>·</span>
            <span>{timeAgo(video.createdAt)}</span>
            {video.category && <span className="px-2 py-0.5 rounded-full bg-muted">{video.category}</span>}
            <span className="px-2 py-0.5 rounded-full bg-muted flex items-center gap-1">
              <Icon name="Settings2" size={10} />
              {quality}
            </span>
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
              <div key={c.id} className="flex gap-3 animate-fade-in">
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
                      <button onClick={() => deleteComment(c.id)} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
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
            <div key={v.id} className="flex gap-2.5 cursor-pointer group hover-scale" onClick={() => setActiveVideo(v.id)}>
              <div className="w-36 aspect-video rounded-xl overflow-hidden bg-secondary flex-shrink-0 relative">
                {v.thumbnail ? (
                  <img src={v.thumbnail} className="w-full h-full object-cover video-thumb" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="Play" size={20} className="text-muted-foreground" />
                  </div>
                )}
                {v.ageRestricted && (
                  <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-destructive text-white text-[9px] font-black">18+</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{v.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{v.authorName}</p>
                <p className="text-xs text-muted-foreground">{v.views} просм.</p>
              </div>
            </div>
          ))}
          {related.length === 0 && <p className="text-sm text-muted-foreground">Нет других видео</p>}
        </div>
      </aside>
    </div>
  );
}