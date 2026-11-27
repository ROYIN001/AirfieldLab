# Data pipeline (reference only)

These scripts produced the files in `data/`. They need the original screen captures (AIP charts and
OpenStreetMap renders at zoom 15–17), which are not included; `shots_meta.json` records the capture centres.
They run on Python 3 with numpy, opencv-python, scikit-image and networkx, which you install yourself; they are not
kept in the repository and keep their own licences: numpy, scikit-image and networkx are BSD-3-Clause and OpenCV is
Apache-2.0, but the opencv-python wheels also bundle FFmpeg (LGPL 2.1) and, outside the headless build, Qt (LGPL 3).
The scripts open no window, so `opencv-python-headless` is enough. Some steps are not kept: see the "made by" column of
`data/LICENSE-DATA.md`.

1. `mosaic.py` – georeference captures (Web Mercator) into local ENU mosaics around the ARP (`geo.py`).
2. `landclass.py` – the OSM-Carto colour classes for land use (2.5 m for `land_in.png`, 8 m for `land_out.png`); the
   drivers that ran it and wrote `land_in.npy` and `land_out.png` are not kept.
3. `extract_af.py`, `graph.py`, `graph2.py`, `merge.py` – taxiway centre lines from the 1 m airfield mosaic.
4. `extract_poly.py` – aprons, terminal, buildings, water, golf polygons.
5. `lines.py` – tollway, rail and Phahonyothin centre lines.
6. `assemble.py` – writes `vtbd_af.json`.
7. `autogen.py` – cleans and writes `land_in.png`, generates the city buildings (`city_bld.bin`, packed into
   `city.json`) and the footprints that became `cbld` in `vtbd_af.json`; the street lights and the packing into
   `city.json` came from steps that are not kept.

## Weather climatology (`climo/`)

`climo/metar-climo.mjs` builds a VTBD surface climatology (wind rose by runway, visibility, present weather,
ceilings, density altitude) from the IEM METAR archive. Node ≥ 18, no dependencies; downloads are cached in
`.cache/climo/` (git-ignored). Used by `docs/research/04-weather.md`.

    node tools/climo/metar-climo.mjs --test                  # parser self-test, no network
    node tools/climo/metar-climo.mjs --from 2016 --to 2025 --out docs/research/data/vtbd-metar-climo.json

Commit only the derived summary, not the raw METAR downloads.

## Aircraft cards (`aircraft/`)

`aircraft/build_cards.mjs` writes the six light-aircraft cards `data/aircraft/{c172s,c172r,da42ng,da42_tae125,da40d,
da40_180}.json` of the training pane's type selector (plan C1, research round 2 task item 10). Node ≥ 22, no
dependencies, no network.

    node tools/aircraft/build_cards.mjs                 # writes the six cards
    node tools/aircraft/build_cards.mjs --only c172s    # writes one card
    node tools/aircraft/build_cards.mjs --check         # writes nothing; exit 1 lists each differing id and its first
                                                        # 10 differing leaf paths (a missing file differs)

Inputs: the round 2 cards in `docs/research/02-light-aircraft/params-light.json` (resolved with that folder's
`scripts/lm_lib.mjs`, gear and inertia rules from `lm_card.mjs` and `lm_inertia.mjs`); the reference rows of the
research topic files (`docs/research/02-light-aircraft/0x-*.md`, `docs/research/01-flight-physics/*.md`), which give
each `_meta.sources` entry its text and link; and the simulator itself through `test/harness.mjs`: the stall-warning
angles are solved on the sim's trimmed lift curve, 7 kt above the 1-g stall. Each card keeps 45 copied leaves with
their sources (what `acFromCard` reads, the speed table `speeds.ias_cas`, the flap detents, and the identity, MTOW,
length and gear layout), the generated leaves and the Thai `thai_fleet` leaf of the civil schools and clubs that fly
the type; `_meta.sources` links every source code. Plan C3: the leaf `speeds.ias_cas` is the research's, with the stall
pair of `speeds.stall_table` as the first point of a row where that pair is at or below the row's first KIAS
(`anchorStallRows`, source code `AL:C3`, an estimate: the HUD then reads the stall near the POH's white arc). The output is deterministic (no dates beyond the register's
`as_of`).

Regenerate, and commit the cards in the same pull request, after a change to `params-light.json`, to a reference row
of a research topic file, to `lm_lib.mjs`, `lm_card.mjs` or `lm_inertia.mjs`, to this script, or to physics that moves
the lift or pitch lines (the warning solve) or the gear formula. `test/cards.test.mjs` runs `--check`, so the page
workflow (`pages.yml`, every pull request into `main`) fails on a stale card, also for a research-only pull request
(`research.yml` does not run `--check`). The script never writes `data/aircraft/trainer.json` and the cards do not
depend on it, but it reads it through `test/harness.mjs` at import, so a broken trainer card stops the script too. The
cards are never edited by hand.

Plan C4: the same command also writes the seven airliner cards `data/aircraft/{a320ceo,b737_800,a320neo,a330_300,
a321neo,atr72_600,a321ceo}.json` (shown only behind the training pane's switch รุ่นทดลอง) through
`aircraft/build_airliners.mjs`, and `--check` and `--only` cover all thirteen. Inputs: round 3's
`docs/research/03-airliners/params-<type>.json` and `params-common-airliner.json` (read only; a value the reader cannot
use is fixed in the generator, never in the research data) and the reference rows of `03-airliners/0x-*.md`. Each card
keeps the research's leaves, adds generated ones with source code `AL:C4` (training mass and the masses offered,
Vref/Vapp/VS0 mass tables, surface limits, `gear.legacy`, the stall-warning angles, the ratings offered, the A330's
lateral derivatives in body axes, the OD-LEMAC fixes), the research's `_na` plus the generator's rules, and `_deferred`
(paths for later plans). `build_airliners.mjs` and `build_cards.mjs` import each other: neither may use the other's
bindings at the top level.

## JSBSim oracle (`jsbsim/`)

`jsbsim/run_cases.py` regenerates `test/fixtures/jsbsim_trainer_doublet.json`, which `test/oracle.test.mjs` checks
our flight model against (research round 1 §12.8, plan item B1). Offline, Python with `jsbsim==1.3.3`; see
`jsbsim/README.md`.
