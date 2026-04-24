import { useState } from 'react';
import { useAuth, Playlist } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

interface PlaylistsPageProps {
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
}

export default function PlaylistsPage({ setPage, setActiveVideo }: PlaylistsPageProps) {
  const { user, playlists, videos, createPlaylist, deletePlaylist, updatePlaylist, removeVideoFromPlaylist } = useAuth();
  const [openPlaylist, setOpenPlaylist] = useState<Playlist | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPublic, setNewPublic] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="ListMusic" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg mb-2">Нужен аккаунт</h2>
      <button onClick={() => setPage('auth')} className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm">Войти</button>
    </div>
  );

  const myPlaylists = playlists.filter(p => p.authorId === user.id);
  const publicPlaylists = playlists.filter(p => p.authorId !== user.id && p.isPublic);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createPlaylist(newTitle.trim(), newDesc.trim(), newPublic);
    setNewTitle('');
    setNewDesc('');
    setShowCreate(false);
  };

  const saveEdit = (id: string) => {
    updatePlaylist(id, { title: editTitle.trim(), description: editDesc.trim() });
    setEditing(null);
  };

  if (openPlaylist) {
    const pl = playlists.find(p => p.id === openPlaylist.id) || openPlaylist;
    const plVideos = pl.videoIds.map(id => videos.find(v => v.id === id)).filter(Boolean) as typeof videos;

    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setOpenPlaylist(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад к плейлистам
        </button>

        <div className="flex flex-col sm:flex-row gap-5 mb-6">
          {/* Cover */}
          <div className="w-full sm:w-48 aspect-video rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {plVideos[0]?.thumbnail ? (
              <img src={plVideos[0].thumbnail} className="w-full h-full object-cover" alt="" />
            ) : (
              <Icon name="ListMusic" size={36} className="text-primary/40" />
            )}
          </div>
          <div className="flex-1">
            {editing === pl.id ? (
              <div className="space-y-2">
                <input
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Название"
                />
                <input
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Описание"
                />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(pl.id)} className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium">Сохранить</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-1.5 rounded-xl bg-secondary text-xs">Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-bold text-xl mb-1">{pl.title}</h1>
                {pl.description && <p className="text-sm text-muted-foreground mb-2">{pl.description}</p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span>{plVideos.length} видео</span>
                  <span>·</span>
                  <span>{pl.isPublic ? 'Публичный' : 'Приватный'}</span>
                </div>
                {pl.authorId === user.id && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setEditing(pl.id); setEditTitle(pl.title); setEditDesc(pl.description); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <Icon name="Pencil" size={12} />
                      Изменить
                    </button>
                    <button
                      onClick={() => { deletePlaylist(pl.id); setOpenPlaylist(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Icon name="Trash2" size={12} />
                      Удалить
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {plVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plVideos.map((v, idx) => (
              <div key={v.id} className="relative group">
                <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                  {idx + 1}
                </div>
                <VideoCard
                  video={v}
                  onClick={() => { setActiveVideo(v.id); setPage('watch'); }}
                />
                {pl.authorId === user.id && (
                  <button
                    onClick={() => removeVideoFromPlaylist(pl.id, v.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <Icon name="X" size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <Icon name="Film" size={36} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">В плейлисте пока нет видео</p>
            <p className="text-xs text-muted-foreground mt-1">Добавляйте видео через кнопку «Плейлист» на странице видео</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <Icon name="ListMusic" size={20} className="text-primary" />
          Плейлисты
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="Plus" size={15} />
          Создать
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 animate-fade-in">
          <h2 className="font-semibold mb-4">Новый плейлист</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
              placeholder="Название плейлиста *"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              maxLength={80}
              autoFocus
            />
            <input
              className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
              placeholder="Описание (необязательно)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewPublic(p => !p)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${newPublic ? 'bg-primary' : 'bg-secondary'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${newPublic ? 'left-5' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-muted-foreground">{newPublic ? 'Публичный' : 'Приватный'}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-1.5 rounded-xl bg-secondary text-xs font-medium">Отмена</button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40"
                >
                  Создать
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* My playlists */}
      {myPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {myPlaylists.map(pl => {
            const plVideos = pl.videoIds.map(id => videos.find(v => v.id === id)).filter(Boolean);
            const cover = plVideos[0] && 'thumbnail' in plVideos[0] ? (plVideos[0] as { thumbnail: string }).thumbnail : '';
            return (
              <div
                key={pl.id}
                className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover-scale"
                onClick={() => setOpenPlaylist(pl)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                  {cover ? (
                    <img src={cover} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="ListMusic" size={32} className="text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-end justify-end p-2">
                    <span className="bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                      {pl.videoIds.length} видео
                    </span>
                  </div>
                  {!pl.isPublic && (
                    <div className="absolute top-2 left-2">
                      <Icon name="Lock" size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{pl.title}</h3>
                  {pl.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{pl.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{pl.isPublic ? 'Публичный' : 'Приватный'}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center mb-8">
          <Icon name="ListMusic" size={40} className="text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">Нет плейлистов</h3>
          <p className="text-sm text-muted-foreground">Создайте первый плейлист и добавляйте видео</p>
        </div>
      )}

      {/* Public playlists from others */}
      {publicPlaylists.length > 0 && (
        <>
          <h2 className="font-semibold mb-4 text-muted-foreground text-sm">Публичные плейлисты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicPlaylists.map(pl => {
              const plVideos = pl.videoIds.map(id => videos.find(v => v.id === id)).filter(Boolean);
              const cover = plVideos[0] && 'thumbnail' in plVideos[0] ? (plVideos[0] as { thumbnail: string }).thumbnail : '';
              const author = playlists.find(p => p.id === pl.id);
              return (
                <div
                  key={pl.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover-scale"
                  onClick={() => setOpenPlaylist(pl)}
                >
                  <div className="aspect-video bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                    {cover ? (
                      <img src={cover} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="ListMusic" size={32} className="text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-end justify-end p-2">
                      <span className="bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                        {pl.videoIds.length} видео
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{pl.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">от другого автора</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
