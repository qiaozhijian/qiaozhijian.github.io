# Zhijian's Website

Jekyll site for Zhijian Qiao's academic homepage.

📖 More detail: [docs/README.md](./docs/README.md)

## Local setup

From the repo root, as a normal user (do **not** use `sudo` for these):

```bash
./scripts/install.sh    # install Ruby / Bundler / gems (first time; may prompt for sudo inside apt)
./scripts/preview.sh    # local site — open http://localhost:4000
```

Optional: `JEKYLL_SKIP_SYSTEM_RUBY_INSTALL=1 ./scripts/install.sh` if Ruby already comes from rbenv/asdf.

## Project layout

- `_pages/` — main pages (about, publications, CV, …)
- `_portfolio/` — portfolio entries
- `_posts/` — blog posts (if any)
- `_layouts/`, `_includes/`, `_sass/` — theme templates and styles
- `media/` — images and media
- `static/` — CSS, JS, fonts
- `tools/` — `Gemfile` / Bundler
- `scripts/` — `install.sh`, `preview.sh`, `run-jekyll.sh`
- `docs/` — extra documentation
