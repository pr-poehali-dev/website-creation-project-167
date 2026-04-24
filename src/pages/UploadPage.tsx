import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';

const CATEGORIES = ['Игры', 'Музыка', 'Спорт', 'Технологии', 'Кино', 'Образование', 'Влог', 'Новости', 'Другое'];

interface UploadPageProps {
  setPage: (p: string) => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

function getVideoDuration(file: File): Promise<string> {
  return new Promise(res => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const t = Math.floor(video.duration);
      const m = Math.floor(t / 60);
      const s = t % 60;
      res(`${m}:${s.toString().padStart(2, '0')}`);
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => res('0:00');
  });
}

export default function UploadPage({ setPage }: UploadPageProps) {
  const { user, uploadVideo } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Другое');
  const [videoFile, setVideoFile] = useState<string>('');
  const [thumbFile, setThumbFile] = useState<string>('');
  const [duration, setDuration] = useState('0:00');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="Lock" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg mb-2">Нужен аккаунт</h2>
      <button onClick={() => setPage('auth')} className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Войти</button>
    </div>
  );

  const handleVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) return;
    setLoading(true);
    const base64 = await fileToBase64(file);
    const dur = await getVideoDuration(file);
    setVideoFile(base64);
    setDuration(dur);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoFile) return;
    uploadVideo({
      title: title.trim(),
      description: description.trim(),
      url: videoFile,
      thumbnail: thumbFile,
      duration,
      category,
    });
    setSuccess(true);
    setTimeout(() => { setPage('home'); }, 1500);
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-scale-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon name="CheckCircle" size={32} className="text-primary" />
      </div>
      <h2 className="font-bold text-xl">Видео опубликовано!</h2>
      <p className="text-muted-foreground text-sm mt-1">Перенаправляем на главную...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setPage('home')} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="text-xl font-bold">Загрузить видео</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Video upload */}
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
            ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          onClick={() => videoRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={async e => {
            e.preventDefault(); setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) await handleVideoFile(f);
          }}
        >
          <input
            ref={videoRef} type="file" accept="video/*" className="hidden"
            onChange={async e => { const f = e.target.files?.[0]; if (f) await handleVideoFile(f); }}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Обработка видео...</p>
            </div>
          ) : videoFile ? (
            <div className="flex flex-col items-center gap-2">
              <Icon name="CheckCircle" size={32} className="text-primary" />
              <p className="text-sm font-medium">Видео загружено · {duration}</p>
              <p className="text-xs text-muted-foreground">Нажмите чтобы заменить</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-1">
                <Icon name="Upload" size={22} className="text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">Нажмите или перетащите видео</p>
              <p className="text-xs text-muted-foreground">MP4, AVI, MOV — до 500 МБ</p>
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div
          className="border border-dashed rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => thumbRef.current?.click()}
        >
          <input
            ref={thumbRef} type="file" accept="image/*" className="hidden"
            onChange={async e => {
              const f = e.target.files?.[0];
              if (f) setThumbFile(await fileToBase64(f));
            }}
          />
          {thumbFile ? (
            <img src={thumbFile} className="w-24 aspect-video rounded-xl object-cover" alt="" />
          ) : (
            <div className="w-24 aspect-video rounded-xl bg-secondary flex items-center justify-center">
              <Icon name="Image" size={20} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Обложка видео</p>
            <p className="text-xs text-muted-foreground">Рекомендуется 1280×720</p>
          </div>
        </div>

        {/* Fields */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Название *</label>
          <input
            className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
            placeholder="Введите название видео"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Описание</label>
          <textarea
            className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors resize-none"
            placeholder="Расскажите о видео..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Категория</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat} type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                  ${category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !videoFile}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          Опубликовать видео
        </button>
      </form>
    </div>
  );
}
