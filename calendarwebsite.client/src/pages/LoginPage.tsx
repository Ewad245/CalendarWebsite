import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('auth.welcomeMessage')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.loginPrompt')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={login}
            disabled={loading}
          >
            <LogIn className="h-5 w-5" />
            {loading ? t('auth.authenticating') : t('auth.loginWithIdentityServer')}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground">
          <p>{t('auth.secureLogin')}</p>
        </CardFooter>
      </Card>
    </div>
  );
}