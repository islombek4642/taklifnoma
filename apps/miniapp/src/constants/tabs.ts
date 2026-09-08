export type TabIcon = "home" | "guests" | "settings";

export interface TabConfig {
  path: string;
  labelKey: string;
  icon: TabIcon;
}

export const TABS: TabConfig[] = [
  { path: "/", labelKey: "tabs.home", icon: "home" },
  { path: "/guests", labelKey: "tabs.guests", icon: "guests" },
  { path: "/settings", labelKey: "tabs.settings", icon: "settings" },
];
