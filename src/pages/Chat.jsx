import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/main";
import { useAuthContext } from "@/App";
import { fetchUserProfile } from "@/utils/supabaseProfile";
import styles from "./Chat.module.css";

const Chat = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const { user } = useAuthContext();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchUserProfile(userId)
        .then(setProfile)
        .catch((error) => {
          throw error;
        });
      fetchUserProfile(user.id)
        .then(setMyProfile)
        .catch((error) => {
          throw error;
        });

      const handleInserts = (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
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
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    let { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(
        `메시지를 불러오는 중 오류가 발생했습니다: ${error.message}`
      );
    } else {
      setMessages(messages);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim().length > 0) {
      let { error } = await supabase
        .from("messages")
        .insert([
          { sender_id: user.id, receiver_id: userId, message: newMessage },
        ]);
      if (error) {
        throw new Error(
          `메시지를 보내는 중 오류가 발생했습니다: ${error.message}`
        );
      } else {
        setNewMessage("");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      {profile && (
        <div className={styles.profileHeader}>
          <h2>{profile.nickname}와 채팅하기</h2>
          <img
            src={profile.profile_url}
            alt={profile.nickname}
            className={styles.profileImage}
          />
        </div>
      )}
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <p className={styles.noMessages}>상대방과 대화를 시작하세요!</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.sender_id === user.id
                  ? styles.myMessage
                  : styles.theirMessage
              }`}
            >
              <img
                src={
                  message.sender_id === user.id
                    ? myProfile?.profile_url
                    : profile?.profile_url
                }
                alt={
                  message.sender_id === user.id
                    ? myProfile?.nickname
                    : profile?.nickname
                }
                className={styles.messageProfileImage}
              />
              <div>
                <div className={styles.messageContent}>{message.message}</div>
                <div className={styles.messageTime}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.messageInput}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          보내기
        </button>
      </div>
    </div>
  );
};

export default Chat;
