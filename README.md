# Statystyki tokenów — wersja 0.2.0

Rozszerzenie dla Owlbear Rodeo. **Cała obsługa znajduje się w menu kontekstowym tokena.**

## Jak używać

1. Kliknij prawym przyciskiem myszy token na warstwie CHARACTER (postać).
2. Kliknij ikonę „Pokaż statystyki”.
3. W oknie zobaczysz zapisany wcześniej obrazek albo komunikat, że go nie ma.
4. Wklej nowy obrazek `Ctrl+V`, ewentualnie wybierz plik, a następnie kliknij „Zapisz obrazek”.
5. Możesz wymienić obrazek na inny lub usunąć przyciskiem „Usuń obecny obrazek”.

Obrazki zapisane we wcześniejszej wersji są kompatybilne: klucz metadanych się nie zmienił. Limit wynosi 1 MB na obrazek.

## Publikacja (to samo repozytorium)

Repozytorium: https://github.com/AttentionHorse1/owlbear-token-stats

1. Zastąp zawartość istniejącego repozytorium plikami z tej paczki (zachowując strukturę katalogów i folder `.github`).
2. Zrób commit/push na gałąź main.
3. W GitHub → Actions sprawdź, czy workflow „Deploy to GitHub Pages” jest zielony.
4. W Owlbear Rodeo odśwież kartę z pokojem; jeśli stara ikonka pozostaje, zamknij i otwórz pokój albo ponownie włącz rozszerzenie.

Manifest: https://attentionhorse1.github.io/owlbear-token-stats/manifest.json

## Technicznie

Plik `index.html` działa wyłącznie w tle poprzez `background_url` manifestu (brak pola `action`, więc znika ikonka z panelu rozszerzeń). W tle rejestrowana jest pozycja menu kontekstowego. Kliknięcie otwiera `viewer.html` z identyfikatorem konkretnego tokena; ten widok umożliwia odczyt i edycję tego samego klucza metadanych: `pl.rpg.token-stats/image`.

Projekt używa Vite z wieloma punktami wejścia (index.html + viewer.html), hostowanie przez GitHub Pages i wdrożenie GitHub Actions.


## Eksperymentalny Popover
Ta wersja zastępuje okno modalne panelem Popover, kotwiczonym przy przycisku menu kontekstowego. Nie zmienia formatu ani miejsca zapisu obrazków (Item Metadata). Nie ma gwarancji, że Owlbear automatycznie zamknie menu kontekstowe.

Zmodyfikowano tylko `src/main.js` oraz `src/viewer.js`.
