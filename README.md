# Website Review Agents

Drie AI-agents die samenwerken om een webproject te analyseren, de frontend te verbeteren en de wijzigingen te reviewen. Gebouwd op Claude Code CLI — geen API-kosten, werkt via je claude.ai Pro-abonnement.

---

## Wat het doet

```
Planner Agent  →  Frontend Agent  →  QA Review Agent
    analyseert       verbetert           controleert
    het project      dashboard.html      de wijzigingen
    maakt plan       maakt backup        geeft verdict
```

**Planner Agent** leest de volledige projectstructuur en sleutelbestanden, begrijpt wat het project doet, en maakt een concreet stappenplan met prioriteitspunten voor de andere agents.

**Frontend Agent** pakt het plan op, maakt een backup van het HTML-bestand, vraagt Claude om verbeteringen (layout, CSS, responsive, toegankelijkheid, semantische HTML), en schrijft het verbeterde bestand terug.

**QA Review Agent** vergelijkt het origineel met de verbeterde versie, checkt op HTML-fouten, JavaScript-risico's, mobile layout, kapotte links en toegankelijkheid, en geeft een eindoordeel: `APPROVED`, `NEEDS_FIXES` of `REJECTED` met een score van 0–10.

Alle resultaten worden opgeslagen in `reports/review_report_DATUM.json`.

---

## Vereisten

- Claude Code CLI geïnstalleerd en ingelogd via `claude.ai` (OAuth)
- Python 3.10+
- Geen extra packages nodig

Controleer of je bent ingelogd:
```powershell
claude --version
```

---

## Volledig systeem draaien

```powershell
cd "pad\naar\Agnets 3"
python orchestrator.py
```

Het systeem vraagt bij **elke stap** om bevestiging voordat het iets uitvoert of opslaat. Je behoudt volledige controle:

```
Starten met de review? [j/n]
  → Planner analyseert (wijzigt niets)
Doorgaan met Stap 2: Frontend Agent? [j/n]
  → Frontend genereert verbeteringen en toont wat er gaat veranderen
Wijzigingen opslaan in dashboard.html? [j/n]
  → Pas dan wordt het bestand overschreven (backup wordt aangemaakt)
Doorgaan met Stap 3: QA Review Agent? [j/n]
  → QA controleert het resultaat (wijzigt niets)
```

Standaard analyseert het systeem het project in `../ai-monitoring/`.

---

## Individuele agents draaien

Je kunt elke agent ook los aanroepen vanuit Python:

```python
import sys
sys.path.insert(0, r"pad\naar\Agnets 3")

# Stap 1 — alleen de Planner
from agents import planner_agent
plan = planner_agent.run()

# Stap 2 — alleen de Frontend Agent (geef een plan mee)
from agents import frontend_agent
result = frontend_agent.run(plan)

# Stap 3 — alleen de QA Agent (geef plan en frontend-resultaat mee)
from agents import qa_agent
report = qa_agent.run(plan, result)
```

Of start één agent direct vanuit de terminal:

```powershell
# Alleen plannen (geen wijzigingen)
python -c "import sys; sys.path.insert(0,'.'); from agents import planner_agent; planner_agent.run()"

# Alleen QA (als je al een verbeterd bestand hebt)
python -c "import sys; sys.path.insert(0,'.'); from agents import qa_agent; qa_agent.run({}, {'original_html':'', 'changes':[]})"
```

---

## Op een ander project of dashboard loslaten

Geef het pad van je project mee als argument:

```powershell
python orchestrator.py --project "C:\Users\guido\Documents\LogeMozart"
```

### Welk HTML-bestand wordt verbeterd?

De Frontend Agent kijkt naar `DASHBOARD_PATH` in `agents/frontend_agent.py`.
Verander dit naar het HTML-bestand dat jij wilt laten verbeteren:

```python
DASHBOARD_PATH = PROJECT_PATH / "public" / "index.html"
DASHBOARD_PATH = PROJECT_PATH / "src" / "views" / "main.html"
```

Het originele bestand wordt automatisch gebackupt als `bestandsnaam.html.backup` vóór elke wijziging.

---

## Waar de resultaten staan

| Bestand | Inhoud |
|---|---|
| `reports/review_report_*.json` | Volledig rapport van alle 3 agents |
| `ai-monitoring/dashboards/dashboard.html` | Verbeterd HTML-bestand |
| `ai-monitoring/dashboards/dashboard.html.backup` | Origineel vóór de wijzigingen |

---

## Structuur

```
Agnets 3/
├── orchestrator.py          ← start de volledige pipeline
├── AGENTS.md                ← specificaties voor alle agents
├── README.md                ← dit bestand
├── .env                     ← optioneel: ANTHROPIC_API_KEY (niet nodig met OAuth)
├── .gitignore
├── reports/                 ← gegenereerde rapporten
└── agents/
    ├── utils.py             ← gedeelde claude CLI helper
    ├── planner_agent.py     ← Agent 1: analyseren en plannen
    ├── frontend_agent.py    ← Agent 2: HTML/CSS verbeteren
    └── qa_agent.py          ← Agent 3: review en verdict
```

---

## Hoe de agents communiceren

```
orchestrator.py
  │
  ├─ planner_agent.run()
  │    └─ geeft terug: dict met summary, review_plan, priority_issues, scope
  │
  ├─ frontend_agent.run(plan)          ← ontvangt plan van Planner
  │    └─ geeft terug: dict met changes, skipped, original_html
  │
  └─ qa_agent.run(plan, frontend_result)   ← ontvangt beide vorige outputs
       └─ geeft terug: dict met verdict, score, problems, positives, summary
```

Elke agent roept `call_claude()` aan uit `agents/utils.py`, die de Claude Code CLI aanroept via OAuth.
