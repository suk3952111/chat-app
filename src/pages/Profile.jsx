import { useState, useEffect } from "react";
import { useAuthContext } from "@/App";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile } from "@/utils/supabaseProfile";
import { uploadProfileImage } from "@/utils/supabaseImage";
import UserProfile from "@/components/common/UserProfile";
import styles from "./Profile.module.css"; // CSS 모듈 임포트

const Profile = () => {
  const { user } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [profileImage, setProfileImage] = useState(null);
  const [profileData, setProfileData] = useState({
    nickname: "",
    profile_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getUserProfile();
    }
  }, [user]);

  const getUserProfile = async () => {
    try {
      const profile = await fetchUserProfile(user.id);
      setProfileData(profile);
    } catch (error) {
      setError(error.message);
    }
  };

  const updateProfile = async (formData) => {
    let profileUrl = profileData.profile_url;

    if (profileImage) {
      setUploading(true);
      try {
        profileUrl = await uploadProfileImage(user.id, profileImage);
      } catch (error) {
        setError(error.message);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      await updateUserProfile(user.id, formData.nickname, profileUrl);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>프로필 업데이트</h2>
      <UserProfile
        nickname={profileData.nickname}
        profileUrl={profileData.profile_url}
      />
      <form className={styles.form} onSubmit={handleSubmit(updateProfile)}>
        <div>
          <label className={styles.label}>닉네임:</label>
          <input
            type="text"
            defaultValue={profileData.nickname}
            {...register("nickname", { required: "닉네임을 입력해주세요." })}
            className={styles.inputText}
          />
          {errors.nickname && (
            <p className={styles.error}>{errors.nickname.message}</p>
          )}
        </div>
        <div>
          <label className={styles.label}>프로필 이미지:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImage(e.target.files[0])}
            className={styles.inputFile}
          />
          {uploading && <p>업로드 중...</p>}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submitButton}>
          업데이트
        </button>
      </form>
    </div>
  );
};

export default Profile;
