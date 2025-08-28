import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LoginScreen() {
  const { loginUser, createUser, allUsers, isCreatingUser, createUserError } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateUsername, setDuplicateUsername] = useState("");
  const { toast } = useToast();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createUser(newUsername.trim());
      setNewUsername("");
      setShowCreateForm(false);
      toast({
        title: "Welcome!",
        description: `Account created for ${newUsername.trim()}. You can now start learning!`,
      });
    } catch (error: any) {
      if (error instanceof Error && /409:/.test(error.message)) {
        setDuplicateUsername(newUsername.trim());
        setShowDuplicateDialog(true);
        return;
      }
      toast({
        title: "Account Creation Failed",
        description: error?.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectUser = () => {
    if (!selectedUserId) {
      toast({
        title: "Please Select a Name",
        description: "Choose your name from the list to continue.",
        variant: "destructive",
      });
      return;
    }

    loginUser(selectedUserId);
    const user = allUsers.find(u => u.id === selectedUserId);
    toast({
      title: "Welcome Back!",
      description: `Logged in as ${user?.username}. Your progress has been restored.`,
    });
  };

  const handleLoginAsExisting = () => {
    const existingUser = allUsers.find(u => u.username.toLowerCase() === duplicateUsername.toLowerCase());
    if (existingUser) {
      loginUser(existingUser.id);
      setShowDuplicateDialog(false);
      setDuplicateUsername("");
      setNewUsername("");
      setShowCreateForm(false);
      toast({
        title: "Welcome Back!",
        description: `Logged in as ${existingUser.username}. Your progress has been restored.`,
      });
    }
  };

  const handlePickDifferentName = () => {
    setShowDuplicateDialog(false);
    setDuplicateUsername("");
    // Keep the create form open so they can enter a different name
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            🎵 AP Music Theory
          </CardTitle>
          <CardDescription>
            Welcome! Please create your account or select your name to continue.
            All your learning progress will be saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Users */}
          {allUsers.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="select-user">Continue with existing name</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger data-testid="select-existing-user">
                    <SelectValue placeholder="Choose your name..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSelectUser} 
                className="w-full"
                data-testid="button-login-existing"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Continue Learning
              </Button>
            </div>
          )}

          {/* Divider */}
          {allUsers.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>
          )}

          {/* Create New User */}
          {!showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="w-full"
              data-testid="button-show-create-form"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create New Account
            </Button>
          ) : (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Enter your name</Label>
                <Input
                  id="new-username"
                  type="text"
                  placeholder="Your name..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={isCreatingUser}
                  data-testid="input-new-username"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isCreatingUser}
                  data-testid="button-create-user"
                >
                  {isCreatingUser ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Create Account
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewUsername("");
                  }}
                  disabled={isCreatingUser}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      
      {/* Duplicate Name Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Name Already Exists
            </DialogTitle>
            <DialogDescription>
              There's already an account with the name "{duplicateUsername}". Would you like to:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button 
              onClick={handleLoginAsExisting} 
              className="w-full justify-start"
              variant="default"
              data-testid="button-login-existing-duplicate"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Log in as {duplicateUsername}
            </Button>
            <Button 
              onClick={handlePickDifferentName} 
              className="w-full justify-start"
              variant="outline"
              data-testid="button-pick-different-name"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Pick a different name
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}