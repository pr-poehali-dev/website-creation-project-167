import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import HomePage from '@/pages/HomePage';
import WatchPage from '@/pages/WatchPage';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import UploadPage from '@/pages/UploadPage';
import SearchPage from '@/pages/SearchPage';
import FavoritesPage from '@/pages/FavoritesPage';
import HistoryPage from '@/pages/HistoryPage';
import SubscriptionsPage from '@/pages/SubscriptionsPage';
import CatalogPage from '@/pages/CatalogPage';
import SettingsPage from '@/pages/SettingsPage';
import PlaylistsPage from '@/pages/PlaylistsPage';

function AppContent() {
  const [page, setPage] = useState('home');
  const [activeVideo, setActiveVideo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('Все');

  const noSidebar = ['auth', 'watch'].includes(page);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} setActiveVideo={setActiveVideo} category={category} setCategory={setCategory} />;
      case 'watch':
        return <WatchPage videoId={activeVideo} setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'auth':
        return <AuthPage setPage={setPage} />;
      case 'profile':
        return <ProfilePage setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'channel':
        return <ProfilePage setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'upload':
        return <UploadPage setPage={setPage} />;
      case 'search':
        return <SearchPage query={searchQuery} setQuery={setSearchQuery} setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'favorites':
        return <FavoritesPage setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'history':
        return <HistoryPage setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'subscriptions':
        return <SubscriptionsPage setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'catalog':
        return <CatalogPage setPage={setPage} setActiveVideo={setActiveVideo} />;
      case 'settings':
        return <SettingsPage setPage={setPage} />;
      case 'playlists':
        return <PlaylistsPage setPage={setPage} setActiveVideo={setActiveVideo} />;
      default:
        return <HomePage setPage={setPage} setActiveVideo={setActiveVideo} category={category} setCategory={setCategory} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentPage={page}
        setPage={setPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {!noSidebar && <Sidebar currentPage={page} setPage={setPage} />}

      <main
        className={`pt-14 pb-16 md:pb-0 ${!noSidebar ? 'md:ml-56' : ''} min-h-screen`}
      >
        <div className="px-4 py-5 max-w-screen-2xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}