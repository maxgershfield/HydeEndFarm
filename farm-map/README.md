# Hyde End Farm map

`map.html` is a fork of `celestial-cyberspace/playa-map.html` centred on **Brimpton, West Berkshire** and **Hyde End Farm Vineyard** (Hyde End Lane, RG7 4RJ).

- Markers: **HYDE END** (vineyard), **BRIMPTON** (locale), **RATSEY** ([Ratsey & Lapthorn](https://ratseyandlapthorn.com/) sail loft in **Cowes**, Isle of Wight — Simon’s bags & sails).
- Top nav **Ratsey & Lapthorn** tab flies to Cowes; dashed **Links** line connects Hyde End ↔ Cowes when “Links” is on.
- Deep links: `map.html?place=ratsey` or `map.html#ratsey` (hash updates react on navigation).
- Parcel polygon defaults to a rough quadrilateral; refine with **Edit boundary** on the vineyard panel.
- **Syndicate passport** link goes to `../passport.html`.
- Optional dashed “link” lines: add place `id`s to `HEV_SYNDICATE_LINKS` in the script when you add more markers.

STAR “Load live data” only appears if you add `starHolonId` to a place. Set `window.OASIS_STAR_USER` / `window.OASIS_STAR_PASS` before using it against a local ONODE.
