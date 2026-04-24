import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function Navbar({ currentPage, setPage, searchQuery, setSearchQuery }: NavbarProps) {
  const { user, users, theme, toggleTheme, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const otherUsers = users.filter(u => u.id !== user?.id);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setPage('home');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border h-14 flex items-center px-4 gap-3">
      {/* Logo */}
      <button
        onClick={() => setPage('home')}
        className="flex items-center gap-1.5 flex-shrink-0 group"
      >
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Icon name="Play" size={14} className="text-white translate-x-0.5" />
        </div>
        <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ fontFamily: 'Golos Text, sans-serif' }}>
          Юви<span className="text-primary">ст</span>
        </span>
      </button>

      {/* Search — desktop */}
      <div className="flex-1 max-w-xl mx-auto hidden md:flex items-center gap-2">
        <div className="flex flex-1 items-center bg-secondary rounded-xl px-3 gap-2 h-9">
          <Icon name="Search" size={15} className="text-muted-foreground flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Поиск видео..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setPage('search'); }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <Icon name="X" size={13} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={() => setPage('search')}
          className="h-9 px-4 rounded-xl bg-secondary text-sm font-medium hover:bg-muted transition-colors"
        >
          <Icon name="Search" size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Search mobile */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
          onClick={() => { setSearchOpen(!searchOpen); setPage('search'); }}
        >
          <Icon name="Search" size={18} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-secondary transition-colors"
            >
              {user.avatar ? (
                <img src={user.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-scale-in z-50">
                {/* Current user */}
                <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">@{user.login}</div>
                  </div>
                </div>

                {/* Menu items */}
                {[
                  { label: 'Мой канал', page: 'profile', icon: 'User' },
                  { label: 'Загрузить видео', page: 'upload', icon: 'Upload' },
                  { label: 'Настройки', page: 'settings', icon: 'Settings' },
                ].map(item => (
                  <button
                    key={item.page}
                    onClick={() => { setPage(item.page); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
                  >
                    <Icon name={item.icon} fallback="Circle" size={15} className="text-muted-foreground" />
                    {item.label}
                  </button>
                ))}

                {/* Switch account */}
                {otherUsers.length > 0 && (
                  <>
                    <div className="border-t border-border px-4 pt-2 pb-1">
                      <span className="text-xs text-muted-foreground font-medium">Сменить аккаунт</span>
                    </div>
                    {otherUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { setPage('auth'); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors"
                      >
                        {u.avatar ? (
                          <img src={u.avatar} className="w-7 h-7 rounded-full object-cover flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <div className="text-xs font-medium truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground truncate">@{u.login}</div>
                        </div>
                        <Icon name="ArrowRight" size={12} className="text-muted-foreground ml-auto flex-shrink-0" />
                      </button>
                    ))}
                  </>
                )}

                <div className="border-t border-border" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors"
                >
                  <Icon name="LogOut" size={15} />
                  Выйти из аккаунта
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setPage('auth')}
            className="px-4 h-8 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Войти
          </button>
        )}
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 px-4 py-2 bg-background border-b border-border md:hidden">
          <div className="flex items-center bg-secondary rounded-xl px-3 gap-2 h-9">
            <Icon name="Search" size={15} className="text-muted-foreground" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Поиск видео..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setPage('search'); setSearchOpen(false); } }}
            />
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
