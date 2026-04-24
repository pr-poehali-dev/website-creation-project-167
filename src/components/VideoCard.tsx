import { Video } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
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
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} мес назад`;
  return `${Math.floor(mo / 12)} г назад`;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div
      className="video-card group cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video mb-2.5">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="video-thumb w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <Icon name="Play" size={36} className="text-muted-foreground opacity-40" />
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded-md">
          {video.duration || '0:00'}
        </div>
        {video.ageRestricted && (
          <div className="absolute top-1.5 left-1.5 bg-destructive text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
            18+
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2.5">
        {video.authorAvatar ? (
          <img src={video.authorAvatar} className="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary font-bold text-xs">
            {video.authorName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">{video.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatViews(video.views)} просм. · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}