
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { initializeAPIs } from "@/lib/youtube-api";
import { toast } from "sonner";

const Layout = () => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Initialize YouTube API when the app starts
    const init = async () => {
      try {
        await initializeAPIs();
      } catch (error) {
        console.error("Failed to initialize YouTube API", error);
        toast.error("Failed to initialize YouTube integration", {
          description: "Some features may not work correctly. Please refresh the page to try again.",
        });
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
