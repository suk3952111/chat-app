import { createContext, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/common/Layout";
import useAuth from "@/hooks/useAuth";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import UserList from "@/pages/UserList";
import Profile from "@/pages/Profile";
import Chat from "@/pages/Chat";

const AuthContext = createContext(null);
export const useAuthContext = () => useContext(AuthContext);

function App() {
  const { user, setUser } = useAuth();

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<UserList />} />
            <Route path="chat/:userId" element={<Chat />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
