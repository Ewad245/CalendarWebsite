import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginButton() {
  const { isAuthenticated, user, login, logout, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <Button variant="ghost" disabled>
        <span className="animate-pulse">Loading...</span>
      </Button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm hidden md:inline-block">
          {user.name || user.email || t('auth.welcome')}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">{t('auth.logout')}</span>
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={login}
      className="flex items-center gap-1"
    >
      <LogIn className="h-4 w-4" />
      <span>{t('auth.login')}</span>
    </Button>
  );
}