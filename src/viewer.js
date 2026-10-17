import OBR from "@owlbear-rodeo/sdk";
import "./style.css";

const EXTENSION_ID = "pl.rpg.token-stats";
const META_KEY = `${EXTENSION_ID}/image`;
const imageEl = document.querySelector("#statImage");
const titleEl = document.querySelector("#title");
const emptyEl = document.querySelector("#empty");
document.querySelector("#close").addEventListener("click", () => {
  // The modal is closed by its own extension id.
  OBR.modal.close(`${EXTENSION_ID}/viewer`);
});

OBR.onReady(async () => {
  const tokenId = new URLSearchParams(window.location.search).get("token");
  if (!tokenId) {
    emptyEl.hidden = false;
    return;
  }
  try {
    const items = await OBR.scene.items.getItems((item) => item.id === tokenId);
    const item = items[0];
    const saved = item?.metadata?.[META_KEY];
    titleEl.textContent = item?.name || saved?.label || "Statystyki przeciwnika";
    if (saved?.data) {
      imageEl.src = saved.data;
      imageEl.hidden = false;
      emptyEl.hidden = true;
    } else {
      emptyEl.hidden = false;
    }
  } catch {
    emptyEl.hidden = false;
  }
});