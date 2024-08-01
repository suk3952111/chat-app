import { useEffect, useState } from "react";
import { supabase } from "@/main";
import { useAuthContext } from "@/App";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchUserProfile } from "@/utils/supabaseProfile";
import UserProfile from "@/components/common/UserProfile";
import styles from "./Header.module.css";

const getLinkStyle = ({ isActive }) => (isActive ? styles.activeLink : "");

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthContext();
  const [profileData, setProfileData] = useState({
    nickname: "",
    profile_url: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      getUserProfile();
      subscribeToMessages();
    }
  }, [user]);

  const getUserProfile = async () => {
    try {
      const profile = await fetchUserProfile(user.id);
      setProfileData(profile);
    } catch (error) {
      console.error("프로필 정보를 가져오는 중 오류 발생:", error.message);
    }
  };

  const subscribeToMessages = () => {
    const handleInserts = async (payload) => {
      if (payload.new.receiver_id === user.id) {
        try {
          const senderProfile = await fetchUserProfile(payload.new.sender_id);
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            {
              sender_id: payload.new.sender_id,
              message: payload.new.message,
              nickname: senderProfile.nickname,
            },
          ]);
        } catch (error) {
          console.error(
            "발신자 프로필 정보를 가져오는 중 오류 발생:",
            error.message
          );
        }
      }
    };

    const subscription = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        handleInserts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const onLogout = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("로그아웃 중 오류 발생:", error.message);
      } else {
        setUser(null);
        navigate("/login");
      }
    } catch (error) {
      alert("로그아웃 중 오류 발생:", error.message);
    }
  };

  const handleNotificationClick = (sender_id) => {
    navigate(`/chat/${sender_id}`);
    setShowNotifications(false);
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.sender_id !== sender_id)
    );
  };

  console.log(notifications);

  return (
    <header className={styles.header}>
      <nav className={styles.navigator}>
        <div className={styles.navigatorComponents}>
          <li>
            <NavLink className={getLinkStyle} to="/">
              Home
            </NavLink>
          </li>
        </div>
        <div className={styles.navigatorComponents}>
          {user ? (
            <>
              <li>
                <UserProfile
                  nickname={profileData.nickname || user.email}
                  profileUrl={profileData.profile_url}
                />
              </li>
              <li>
                <button className={styles.logoutButton} onClick={onLogout}>
                  로그아웃
                </button>
              </li>
              <li>
                <NavLink className={getLinkStyle} to="/profile">
                  내 정보
                </NavLink>
              </li>
              <li className={styles.notificationContainer}>
                <button
                  className={styles.notificationButton}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  알림
                  {notifications.length > 0 && (
                    <span className={styles.notificationBadge}>
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <ul className={styles.notificationDropdown}>
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(notification.sender_id)
                        }
                      >
                        {notification.nickname}에게 메시지가 왔습니다
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink className={getLinkStyle} to="/login">
                  로그인
                </NavLink>
              </li>
              <li>
                <NavLink className={getLinkStyle} to="/signup">
                  회원가입
                </NavLink>
              </li>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
