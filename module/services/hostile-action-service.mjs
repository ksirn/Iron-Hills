import { isCombatActive } from "./combat-flow-service.mjs";
import {
  buildCombatChatCard,
  buildCombatParagraphs,
} from "./combat-chat-service.mjs";

export async function requestGmHostileAction(actor, actionLabel) {
  if (isCombatActive()) return true;
  if (globalThis.game?.user?.isGM) return true;

  await ChatMessage.create({
    content: buildCombatChatCard({
      title: "Запрос на враждебное действие",
      icon: "⚔",
      status: "нужен GM",
      statusClass: "is-danger",
      rows: [
        ["Актёр", actor?.name ?? "Актёр"],
        ["Действие", actionLabel],
      ],
      bodyHtml: buildCombatParagraphs([
        { value: "GM, используй команду <code>/ir approve</code> или начни бой.", html: true },
      ]),
      className: "ih-hostile-chat-card",
    }),
    whisper: ChatMessage.getWhisperRecipients("GM"),
  });

  ui.notifications.info("Запрос отправлен GM. Ожидайте разрешения.");
  return false;
}
