import { useState, useEffect } from "react";
import { YouTubeAccount, initializeAPIs } from "@/lib/youtube-api";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = "youtube-auto-commenter-accounts";

export const useYouTubeAccounts = () => {
  const [accounts, setAccounts] = useState<YouTubeAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsLoading(true);
        
        const savedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedAccounts) {
          setAccounts(JSON.parse(savedAccounts));
        }
        
        await initializeAPIs();
      } catch (err) {
        console.error("Error initializing YouTube accounts", err);
        setError(err as Error);
        toast.error("Failed to load accounts", {
          description: "There was an error loading your saved YouTube accounts."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
    }
  }, [accounts]);

  const addAccount = (account: YouTubeAccount) => {
    setAccounts((prevAccounts) => {
      const existingAccount = prevAccounts.find(
        (a) => a.email === account.email
      );
      
      if (existingAccount) {
        toast.info("Account already exists", {
          description: `The YouTube account ${account.email} is already connected.`,
        });
        return prevAccounts;
      }
      
      const newAccounts = [...prevAccounts, account];
      
      return newAccounts;
    });
  };

  const updateAccount = (id: number, updates: Partial<YouTubeAccount>) => {
    setAccounts((prevAccounts) => {
      const newAccounts = prevAccounts.map((account) => 
        account.id === id ? { ...account, ...updates } : account
      );
      
      const updatedAccount = newAccounts.find(a => a.id === id);
      if (updatedAccount) {
        toast.success("Account updated", {
          description: `YouTube account ${updatedAccount.email} has been updated.`,
        });
      }
      
      return newAccounts;
    });
  };

  const removeAccount = (id: number) => {
    setAccounts((prevAccounts) => {
      const accountToRemove = prevAccounts.find((a) => a.id === id);
      if (accountToRemove) {
        toast.success("Account removed", {
          description: `YouTube account ${accountToRemove.email} has been removed.`,
        });
      }
      return prevAccounts.filter((account) => account.id !== id);
    });
  };

  const toggleAccountStatus = (id: number) => {
    setAccounts((prevAccounts) => {
      const newAccounts = prevAccounts.map((account) => {
        if (account.id === id) {
          const newStatus: "active" | "inactive" = account.status === "active" ? "inactive" : "active";
          toast.success(`Account ${newStatus === "active" ? "reconnected" : "disconnected"}`, {
            description: `YouTube account ${account.email} is now ${newStatus}.`,
          });
          return { ...account, status: newStatus };
        }
        return account;
      });
      return newAccounts;
    });
  };

  const updateAccountProxy = (id: number, proxy: string) => {
    setAccounts((prevAccounts) => {
      const newAccounts = prevAccounts.map((account) => {
        if (account.id === id) {
          toast.success("Proxy updated", {
            description: `Proxy settings updated for ${account.email}.`,
          });
          return { ...account, proxy: proxy || "None" };
        }
        return account;
      });
      return newAccounts;
    });
  };

  const getActiveAccounts = () => {
    return accounts.filter(account => account.status === "active");
  };

  const getAccountById = (id: number) => {
    return accounts.find(account => account.id === id);
  };

  return {
    accounts,
    isLoading,
    error,
    addAccount,
    updateAccount,
    removeAccount,
    toggleAccountStatus,
    updateAccountProxy,
    getActiveAccounts,
    getAccountById
  };
};
