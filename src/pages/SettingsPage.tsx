import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/icon';

interface SettingsPageProps {
  setPage: (p: string) => void;
}

export default function SettingsPage({ setPage }: SettingsPageProps) {
  const { user, theme, toggleTheme, logout, updateProfile } = useAuth();
  const [oldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Icon name="Settings" size={40} className="text-muted-foreground mb-4" />
      <h2 className="font-semibold text-lg mb-2">Нужен аккаунт</h2>
      <button onClick={() => setPage('auth')} className="mt-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm">Войти</button>
    </div>
  );

  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (newPass.length < 4) { setPassError('Пароль минимум 4 символа'); return; }
    if (newPass !== confirmPass) { setPassError('Пароли не совпадают'); return; }
    setPassSaved(true);
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setPage('home')} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h1 className="text-xl font-bold">Настройки</h1>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="Palette" size={16} className="text-primary" />
          Внешний вид
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Тёмная тема</p>
            <p className="text-xs text-muted-foreground">Переключить оформление сайта</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-secondary'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'}`}
          >
            <div className="w-10 h-7 rounded-lg bg-gray-900" />
            <span className="text-xs font-medium">Тёмная</span>
          </button>
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'}`}
          >
            <div className="w-10 h-7 rounded-lg bg-gray-100 border border-gray-200" />
            <span className="text-xs font-medium">Светлая</span>
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="User" size={16} className="text-primary" />
          Аккаунт
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Логин</span>
            <span className="font-medium">@{user.login}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Имя</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Дата регистрации</span>
            <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('ru')}</span>
          </div>
        </div>
        <button
          onClick={() => setPage('profile')}
          className="mt-3 w-full py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-muted transition-colors"
        >
          Редактировать профиль
        </button>
      </div>

      {/* Change password */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Icon name="Lock" size={16} className="text-primary" />
          Изменить пароль
        </h2>
        <form onSubmit={handlePassChange} className="space-y-3">
          <input
            type="password"
            className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
            placeholder="Новый пароль"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
          />
          <input
            type="password"
            className="w-full h-10 px-3 rounded-xl bg-secondary text-sm outline-none border border-transparent focus:border-primary"
            placeholder="Повторите пароль"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
          />
          {passError && <p className="text-destructive text-xs">{passError}</p>}
          {passSaved && <p className="text-green-500 text-xs">Пароль изменён!</p>}
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Сохранить пароль
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="LogOut" size={16} className="text-primary" />
          Сессия
        </h2>
        <button
          onClick={() => { logout(); setPage('home'); }}
          className="w-full py-2 rounded-xl border border-destructive text-destructive text-sm font-medium hover:bg-destructive hover:text-white transition-colors"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}
