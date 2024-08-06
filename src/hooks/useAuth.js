import { useState, useEffect } from "react";
import { supabase } from "@/main";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, setUser };
};

export default useAuth;
