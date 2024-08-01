import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import useToggle from "../hooks/useToggle";
import styles from "./Signup.module.css";
import { supabase } from "@/main";

const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [showPassword, toggleShowPassword] = useToggle(false);
  const [signupError, setSignupError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const password = watch("password");

  const onSubmit = async (formData, e) => {
    e.preventDefault();

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        setSignupError(`Sign Up Error: ${signUpError.message}`);
        return;
      }

      const user = data.user;

      let profileUrl = null;
      if (profileImage && user) {
        const fileExt = profileImage.name.split(".").pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, profileImage);

        if (uploadError) {
          setSignupError(`Image Upload Error: ${uploadError.message}`);
          return;
        }

        const { data: publicData, error: urlError } = supabase.storage
          .from("images")
          .getPublicUrl(filePath);

        if (urlError) {
          setSignupError(`URL Retrieval Error: ${urlError.message}`);
          return;
        }
        profileUrl = publicData.publicUrl;
      }

      if (user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: user.id,
            nickname: formData.nickname,
            profile_url: profileUrl,
          },
        ]);

        if (profileError) {
          setSignupError(`Profile Insert Error: ${profileError.message}`);
          return;
        }

        navigate("/");
      } else {
        setSignupError("Unexpected Error: User not found after sign up");
      }
    } catch (error) {
      setSignupError(`Unexpected Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>가입</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className={styles.label}>이메일:</label>
          <input
            type="text"
            {...register("email", {
              required: "이메일을 입력해주세요.",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "올바른 이메일 형식이 아닙니다.",
              },
              minLength: {
                value: 6,
                message: "이메일은 최소 6자 이상이어야 합니다.",
              },
            })}
            className={styles.inputText}
          />
          {errors.email && (
            <p className={styles.error}>{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className={styles.label}>닉네임:</label>
          <input
            type="text"
            {...register("nickname", {
              required: "닉네임을 입력해주세요.",
            })}
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
        </div>
        <div>
          <label className={styles.label}>비밀번호:</label>
          <div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "비밀번호를 입력해주세요.",
                minLength: {
                  value: 8,
                  message: "비밀번호는 최소 8자 이상이어야 합니다.",
                },
              })}
              className={styles.inputPassword}
            />
          </div>
          {errors.password && (
            <p className={styles.error}>{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className={styles.label}>비밀번호 확인:</label>
          <div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "비밀번호를 다시 입력해주세요.",
                validate: (value) =>
                  value === password || "비밀번호가 동일하지 않습니다.",
              })}
              className={styles.inputPassword}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className={styles.button}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className={styles.error}>{errors.confirmPassword.message}</p>
          )}
        </div>
        {signupError && <p className={styles.error}>{signupError}</p>}
        <button type="submit" className={styles.submitButton}>
          가입
        </button>
      </form>
    </div>
  );
};

export default Signup;
