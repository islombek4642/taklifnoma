import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav.js";
import "./Layout.css";

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
