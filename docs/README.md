# Zhijian's Website

This is a Jekyll website for Zhijian Qiao's academic homepage.

## To run locally (not on GitHub Pages, to serve on your own computer)

1. Clone the repository and make updates as needed.
1. From the repo root: `./scripts/install.sh` then `./scripts/preview.sh` (see root [README.md](../README.md)).

```bash
./scripts/install.sh
./scripts/preview.sh          # default: start
./scripts/preview.sh stop     # stop
./scripts/preview.sh status   # status
```

**Note:** `preview.sh` clears conflicting Jekyll processes, uses port 4000, and runs with `--no-watch` to avoid symlink watch issues.

```
# Navigation
_data/navigation.yml
_pages/about.md
_pages/publications.html

# Tutorials
_pages/markdown.md
```
