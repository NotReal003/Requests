import React, { useEffect, useState } from "react";
import { MdWifiOff } from "react-icons/md";

const OfflineWarning = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-gray-900 text-white shadow-lg">
      <div className="flex items-center justify-center gap-2 py-2">
        <MdWifiOff className="text-2xl text-red-500" />
        <span className="font-semibold">
          No internet connection. Please check your network connection!
        </span>
      </div>
    </div>
  );
};

export default OfflineWarning;
