import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Users, Settings, type LucideIcon } from "lucide-react";
import { TABS, type TabIcon } from "../constants/tabs.js";
import "./BottomNav.css";

const TAB_ICONS: Record<TabIcon, LucideIcon> = {
  home: Home,
  guests: Users,
  settings: Settings,
};

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.icon];
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === "/"}
            className={({ isActive }) => (isActive ? "bottom-nav__item bottom-nav__item--active" : "bottom-nav__item")}
          >
            <span className="bottom-nav__icon">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span className="bottom-nav__label">{t(tab.labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
