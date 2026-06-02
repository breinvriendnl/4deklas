# Hoe sluit ik een Claude Code-sessie goed af?

## De drie opties

---

### 1. `/compact` — Doorgaan in dezelfde sessie

**Wat het doet:**
Claude comprimeert de hele gespreksgeschiedenis tot een compacte samenvatting.
De context wordt kleiner, maar je werkt gewoon verder in hetzelfde gesprek.

**Wanneer gebruiken:**
- Je bent al lang bezig en de sessie voelt traag of vol
- Je wilt verder werken aan dezelfde taak
- Je merkt dat Claude dingen vergeet die eerder wel besproken zijn

**Wat het NIET doet:**
- Het slaat niks op voor de volgende sessie
- Als je daarna een nieuwe chat opent, is alles weg

---

### 2. `/claude-mem` — Context opslaan voor later

**Wat het doet:**
Toont wat er al in het geheugen staat én laat je nieuwe dingen toevoegen.
Claude slaat dit op in bestanden op je pc (`~/.claude/projects/.../memory/`).
Die worden automatisch ingeladen bij elke nieuwe sessie in dit project.

**Wanneer gebruiken:**
- Je sluit een sessie af en wilt dat Claude de volgende keer weet waar je mee bezig was
- Je hebt een belangrijke beslissing genomen (bijv. "we gebruiken geen TypeScript")
- Je wilt dat Claude jouw voorkeursstijl onthoudt

**Wat het NIET doet:**
- Het is geen back-up van het gesprek — alleen de kern wordt opgeslagen
- Technische details die in de code staan, hoef je niet op te slaan

---

### 3. Nieuwe chat openen — Frisse start

**Wat het doet:**
Volledig schone lei. Claude weet niks van het vorige gesprek.
Wel: het geheugen (zie optie 2) wordt automatisch ingeladen.

**Wanneer gebruiken:**
- Je begint aan een andere taak of ander project
- De vorige sessie is klaar en je hebt geen open eindjes
- Je wilt niet dat old context de nieuwe taak beïnvloedt

**Tip:** Zeg bij het openen van een nieuwe chat: _"Check het geheugen even"_
dan haalt Claude de relevante context op.

---

## De vuistregel

```
Sessie wordt lang maar je werkt door?  →  /compact
Sessie afsluiten, morgen verder?       →  /claude-mem opslaan → nieuwe chat
Andere taak, andere dag?               →  gewoon nieuwe chat
```

---

## 3 Voorbeelden

---

### Voorbeeld 1 — Lang gesprek, middenin een feature

Je bent een uur bezig met de donatiepagina. Claude begint dingen te herhalen
of lijkt dingen van een uur geleden vergeten.

**Wat je doet:** typ `/compact`

Claude comprimeert alles wat er besproken is tot een korte samenvatting
en gaat gewoon verder. Je hoeft niks opnieuw uit te leggen.

---

### Voorbeeld 2 — Sessie afsluiten na productief werk

Je hebt vandaag de navigatie van 4deklas.nl omgebouwd en besloten dat
backupbestanden altijd in `.gitignore` gaan.

**Wat je doet:**
1. Zeg: _"Sla de belangrijkste dingen van vandaag op in het geheugen"_
2. Claude schrijft een memory-bestand met de beslissingen en context
3. Open een nieuwe chat

Volgende dag: Claude weet bij het opstarten automatisch wat er gisteren gedaan is
en welke afspraken er gelden.

---

### Voorbeeld 3 — Overstappen naar een ander project

Je bent klaar met 4deklas en wilt nu aan je GuidoStudio-website werken.

**Wat je doet:**
1. Sluit het huidige VS Code-venster (of de chat)
2. Open een **nieuw venster** via `File → New Window` (`Ctrl+Shift+N`)
3. Open daar de GuidoStudio-map
4. Start een nieuwe chat

Waarom nieuw venster? Als je in hetzelfde venster een andere map opent,
verdwijnt de hele gespreksgeschiedenis van de vorige sessie.

---

## Wat Claude automatisch onthoudt (zonder dat je iets hoeft te doen)

Claude slaat zelf dingen op als:
- Je een voorkeur aangeeft (_"doe dit altijd zo"_)
- Er een belangrijke projectbeslissing valt
- Je iets corrigeert wat Claude verkeerd deed

Je hoeft dit niet handmatig te triggeren — het gebeurt vanzelf aan het einde
van een sessie of als er significante voortgang is geboekt.
