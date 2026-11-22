import { inputs } from "@/content/lessons/cybersecurity-1-2";
import { webTitles } from "@/content/lessons/web-module";
import { WebReviewExplorer } from "./WebReviewExplorer";

export function Cybersecurity12Slide() {
  return (
    <WebReviewExplorer
      title={webTitles["cybersecurity-1-2"]!}
      intro="Su uno stesso ingresso web arrivano identificatori, termini di ricerca, credenziali e file. Segui ogni valore fino al codice che gli attribuisce un significato."
      heading="Quale input attraversa il confine?"
      cases={inputs}
    />
  );
}
