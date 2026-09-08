import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TABS } from "../constants/tabs.js";

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === "/"}
          className={({ isActive }) => (isActive ? "bottom-nav__item bottom-nav__item--active" : "bottom-nav__item")}
        >
          {t(tab.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
