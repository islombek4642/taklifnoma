import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.js";
import { HomeScreen } from "./features/home/HomeScreen.js";
import { BuilderScreen } from "./features/builder/BuilderScreen.js";
import { ResultScreen } from "./features/builder/ResultScreen.js";
import { GuestsScreen } from "./features/guests/GuestsScreen.js";
import { SettingsScreen } from "./features/settings/SettingsScreen.js";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/guests" element={<GuestsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="/builder" element={<BuilderScreen />} />
      <Route path="/builder/result" element={<ResultScreen />} />
    </Routes>
  );
}
