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

// Capture a frame at a given time (in seconds) from a video file
function captureVideoFrame(file: File, timeAt: number): Promise<string> {
  return new Promise(res => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.preload = 'auto';
    video.muted = true;
    video.currentTime = timeAt;
    video.onloadeddata = () => {
      video.currentTime = timeAt;
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(url);
      res(dataUrl);
    };
    video.onerror = () => { URL.revokeObjectURL(url); res(''); };
  });
}

export default function UploadPage({ setPage }: UploadPageProps) {
  const { user, uploadVideo } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Другое');
  const [videoFile, setVideoFile] = useState<string>('');
  const [videoRawFile, setVideoRawFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<string>('');
  const [duration, setDuration] = useState('0:00');
  const [videoDurationSec, setVideoDurationSec] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Frame picker
  const [frames, setFrames] = useState<string[]>([]);
  const [framesLoading, setFramesLoading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<number>(-1);
  const [showFramePicker, setShowFramePicker] = useState(false);

  // Subtitles (SRT file as text)
  const [subtitleText, setSubtitleText] = useState('');
  const [subtitleFile, setSubtitleFile] = useState('');

  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);

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
    setVideoRawFile(file);

    // get duration
    const dur = await new Promise<string>(res => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        const t = Math.floor(video.duration);
        setVideoDurationSec(t);
        const m = Math.floor(t / 60);
        const s = t % 60;
        res(`${m}:${s.toString().padStart(2, '0')}`);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => res('0:00');
    });

    setVideoFile(base64);
    setDuration(dur);
    setLoading(false);
  };

  const loadFrames = async () => {
    if (!videoRawFile || videoDurationSec === 0) return;
    setFramesLoading(true);
    setShowFramePicker(true);
    const count = 6;
    const step = videoDurationSec / (count + 1);
    const captured: string[] = [];
    for (let i = 1; i <= count; i++) {
      const frame = await captureVideoFrame(videoRawFile, step * i);
      captured.push(frame);
    }
    setFrames(captured);
    setFramesLoading(false);
  };

  const selectFrame = (idx: number) => {
    setSelectedFrame(idx);
    setThumbFile(frames[idx]);
    setShowFramePicker(false);
  };

  const handleSubtitleFile = async (file: File) => {
    const text = await file.text();
    setSubtitleText(file.name);
    setSubtitleFile(text);
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
      subtitles: subtitleFile || undefined,
    });
    setSuccess(true);
    setTimeout(() => setPage('home'), 1500);
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
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Icon name="Image" size={15} className="text-primary" />
            Обложка видео
          </p>
          <div className="flex gap-3 flex-wrap">
            {/* Upload image */}
            <div
              className="flex flex-col items-center gap-1.5 cursor-pointer"
              onClick={() => thumbRef.current?.click()}
            >
              <input
                ref={thumbRef} type="file" accept="image/*" className="hidden"
                onChange={async e => {
                  const f = e.target.files?.[0];
                  if (f) { setThumbFile(await fileToBase64(f)); setSelectedFrame(-1); }
                }}
              />
              {thumbFile && selectedFrame === -1 ? (
                <div className="relative">
                  <img src={thumbFile} className="w-28 aspect-video rounded-xl object-cover ring-2 ring-primary" alt="" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="Check" size={10} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-28 aspect-video rounded-xl bg-secondary border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors">
                  <Icon name="Upload" size={16} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Загрузить</span>
                </div>
              )}
            </div>

            {/* Frame picker */}
            {videoFile && (
              <div
                className="flex flex-col items-center gap-1.5 cursor-pointer"
                onClick={loadFrames}
              >
                <div className="w-28 aspect-video rounded-xl bg-secondary border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors">
                  {framesLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Icon name="Film" size={16} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Из видео</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Captured frames */}
            {frames.map((frame, idx) => (
              <div
                key={idx}
                className="relative cursor-pointer"
                onClick={() => selectFrame(idx)}
              >
                <img
                  src={frame}
                  className={`w-28 aspect-video rounded-xl object-cover transition-all
                    ${selectedFrame === idx ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}`}
                  alt=""
                />
                {selectedFrame === idx && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="Check" size={10} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {showFramePicker && framesLoading && (
            <p className="text-xs text-muted-foreground mt-2">Захватываем кадры из видео...</p>
          )}
        </div>

        {/* Subtitles */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Icon name="Captions" size={15} className="text-primary" />
            Субтитры <span className="text-muted-foreground font-normal text-xs">(необязательно)</span>
          </p>
          <input
            ref={subtitleRef} type="file" accept=".srt,.vtt,.txt" className="hidden"
            onChange={async e => {
              const f = e.target.files?.[0];
              if (f) await handleSubtitleFile(f);
            }}
          />
          {subtitleFile ? (
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
              <Icon name="FileText" size={14} className="text-primary" />
              <span className="text-xs flex-1 truncate">{subtitleText}</span>
              <button
                type="button"
                onClick={() => { setSubtitleFile(''); setSubtitleText(''); }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Icon name="X" size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => subtitleRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Upload" size={13} />
              Загрузить файл субтитров (.srt, .vtt)
            </button>
          )}
        </div>

        {/* Title */}
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

        {/* Description */}
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

        {/* Category */}
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