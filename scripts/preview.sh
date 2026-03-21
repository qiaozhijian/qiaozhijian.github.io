#!/bin/bash

# Local preview: Jekyll dev server on port 4000 (start / stop / status).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
JEKYLL_PID_FILE="${REPO_ROOT}/.jekyll.pid"
JEKYLL_PORT=4000

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_port() {
    if lsof -Pi :$JEKYLL_PORT -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

kill_existing_processes() {
    log_info "Checking for existing Jekyll processes..."

    JEKYLL_PIDS=$(ps aux | grep -E "bundle exec jekyll|jekyll serve|jekyll s" | grep -v grep | awk '{print $2}')

    if [ ! -z "$JEKYLL_PIDS" ]; then
        log_warn "Found existing Jekyll processes, terminating..."
        echo "$JEKYLL_PIDS" | xargs kill -9 2>/dev/null
        sleep 2
        log_info "Existing processes terminated."
    else
        log_info "No existing Jekyll processes found."
    fi
}

start_server() {
    log_info "Starting preview server on port $JEKYLL_PORT..."

    if [ "$(id -u)" -eq 0 ]; then
        log_warn "Do not use sudo. Install system Ruby once with apt, then run as your normal user."
    fi

    [ -f "$JEKYLL_PID_FILE" ] && rm -f "$JEKYLL_PID_FILE"
    [ -d "${REPO_ROOT}/.sass-cache" ] && rm -rf "${REPO_ROOT}/.sass-cache"

    "${REPO_ROOT}/scripts/run-jekyll.sh" serve --host 0.0.0.0 --port $JEKYLL_PORT --no-watch &
    JEKYLL_PID=$!

    echo $JEKYLL_PID > "$JEKYLL_PID_FILE"
    log_info "Jekyll PID: $JEKYLL_PID (waiting for port $JEKYLL_PORT)..."

    local waited=0
    local max_wait=300
    while [ "$waited" -lt "$max_wait" ]; do
        if ! kill -0 "$JEKYLL_PID" 2>/dev/null; then
            log_error "Process exited before port $JEKYLL_PORT was ready. Run ./scripts/install.sh first or check errors above."
            rm -f "$JEKYLL_PID_FILE"
            exit 1
        fi
        if check_port; then
            log_info "Open http://localhost:$JEKYLL_PORT in your browser."
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done

    log_error "Timed out after ${max_wait}s waiting for port $JEKYLL_PORT."
    rm -f "$JEKYLL_PID_FILE"
    exit 1
}

stop_server() {
    if [ -f "$JEKYLL_PID_FILE" ]; then
        JEKYLL_PID=$(cat "$JEKYLL_PID_FILE")
        if kill -0 $JEKYLL_PID 2>/dev/null; then
            log_info "Stopping preview server (PID: $JEKYLL_PID)..."
            kill $JEKYLL_PID
            sleep 2
            if kill -0 $JEKYLL_PID 2>/dev/null; then
                log_warn "Force killing..."
                kill -9 $JEKYLL_PID
            fi
        else
            log_warn "Process not found."
        fi
        rm -f "$JEKYLL_PID_FILE"
        log_info "Stopped."
    else
        log_info "No PID file; server may not be running."
    fi
}

show_status() {
    if [ -f "$JEKYLL_PID_FILE" ]; then
        JEKYLL_PID=$(cat "$JEKYLL_PID_FILE")
        if kill -0 $JEKYLL_PID 2>/dev/null; then
            log_info "Running (PID: $JEKYLL_PID) — http://localhost:$JEKYLL_PORT"
        else
            log_warn "Stale PID file removed."
            rm -f "$JEKYLL_PID_FILE"
        fi
    else
        log_info "Not running."
    fi
}

show_help() {
    echo "Local preview (Jekyll)"
    echo ""
    echo "Usage: $0 [command]"
    echo "  (none)|start  Start server, open http://localhost:$JEKYLL_PORT"
    echo "  stop          Stop server"
    echo "  restart       Restart"
    echo "  status        Show status"
    echo "  help          This help"
}

COMMAND="${1:-}"

case "$COMMAND" in
    start|"")
        log_info "Starting preview..."
        kill_existing_processes
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        log_info "Restarting..."
        stop_server
        sleep 1
        kill_existing_processes
        start_server
        ;;
    status)
        show_status
        ;;
    help|-h|--help)
        show_help
        ;;
    *)
        log_error "Unknown: $COMMAND"
        show_help
        exit 1
        ;;
esac
