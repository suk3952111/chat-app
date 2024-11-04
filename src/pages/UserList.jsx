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
      setLoading(false);
    }
  }, [user]);

  const fetchProfiles = async () => {
    let { data: profiles, error } = await supabase.from("profiles").select("*");

    if (error) {
      throw new Error(`프로필을 불러오는 중 오류가 발생했습니다: ${error}`);
    } else {
      setUsers(profiles);
    }
    setLoading(false);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <div className={styles.loginMessage}>로그인이 필요합니다.</div>;
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
