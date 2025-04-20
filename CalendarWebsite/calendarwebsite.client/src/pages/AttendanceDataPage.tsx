import { useState, useEffect } from "react";
import { UserInfo } from "../interfaces/type";
import Header from "../components/Header";
import MaterialDataTable from "@/components/MaterialDataTable";
import { Link } from "react-router-dom";

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
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
        <Header />
        <Link to="/" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            View Calendar
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading user data...</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden rounded-md shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <MaterialDataTable userList={userList} />
          </div>
        </div>
      )}
    </div>
  );
}
