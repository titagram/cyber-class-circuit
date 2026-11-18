# Nightrunner UI — regole del tema

Sistema HUD scuro per app personali, derivato da una demo calibrata e non da asset ufficiali di un videogioco. Implementazione React con token TypeScript, CSS isolato e font Rajdhani OFL. Il codice deve rimanere modificabile e composto da veri controlli interattivi.

## Fonte di verità

- `src/design-system/nightrunner/core/tokens.ts`: colori, spaziature, tipografia, geometria e tempi.
- `src/design-system/nightrunner/core/gradient.ts`: gradiente verticale e intensità.
- `src/styles/nightrunner.css`: variabili CSS e stile dei componenti.
- `src/design-system/nightrunner/react`: comportamento dei componenti.
- Lo screenshot serve per il confronto visivo, non sostituisce i token né i componenti.

Le variabili CSS sono una copia generata dei token: se cambi la palette, mantieni coerenti core/tokens.ts e il blocco `.nr-theme` del CSS. Le opzioni dinamiche di HudTheme sono calcolate dal core e applicate come variabili inline.

## Linguaggio visivo

- Fondo nero-blu `#05090E`; pannelli neutri `#100E1A` → `#0A0C14`.
- Accento primario giallo `#FCEE0A`, testo scuro sui pulsanti pieni.
- Ciano `#76FDF7` per selezioni, ON, focus e valori dei campi.
- Corallo `#E15A62` per etichette/attenzione; bordeaux `#81242E` per OFF selezionato e pulsanti di attenzione.
- Bordi sottili `#592431`; angoli tagliati, quasi nessun arrotondamento.
- Gradiente dall'alto: a intensità 65 gli stop sono `#30101B` a 0%, `#240D15` a 15%, `#0D080F` a 40%, `#05070C` a 65%, `#05090E` a 100%.
- Intensità 100 usa il riferimento più luminoso; 0 è uniforme. Impostazione predefinita 65.
- Rajdhani per titoli e controlli; font di sistema per testi lunghi. I font inclusi mantengono la licenza OFL.
- Mantieni leggibili testi e focus; niente glow diffuso, animazioni continue o ulteriori colori decorativi.

## Componenti e integrazione

Usa HudTheme, HudPanel, HudButton, HudTextField, HudSwitch, HudCheckbox, HudTabs, HudTabPanel, HudMenu, HudBadge e HudNotice. Il prefisso CSS è `nr-`. La libreria non applica reset a body o a elementi globali. Installa solo le dipendenze richieste dall'app web: i sorgenti allegati richiedono React e non importano React Native.

I componenti sono controllati dall'app: menu e schede ricevono value/onValueChange; switch e checkbox ricevono checked/onCheckedChange. Web TextField usa onChange. I pulsanti hanno type="button" predefinito: usa type="submit" solo nei form che lo richiedono. Le schede web richiedono un id univoco e HudTabPanel usa lo stesso tabsId.

Preserva logica, dati e contratti API dell'app durante l'adozione del tema. Usa i token anche per eventuali componenti aggiuntivi. Verifica le interazioni, la tastiera, i messaggi di errore e gli schermi stretti. Il riferimento visivo non certifica automaticamente l'accessibilità di ogni combinazione.
