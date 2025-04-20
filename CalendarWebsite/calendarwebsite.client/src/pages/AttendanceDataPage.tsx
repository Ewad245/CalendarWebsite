import { useState, useEffect } from "react";
import { UserInfo } from "../interfaces/type";
import Header from "../components/Header";
import MaterialDataTable from "@/components/MaterialDataTable";

export default function AttendanceDataPage() {
  const [userList, setUserList] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to fetch user list");
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Header />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading user data...</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div>
            <MaterialDataTable userList={userList} />
          </div>
        </div>
      )}
    </div>
  );
}
