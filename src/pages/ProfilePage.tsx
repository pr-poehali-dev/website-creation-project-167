import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

interface ProfilePageProps {
  setPage: (p: string) => void;
  setActiveVideo: (id: string) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage({ setPage, setActiveVideo }: ProfilePageProps) {
  const { user, videos, updateProfile, deleteVideo, deleteAccount } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="User" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg mb-2">Нужен аккаунт</h2>
      <button onClick={() => setPage('auth')} className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm">Войти</button>
    </div>
  );

  const myVideos = videos.filter(v => v.authorId === user.id);
  const totalViews = myVideos.reduce((acc, v) => acc + v.views, 0);
  const totalLikes = myVideos.reduce((acc, v) => acc + v.likes, 0);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const base64 = await fileToBase64(f);
    updateProfile({ avatar: base64 });
  };

  const saveProfile = () => {
    updateProfile({ name: name.trim() || user.name, bio: bio.trim() });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Avatar */}
          <div className="relative">
            {user.avatar ? (
              <img src={user.avatar} className="w-20 h-20 rounded-2xl object-cover" alt="" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
            >
              <Icon name="Camera" size={12} className="text-white" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input
                  className="w-full h-9 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Имя канала"
                />
                <input
                  className="w-full h-9 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="О себе..."
                  maxLength={200}
                />
                <div className="flex gap-2">
                  <button onClick={saveProfile} className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium">Сохранить</button>
                  <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-xl bg-secondary text-xs font-medium">Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-bold text-xl">{user.name}</h1>
                <p className="text-muted-foreground text-sm">@{user.login}</p>
                {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
                <button onClick={() => setEditing(true)} className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="Pencil" size={12} /> Редактировать профиль
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Видео', value: myVideos.length },
            { label: 'Просмотры', value: totalViews.toLocaleString() },
            { label: 'Лайки', value: totalLikes.toLocaleString() },
          ].map(stat => (
            <div key={stat.label} className="bg-secondary rounded-xl p-3 text-center">
              <div className="font-bold text-lg">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Мои видео · {myVideos.length}</h2>
        <button
          onClick={() => setPage('upload')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Icon name="Plus" size={15} />
          Загрузить
        </button>
      </div>

      {/* Videos */}
      {myVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myVideos.map(video => (
            <div key={video.id} className="relative group">
              <VideoCard
                video={video}
                onClick={() => { setActiveVideo(video.id); setPage('watch'); }}
              />
              <button
                onClick={() => deleteVideo(video.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
              >
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <Icon name="Video" size={36} className="text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">У вас пока нет видео</p>
        </div>
      )}

      {/* Delete account */}
      <div className="mt-10 border-t border-border pt-6">
        <h3 className="font-semibold text-destructive mb-2">Удалить аккаунт</h3>
        <p className="text-sm text-muted-foreground mb-3">Это действие нельзя отменить. Все ваши видео и данные будут удалены.</p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-xl border border-destructive text-destructive text-sm hover:bg-destructive hover:text-white transition-colors"
          >
            Удалить аккаунт
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={deleteAccount}
              className="px-4 py-2 rounded-xl bg-destructive text-white text-sm font-medium"
            >
              Подтвердить удаление
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 rounded-xl bg-secondary text-sm"
            >
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
