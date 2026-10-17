# Statystyki tokenów — rozszerzenie do Owlbear Rodeo

Rozszerzenie pozwala przypisać obrazek ze statystykami do tokena, a potem otworzyć go z menu kontekstowego tokena. Interfejs jest po polsku.

## Co robi ta wersja

- W panelu rozszerzenia można wkleić obrazek ze schowka (`Ctrl+V`) lub wybrać plik graficzny.
- Obrazek zapisuje się w metadanych wybranego tokena.
- Po zaznaczeniu tokena kliknij prawym przyciskiem i wybierz „Pokaż statystyki”.
- Obrazek można zastąpić lub usunąć.

## Ograniczenia

- To pierwsza wersja testowa. Nie tworzy stale widocznej ikonki „i” na rogu tokena; otwieranie odbywa się przez menu kontekstowe.
- Dla niezawodności używaj obrazków do 1 MB. Dane obrazu zapisują się w metadanych tokena, więc duże obrazy mogą zwiększać rozmiar danych sceny i spowalniać synchronizację.
- Zapisane metadane synchronizują się w pokoju. Przed użyciem w grze sprawdź zachowanie w osobnym pokoju testowym i upewnij się, że taki sposób przechowywania odpowiada Twoim potrzebom.

## Publikowanie na GitHub Pages

Repozytorium jest skonfigurowane dla adresu `https://attentionhorse1.github.io/owlbear-token-stats/`. Plik `public/manifest.json` jest kopiowany do gotowego folderu `dist` podczas budowania. Workflow GitHub Actions buduje projekt i publikuje go automatycznie po zmianach w gałęzi `main`.

1. Wgraj pliki projektu do głównego katalogu repozytorium `owlbear-token-stats` i zatwierdź je w gałęzi `main`.
2. W GitHub otwórz **Settings → Pages**. W sekcji **Build and deployment** ustaw **Source: GitHub Actions**.
3. Otwórz zakładkę **Actions** i sprawdź, czy workflow „Deploy to GitHub Pages” zakończył się powodzeniem.
4. Sprawdź, czy manifest otwiera się pod adresem: `https://attentionhorse1.github.io/owlbear-token-stats/manifest.json`.
5. W Owlbear Rodeo otwórz profil, wybierz **Add Extension** i wklej powyższy adres manifestu. Następnie włącz rozszerzenie w pokoju.

## Test lokalny (opcjonalnie)

Wymagany jest Node.js w wersji LTS. W katalogu projektu uruchom:

```bash
npm install
npm run dev
```

## Dokumentacja

- https://docs.owlbear.rodeo/extensions/getting-started/
- https://docs.owlbear.rodeo/extensions/apis/context-menu/
- https://docs.owlbear.rodeo/extensions/apis/scene/items/
- https://docs.owlbear.rodeo/extensions/apis/modal/
- https://vite.dev/guide/static-deploy.html
