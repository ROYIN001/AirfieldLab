# Data pipeline (reference only)

These scripts produced the files in `data/`. They need the original screen captures (AIP charts and
OpenStreetMap renders at zoom 15–17), which are not included; `shots_meta.json` records the capture centres.
They run on Python 3 with numpy, opencv-python, scikit-image and networkx, which you install yourself (BSD and Apache
licences; not kept in the repository). Some steps are not kept: see the "made by" column of `data/LICENSE-DATA.md`.

1. `mosaic.py` – georeference captures (Web Mercator) into local ENU mosaics around the ARP (`geo.py`).
2. `landclass.py` – classify OSM-Carto colours into land-use ids → `land_in.png` (2.5 m) and `land_out.png` (8 m).
3. `extract_af.py`, `graph.py`, `graph2.py`, `merge.py` – taxiway centre lines from the 1 m airfield mosaic.
4. `extract_poly.py` – aprons, terminal, buildings, water, golf polygons.
5. `lines.py` – tollway, rail and Phahonyothin centre lines.
6. `assemble.py` – writes `vtbd_af.json`.
7. `autogen.py` – generated city buildings and street lights (packed into `city.json`).

## Weather climatology (`climo/`)

`climo/metar-climo.mjs` builds a VTBD surface climatology (wind rose by runway, visibility, present weather,
ceilings, density altitude) from the IEM METAR archive. Node ≥ 18, no dependencies; downloads are cached in
`.cache/climo/` (git-ignored). Used by `docs/research/04-weather.md`.

    node tools/climo/metar-climo.mjs --test                  # parser self-test, no network
    node tools/climo/metar-climo.mjs --from 2016 --to 2025 --out docs/research/data/vtbd-metar-climo.json

Commit only the derived summary, not the raw METAR downloads.
