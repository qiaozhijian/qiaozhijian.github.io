#!/usr/bin/env bash
# Run Jekyll with tools/Gemfile; ensure Ruby, Bundler, and gems when possible.
# Set JEKYLL_SKIP_SYSTEM_RUBY_INSTALL=1 to skip apt/dnf/brew for system Ruby (e.g. rbenv/asdf).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"
export BUNDLE_GEMFILE="${REPO_ROOT}/tools/Gemfile"
# Gems under tools/vendor/bundle (no root). GEM_HOME must be user-writable: apt Ruby defaults to /var/lib/gems.
export BUNDLE_PATH="${REPO_ROOT}/tools/vendor/bundle"

_prepend_path_dir() {
  local d="$1"
  [[ -z "$d" || ! -d "$d" ]] && return 0
  case ":${PATH:-}:" in
    *":$d:"*) ;;
    *) export PATH="$d:${PATH:-}" ;;
  esac
}

_prepend_user_gem_bin() {
  local d
  d="$(ruby -e 'print File.join(Gem.user_dir, "bin")' 2>/dev/null || true)"
  _prepend_path_dir "$d"
}

_install_system_ruby_linux() {
  [[ -n "${JEKYLL_SKIP_SYSTEM_RUBY_INSTALL:-}" ]] && return 1
  [[ -f /etc/os-release ]] && . /etc/os-release
  local id="${ID:-}"
  local run_as_root=0
  [[ "$(id -u)" -eq 0 ]] && run_as_root=1

  if [[ "$run_as_root" -eq 0 ]] && ! command -v sudo >/dev/null 2>&1; then
    return 1
  fi

  case "$id" in
    ubuntu|debian|linuxmint|pop)
      echo "[jekyll-deps] Installing Ruby via apt (may prompt for sudo password)..."
      if [[ "$run_as_root" -eq 1 ]]; then
        apt-get update -qq
        DEBIAN_FRONTEND=noninteractive apt-get install -y ruby-full ruby-dev build-essential zlib1g-dev
      else
        sudo apt-get update -qq
        sudo DEBIAN_FRONTEND=noninteractive apt-get install -y ruby-full ruby-dev build-essential zlib1g-dev
      fi
      return 0
      ;;
    fedora)
      echo "[jekyll-deps] Installing Ruby via dnf (may prompt for sudo password)..."
      if [[ "$run_as_root" -eq 1 ]]; then
        dnf install -y ruby ruby-devel gcc gcc-c++ make zlib-devel
      else
        sudo dnf install -y ruby ruby-devel gcc gcc-c++ make zlib-devel
      fi
      return 0
      ;;
    rhel|centos|rocky|almalinux)
      echo "[jekyll-deps] Installing Ruby via dnf/yum (may prompt for sudo password)..."
      if command -v dnf >/dev/null 2>&1; then
        if [[ "$run_as_root" -eq 1 ]]; then dnf install -y ruby ruby-devel gcc gcc-c++ make zlib-devel
        else sudo dnf install -y ruby ruby-devel gcc gcc-c++ make zlib-devel; fi
      elif command -v yum >/dev/null 2>&1; then
        if [[ "$run_as_root" -eq 1 ]]; then yum install -y ruby ruby-devel gcc gcc-c++ make zlib-devel
        else sudo yum install -y ruby ruby-devel gcc gcc-c++ make zlib-devel; fi
      else
        return 1
      fi
      return 0
      ;;
    arch|manjaro)
      echo "[jekyll-deps] Installing Ruby via pacman (may prompt for sudo password)..."
      if [[ "$run_as_root" -eq 1 ]]; then
        pacman -S --needed --noconfirm ruby base-devel
      else
        sudo pacman -S --needed --noconfirm ruby base-devel
      fi
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

_ensure_ruby() {
  if command -v ruby >/dev/null 2>&1; then
    return 0
  fi

  echo "[jekyll-deps] Ruby not found."
  local uname_s
  uname_s="$(uname -s)"

  if [[ "$uname_s" == "Darwin" ]]; then
    if command -v brew >/dev/null 2>&1; then
      echo "[jekyll-deps] Installing Ruby via Homebrew..."
      brew install ruby
      if [[ -d /opt/homebrew/opt/ruby/bin ]]; then
        _prepend_path_dir "/opt/homebrew/opt/ruby/bin"
      elif [[ -d /usr/local/opt/ruby/bin ]]; then
        _prepend_path_dir "/usr/local/opt/ruby/bin"
      fi
    else
      echo "[jekyll-deps] Install Homebrew and Ruby: https://jekyllrb.com/docs/installation/macos/"
      return 1
    fi
  elif [[ "$uname_s" == "Linux" ]]; then
    if _install_system_ruby_linux; then
      :
    else
      echo "[jekyll-deps] Could not auto-install Ruby. Install manually, e.g.:"
      echo "  Debian/Ubuntu: sudo apt install ruby-full ruby-dev build-essential zlib1g-dev"
      echo "  Or set JEKYLL_SKIP_SYSTEM_RUBY_INSTALL=1 if you use rbenv/asdf and forgot to activate it."
      return 1
    fi
  else
    echo "[jekyll-deps] Install Ruby: https://jekyllrb.com/docs/installation/"
    return 1
  fi

  command -v ruby >/dev/null 2>&1
}

_ensure_bundler() {
  _prepend_user_gem_bin
  if command -v bundle >/dev/null 2>&1; then
    return 0
  fi

  echo "[jekyll-deps] Installing Bundler..."
  if gem install bundler --user-install; then
    _prepend_user_gem_bin
  elif gem install bundler; then
    _prepend_user_gem_bin
  else
    return 1
  fi

  command -v bundle >/dev/null 2>&1
}

_ensure_bundle_install() {
  if bundle check >/dev/null 2>&1; then
    echo "[jekyll-deps] Gems satisfied (bundle check)."
    return 0
  fi
  echo "[jekyll-deps] Running bundle install (first time can take several minutes)..."
  bundle install
}

jekyll_ensure_deps() {
  _ensure_ruby || return 1
  # Avoid Bundler/RubyGems writing to system GEM_HOME (/var/lib/gems → PermissionError).
  export GEM_HOME="$(ruby -e 'puts Gem.user_dir')"
  export GEM_PATH="${GEM_HOME}"
  _prepend_user_gem_bin
  _ensure_bundler || {
    echo "[jekyll-deps] Failed to install or find bundler."
    return 1
  }
  _ensure_bundle_install || return 1
}

if [[ "${1:-}" == "--install-only" ]]; then
  jekyll_ensure_deps
  exit 0
fi

jekyll_ensure_deps
exec bundle exec jekyll "$@"
