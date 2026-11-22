import { perimeter } from "@/content/lessons/cybersecurity-1-1";
import { webTitles } from "@/content/lessons/web-module";
import { WebReviewExplorer } from "./WebReviewExplorer";

export function Cybersecurity11Slide() {
  return (
    <WebReviewExplorer
      title={webTitles["cybersecurity-1-1"]!}
      intro="Nel portale di 42.pdf un visitatore, un programma e un operatore raggiungono interfacce diverse. Seleziona un percorso per distinguere ciò che è pubblicato da ciò che il backend può raggiungere."
      heading="Da dove si entra nel portale?"
      cases={perimeter}
    />
  );
}
