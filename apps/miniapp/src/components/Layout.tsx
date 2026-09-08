import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav.js";
import "./Layout.css";

export function Layout() {
  const location = useLocation();

  return (
    <div className="app-layout">
      <main className="app-content">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
