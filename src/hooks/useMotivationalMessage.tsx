import { getRandomMotivationalMessage, getMotivationalMessage } from "@/data/motivational-messages";

export function useMotivationalMessage() {
  const getMessage = (category: string, trigger?: string) => {
    if (trigger) {
      return getMotivationalMessage(category, trigger);
    }
    return getRandomMotivationalMessage(category);
  };

  return { getMessage };
}
