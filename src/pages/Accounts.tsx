
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
import { useYouTubeAccounts } from "@/hooks/use-youtube-accounts";
import { signInWithGoogle } from "@/lib/youtube-api";
import { Avatar, AvatarFallback, AvatarImage }   from "@/components/ui/avatar";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
const Accounts = () => {
  const { 
    accounts, 
    isLoading,
    addAccount, 
    removeAccount, 
    toggleAccountStatus, 
    updateAccountProxy 
  } = useYouTubeAccounts();
  
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isProxyDialogOpen, setIsProxyDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [proxyValue, setProxyValue] = useState("");
  const isMobile = useIsMobile();
  const [isGoogleAuthLoading, setIsGoogleAuthLoading] = useState(false);

  const handleGoogleSignIn = (authResult: { credential: any; }) => {
    setIsGoogleAuthLoading(true);
    
    try {
      
      // Real Google OAuth login
      const { credential }  =authResult
      
      // Add the authenticated account
      addAccount({
        id: Date.now(),
        email: credential.email,
        status: "active",
        proxy: proxyValue || "None",
        connectedDate: new Date().toISOString().split("T")[0],
        channelId: credential.channelInfo.channelId,
        channelTitle: credential.channelInfo.title,
        thumbnailUrl: credential.channelInfo.thumbnailUrl,
      });
      
      setIsAddAccountOpen(false);
      setProxyValue("");
    } catch (error) {
      console.error("Google auth error", error);
      // The toast notification is handled in the signInWithGoogle function
    } finally {
      setIsGoogleAuthLoading(false);
    }
  };

  const handleManualAddAccount = () => {
    toast.success("Manual account added", {
      description: "New YouTube account added successfully.",
    });
    
    addAccount({
      id: Date.now(),
      email: `manual-account-${Math.floor(Math.random() * 1000)}@gmail.com`,
      status: "active",
      proxy: proxyValue || "None",
      connectedDate: new Date().toISOString().split("T")[0],
    });
    
    setIsAddAccountOpen(false);
    setProxyValue("");
  };

  const handleToggleStatus = (id: number) => {
    toggleAccountStatus(id);
  };

  const handleDeleteAccount = (id: number) => {
    removeAccount(id);
  };

  const openProxyDialog = (id: number) => {
    const account = accounts.find((a) => a.id === id);
    setSelectedAccountId(id);
    setProxyValue(account?.proxy === "Lost" || account?.proxy === "None" ? "" : account?.proxy || "");
    setIsProxyDialogOpen(true);
  };

  const handleSaveProxy = () => {
    if (!selectedAccountId) return;
    updateAccountProxy(selectedAccountId, proxyValue);
    setIsProxyDialogOpen(false);
    setProxyValue("");
    setSelectedAccountId(null);
  };

  const renderAccountCards = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (accounts.length === 0) {
      return (
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No YouTube accounts connected yet</p>
            <Button onClick={() => setIsAddAccountOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Account
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return accounts.map((account) => (
      <Card key={account.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Avatar className="mr-2 h-8 w-8">
              <AvatarImage src={account.thumbnailUrl} alt={account.channelTitle || account.email} />
              <AvatarFallback>{account.email.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-medium">
                {account.channelTitle || account.email}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{account.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm mt-2">
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
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (accounts.length === 0) {
      return (
        <div className="bg-muted/40 rounded-md border p-8 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">No YouTube accounts connected yet</p>
          <Button onClick={() => setIsAddAccountOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Account
          </Button>
        </div>
      );
    }
    
    return (
      <div className="rounded-md border">
        <ScrollArea className="max-h-[65vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proxy</TableHead>
                <TableHead>Connected Since</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarImage src={account.thumbnailUrl} alt={account.channelTitle || account.email} />
                        <AvatarFallback>{account.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{account.channelTitle || account.email}</div>
                        <div className="text-xs text-muted-foreground">{account.email}</div>
                      </div>
                    </div>
                  </TableCell>
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
            <GoogleOAuthProvider clientId="306302817114-5bcro0pkebe5t4dipi17b5f17b44jkti.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSignIn}
             
                text={"Sign up with google"}
                className="google-login-button"
              />
            </GoogleOAuthProvider> 
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
            <Button onClick={handleManualAddAccount}>Add Manually</Button>
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
