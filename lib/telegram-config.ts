/** Preview deployments must never send an order to the production chat. */
export function selectTelegramChat(deployment: string, productionChat: string, previewChat: string): string {
  return deployment === "preview" ? previewChat : productionChat;
}
