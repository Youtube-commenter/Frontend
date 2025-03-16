
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { initializeAPIs } from "@/lib/youtube-api";
import { toast } from "sonner";

const Layout = () => {
  const isMobile = useIsMobile();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Initialize YouTube API when the app starts
    const init = async () => {
      try {
        setIsInitializing(true);
        await initializeAPIs();
        console.log("YouTube API initialized successfully");
      } catch (error) {
        console.error("Failed to initialize YouTube API", error);
        toast.error("Failed to initialize YouTube integration", {
          description: "Some features may not work correctly. Please refresh the page to try again.",
        });
      } finally {
        setIsInitializing(false);
      }
    };
    
    init();
  }, []);
  
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className={`flex-1 overflow-auto ${isMobile ? 'p-3' : 'p-6'}`}>
          {isInitializing ? (
            <div className="flex justify-center items-center h-full opacity-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;
