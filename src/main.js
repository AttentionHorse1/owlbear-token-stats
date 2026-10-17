import OBR from "@owlbear-rodeo/sdk";

const EXTENSION_ID = "pl.rpg.token-stats";
const SITE_BASE = "https://attentionhorse1.github.io/owlbear-token-stats/";

// Rozszerzenie działa w tle, bez przycisku w lewym górnym rogu.
OBR.onReady(async () => {
  await OBR.contextMenu.create({
    id: `${EXTENSION_ID}/context-menu`,
    icons: [{
      icon: `${SITE_BASE}info.svg`,
      label: "Pokaż statystyki",
      filter: {
        max: 1,
        every: [{ key: "layer", value: "CHARACTER" }]
      }
    }],
    async onClick(context) {
      const token = context.items?.[0];
      if (!token) return;

      await OBR.modal.open({
        id: `${EXTENSION_ID}/viewer`,
        url: `${SITE_BASE}viewer.html?token=${encodeURIComponent(token.id)}`,
        width: 700,
        height: 780
      });
    }
  });
});
