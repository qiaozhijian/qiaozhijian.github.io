# Zhijian's Website

Jekyll site for Zhijian Qiao's academic homepage.

## Local setup

From the repo root, as a normal user (do **not** use `sudo` for these):

```bash
./scripts/install.sh    # install Ruby / Bundler / gems (first time; may prompt for sudo inside apt)
./scripts/preview.sh    # local site — open http://localhost:4000
```

Optional: `JEKYLL_SKIP_SYSTEM_RUBY_INSTALL=1 ./scripts/install.sh` if Ruby already comes from rbenv/asdf.

## Project layout

- `_pages/` — main pages (home, publications, projects, highlight, 404)
- `_portfolio/` — project entries (rendered on `/projects/` only)
- `_layouts/` — `barron` layout; `_includes/` — publications list + visitor map
- `media/` — images
- `static/css/` — `barron.css`
- `tools/` — `Gemfile` / Bundler
- `scripts/` — `install.sh`, `preview.sh`, `run-jekyll.sh`
