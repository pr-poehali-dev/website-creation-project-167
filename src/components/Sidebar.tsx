import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';

const navItems = [
  { label: 'Главная',    page: 'home',          icon: 'Home' },
  { label: 'Каталог',    page: 'catalog',       icon: 'LayoutGrid' },
  { label: 'Подписки',   page: 'subscriptions', icon: 'Rss' },
  { label: 'История',    page: 'history',       icon: 'Clock' },
  { label: 'Избранное',  page: 'favorites',     icon: 'Bookmark' },
];

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
}

export default function Sidebar({ currentPage, setPage }: SidebarProps) {
  const { user } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-14 bottom-0 w-56 bg-background border-r border-border py-4 px-2 gap-1 z-40">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full
              ${currentPage === item.page
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
          >
            <Icon name={item.icon} fallback="Circle" size={17} />
            {item.label}
          </button>
        ))}
        {user && (
          <>
            <div className="my-2 border-t border-border" />
            <button
              onClick={() => setPage('upload')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full"
            >
              <Icon name="Upload" size={17} />
              Загрузить видео
            </button>
            <button
              onClick={() => setPage('channel')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all w-full"
            >
              <Icon name="BarChart2" size={17} />
              Мой канал
            </button>
          </>
        )}
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border flex items-center justify-around h-14">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors
              ${currentPage === item.page ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon name={item.icon} fallback="Circle" size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
