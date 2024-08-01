import { useState, useEffect } from "react";
import { supabase } from "@/main";
import { Link } from "react-router-dom";
import styles from "./UserList.module.css";
import { useAuthContext } from "@/App";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setLoading(false); // user가 없으면 로딩을 중지합니다.
    }
  }, [user]);

  const fetchProfiles = async () => {
    console.log("fetchProfiles called");
    let { data: profiles, error } = await supabase.from("profiles").select("*");

    if (error) {
      console.error("프로필을 불러오는 중 오류가 발생했습니다:", error);
    } else {
      console.log("Profiles fetched:", profiles);
      setUsers(profiles);
    }
    setLoading(false);
  };

  console.log("loading state:", loading);
  if (loading) {
    return <div>로딩 중...</div>;
  }

  console.log("user state:", user);
  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.userList}>
      <h2>추천 친구</h2>
      <ul>
        {users
          .filter((profile) => profile.id !== user.id)
          .map((profile) => (
            <li key={profile.id} className={styles.userItem}>
              <Link to={`/chat/${profile.id}`} className={styles.userLink}>
                <img
                  src={profile.profile_url}
                  alt={profile.nickname}
                  className={styles.userImage}
                />
                <span>{profile.nickname}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default UserList;
