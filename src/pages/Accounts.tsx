import { useState } from "react";
import { CheckCircle, XCircle, RefreshCw, Link, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialAccounts = [
  {
    id: 1,
    email: "channel1@gmail.com",
    status: "active",
    proxy: "http://user:pass@192.168.1.1:8080",
    connectedDate: "2023-12-15",
  },
  {
    id: 2,
    email: "youtube-creator@gmail.com",
    status: "active",
    proxy: "http://proxy2.example.com:1234",
    connectedDate: "2023-12-01",
  },
  {
    id: 3,
    email: "disconnected@gmail.com",
    status: "inactive",
    proxy: "Lost",
    connectedDate: "2023-11-20",
  },
];

const Accounts = () => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isProxyDialogOpen, setIsProxyDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [proxyValue, setProxyValue] = useState("");
  const isMobile = useIsMobile();

  const handleAddAccount = () => {
    toast.success("Authentication successful!", {
      description: "New YouTube account added successfully.",
    });
    
    setAccounts([
      ...accounts,
      {
        id: accounts.length + 1,
        email: `new-account-${Math.floor(Math.random() * 1000)}@gmail.com`,
        status: "active",
        proxy: proxyValue || "None",
        connectedDate: new Date().toISOString().split("T")[0],
      },
    ]);
    
    setIsAddAccountOpen(false);
    setProxyValue("");
  };

  const handleToggleStatus = (id: number) => {
    setAccounts(
      accounts.map((account) =>
        account.id === id
          ? {
              ...account,
              status: account.status === "active" ? "inactive" : "active",
            }
          : account
      )
    );
    
    const account = accounts.find((a) => a.id === id);
    const newStatus = account?.status === "active" ? "inactive" : "active";
    
    toast.success(`Account ${newStatus === "active" ? "reconnected" : "disconnected"}`, {
      description: `YouTube account ${account?.email} is now ${newStatus}.`,
    });
  };

  const handleDeleteAccount = (id: number) => {
    const accountToDelete = accounts.find((a) => a.id === id);
    setAccounts(accounts.filter((account) => account.id !== id));
    
    toast.success("Account removed", {
      description: `YouTube account ${accountToDelete?.email} has been removed.`,
    });
  };

  const openProxyDialog = (id: number) => {
    const account = accounts.find((a) => a.id === id);
    setSelectedAccountId(id);
    setProxyValue(account?.proxy === "Lost" || account?.proxy === "None" ? "" : account?.proxy || "");
    setIsProxyDialogOpen(true);
  };

  const handleSaveProxy = () => {
    if (!selectedAccountId) return;
    
    setAccounts(
      accounts.map((account) =>
        account.id === selectedAccountId
          ? { ...account, proxy: proxyValue || "None" }
          : account
      )
    );
    
    const account = accounts.find((a) => a.id === selectedAccountId);
    
    toast.success("Proxy updated", {
      description: `Proxy settings updated for ${account?.email}.`,
    });
    
    setIsProxyDialogOpen(false);
    setProxyValue("");
    setSelectedAccountId(null);
  };

  const renderAccountCards = () => {
    return accounts.map((account) => (
      <Card key={account.id} className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{account.email}</CardTitle>
          <div className="flex items-center space-x-2 text-sm">
            {account.status === "active" ? (
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span>Active</span>
              </div>
            ) : (
              <div className="flex items-center">
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                <span>Inactive</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-sm pb-4">
          <div className="grid gap-2">
            <div>
              <div className="text-muted-foreground mb-1">Proxy:</div>
              <div className={account.proxy === "Lost" ? "text-red-500" : ""}>
                {account.proxy}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Connected Since:</div>
              <div>{account.connectedDate}</div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleStatus(account.id)}
                className="h-8 px-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {account.status === "active" ? "Disconnect" : "Reconnect"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openProxyDialog(account.id)}
                className="h-8 px-2"
              >
                <Link className="h-4 w-4 mr-2" />
                Proxy
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteAccount(account.id)}
                className="h-8 px-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderAccountTable = () => {
    return (
      <div className="rounded-md border">
        <ScrollArea className="max-h-[65vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proxy</TableHead>
                <TableHead>Connected Since</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.email}</TableCell>
                  <TableCell>
                    {account.status === "active" ? (
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        <span>Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {account.proxy === "Lost" ? (
                        <span className="text-red-500">{account.proxy}</span>
                      ) : (
                        <span className="truncate max-w-[200px]">{account.proxy}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{account.connectedDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleToggleStatus(account.id)}
                        title={account.status === "active" ? "Disconnect" : "Reconnect"}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openProxyDialog(account.id)}
                        title="Assign Proxy"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteAccount(account.id)}
                        title="Delete Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold">YouTube Accounts</h1>
          <p className="text-muted-foreground">Manage your connected YouTube channels</p>
        </div>
        <Button onClick={() => setIsAddAccountOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {isMobile ? renderAccountCards() : renderAccountTable()}

      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add YouTube Account</DialogTitle>
            <DialogDescription>
              Connect a new YouTube account to use with the auto commenter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Button className="w-full" onClick={() => toast("Google OAuth triggered", { description: "This would redirect to Google login in a real app." })}>
                Sign in with Google
              </Button>
              <p className="text-sm text-center text-muted-foreground">or</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proxy">Proxy Settings (Optional)</Label>
              <Input
                id="proxy"
                placeholder="http://user:pass@host:port"
                value={proxyValue}
                onChange={(e) => setProxyValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Format: http://username:password@host:port
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAccount}>Add Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProxyDialogOpen} onOpenChange={setIsProxyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Proxy</DialogTitle>
            <DialogDescription>
              Update proxy settings for this YouTube account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-proxy">Proxy URL</Label>
            <Input
              id="edit-proxy"
              placeholder="http://user:pass@host:port"
              value={proxyValue}
              onChange={(e) => setProxyValue(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Format: http://username:password@host:port
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProxyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProxy}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;
