export interface TabConfig {
  path: string;
  labelKey: string;
}

export const TABS: TabConfig[] = [
  { path: "/", labelKey: "tabs.home" },
  { path: "/guests", labelKey: "tabs.guests" },
  { path: "/settings", labelKey: "tabs.settings" },
];
