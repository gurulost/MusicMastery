import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LoginScreen() {
  const { loginUser, createUser, allUsers, isCreatingUser, createUserError } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
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
    } catch (error) {
      toast({
        title: "Account Creation Failed",
        description: createUserError || "Failed to create account. Please try again.",
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
    </div>
  );
}