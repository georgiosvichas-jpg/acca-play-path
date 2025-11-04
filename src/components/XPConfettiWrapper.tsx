import { useXP } from "@/hooks/useXP";

export default function XPConfettiWrapper() {
  const { ConfettiComponent } = useXP();
  return <>{ConfettiComponent}</>;
}
