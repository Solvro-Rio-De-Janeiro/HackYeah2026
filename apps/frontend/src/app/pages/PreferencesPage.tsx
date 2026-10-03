import React from "react";
import { useDashboard, money, dailyAmount } from "../context/DashboardContext";
import Icon from "../components/common/Icon";
import Switch from "../components/common/Switch";
import { Moon, Sun } from "lucide-react";

export function PreferencesPage() {
  const { theme, setTheme, settings, updateSettings, activeGroup } =
    useDashboard();
  const rate = dailyAmount(activeGroup);

  const settingItems = [
    {
      key: "reminder",
      title: "Przypomnienie w aplikacji",
      text: "Pokaż przypomnienie o dziennej kwocie grupy w Preferencjach",
    },
    {
      key: "privacy",
      title: "Ukryj kwoty w profilu",
      text: "Zasłoń podsumowanie historii w profilu. Historia grupy pozostaje widoczna",
    },
  ];

  const accessibilityItems = [
    {
      key: "highContrast",
      title: "Wysoki kontrast (WCAG AAA)",
      text: "Zwiększa kontrast kolorów i obramowań dla lepszej czytelności",
    },
    {
      key: "largeText",
      title: "Większy tekst",
      text: "Zwiększa rozmiar czcionki w całej aplikacji",
    },
    {
      key: "reduceMotion",
      title: "Ograniczenie ruchu",
      text: "Wyłącza animacje i przejścia ekranów",
    },
  ];

  return (
    <section
      className="secondary-page max-w-190 mx-auto py-10 min-h-162.5"
      aria-labelledby="preferences-title"
    >
      <span className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279] block mb-2">
        TWOJA PRZESTRZEŃ
      </span>

      <h1
        id="preferences-title"
        className="text-3xl font-semibold tracking-tight text-[#010120] mb-2"
      >
        Preferencje
      </h1>

      <p className="text-sm text-[#727279] m-0 mb-8">
        Dopasuj odnowę do swojego rytmu i indywidualnych potrzeb dostępności
      </p>

      <div className="settings-list my-8 border-t border-[#ebebeb]">
        {/* Appearance Row */}
        <div className="settings-row appearance-row flex items-center justify-between flex-wrap gap-5 py-6 border-b border-[#ebebeb]">
          <div>
            <h2 className="text-sm font-semibold text-[#010120] m-0">
              Wygląd aplikacji
            </h2>
            <p
              id="theme-picker-desc"
              className="text-xs text-[#727279] mt-1 m-0"
            >
              Wybierz tryb jasny lub ciemny
            </p>
          </div>

          <div
            className="theme-picker flex p-1 gap-1 bg-[#f4f3fc] border border-[#ebebeb] rounded"
            role="group"
            aria-label="Tryb kolorystyczny"
            aria-describedby="theme-picker-desc"
          >
            <button
              type="button"
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-1.5 min-w-[84px] py-2 px-3 border rounded text-xs cursor-pointer transition-all ${
                theme === "light"
                  ? "bg-white text-[#17171c] border-[#ebebeb] shadow-sm font-medium"
                  : "border-transparent text-[#727279] hover:text-[#010120]"
              }`}
            >
              <Sun className="size-4" /> Jasny
              {theme === "light" && <Icon name="check" size={13} />}
            </button>

            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-1.5 min-w-[84px] py-2 px-3 border rounded text-xs cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-white text-[#17171c] border-[#ebebeb] shadow-sm font-medium"
                  : "border-transparent text-[#727279] hover:text-[#010120]"
              }`}
            >
              <Moon className="size-4" /> Ciemny
              {theme === "dark" && <Icon name="check" size={13} />}
            </button>
          </div>
        </div>

        {/* Setting toggles */}
        {settingItems.map((item) => (
          <div
            className="settings-row flex items-center justify-between gap-5 py-6 border-b border-[#ebebeb]"
            key={item.key}
          >
            <div>
              <h2 className="text-sm font-semibold text-[#010120] m-0">
                {item.title}
              </h2>
              <p
                id={`desc-${item.key}`}
                className="text-xs text-[#727279] mt-1 m-0"
              >
                {item.text}
              </p>
            </div>

            <Switch
              checked={Boolean(settings[item.key])}
              onChange={(val) => updateSettings(item.key, val)}
              label={item.title}
            />
          </div>
        ))}

        {/* Accessibility Section */}
        <div className="pt-6 pb-2">
          <span className="eyebrow muted text-[11px] font-mono tracking-wider uppercase text-[#727279] block mb-1">
            DOSTĘPNOŚĆ (WCAG)
          </span>
          <h2 className="text-base font-semibold text-[#010120] m-0">
            Ułatwienia dostępu
          </h2>
        </div>

        {accessibilityItems.map((item) => (
          <div
            className="settings-row flex items-center justify-between gap-5 py-6 border-b border-[#ebebeb]"
            key={item.key}
          >
            <div>
              <h3 className="text-sm font-semibold text-[#010120] m-0">
                {item.title}
              </h3>
              <p
                id={`desc-${item.key}`}
                className="text-xs text-[#727279] mt-1 m-0"
              >
                {item.text}
              </p>
            </div>

            <Switch
              checked={Boolean(settings[item.key])}
              onChange={(val) => updateSettings(item.key, val)}
              label={item.title}
            />
          </div>
        ))}
      </div>

      {settings.reminder && (
        <p
          className="preference-hint p-4 bg-[#f4f3ff] rounded text-xs text-[#59536f] my-6 leading-relaxed"
          role="note"
        >
          Dzienna kwota w grupie „{activeGroup.name}”: {money(rate)} na osobę.
          Możesz przetestować zapis w „Szczegóły kwoty”.
        </p>
      )}
    </section>
  );
}

export default PreferencesPage;
