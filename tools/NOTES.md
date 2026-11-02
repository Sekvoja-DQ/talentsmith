# Talentsmith – working notes for automated runs

Public fan site for WoW Forever (launched Nov 4, 2026). Hosted on GitHub Pages from `main`.
Goal: useful free tools that grow search traffic; income via Ko-fi (ko-fi.com/talentsmith), ads later.

## Status (keep a dated log at the bottom)
- Talent calculator for all 9 classes (`calculator.html`), Official vs Oct 30 hotfix switch, share links `?c=<class>&b=<digits per tree joined by ->&v=hot|off`.
- Best-race picker + all racials (`index.html`): Faction → Class → Spec → Content (leveling / dungeons & raids / PvP); each racial scored 0–5 by `RULES`.
- Class guides `classes/<class>.html`, 18 starter builds `builds/<class>-<id>.html`, hotfix tracker `changes.html`, `sitemap.xml`, `robots.txt` – all GENERATED.

## How pages are generated
- `node tools/gen-pages.js` reads talent data from `calculator.html` and race data/scores from `index.html`, builds from `tools/builds.js`, and writes classes/, builds/, changes.html, sitemap.xml, robots.txt.
- Builds: `[class, id, name, "Leveling"|"Endgame", blurb, [[treeIndex, "Talent", ranks], ...]]` in the order points are spent. The script validates tree rules and 51 points and stops with an error otherwise.
- Site address: `SITE` env var (default the github.io URL). After a custom domain: add a `CNAME` file and run `SITE=https://<domain>/ node tools/gen-pages.js`.
- Never hand-edit generated pages; edit data or the generator and regenerate.

## Calculator data format
One array per class (`PALADIN`, `ROGUE`, …) of 3 trees `{name, t:[[name,maxRanks,row,col,requires|null,officialText,hotfixText|null,changedInHotfix], ...]}` registered in `CLASSES`. Icons: `img/talents/<class>-<slug(name)>.webp` (Paladin uses `TICON`); `GICON` holds game icon file names. Tree backgrounds `img/trees/`.

## Sources
- Talent data: talentsforever.com/<class>/talents (max-rank text) and foreverchanges.pro/talents/<class>?tl=5 (icons, tiers). Patch notes: foreverchanges.pro/patch-notes and Blizzard's WoW Forever Development Notes. Use a web-fetch tool; both sites block curl.
- Icons: github.com/Gethe/wow-ui-textures (`classic` branch first, then `live`), `ICONS/<Name>.PNG`, case-insensitive, convert to 64px WebP (`convert -resize 64x64 -quality 82`).
- Missing icons (placeholders): Mage Arcane Geometry, Warrior Vanguard, Warlock Demonic Pact; racials Eureka!, Elemental Insight.

## Rules
- Only verified values; mark unconfirmed ones on the page. When racial values change, update `RACES` text AND the matching `RULES` scores.
- Facts in our own words; never copy another site's text or design.
- Real game icons are used; keep the Blizzard trademark/© notice in every footer. No Blizzard logos. Keep "WoW/Warcraft" out of the brand name.
- Same forge design (night/plate/gold/ember, Cinzel + Alegreya Sans). Class-button backgrounds stay static.
- Test every run with Playwright: no JS errors, no 404s, no horizontal scroll at 390px.
- Commit author "Talentsmith <Sekvoja-DQ@users.noreply.github.com>".

## Roadmap
1. Custom domain (owner is buying one; avoid "WoW" in it) – then CNAME + regenerate with SITE.
2. "What changed vs Classic" page for talents/racials (talentsforever.com/export/<class>.json is CC BY 4.0).
3. More builds for the most-searched specs (Shockadin, petless Survival, Smite Priest, Shaman tank, bear tank).
4. Pre-raid BiS table per spec (short, hand-checked).
5. Analytics (GoatCounter, needs owner sign-up) → popular builds; class tier list labelled as opinion.
6. Legacy perks calculator if traffic justifies it.

## Log
- 2026-11-02: all 9 calculators, class guides, 18 builds, hotfix tracker, sitemap, generator moved into tools/.
