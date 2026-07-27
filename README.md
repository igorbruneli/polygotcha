# polygotcha.com

The marketing site for [PolyGotcha](https://apps.apple.com/app/polygotcha/id6789138245),
an iOS keyboard that translates as you type. Static HTML, CSS, and one
JavaScript file. No build step, no dependencies, no framework.

> [!WARNING]
> **This repository *is* the live site.** GitHub Pages serves
> `main` at the repo root, and the `CNAME` file points `polygotcha.com` here.
> Deleting, renaming, or making this repository private takes the site down,
> and with it the Support URL and Marketing URL registered in App Store
> Connect. Apple checks those during review.
>
> It has to stay **public**: GitHub Pages only publishes from private
> repositories on paid plans.

## Deployment

Push to `main`. Pages rebuilds within a minute or two.

| Setting | Value |
| --- | --- |
| Source | Deploy from a branch |
| Branch | `main`, folder `/` (root) |
| Custom domain | `polygotcha.com`, from the `CNAME` file |
| Enforce HTTPS | On |
| `.nojekyll` | Present, so Jekyll does not process the files |

DNS lives at the registrar and points at GitHub. It is not configured here.

## Running it locally

Any static server works. There is a preview config in `.claude/launch.json`,
or by hand:

```bash
python3 -m http.server 8123
```

Then open `http://localhost:8123`. Note that language switching uses
`?lang=` query parameters, so `file://` will not behave correctly - serve it
over HTTP.

## Layout

```
index.html        the whole home page
features/         feature grid
privacy/          privacy policy, the binding English text
style.css         all styles, including light/dark and the reveal animations
site.js           language resolution, theme toggle, scroll reveals
i18n.js           translation dictionaries for pt, fr, ro, it
CNAME             polygotcha.com
robots.txt        crawl policy
sitemap.xml       submitted to Search Console
```

## Translations

English is the source and lives in the markup. Every translatable node
carries a `data-i18n` key; `i18n.js` holds one dictionary per language and
`site.js` swaps the values in.

Currently: **pt, fr, ro, it** (English is the markup itself).

To add or change a string:

1. Edit the English text in the HTML, keeping its `data-i18n` key.
2. Update that key in **every** dictionary in `i18n.js`, or the other
   languages silently keep the old wording.
3. Language is resolved from `?lang=`, then the stored choice, then the
   browser. Test with `?lang=fr` and friends.

Values may contain trusted HTML (our own markup only), which is how
`&nbsp;` and inline links work inside translated strings.

Note that **Romanian and Italian are site languages the app cannot
translate**. Apple's models do not cover Romanian at all, and the app's UI
ships only in en, fr, pt-BR and pt-PT. Someone can read this site in
Romanian and then find the keyboard will not translate their language. That
is a known gap, not an oversight.

## Keeping claims true

This is the part that matters most, and the part that has gone wrong before.

The site makes specific claims about privacy, permissions, and which models
run where. Those claims describe the app, and the app changes. In 1.4.0 the
keyboard began offering Apple Translation, which iOS only exposes to a
keyboard with Full Access, and the site's central promise - "never asks for
Full Access" - became false overnight.

**Before changing any claim here, check it against the app repo**, which is
the source of truth:

- `README.md`, the privacy and security model table
- `docs/ARCHITECTURE.md`, what each engine needs
- `docs/ROADMAP.md`, what was tried, measured, and settled

The current claims, and what they rest on:

| Claim on the site | Why it is true |
| --- | --- |
| No servers, no analytics, no tracking | There is no backend. Nothing to send to. |
| Full Access is optional and off by default | `RequestsOpenAccess` makes the switch exist; iOS keeps it off and the app never prompts. |
| Translation runs on your device | Both engines are Apple's on-device models. No network model is offered. |
| Works on any iPhone | Apple Translation needs no Apple Intelligence hardware. |

If a claim cannot be traced to something in the app repo, it should not be
on the site.

## Licence

Proprietary. See [LICENSE](LICENSE). The repository is public so the claims
above can be checked, not so the site can be reused.
