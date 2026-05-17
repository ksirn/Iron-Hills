import { isCombatActive } from "./combat-flow-service.mjs";

export async function requestGmHostileAction(actor, actionLabel) {
  if (isCombatActive()) return true;
  if (globalThis.game?.user?.isGM) return true;

  await ChatMessage.create({
    content: `
      <div style="border:1px solid rgba(248,113,113,0.4);border-radius:8px;padding:10px;background:rgba(248,113,113,0.06);">
        <b>⚔ Запрос на враждебное действие</b><br>
        <b>${actor?.name ?? "Актёр"}</b> хочет выполнить <b>${actionLabel}</b> вне боя.<br>
        <small style="opacity:0.7">GM, используй команду <code>/ir approve</code> или начни бой.</small>
      </div>
    `,
    whisper: ChatMessage.getWhisperRecipients("GM"),
  });

  ui.notifications.info("Запрос отправлен GM. Ожидайте разрешения.");
  return false;
}
