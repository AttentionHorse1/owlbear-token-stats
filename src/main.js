import OBR from "@owlbear-rodeo/sdk";
import "./style.css";

const EXTENSION_ID = "pl.rpg.token-stats";
const META_KEY = `${EXTENSION_ID}/image`;
const MAX_IMAGE_BYTES = 1 * 1024 * 1024;
const SITE_BASE = "https://attentionhorse1.github.io/owlbear-token-stats/";

const selectionEl = document.querySelector("#selection");
const pasteTarget = document.querySelector("#pasteTarget");
const preview = document.querySelector("#preview");
const saveButton = document.querySelector("#save");
const removeButton = document.querySelector("#remove");
const statusEl = document.querySelector("#status");
const fileInput = document.querySelector("#fileInput");

let selectedItem = null;
let imageData = null;

function setStatus(message, error = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", error);
}

function imageFromClipboardEvent(event) {
  const items = Array.from(event.clipboardData?.items ?? []);
  return items.find((item) => item.type.startsWith("image/"))?.getAsFile() ?? null;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Wybierz plik graficzny."));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error("Obrazek jest większy niż 1 MB. Zmniejsz go przed zapisaniem."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nie udało się odczytać obrazka."));
    reader.readAsDataURL(file);
  });
}

async function loadSelectedToken() {
  try {
    const ids = await OBR.player.getSelection();
    if (!ids || ids.length !== 1) {
      selectedItem = null;
      selectionEl.textContent = ids?.length > 1
        ? "Zaznacz tylko jeden token, aby przypisać obrazek."
        : "Nie zaznaczono tokena. Zaznacz jeden token na mapie.";
      saveButton.disabled = true;
      removeButton.disabled = true;
      return;
    }
    const items = await OBR.scene.items.getItems((item) => item.id === ids[0]);
    selectedItem = items[0] ?? null;
    if (!selectedItem) {
      selectionEl.textContent = "Nie udało się odczytać zaznaczonego elementu.";
      saveButton.disabled = true;
      removeButton.disabled = true;
      return;
    }
    selectionEl.textContent = `Wybrany token: ${selectedItem.name || "bez nazwy"}`;
    const saved = selectedItem.metadata?.[META_KEY];
    removeButton.disabled = !saved?.data;
    saveButton.disabled = !imageData;
    if (!imageData) {
      preview.hidden = true;
      pasteTarget.classList.remove("has-image");
      setStatus(saved?.data
        ? "Ten token ma już obrazek. Możesz go zastąpić lub usunąć."
        : "Kliknij obszar wklejania i użyj Ctrl+V, albo wybierz plik.");
    }
  } catch (error) {
    setStatus(`Nie udało się odczytać zaznaczenia: ${error.message}`, true);
  }
}

async function acceptImage(file) {
  try {
    imageData = await fileToDataUrl(file);
    preview.src = imageData;
    preview.hidden = false;
    pasteTarget.classList.add("has-image");
    saveButton.disabled = !selectedItem;
    setStatus("Obrazek gotowy. Kliknij „Zapisz przy tokenie”.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

pasteTarget.addEventListener("click", () => pasteTarget.focus());
pasteTarget.addEventListener("paste", (event) => {
  const file = imageFromClipboardEvent(event);
  if (!file) {
    setStatus("Schowek nie zawiera obrazka. Skopiuj obrazek, kliknij obszar i wklej ponownie.", true);
    return;
  }
  event.preventDefault();
  acceptImage(file);
});
document.addEventListener("paste", (event) => {
  if (event.target === fileInput) return;
  const file = imageFromClipboardEvent(event);
  if (file) {
    event.preventDefault();
    acceptImage(file);
  }
});
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (file) acceptImage(file);
});

saveButton.addEventListener("click", async () => {
  if (!selectedItem || !imageData) {
    setStatus("Zaznacz jeden token i wklej obrazek.", true);
    return;
  }
  try {
    await OBR.scene.items.updateItems([selectedItem.id], (items) => {
      for (const item of items) {
        item.metadata[ META_KEY ] = {
          data: imageData,
          savedAt: new Date().toISOString(),
          label: item.name || "Statystyki przeciwnika"
        };
      }
    });
    setStatus("Zapisano obrazek przy tokenie. Możesz go otworzyć z menu kontekstowego tokena.");
    imageData = null;
    preview.hidden = true;
    preview.removeAttribute("src");
    pasteTarget.classList.remove("has-image");
    saveButton.disabled = true;
    await loadSelectedToken();
  } catch (error) {
    setStatus(`Nie udało się zapisać obrazka: ${error.message}`, true);
  }
});

removeButton.addEventListener("click", async () => {
  if (!selectedItem) return;
  try {
    await OBR.scene.items.updateItems([selectedItem.id], (items) => {
      for (const item of items) delete item.metadata[META_KEY];
    });
    setStatus("Usunięto obrazek z tokena.");
    await loadSelectedToken();
  } catch (error) {
    setStatus(`Nie udało się usunąć obrazka: ${error.message}`, true);
  }
});

OBR.onReady(async () => {
  await OBR.contextMenu.create({
    id: `${EXTENSION_ID}/context-menu`,
    icons: [{
      icon: `${SITE_BASE}info.svg`,
      label: "Pokaż statystyki",
      filter: {
        every: [{ key: "layer", value: "CHARACTER" }]
      }
    }],
    async onClick(context) {
      const item = context.items?.[0];
      if (!item) return;
      await OBR.modal.open({
        id: `${EXTENSION_ID}/viewer`,
        url: `${SITE_BASE}viewer.html?token=${encodeURIComponent(item.id)}`,
        width: 620,
        height: 720
      });
    }
  });
  await loadSelectedToken();
  OBR.player.onChange(() => loadSelectedToken());
  OBR.scene.items.onChange(() => loadSelectedToken());
});