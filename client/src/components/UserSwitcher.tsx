import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, LogOut, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function UserSwitcher() {
  const { currentUser, logoutUser, loginUser, createUser, allUsers, isCreatingUser, createUserError } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateUsername, setDuplicateUsername] = useState("");
  const { toast } = useToast();

  const handleSwitchUser = () => {
    if (!selectedUserId) return;
    
    loginUser(selectedUserId);
    const user = allUsers.find(u => u.id === selectedUserId);
    setIsOpen(false);
    setSelectedUserId("");
    toast({
      title: "Switched User",
      description: `Now logged in as ${user?.username}`,
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    try {
      await createUser(newUsername.trim());
      setNewUsername("");
      setShowCreateForm(false);
      setIsOpen(false);
      toast({
        title: "Account Created",
        description: `Welcome ${newUsername.trim()}! Your progress will be saved.`,
      });
    } catch (error: any) {
      if (error instanceof Error && /409:/.test(error.message)) {
        setDuplicateUsername(newUsername.trim());
        setShowDuplicateDialog(true);
        return;
      }
      toast({
        title: "Failed to Create Account",
        description: error?.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    toast({
      title: "Logged Out",
      description: "Select or create an account to continue learning.",
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
      setIsOpen(false);
      toast({
        title: "Welcome Back!",
        description: `Switched to ${existingUser.username}. Your progress has been restored.`,
      });
    }
  };

  const handlePickDifferentName = () => {
    setShowDuplicateDialog(false);
    setDuplicateUsername("");
    // Keep the create form open so they can enter a different name
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-user-menu">
          <Users className="w-4 h-4 mr-2" />
          {currentUser?.username}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch User</DialogTitle>
          <DialogDescription>
            Change to a different user account or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current User */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Currently: {currentUser?.username}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>

          {/* Switch to Existing User */}
          <div className="space-y-2">
            <Label>Switch to existing user:</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger data-testid="select-switch-user">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {allUsers
                  .filter(user => user.id !== currentUser?.id)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSwitchUser} 
              disabled={!selectedUserId}
              className="w-full"
              data-testid="button-switch-confirm"
            >
              Switch User
            </Button>
          </div>

          {/* Create New User */}
          <div className="border-t pt-4">
            {!showCreateForm ? (
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                className="w-full"
                data-testid="button-show-create-new"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create New User
              </Button>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-2">
                <Label>Create new user:</Label>
                <Input
                  type="text"
                  placeholder="Enter name..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={isCreatingUser}
                  data-testid="input-create-new-username"
                />
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isCreatingUser || !newUsername.trim()}
                    data-testid="button-create-new-confirm"
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewUsername("");
                    }}
                    disabled={isCreatingUser}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
      
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
              data-testid="button-login-existing-duplicate-switcher"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Switch to {duplicateUsername}
            </Button>
            <Button 
              onClick={handlePickDifferentName} 
              className="w-full justify-start"
              variant="outline"
              data-testid="button-pick-different-name-switcher"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Pick a different name
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}