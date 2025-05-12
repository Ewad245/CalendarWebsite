// src/theme.js
import { createTheme,PaletteMode,ThemeProvider  } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { viVN, enUS } from '@mui/material/locale';
import { useMemo } from 'react';

export default function CustomThemeProvider({ mode, children } : { mode: PaletteMode, children: React.ReactNode}) {

  const { i18n } = useTranslation();

  // Determine the locale based on the current language
  const locale = useMemo(() => {
    return i18n.language === 'en' ? enUS : viVN;
  }, [i18n.language]);

// Memoize the theme to avoid recreating it unnecessarily
const theme = useMemo(() => {
  return createTheme(
    {
      palette: {
        mode,
        primary: {
          main: mode === 'light' ? '#727272' : '#4f46e5',
        },
        background: {
          default: mode === 'light' ? '#fafafa' : '#262626',
          paper: mode === 'light' ? '#fafafa' : '#262626',
        },
      },
    },
    locale,
  );
}, [mode, locale]);

return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  
  
}