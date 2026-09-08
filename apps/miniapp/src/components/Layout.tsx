import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav.js";

export function Layout() {
  return (
    <div className="app-layout">
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
