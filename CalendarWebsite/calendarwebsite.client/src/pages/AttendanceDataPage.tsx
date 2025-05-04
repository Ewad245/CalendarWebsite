import { useState, useEffect } from "react";
import { UserInfo } from "../interfaces/type";
import Header from "../components/Header";
import MaterialDataTable from "@/components/MaterialDataTable";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function AttendanceDataPage() {
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUserList();
  }, []);

  async function fetchUserList() {
    setLoading(true);
    try {
      const response = await fetch("/api/DataOnly_APIaCheckIn");
      if (response.ok) {
        const data: UserInfo[] = await response.json();
        setUserList(data);
      } else {
        console.error(t('attendance.message.fetchError'));
      }
    } catch (error) {
      console.error(`${t('attendance.message.fetchErrorDetails')}`, error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
        <Header />
        <Link to="/" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            {t('navigation.viewCalendar')}
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">{t('attendance.message.loadingData')}</p>
        </div>
      ) : (
        <div className="min-h-screen py-6 flex flex-col items-center rounded-md shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl">
            <MaterialDataTable userList={userList} />
          </div>
        </div>
      )}
    </div>
  );
}
