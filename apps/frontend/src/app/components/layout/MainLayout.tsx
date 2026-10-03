import { Outlet } from "react-router-dom";
import Header from "../Header";

export function MainLayout() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="screen-transition px-4 sm:px-8 lg:px-12 outline-none"
      >
        <Outlet />
      </main>
    </>
  );
}
