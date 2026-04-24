import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';

interface AuthPageProps {
  setPage: (p: string) => void;
}

export default function AuthPage({ setPage }: AuthPageProps) {
  const { login, register, users, switchAccount, forgetAccount } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'switch'>('login');
  const [loginVal, setLoginVal] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [switchPass, setSwitchPass] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [switchError, setSwitchError] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const ok = login(loginVal.trim(), password);
      if (ok) setPage('home');
      else setError('Неверный логин/email или пароль');
    } else {
      if (!loginVal.trim() || !email.trim() || !name.trim() || !password) {
        setError('Заполните все поля');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Введите корректный email');
        return;
      }
      if (password.length < 4) {
        setError('Пароль минимум 4 символа');
        return;
      }
      const ok = register(loginVal.trim(), email.trim().toLowerCase(), name.trim(), password);
      if (ok) setPage('home');
      else setError('Этот логин или email уже занят');
    }
  };

  const handleSwitch = (userId: string) => {
    setSwitchError(prev => ({ ...prev, [userId]: '' }));
    const pass = switchPass[userId] || '';
    const ok = switchAccount(userId, pass);
    if (ok) setPage('home');
    else setSwitchError(prev => ({ ...prev, [userId]: 'Неверный пароль' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
            <Icon name="Play" size={24} className="text-white translate-x-0.5" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Golos Text' }}>Ювист</h1>
          <p className="text-muted-foreground text-sm mt-1">Смотри и публикуй видео</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          {/* Tabs */}
          <div className="flex bg-secondary rounded-xl p-1 mb-6 gap-1">
            {[
              { key: 'login', label: 'Вход' },
              { key: 'register', label: 'Регистрация' },
              ...(users.length > 0 ? [{ key: 'switch', label: 'Аккаунты' }] : []),
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setMode(tab.key as typeof mode); setError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${mode === tab.key ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Switch account tab */}
          {mode === 'switch' ? (
            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Нет сохранённых аккаунтов</p>
              ) : (
                users.map(u => (
                  <div key={u.id} className="bg-secondary rounded-xl p-3">
                    <div className="flex items-center gap-3 mb-2">
                      {u.avatar ? (
                        <img src={u.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">@{u.login}</div>
                      </div>
                      <button
                        onClick={() => forgetAccount(u.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
                        title="Убрать аккаунт"
                      >
                        <Icon name="X" size={13} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Пароль"
                        className="flex-1 h-8 px-2.5 rounded-lg bg-background text-xs outline-none border border-transparent focus:border-primary transition-colors"
                        value={switchPass[u.id] || ''}
                        onChange={e => setSwitchPass(prev => ({ ...prev, [u.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleSwitch(u.id); }}
                      />
                      <button
                        onClick={() => handleSwitch(u.id)}
                        className="px-3 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Войти
                      </button>
                    </div>
                    {switchError[u.id] && (
                      <p className="text-destructive text-xs mt-1">{switchError[u.id]}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Login / Register form */
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  {mode === 'login' ? 'Логин или Email' : 'Логин'}
                </label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
                  placeholder={mode === 'login' ? 'login или email@mail.ru' : 'your_login'}
                  value={loginVal}
                  onChange={e => setLoginVal(e.target.value)}
                  autoComplete="username"
                />
              </div>

              {mode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                    <input
                      type="email"
                      className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
                      placeholder="email@mail.ru"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Имя канала</label>
                    <input
                      className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
                      placeholder="Ваше имя"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Пароль</label>
                <input
                  type="password"
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              {error && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} /> {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mt-2 shadow-lg shadow-primary/25"
              >
                {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}