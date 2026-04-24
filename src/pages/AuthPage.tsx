import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';

interface AuthPageProps {
  setPage: (p: string) => void;
}

export default function AuthPage({ setPage }: AuthPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginVal, setLoginVal] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const ok = login(loginVal.trim(), password);
      if (ok) setPage('home');
      else setError('Неверный логин или пароль');
    } else {
      if (!loginVal.trim() || !name.trim() || !password) {
        setError('Заполните все поля');
        return;
      }
      if (password.length < 4) {
        setError('Пароль минимум 4 символа');
        return;
      }
      const ok = register(loginVal.trim(), name.trim(), password);
      if (ok) setPage('home');
      else setError('Этот логин уже занят');
    }
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
          <div className="flex bg-secondary rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
            >
              Вход
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Логин</label>
              <input
                className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
                placeholder="your_login"
                value={loginVal}
                onChange={e => setLoginVal(e.target.value)}
                autoComplete="username"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Имя канала</label>
                <input
                  className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary transition-colors"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
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
        </div>
      </div>
    </div>
  );
}
