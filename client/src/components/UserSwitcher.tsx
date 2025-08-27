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
import { Users, LogOut, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function UserSwitcher() {
  const { currentUser, logoutUser, loginUser, createUser, allUsers, isCreatingUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
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
    } catch (error) {
      toast({
        title: "Failed to Create Account",
        description: "This name might already be taken.",
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
    </Dialog>
  );
}