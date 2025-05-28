import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ENV, isSupabaseConfigured } from "@/lib/env";
import { toast } from "@/hooks/use-toast";

type UserProfile = {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  subscription: string;
  credits: number;
  role: string;
};

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserCredits: (amount: number) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  supabase: typeof supabase;
  isSupabaseConfigured: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  updateUserCredits: async () => {},
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithApple: async () => {},
  supabase,
  isSupabaseConfigured: isSupabaseConfigured(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [configStatus] = useState(isSupabaseConfigured());

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Being tried");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
  };

  // Check for existing session on load
  useEffect(() => {
    // Skip if Supabase is not configured
    if (!configStatus) {
      setIsLoading(false);
      toast({
        title: "Configuration Issue",
        description: "Supabase is not configured properly",
        variant: "destructive",
      });
      return;
    }

    const getSession = async () => {
      setIsLoading(true);

      try {
        // Check for active session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session retrieval error:", error);
          toast({
            title: "Session Error",
            description: error.message,
            variant: "destructive",
          });
        }

        if (session) {
          console.log("Found existing session:", session.user.id);
          const profileData = await fetchProfile(session.user.id);

          if (profileData) {
            setUser({
              id: session.user.id,
              username: profileData.username,
              email: session.user.email,
              full_name: profileData.full_name,
              bio: profileData.bio,
              avatar_url: profileData.avatar_url,
              subscription: profileData.subscription || "free",
              credits: profileData.credits || 0,
              role: profileData.role || "user",
            });

            setIsAdmin(profileData.role === "admin");
            console.log("User authenticated:", profileData.username);

            toast({
              title: "Welcome back",
              description: `Hello, ${profileData.username}`,
            });

            setToken(session.access_token);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        toast({
          title: "Error",
          description: "Failed to retrieve session",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Set up auth state change listener
    let authListener: { unsubscribe: () => void } | null = null;

    try {
      console.log("Setting up auth state change listener");
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id);
          if (event === "SIGNED_IN" && session) {
            // Defer fetching profile to avoid potential Supabase auth deadlock
            setTimeout(async () => {
              console.log("Fetching profile after sign-in");
              const profileData = await fetchProfile(session.user.id);

              if (profileData) {
                setUser({
                  id: session.user.id,
                  username: profileData.username,
                  email: session.user.email,
                  full_name: profileData.full_name,
                  bio: profileData.bio,
                  avatar_url: profileData.avatar_url,
                  subscription: profileData.subscription || "free",
                  credits: profileData.credits || 0,
                  role: profileData.role || "user",
                });

                setIsAdmin(profileData.role === "admin");
                console.log("User signed in:", profileData.username);

                toast({
                  title: "Signed in",
                  description: `Welcome, ${profileData.username}`,
                });

                setToken(session.access_token);
              } else {
                console.error("Profile data not found after sign-in");
              }
            }, 0);
          } else if (event === "SIGNED_OUT") {
            console.log("User signed out");
            toast({
              title: "Signed out",
              description: "You've been signed out",
            });
            setUser(null);
            setToken(null);
            setIsAdmin(false);
          } else if (event === "USER_UPDATED") {
            // Defer fetching updated profile
            setTimeout(async () => {
              if (session?.user.id) {
                console.log("Fetching profile after user update");
                const profileData = await fetchProfile(session.user.id);

                if (profileData) {
                  setUser({
                    id: session.user.id,
                    username: profileData.username,
                    email: session.user.email,
                    full_name: profileData.full_name,
                    bio: profileData.bio,
                    avatar_url: profileData.avatar_url,
                    subscription: profileData.subscription || "free",
                    credits: profileData.credits || 0,
                    role: profileData.role || "user",
                  });

                  setIsAdmin(profileData.role === "admin");
                  console.log("User profile updated");

                  toast({
                    title: "Profile updated",
                    description: "Your profile has been updated",
                  });
                }
              }
            }, 0);
          }
        }
      );

      authListener = data.subscription;
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      toast({
        title: "Error",
        description: "Failed to set up authentication listener",
        variant: "destructive",
      });
    }

    return () => {
      if (authListener) {
        console.log("Unsubscribing auth listener");
        authListener.unsubscribe();
      }
    };
  }, [configStatus]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      toast({
        title: "Signing in",
        description: "Please wait...",
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Don't need to manually set user and token here since onAuthStateChange will handle it
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      toast({
        title: "Creating account",
        description: "Please wait...",
      });

      // First check if username already exists in profiles
      // const { data: existingUser, error: checkError } = await supabase
      //   .from('profiles')
      //   .select('username')
      //   .eq('username', username)
      //   .single();

      // if (checkError && checkError.code !== 'PGRST116') {  // PGRST116 means no rows returned
      //   console.error('Username check error:', checkError);
      //   throw new Error("Error checking username availability");
      // }

      // if (existingUser) {
      //   toast({
      //     title: "Username already taken",
      //     description: "Please choose a different username",
      //     variant: "destructive",
      //   });
      //   throw new Error("Username already taken");
      // }

      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user) {
        toast({
          title: "Account created",
          description: "Welcome to QuikClips",
        });
      }

      // onAuthStateChange will handle updating the state
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return null;
        return { ...prevUser, ...updates };
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateUserCredits = async (amount: number) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          credits: Math.max(0, (user.credits || 0) + amount),
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      // Update local user state
      setUser((prevUser) => {
        if (!prevUser) return null;
        const newCredits = Math.max(0, (prevUser.credits || 0) + amount);
        return { ...prevUser, credits: newCredits };
      });

      toast({
        title: amount > 0 ? "Credits added" : "Credits used",
        description:
          amount > 0
            ? `${amount} credits have been added to your account`
            : `${Math.abs(amount)} credits have been used`,
      });
    } catch (error) {
      console.error("Credits update error:", error);
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Failed to update credits",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to sign in with Google",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Facebook sign-in error:", error);
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to sign in with Facebook",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Apple sign-in error:", error);
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to sign in with Apple",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        updateUserCredits,
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple,
        supabase,
        isSupabaseConfigured: configStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
