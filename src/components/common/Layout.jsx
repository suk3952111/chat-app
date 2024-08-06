import { Outlet } from "react-router-dom";
import Header from "./Header";
import styles from "./Layout.module.css"; // CSS 모듈 불러오기

function Layout() {
  return (
    <>
      <Header />
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
