import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
}

interface UserContextType {
  currentUser: User | null;
  isLoadingUser: boolean;
  loginUser: (userId: string) => void;
  logoutUser: () => void;
  createUser: (username: string) => Promise<void>;
  allUsers: User[];
  isCreatingUser: boolean;
  createUserError: string | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Load all users
  const { data: allUsers = [], refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: true,
  });

  // Create user mutation
  const {
    mutateAsync: createUserMutation,
    isPending: isCreatingUser,
    error: createUserError
  } = useMutation({
    mutationFn: async (username: string): Promise<User> => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      refetchUsers();
    },
  });

  // Load current user from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId && allUsers && allUsers.length > 0) {
      const user = allUsers.find((u) => u.id === storedUserId);
      if (user) {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('currentUserId');
      }
    }
    setIsLoadingUser(false);
  }, [allUsers]);

  const loginUser = (userId: string) => {
    const user = allUsers?.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', userId);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  const createUser = async (username: string) => {
    const newUser = await createUserMutation(username);
    loginUser(newUser.id);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      isLoadingUser,
      loginUser,
      logoutUser,
      createUser,
      allUsers,
      isCreatingUser,
      createUserError: createUserError?.message || null,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}