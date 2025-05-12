import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale/vi';
import { enUS } from 'date-fns/locale/en-US';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

interface Props {
    children: React.ReactNode;
}
export function MultilingualLocalizationProvider ({ children }: Props) {
    const { i18n } = useTranslation();
    const locale = useMemo(() => {
        return i18n.language === 'en' ? enUS : vi;
    }, [i18n.language]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
            {children}
        </LocalizationProvider>
    );
}