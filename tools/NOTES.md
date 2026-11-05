# Talentsmith – working notes for automated runs

Public fan site for WoW Forever (launched Nov 4, 2026). Hosted on GitHub Pages from `main`.
Goal: useful free tools that grow search traffic; income via Ko-fi (ko-fi.com/bigdforever), ads later.

## Status (keep a dated log at the bottom)
- Talent calculator for all 9 classes (`calculator.html`), Launch (Blizzard's Nov 2 notes) vs Beta (October) switch, share links `?c=<class>&b=<digits per tree joined by ->&v=hot|off`.
- Best-race picker + all racials (`index.html`): Faction → Class → Spec → Content (leveling / dungeons & raids / PvP); each racial scored 0–5 by `RULES`.
- Class guides `classes/<class>.html`, 21 starter builds `builds/<class>-<id>.html`, hotfix tracker `changes.html`, `sitemap.xml`, `robots.txt` – all GENERATED.

## How pages are generated
- `node tools/gen-pages.js` reads talent data from `calculator.html` and race data/scores from `index.html`, builds from `tools/builds.js`, and writes classes/, builds/, changes.html, sitemap.xml, robots.txt.
- Builds: `[class, id, name, "Leveling"|"Endgame", blurb, [[treeIndex, "Talent", ranks], ...]]` in the order points are spent. The script validates tree rules and 51 points and stops with an error otherwise.
- Site address: **https://talentsmith.app/** (custom domain since Nov 4; `CNAME` file in the repo root must stay). `SITE` env var defaults to it. Use https://talentsmith.app/ for every new absolute link.
- Never hand-edit generated pages; edit data or the generator and regenerate.

## Calculator features (Nov 5)
- Detail panel + desktop hover tooltip show the current rank and the next rank. Per-rank text is computed by `rankText()` from the max-rank text: an explicit `(a / b / c)` list wins, then `X per rank`, else linear scaling of every `up to N` (counts like `up to 5 times/targets/charges` are left alone). So write max-rank texts with `up to N`, and add a `(a / b / c)` list whenever ranks aren't linear.
- Share links: `&o=` = spending order, one char per point (`0-9a-zA-Z` index over all talents of the class, trees concatenated). Old links without `o` get a legal order rebuilt. Build pages link with `o` (gen-pages `calcUrl`).
- Leveling-order panel (Lv 10–60) under the details; tree headers show the next row threshold.

## Calculator data format
One array per class (`PALADIN`, `ROGUE`, …) of 3 trees `{name, t:[[name,maxRanks,row,col,requires|null,officialText,hotfixText|null,changedInHotfix], ...]}` registered in `CLASSES`. Icons: `img/talents/<class>-<slug(name)>.webp` (Paladin uses `TICON`); `GICON` holds game icon file names. Tree backgrounds `img/trees/`.

## Sources
- Talent data: talentsforever.com/<class>/talents (max-rank text) and foreverchanges.pro/talents/<class>?tl=5 (icons, tiers). Use a web-fetch tool; both sites block curl.
- PATCH CHECK EVERY RUN: Blizzard's official "WoW Forever Beta Development Notes" forum thread (https://us.forums.blizzard.com/en/wow/t/2360696 – the newest update is a reply further down, e.g. /9). If direct fetches are refused, run WebSearch for "WoW Forever development notes updated" and fetch the forum link from the results. The Nov 2 update was missed by runs that only checked foreverchanges.pro.
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
3. Builds: ONLY add a build that matches the split + core talents recommended by the major guide sites (Rankedboost build list, MMOnster raid tier list with build codes, wowforevertalent.com, wowforeverbuilds.com; Icy Veins/Wowhead/Mobalytics/Warcraft Tavern block fetches). No niche/own-idea builds (owner rule, Nov 5). Missing: Mage, Shaman, tanks, MM/Survival Hunter, Destruction, Resto Druid.
4. Pre-raid BiS table per spec (short, hand-checked).
5. Analytics (GoatCounter, needs owner sign-up) → popular builds; class tier list labelled as opinion.
6. Legacy perks calculator if traffic justifies it.

## Log
- 2026-11-02: all 9 calculators, class guides, 18 builds, hotfix tracker, sitemap, generator moved into tools/.
- 2026-11-03: Merged update bundle. No talent changes found after the Oct 30 hotfix (foreverchanges.pro not reachable from the cloud session; WebSearch only). Added 3 builds (Smite priest, Shockadin, bear tank) → 21 builds, 34 pages. Playwright: no JS errors, no 404s, no horizontal scroll at 390px (images lazy-load).
- 2026-11-04: foreverchanges.pro and talentsforever.com not resolvable from the cloud session (need allowing in network settings) – roadmap item 2 blocked; WebSearch shows no talent changes after the Oct 30 hotfix. Added Prot Warrior, Elemental Shaman, Balance Druid builds → 24 builds, 37 pages. Playwright: clean, no horizontal scroll at 390px.
- 2026-11-05: foreverchanges.pro still not resolvable; WebSearch shows no talent changes after the Oct 30 hotfix (only unconfirmed third-party stealth-fix reports). Added Protection Paladin tank build → 25 builds, 38 pages. Playwright: clean, no horizontal scroll at 390px.
- 2026-11-04 (Dejan live): Blizzard's Nov 2 development notes (posted Nov 3) applied to all calculators. Switch relabelled Launch (Nov 2 notes) / Beta (October); index 5 = beta text, index 6 = launch text, index 7 = changed for launch. Rogue, Shaman and Warrior trees restructured (Rogue: Shank/Poised talents Blood Splatter, Composure, Flash of Steel, Quick Getaway, Boot Knife, Death Mark; Murder, Improved Distract, Quietus, Cutthroat, Thousand Cuts removed; Mutilate row 7, Venom row 5; renames Coup de Grace, Efficient Strikes. Shaman: Lava Burst → Call of Thunder, Elemental Mastery → Lightning Mastery (requirement assumed), Improved Ghost Wolf row 4. Warrior: Reckless Swings r4, Improved Whirlwind r6, Flurry 3 ranks no longer needs Death Wish, Bloodthirst needs Death Wish, Enrage r3, Gore Drinker r5 under Blood Craze). Blizzard says these three classes' changes were NOT in the beta files on Nov 3 – re-check against game data when foreverchanges.pro/talentsforever.com update, and replace stand-in icons (rogue blood-splatter, composure, flash-of-steel, quick-getaway, boot-knife, death-mark; shaman call-of-thunder, lightning-mastery; warrior reckless-swings, improved-whirlwind) with the real ones. Value fixes: Paladin Vengeance 5 stacks, 2H Spec Holy+Physical; Hunter Barrage, Sniper Shot, Trueshot Aura, Lightning Reflexes, Lacerating Strikes; Mage Missile Barrage, Ignite; Warlock Amplify Curse, Wrack, Shadow and Flame; Druid Rend and Tear, Swiftmend; Priest Vampiric Embrace, Devouring Contagion. 8 builds rewritten (Rogue, Shaman, Warrior). Racials renamed Ruthless and Read Leyline (Blizzard's names). Rogue/Shaman/Warrior share links made before today decode to the wrong talents (array order changed). Playwright: 9 classes, 25 build links = 51 pts, no JS errors, no missing files, no horizontal scroll at 390px.
- 2026-11-04 21:00: Owner: new address https://talentsmith.app (CNAME + canonical/og/sitemap done in 5043479); tip links switched to ko-fi.com/bigdforever everywhere; canonical + og:url + absolute og:image added to index and calculator.
- 2026-11-04 (nightly): no new patch notes found (WebSearch only; Blizzard forum, foreverchanges.pro unreachable from cloud). Added Enhancement tank (Shaman) build → 26 builds, 39 pages. Open builds: petless Survival. Playwright: clean, no horizontal scroll at 390px.
- 2026-11-05 (owner live, "Forever is live"): launch build 1.60.1.70790 (Nov 4) now contains the Rogue/Shaman/Warrior reworks – checked against foreverchanges.pro/talents/<class> (shows build). Fixes: Warrior Raging Blows removed (Reckless Swings takes r4c2), Mutilate 90% + 40/57/79, Death Mark values, Ghostly Strike keeps +15% dodge, Riptide 445 over 15 sec, Vengeance up to 15% at rank 3, Arcane Concentration from Arcane Missiles. Stand-in icons replaced with the exact launch icons (71 rogue/shaman/warrior icons re-synced). Notes no longer say 'not in game files'. Home log Nov 5: Touch of the Grave proc fix, spell-triggered talents no longer weaker at low ranks. Competitors: Guild Order still on the October beta Rogue tree; Mobalytics/Icy Veins/Seemeta block fetches.
- 2026-11-05 evening: owner asked for all four proposed calculator features – per-rank values, desktop tooltips, leveling order in share links (+ panel), per-tree row progress. Paladin texts rewritten with exact launch values (rank-1 numbers from foreverchanges.pro talents/paladin, build 70790). Build links now carry the order.
- 2026-11-05 18:10: mobile +/- test – on touch/narrow screens tapping a talent opens a +/- popover on the talent itself; two versions switchable on the page ("Below talent" bar with rank, or "Right of talent" vertical stack ≤150% of the icon height), choice stored in localStorage `pmv` (also `?pm=below|side`). Desktop unchanged. Owner is testing which to keep.
- 2026-11-05 18:20: owner picked "Below talent" – switch + side version removed. Mobile popover = bar (− name rank +) plus the same text as the desktop tooltip (unmet requirements, current/next rank); opens under the talent, flips above for the bottom rows; tapping the card or outside closes it.
- 2026-11-05 18:30: phones – tapping a talent no longer adds a point; it only opens the card (tap the same talent again to close). Points only via the card's + / −. Desktop click still adds.
- 2026-11-05 19:00: owner said half the builds were rubbish. Cross-checked all 26 against Rankedboost (Nov 4, 43 builds with splits) and MMOnster raid list (Nov 3): kept 12 that match tree + split within ~6 points (Arms leveling, Fury raid, Ret leveling, Holy Paladin, Combat leveling, Mutilate raid, BM leveling, Shadow leveling, Disc, Affliction leveling, Feral leveling, Balance); removed 14 (Prot Warrior 6/0/45, Shockadin, Prot Paladin 14/37, MM 19/32, Frost leveling 20/0/31, Fire 20/31, Smite, Enh leveling 20/31, Shaman tank, Resto Shaman 0/18/33, Elemental 46/0/5, Destruction 0/20/31, Resto Druid 16/0/35, bear tank 0/31/20). Build page note now says it matches the major guide sites; class pages show a note when no builds.
- 2026-11-05 (nightly): no new talent/racial changes found (WebSearch only; foreverchanges.pro and rankedboost.com not resolvable from the cloud session). No build added: roadmap item 3 needs guide-site splits that cannot be verified from here (search snippets show no splits), so nothing shipped rather than guess. Needs both hosts allowed in the network settings.
