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

## AIRAC, SUP/AIC and aircraft register watch (`watch/`)

`watch/watch.mjs` (plan A10) tells when AIP Thailand AD 2 VTBD, the AIP supplements and circulars, or the CAAT aircraft
register change. It needs the network, so it is not run in CI. See `watch/README.md` (Thai).

    node tools/watch/watch.mjs aip        # eAIP editions newer than test/fixtures/aip_vtbd_current.json, SUP/AIC
    node tools/watch/watch.mjs due        # next AIRAC dates and recheck dates, no network
