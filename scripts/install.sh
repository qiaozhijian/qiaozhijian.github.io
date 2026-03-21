#!/usr/bin/env bash
# Install Ruby (if needed), Bundler, and gems from tools/Gemfile.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/run-jekyll.sh" --install-only
