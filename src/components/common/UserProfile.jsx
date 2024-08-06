import PropTypes from "prop-types";
import styles from "./UserProfile.module.css";

const UserProfile = ({ nickname, profileUrl }) => {
  return (
    <div className={styles.userProfile}>
      {profileUrl ? (
        <img src={profileUrl} alt="Profile" className={styles.profileImage} />
      ) : (
        <div className={styles.placeholderImage}>No Image</div>
      )}
      <div className={styles.nickname}>{nickname}</div>
    </div>
  );
};

UserProfile.propTypes = {
  nickname: PropTypes.string.isRequired,
  profileUrl: PropTypes.string,
};

export default UserProfile;
