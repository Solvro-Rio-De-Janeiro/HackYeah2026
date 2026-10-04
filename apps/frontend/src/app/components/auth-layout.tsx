import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function AuthLayout() {
  return (
    <main className="min-h-screen grid grid-rows-[4.25rem_1fr] bg-[#f6f6f9] dark:bg-[#0c0c16] text-black font-sans">
      <Header />
      <div
        id="top"
        className="min-h-[calc(100vh-4.25rem)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 w-full overflow-hidden bg-[#f6f6f9] dark:bg-[#0c0c16]"
      >
        <Outlet />
      </div>
    </main>
  );
}

export default AuthLayout;
