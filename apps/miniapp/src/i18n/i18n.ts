import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "../locales/uz.json";
import ru from "../locales/ru.json";
import en from "../locales/en.json";

void i18next.use(initReactI18next).init({
  lng: "uz",
  fallbackLng: "uz",
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18next;
