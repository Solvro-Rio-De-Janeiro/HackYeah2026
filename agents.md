# Agent Guidelines & Design System Rules: Sober (Odnowa)

Niniejszy dokument określa kluczowe wytyczne projektowe, reguły typograficzne oraz standardy implementacji dla modeli i agentów AI pracujących w repozytorium projektu **Sober (Odnowa)**.

---

## 1. Wytyczne Typograficzne (Typography & Font System)

Aplikacja wykorzystuje ścisły, dwuskładnikowy system typograficzny zdefiniowany w `apps/frontend/src/styles.css`:

### 1.1 Czcionka Techniczna i Interaktywna: `DM Mono` (`font-mono`)
* **Nazwa czcionki:** `'DM Mono', monospace`
* **Import Google Fonts:** `DM+Mono:wght@400;500`
* **Zmienna CSS:** `--font-mono: 'DM Mono', monospace;`
* **Klasa Tailwind:** `font-mono`

> [!IMPORTANT]
> **Zasada bezwzględna:** Wszystkie elementy techniczne, przyciski akcji, timery, odliczacze czasu oraz etykiety uppercase **MUSZĄ** używać czcionki **`DM Mono`** — dokładnie tej samej, która definiuje przycisk **`SZCZEGÓŁY KWOTY ↗`** (`.outline`).

#### Elementy wymagające czcionki `DM Mono`:
1. **Przyciski akcji: "SZCZEGÓŁY KWOTY", "WPŁAĆ 30 TERAZ" oraz "WPŁAĆ KWOTĘ TERAZ" (wszystkie `.outline` i `.primary`):**
   - Przyciski wpłaty stawki i szczegółów kwoty muszą mieć w 100% identyczną typografię, rozmiar i odstępy:
   ```css
   font-family: 'DM Mono', monospace;
   font-size: 10px;
   letter-spacing: .6px;
   font-weight: 500;
   text-transform: uppercase;
   ```
2. **Timer oczekujący na wpłatę (`.daily-timer-box`, `SavingsHero` disc timer):**
   - Cyfry odliczające czas: `HH:MM:SS` (np. `02:48:15`)
   - Etykiety stanu: `CZEKA NA WPŁATĘ`, `WPŁATA ZAKSIĘGOWANA ✓`
   - Etykiety kontekstowe: `DO KOŃCA DOBY`, `DO KOLEJNEJ`
   ```tsx
   /* Przykład implementacji timera zgodnego ze stylem SZCZEGÓŁY KWOTY */
   <span className="font-mono text-lg font-medium tracking-wider uppercase">
     {timeRemaining}
   </span>
   ```
3. **Etykiety typu Eyebrow:**
   - Etykiety sekcji (np. `DZIENNA KWOTA GRUPY`, `WSPÓLNY CEL · DEMO`, `TWÓJ CODZIENNY RYTM`).
4. **Identyfikatory, kody i liczniki:**
   - Kody BLIK (np. `742 819`), kody zaproszeń do grup (`ODNOWA`), identyfikatory transakcji, kwoty i odznaki procentowe (`32% CELU`).

---

### 1.2 Czcionka Interfejsu (Sans-serif): `Manrope` (`font-sans`)
* **Nazwa czcionki:** `'Manrope', sans-serif`
* **Import Google Fonts:** `Manrope:wght@400;500;600;700;800`
* **Zmienna CSS:** `--font-sans: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
* **Zastosowanie:**
  - Główne nagłówki stron (`H1`, `H2`, `H3`).
  - Dłuższy tekst czytany, akapity (`p`), opisy celów i podsumowania.
  - Formularze (wartości pól wejściowych, placeholdery).

---

## 2. Paleta Barw i Tokeny Semantyczne

Wszystkie komponenty powinny korzystać ze spójnych zmiennych CSS:

| Token | Wartość Hex | Zastosowanie |
| :--- | :--- | :--- |
| `--ink` / `--color-ink` | `#010120` | Kolor wiodący marki, ciemne tło hero, przyciski główne. |
| `--lavender` / `--color-lavender` | `#bdbbff` | Akcenty tekstowe, statusy, wskaźniki w motywie nocnym. |
| `--mint` / `--color-mint` | `#c8f6f9` | Świeży akcent, kropki online (`#85ebcf`), cyjanowe wskaźniki. |
| `--line` / `--color-line` | `#ebebeb` | Obramowania paneli i separatorów (w trybie ciemnym `#323145`). |
| `--muted` / `--color-muted` | `#4e4e56` / `#727279` | Teksty pomocnicze, opisy, etykiety o mniejszym kontraście. |
| `--focus-ring` | `#4338ca` (lub `#ffffff`) | Obrys fokusu dostępności WCAG (3px outline). |

---

## 3. Kluczowe Reguły UI/UX dla Agentów

1. **Izolacja formularza rejestracji i logowania (`.auth-card`):**
   - Karta logowania i rejestracji (`/login`, `/signup`) **zawsze** pozostaje czysto biała (`#ffffff`) z ciemnym tekstem, bez względu na aktywny motyw ciemny aplikacji (`background-color: #ffffff !important`).
   - Tło strony logowania/rejestracji to głęboki atrament (`bg-[#010120]`), a nagłówek pozostaje biały z borderem.

2. **Timer oczekujący na wpłatę (Brak blokujących modali 120s):**
   - Timer odliczający czas na wpłatę dziennej stawki ma być **zintegrowany bezpośrednio wewnątrz komponentu** (`DailyAmountPanel` w centralnej części paska oraz wewnątrz tarczy koła `SavingsHero`).
   - Nie należy dodawać blokujących wyskakujących okienek z 120-sekundowym limitem.
   - Kliknięcie przycisku wpłaty natychmiast księguje kwotę i aktualizuje stan licznika do następnej doby.

3. **Bezpieczny zapis stanu (Offline-first & LocalStorage):**
   - W środowiskach testowych (Vitest/JSDOM) obiekt `localStorage` może być niezdefiniowany.
   - Wszelkie operacje zapisu i odczytu w `DashboardContext.tsx` muszą przechodzić przez bezpieczne funkcje `readSaved()` i `writeSaved()` zabezpieczone blokiem `try/catch` i sprawdzeniem `typeof localStorage !== 'undefined'`.

4. **Ścisłe ograniczenie zakresu prac (Strict Scope Rule):**
   - **Pod żadnym pozorem nie modyfikować kodu w katalogu `apps/backend/`**. Prace dotyczą wyłącznie części frontendowej (`apps/frontend/`).

---

## 4. Weryfikacja Jakości Kodu

Przed zakończeniem każdego zadania agent jest zobowiązany do uruchomienia i weryfikacji:
1. **Testy jednostkowe i integracyjne:**
   ```bash
   pnpm exec nx test frontend
   ```
   Wszystkie testy w `apps/frontend/src/app/app.spec.tsx` muszą przechodzić ze statusem **100% PASS**.

2. **Kompilacja produkcyjna:**
   ```bash
   pnpm exec nx build frontend
   ```
   Kompilacja Vite musi zakończyć się kodem wyjścia `0` bez błędów typowania TypeScript.
