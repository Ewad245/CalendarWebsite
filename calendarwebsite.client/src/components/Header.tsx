import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

export default function Header() {
  const { t } = useTranslation();
  
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ThemeToggle />
        <LanguageSwitcher />
      </Box>
      <div className="max-w-7xl mx-auto">
        <h1
          id="tableLabel"
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-neutral-700 dark:text-neutral-50 text-center sm:text-left"
        >
          {t('attendance.staffCheckIn')}
        </h1>
      </div>
    </>
  );
}

