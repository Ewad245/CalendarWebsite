import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import CustomThemeProvider from './MaterialUITheme';
import { useTheme } from '@/contexts/ThemeContext';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const { isDarkMode, toggleTheme } = useTheme();
  const theme = useMemo(() => (isDarkMode ? 'dark' : 'light'), [isDarkMode]);
  

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const handleLanguageChange = (_event: React.MouseEvent<HTMLElement>, newLanguage: string | null) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
    }
  };

  return (
    <CustomThemeProvider mode={theme}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ mr: 1 }}>
        {/* No label needed */}
      </Typography>
      <ToggleButtonGroup
        value={language}
        exclusive
        onChange={handleLanguageChange}
        aria-label="language selector"
        size="small"
      >
        <ToggleButton value="en" aria-label="english">
          {t('language.english')}
        </ToggleButton>
        <ToggleButton value="vi" aria-label="vietnamese">
          {t('language.vietnamese')}
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
    </CustomThemeProvider>
  );
};

export default LanguageSwitcher;