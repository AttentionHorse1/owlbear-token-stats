
import OBR from "@owlbear-rodeo/sdk";
import "./style.css";

const EXTENSION_ID = "pl.rpg.token-stats";
const META_KEY = `${EXTENSION_ID}/image`;
const MAX_IMAGE_BYTES = 1024 * 1024;
const tokenId = new URLSearchParams(location.search).get("token");

const titleEl = document.querySelector("#title");
const imageSection = document.querySelector("#imageSection");
const imageEl = document.querySelector("#statImage");
const emptyEl = document.querySelector("#empty");
const pasteTarget = document.querySelector("#pasteTarget");
const preview = document.querySelector("#preview");
const fileInput = document.querySelector("#fileInput");
const saveButton = document.querySelector("#save");
const removeButton = document.querySelector("#remove");
const statusEl = document.querySelector("#status");
const editorTitle = document.querySelector("#editorTitle");

let imageData = null;
let currentItem = null;

function status(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function updateImage(item) {
  currentItem = item;
  const saved = item?.metadata?.[META_KEY];

  titleEl.textContent = item?.name || "Statystyki tokena";

  const hasImage =
    typeof saved?.data === "string" && saved.data.length > 0;

  imageSection.hidden = !hasImage;
  imageEl.hidden = !hasImage;
  emptyEl.hidden = hasImage;

  if (hasImage) {
    imageEl.src = saved.data;
  } else {
    imageEl.removeAttribute("src");
  }

  editorTitle.textContent = hasImage
    ? "Zmień obrazek"
    : "Dodaj obrazek";

  removeButton.disabled = !hasImage;
  saveButton.disabled = !imageData || !item;
}

async function loadToken(showInfo = true) {
  if (!tokenId) {
    status("Brakuje identyfikatora tokena.", true);
    return;
  }

  try {
    const items = await OBR.scene.items.getItems(
      item => item.id === tokenId
    );

    const item = items[0];

    if (!item) {
      currentItem = null;
      saveButton.disabled = true;
      removeButton.disabled = true;
      status("Nie można znaleźć tego tokena na mapie.", true);
      return;
    }

    updateImage(item);

    if (showInfo) {
      status(
        "Wklej obrazek lub wybierz plik, a następnie kliknij Zapisz obrazek."
      );
    }
  } catch (error) {
    status(
      `Nie udało się odczytać tokena: ${error.message}`,
      true
    );
  }
}

function fromClipboard(event) {
  const entries = Array.from(event.clipboardData?.items || []);

  return entries.find(
    item => item.type.startsWith("image/")
  )?.getAsFile() || null;
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("Wybierz plik graficzny."));
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return reject(
        new Error(
          "Obrazek przekracza 1 MB. Zmniejsz go przed wklejeniem."
        )
      );
    }

    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("Nie można odczytać obrazka."));

    reader.readAsDataURL(file);
  });
}

async function acceptImage(file) {
  try {
    imageData = await readImage(file);

    preview.src = imageData;
    preview.hidden = false;
    pasteTarget.classList.add("has-image");

    saveButton.disabled = !currentItem;

    status(
      "Nowy obrazek gotowy — kliknij „Zapisz obrazek”."
    );
  } catch (error) {
    status(error.message, true);
  }
}

pasteTarget.addEventListener("click", () => {
  pasteTarget.focus();
});

document.addEventListener("paste", event => {
  const file = fromClipboard(event);

  if (file) {
    event.preventDefault();
    acceptImage(file);
  } else if (event.target === pasteTarget) {
    status("W schowku nie znaleziono obrazka.", true);
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files?.[0]) {
    acceptImage(fileInput.files[0]);
  }
});

saveButton.addEventListener("click", async () => {
  if (!currentItem || !imageData) return;

  saveButton.disabled = true;

  try {
    const data = imageData;

    await OBR.scene.items.updateItems([tokenId], items => {
      for (const item of items) {
        item.metadata[META_KEY] = {
          data,
          savedAt: new Date().toISOString(),
          label: item.name || "Statystyki tokena"
        };
      }
    });

    imageData = null;
    preview.hidden = true;
    preview.removeAttribute("src");
    pasteTarget.classList.remove("has-image");
    fileInput.value = "";

    await loadToken(false);
    status("Obrazek zapisany przy tokenie.");
  } catch (error) {
    saveButton.disabled = false;
    status(
      `Nie udało się zapisać obrazka: ${error.message}`,
      true
    );
  }
});

removeButton.addEventListener("click", async () => {
  if (!currentItem) return;

  if (!window.confirm(
    "Usunąć obrazek statystyk z tego tokena?"
  )) {
    return;
  }

  removeButton.disabled = true;

  try {
    await OBR.scene.items.updateItems([tokenId], items => {
      for (const item of items) {
        delete item.metadata[META_KEY];
      }
    });

    await loadToken(false);
    status("Usunięto obrazek z tokena.");
  } catch (error) {
    removeButton.disabled = false;
    status(
      `Nie udało się usunąć obrazka: ${error.message}`,
      true
    );
  }
});

// Przywrócenie szybszego okna Modal.
document.querySelector("#close").addEventListener("click", async (event) => {
  event.preventDefault();
  event.stopPropagation();

  alert("Kliknięcie X zostało wykryte!");

  try {
    await OBR.modal.close("pl.rpg.token-stats/viewer");
  } catch (error) {
    console.error("Błąd zamykania:", error);
    alert("Błąd zamykania: " + error.message);
  }
});


OBR.onReady(async () => {
  await loadToken();

  OBR.scene.items.onChange(() => {
    loadToken(false);
  });
});
