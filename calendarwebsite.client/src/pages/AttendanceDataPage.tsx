import { useState, useEffect } from "react";
import { UserInfo } from "../interfaces/type";
import Header from "../components/Header";
import MaterialDataTable from "@/components/MaterialDataTable";
import { useTranslation } from 'react-i18next';
import LoadingSpinner from "@/components/loading-spinner";

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
      <div className="mb-6 sm:mb-8">
        <Header />
      </div>

      {loading ? (
        <LoadingSpinner size="large" fullScreen={true} text={t('attendance.message.loadingData')} />
      ) : (
        <div className="min-h-screen py-6 flex flex-col items-center rounded-md shadow-sm">
          <div className="container mx-auto px-4 max-w-auto">
            <MaterialDataTable userList={userList} />
          </div>
        </div>
      )}
    </div>
  );
}
