#!/bin/bash
# =============================================================================
# certctl Agent - Bộ cài đặt Offline dành cho Ubuntu/Linux Apache
# =============================================================================
#
# OFFLINE: Không cần internet, không cần Docker, chạy hoàn toàn từ folder này.
# Cài agent dưới dạng systemd service, khởi động cùng với hệ thống.
#
# CÁCH DÙNG:
#   sudo ./install-agent.sh                                          # Tương tác
#   sudo ./install-agent.sh --server-url https://IP:8443 \          # Không tương tác
#                           --api-key YOUR_KEY \
#                           --ca-bundle ./server-ca.crt
#
#   sudo ./install-agent.sh --uninstall                             # Gỡ cài
#
# YÊU CẦU:
#   - Ubuntu 20.04+ (hoặc Debian-based distro với systemd)
#   - Quyền root (sudo)
#   - File certctl-agent phải cùng folder với script này
# =============================================================================

set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── Constants ────────────────────────────────────────────────────────────────
SERVICE_NAME="certctl-agent"
INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="/etc/certctl"
KEY_DIR="/var/lib/certctl/keys"
LOG_DIR="/var/log/certctl"
CONFIG_FILE="$CONFIG_DIR/agent.env"
BINARY_NAME="certctl-agent"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── Default values ───────────────────────────────────────────────────────────
SERVER_URL=""
API_KEY=""
AGENT_NAME=""
AGENT_ID=""
CA_BUNDLE_PATH=""
DISCOVERY_DIRS="/etc/apache2/ssl,/etc/ssl/certs,/etc/letsencrypt/live"
NO_START=false
UNINSTALL=false

# ─── Banner ───────────────────────────────────────────────────────────────────
show_banner() {
    echo -e "${CYAN}=================================================="
    echo -e "  certctl Agent Installer - Ubuntu Apache Edition"
    echo -e "  Chế độ: OFFLINE (không cần internet)"
    echo -e "==================================================${NC}"
    echo ""
}

# ─── Usage ────────────────────────────────────────────────────────────────────
usage() {
    cat <<EOF
Cách dùng: $0 [OPTIONS]

OPTIONS:
    --server-url URL     Địa chỉ certctl server (ví dụ: https://192.168.1.100:8443)
    --api-key KEY        API Key xác thực
    --agent-name NAME    Tên hiển thị của agent trong fleet
    --agent-id ID        Agent ID (mặc định: hostname)
    --ca-bundle PATH     Đường dẫn tới CA certificate (dùng khi server có self-signed cert)
    --discovery-dirs DIRS Thư mục scan certs, phân cách bằng dấu phẩy
    --no-start           Cài đặt nhưng không khởi động service
    --uninstall          Gỡ cài đặt agent
    -h, --help           Hiển thị hướng dẫn này

VÍ DỤ:
    # Cài đặt tương tác:
    sudo ./install-agent.sh

    # Cài đặt không tương tác với self-signed cert:
    sudo ./install-agent.sh \\
        --server-url https://192.168.1.100:8443 \\
        --api-key demo-secret-123 \\
        --ca-bundle ./server-ca.crt

    # Gỡ cài đặt:
    sudo ./install-agent.sh --uninstall
EOF
}

# ─── Parse arguments ──────────────────────────────────────────────────────────
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --server-url)    SERVER_URL="${2:-}";       shift 2 ;;
            --server-url=*)  SERVER_URL="${1#*=}";      shift   ;;
            --api-key)       API_KEY="${2:-}";          shift 2 ;;
            --api-key=*)     API_KEY="${1#*=}";         shift   ;;
            --agent-name)    AGENT_NAME="${2:-}";       shift 2 ;;
            --agent-name=*)  AGENT_NAME="${1#*=}";      shift   ;;
            --agent-id)      AGENT_ID="${2:-}";         shift 2 ;;
            --agent-id=*)    AGENT_ID="${1#*=}";        shift   ;;
            --ca-bundle)     CA_BUNDLE_PATH="${2:-}";   shift 2 ;;
            --ca-bundle=*)   CA_BUNDLE_PATH="${1#*=}";  shift   ;;
            --discovery-dirs) DISCOVERY_DIRS="${2:-}";  shift 2 ;;
            --discovery-dirs=*) DISCOVERY_DIRS="${1#*=}"; shift ;;
            --no-start)      NO_START=true;             shift   ;;
            --uninstall)     UNINSTALL=true;            shift   ;;
            -h|--help)       usage; exit 0              ;;
            *) echo -e "${RED}Tùy chọn không hợp lệ: $1${NC}" >&2; usage; exit 1 ;;
        esac
    done
}

# ─── Require root ─────────────────────────────────────────────────────────────
check_root() {
    if [[ "$EUID" -ne 0 ]]; then
        echo -e "${RED}LỖI: Script này cần chạy với quyền root.${NC}"
        echo "Thử lại với: sudo $0 $*"
        exit 1
    fi
}

# ─── Uninstall ────────────────────────────────────────────────────────────────
do_uninstall() {
    echo -e "${YELLOW}Đang gỡ cài đặt certctl-agent...${NC}"

    if if command -v systemctl >/dev/null && systemctl is-system-running >/dev/null 2>&1; then systemctl is-active --quiet "$SERVICE_NAME"; else pgrep -f certctl-agent >/dev/null; fi 2>/dev/null; then
        echo "  Dừng service..."
        systemctl stop "$SERVICE_NAME"
    fi

    if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
        echo "  Tắt autostart..."
        systemctl disable "$SERVICE_NAME"
    fi

    local svc_file="/etc/systemd/system/${SERVICE_NAME}.service"
    if [[ -f "$svc_file" ]]; then
        rm -f "$svc_file"
        if command -v systemctl >/dev/null; then systemctl daemon-reload; else echo "Not using systemd"; fi
        echo -e "${GREEN}  [OK] Xóa service file${NC}"
    fi

    if [[ -f "$INSTALL_DIR/$BINARY_NAME" ]]; then
        rm -f "$INSTALL_DIR/$BINARY_NAME"
        echo -e "${GREEN}  [OK] Xóa binary${NC}"
    fi

    echo ""
    echo -e "${GREEN}Gỡ cài đặt hoàn tất!${NC}"
    echo -e "${YELLOW}Lưu ý: Config và keys tại '$CONFIG_DIR' và '$KEY_DIR' được giữ nguyên.${NC}"
    echo -e "${YELLOW}Xóa thủ công nếu cần: sudo rm -rf $CONFIG_DIR $KEY_DIR${NC}"
}

# ─── Check binary ─────────────────────────────────────────────────────────────
check_binary() {
    local src="$SCRIPT_DIR/$BINARY_NAME"
    if [[ ! -f "$src" ]]; then
        echo -e "${RED}LỖI: Không tìm thấy file '$BINARY_NAME' trong thư mục này!${NC}"
        echo -e "${RED}Đường dẫn tìm: $src${NC}"
        echo ""
        echo "Hãy đảm bảo bộ cài đủ file:"
        echo "  - $BINARY_NAME      (binary agent)"
        echo "  - install-agent.sh  (script này)"
        echo "  - agent.env.example (mẫu cấu hình)"
        echo "  - server-ca.crt     (nếu server dùng self-signed cert)"
        exit 1
    fi
    echo "$src"
}

DEFAULT_SERVER_URL=""
DEFAULT_API_KEY=""
DEFAULT_AGENT_NAME=""
DEFAULT_AGENT_ID=""
DEFAULT_CA_BUNDLE_PATH=""
DEFAULT_DISCOVERY_DIRS=""

# ─── Load env defaults ────────────────────────────────────────────────────────
load_env_defaults() {
    local env_file=""
    if [[ -f "$SCRIPT_DIR/agent.env" ]]; then
        env_file="$SCRIPT_DIR/agent.env"
    elif [[ -f "$CONFIG_DIR/agent.env" ]]; then
        env_file="$CONFIG_DIR/agent.env"
    elif [[ -f "$SCRIPT_DIR/agent.env.example" ]]; then
        env_file="$SCRIPT_DIR/agent.env.example"
    fi

    if [[ -n "$env_file" && -f "$env_file" ]]; then
        echo -e "  ${CYAN}[Tự động] Đọc giá trị mặc định từ '$env_file'${NC}"
        local line=""
        while IFS= read -r line || [[ -n "$line" ]]; do
            line="$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
            [[ -z "$line" || "$line" =~ ^# ]] && continue
            
            if [[ "$line" =~ ^([A-Za-z0-9_]+)=(.*)$ ]]; then
                local var_name="${BASH_REMATCH[1]}"
                local var_val="${BASH_REMATCH[2]}"
                var_val="${var_val%\"}"
                var_val="${var_val#\"}"
                var_val="${var_val%\'}"
                var_val="${var_val#\'}"

                case "$var_name" in
                    CERTCTL_SERVER_URL)            DEFAULT_SERVER_URL="$var_val" ;;
                    CERTCTL_API_KEY)               DEFAULT_API_KEY="$var_val" ;;
                    CERTCTL_AGENT_NAME)            DEFAULT_AGENT_NAME="$var_val" ;;
                    CERTCTL_AGENT_ID)              DEFAULT_AGENT_ID="$var_val" ;;
                    CERTCTL_SERVER_CA_BUNDLE_PATH) DEFAULT_CA_BUNDLE_PATH="$var_val" ;;
                    CERTCTL_DISCOVERY_DIRS)        DEFAULT_DISCOVERY_DIRS="$var_val" ;;
                esac
            fi
        done < "$env_file"
    fi
}

# ─── Interactive prompts ───────────────────────────────────────────────────────
prompt_config() {
    echo ""
    echo -e "${YELLOW}=== Cấu hình kết nối certctl Server ===${NC}"
    echo ""

    load_env_defaults

    # Server URL
    if [[ -z "$SERVER_URL" ]]; then
        local default_url="${DEFAULT_SERVER_URL:-}"
        local prompt_msg="  ${CYAN}Nhập certctl Server URL"
        if [[ -n "$default_url" ]]; then
            prompt_msg+=" (Enter để dùng: '$default_url')"
        else
            prompt_msg+=" (ví dụ: https://192.168.1.100:8443)"
        fi
        prompt_msg+=":${NC} "

        echo -n -e "$prompt_msg"
        read -r input
        SERVER_URL="${input:-$default_url}"

        if [[ -z "$SERVER_URL" ]]; then
            echo -e "${RED}LỖI: Server URL không được để trống!${NC}" >&2
            exit 1
        fi
    fi

    # API Key
    if [[ -z "$API_KEY" ]]; then
        local default_key="${DEFAULT_API_KEY:-}"
        local prompt_msg="  ${CYAN}Nhập API Key"
        if [[ -n "$default_key" ]]; then
            prompt_msg+=" (Enter để dùng giá trị từ agent.env)"
        fi
        prompt_msg+=":${NC} "

        echo -n -e "$prompt_msg"
        read -rs input
        echo ""
        API_KEY="${input:-$default_key}"

        if [[ -z "$API_KEY" ]]; then
            echo -e "${RED}LỖI: API Key không được để trống!${NC}" >&2
            exit 1
        fi
    fi

    # Agent Name
    if [[ -z "$AGENT_NAME" ]]; then
        local default_name="${DEFAULT_AGENT_NAME:-$(hostname -s)}"
        echo -n -e "  ${CYAN}Tên Agent (Enter để dùng mặc định '$default_name'):${NC} "
        read -r input
        AGENT_NAME="${input:-$default_name}"
    fi

    # Agent ID
    if [[ -z "$AGENT_ID" ]]; then
        local default_id="${DEFAULT_AGENT_ID:-$(hostname -s)}"
        echo -n -e "  ${CYAN}Agent ID (Enter để dùng mặc định '$default_id'):${NC} "
        read -r input
        AGENT_ID="${input:-$default_id}"
    fi

    # CA Bundle - auto-detect nếu có trong folder
    if [[ -z "$CA_BUNDLE_PATH" ]]; then
        local auto_ca="$SCRIPT_DIR/server-ca.crt"
        local default_ca="${DEFAULT_CA_BUNDLE_PATH:-}"
        if [[ -f "$auto_ca" ]]; then
            echo -e "  ${GREEN}[Tự động] Tìm thấy server-ca.crt trong bộ cài, sẽ sử dụng file này.${NC}"
            CA_BUNDLE_PATH="$auto_ca"
        elif [[ -n "$default_ca" && -f "$default_ca" ]]; then
            echo -n -e "  ${CYAN}Đường dẫn CA bundle (Enter để dùng mặc định '$default_ca'):${NC} "
            read -r input
            CA_BUNDLE_PATH="${input:-$default_ca}"
        else
            echo -n -e "  ${CYAN}Đường dẫn CA bundle (Enter bỏ qua - chỉ cần khi server dùng self-signed cert):${NC} "
            read -r input
            CA_BUNDLE_PATH="${input:-}"
        fi
    fi

    # Discovery Dirs
    if [[ -z "$DISCOVERY_DIRS" ]]; then
        local default_dirs="${DEFAULT_DISCOVERY_DIRS:-/etc/apache2/ssl,/etc/ssl/certs,/etc/letsencrypt/live}"
        echo -n -e "  ${CYAN}Thư mục scan certificates (Enter để dùng mặc định '$default_dirs'):${NC} "
        read -r input
        DISCOVERY_DIRS="${input:-$default_dirs}"
    fi
}

# ─── Create directories ────────────────────────────────────────────────────────
setup_dirs() {
    echo -e "${YELLOW}Tạo thư mục cài đặt...${NC}"
    mkdir -p "$CONFIG_DIR"
    chmod 755 "$CONFIG_DIR"
    mkdir -p "$KEY_DIR"
    chmod 700 "$KEY_DIR"
    mkdir -p "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    echo -e "${GREEN}  [OK] $CONFIG_DIR${NC}"
    echo -e "${GREEN}  [OK] $KEY_DIR (quyền 700 - chỉ root đọc được)${NC}"
    echo -e "${GREEN}  [OK] $LOG_DIR${NC}"
}

# ─── Install binary ───────────────────────────────────────────────────────────
install_binary() {
    local src="$1"
    echo -e "${YELLOW}Cài đặt binary agent...${NC}"
    cp "$src" "$INSTALL_DIR/$BINARY_NAME"
    chmod 755 "$INSTALL_DIR/$BINARY_NAME"
    echo -e "${GREEN}  [OK] $INSTALL_DIR/$BINARY_NAME${NC}"
}

# ─── Install CA cert ──────────────────────────────────────────────────────────
install_ca_cert() {
    local resolved_ca=""
    if [[ -n "$CA_BUNDLE_PATH" && -f "$CA_BUNDLE_PATH" ]]; then
        cp "$CA_BUNDLE_PATH" "$CONFIG_DIR/server-ca.crt"
        chmod 644 "$CONFIG_DIR/server-ca.crt"
        resolved_ca="$CONFIG_DIR/server-ca.crt"
        echo -e "${GREEN}  [OK] CA certificate: $resolved_ca${NC}" >&2
    fi
    echo "$resolved_ca"
}

# ─── Write config file ────────────────────────────────────────────────────────
write_config() {
    local ca_dest="$1"
    echo -e "${YELLOW}Ghi file cấu hình...${NC}"

    local ca_line
    if [[ -n "$ca_dest" ]]; then
        ca_line="CERTCTL_SERVER_CA_BUNDLE_PATH=$ca_dest"
    else
        ca_line="# CERTCTL_SERVER_CA_BUNDLE_PATH=/etc/certctl/server-ca.crt"
    fi

    local discovery_line
    if [[ -n "$DISCOVERY_DIRS" ]]; then
        discovery_line="CERTCTL_DISCOVERY_DIRS=$DISCOVERY_DIRS"
    else
        discovery_line="# CERTCTL_DISCOVERY_DIRS=/etc/nginx/certs,/etc/ssl/certs"
    fi

    cat > "$CONFIG_FILE" <<EOF
# certctl Agent Configuration - Ubuntu Apache
# Được tạo bởi install-agent.sh vào $(date '+%Y-%m-%d %H:%M:%S')

# ─── Thông tin Agent ────────────────────────────────────────────────
CERTCTL_AGENT_ID=$AGENT_ID
CERTCTL_AGENT_NAME=$AGENT_NAME

# ─── Kết nối Server ─────────────────────────────────────────────────
CERTCTL_SERVER_URL=$SERVER_URL
CERTCTL_API_KEY=$API_KEY

# ─── TLS Trust ──────────────────────────────────────────────────────
# Nếu server dùng self-signed cert hoặc Private CA, bỏ comment dòng dưới:
$ca_line
# Dev/test only - BỎ TẮT trong production:
# CERTCTL_SERVER_TLS_INSECURE_SKIP_VERIFY=true

# ─── Key Storage ────────────────────────────────────────────────────
CERTCTL_KEY_DIR=$KEY_DIR
CERTCTL_KEYGEN_MODE=agent

# ─── Discovery ──────────────────────────────────────────────────────
$discovery_line

# ─── Logging ────────────────────────────────────────────────────────
CERTCTL_LOG_LEVEL=info
EOF

    chmod 600 "$CONFIG_FILE"
    echo -e "${GREEN}  [OK] $CONFIG_FILE (quyền 600 - chỉ root đọc được)${NC}"
}

# ─── Create systemd service ───────────────────────────────────────────────────
setup_systemd() {
    echo -e "${YELLOW}Tạo systemd service...${NC}"

    cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<'EOF'
[Unit]
Description=certctl Agent - Certificate Lifecycle Management
Documentation=https://github.com/zulufun/certctl-localhost
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
Restart=on-failure
RestartSec=10s
RestartMaxDelay=60s
StandardOutput=journal
StandardError=journal
SyslogIdentifier=certctl-agent

# Load environment từ config file
EnvironmentFile=/etc/certctl/agent.env

# Khởi động agent
ExecStart=/usr/local/bin/certctl-agent

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/lib/certctl /var/log/certctl /etc/nginx/certs /etc/ssl/certs

[Install]
WantedBy=multi-user.target
EOF

    chmod 644 "/etc/systemd/system/${SERVICE_NAME}.service"
    if command -v systemctl >/dev/null; then systemctl daemon-reload; else echo "Not using systemd"; fi
    echo -e "${GREEN}  [OK] /etc/systemd/system/${SERVICE_NAME}.service${NC}"
}

# ─── Start service ────────────────────────────────────────────────────────────
start_service() {
    if [[ "$NO_START" == "true" ]]; then
        echo -e "${YELLOW}Bỏ qua khởi động service (--no-start).${NC}"
        return
    fi

    echo -e "${YELLOW}Kích hoạt và khởi động certctl-agent...${NC}"
    if command -v systemctl >/dev/null; then systemctl enable "$SERVICE_NAME"; fi
    if command -v systemctl >/dev/null && systemctl is-system-running >/dev/null 2>&1; then systemctl start "$SERVICE_NAME"; else set -a; source /etc/certctl/agent.env; set +a; nohup "$INSTALL_DIR/$BINARY_NAME" > "$LOG_DIR/agent.log" 2>&1 & echo "Started agent in background"; fi
    sleep 3

    if if command -v systemctl >/dev/null && systemctl is-system-running >/dev/null 2>&1; then systemctl is-active --quiet "$SERVICE_NAME"; else pgrep -f certctl-agent >/dev/null; fi; then
        echo -e "${GREEN}  [OK] Service đang chạy!${NC}"
    else
        echo -e "${RED}  [WARN] Service chưa chạy. Kiểm tra:${NC}"
        echo "         journalctl -u $SERVICE_NAME -n 20 --no-pager"
    fi
}

# ─── Summary ──────────────────────────────────────────────────────────────────
show_summary() {
    local status
    status=$(systemctl is-active "$SERVICE_NAME" 2>/dev/null || echo "inactive")

    echo ""
    echo -e "${GREEN}=================================================="
    echo -e "  certctl Agent - Cài đặt hoàn tất!"
    echo -e "==================================================${NC}"
    echo ""
    echo "Thông tin cài đặt:"
    echo -e "  ${CYAN}Agent ID    :${NC} $AGENT_ID"
    echo -e "  ${CYAN}Agent Name  :${NC} $AGENT_NAME"
    echo -e "  ${CYAN}Server URL  :${NC} $SERVER_URL"
    echo -e "  ${CYAN}Trạng thái  :${NC} $status"
    echo ""
    echo "Đường dẫn:"
    echo -e "  ${CYAN}Binary      :${NC} $INSTALL_DIR/$BINARY_NAME"
    echo -e "  ${CYAN}Config      :${NC} $CONFIG_FILE"
    echo -e "  ${CYAN}Keys        :${NC} $KEY_DIR"
    echo ""
    echo "Lệnh quản lý:"
    echo -e "  ${YELLOW}Xem trạng thái :${NC} systemctl status $SERVICE_NAME"
    echo -e "  ${YELLOW}Xem logs       :${NC} journalctl -u $SERVICE_NAME -f"
    echo -e "  ${YELLOW}Khởi động lại  :${NC} systemctl restart $SERVICE_NAME"
    echo -e "  ${YELLOW}Dừng service   :${NC} systemctl stop $SERVICE_NAME"
    echo -e "  ${YELLOW}Gỡ cài đặt    :${NC} sudo $0 --uninstall"
    echo ""
    echo "Bước tiếp theo:"
    echo -e "  ${CYAN}1.${NC} Truy cập Dashboard: $SERVER_URL"
    echo -e "  ${CYAN}2.${NC} Vào menu 'Agents' - Agent '$AGENT_NAME' sẽ xuất hiện trong ~30 giây"
    echo -e "  ${CYAN}3.${NC} Cấu hình Deployment Target để deploy cert lên Apache"
    echo ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────
main() {
    parse_args "$@"

    show_banner

    if [[ "$UNINSTALL" == "true" ]]; then
        check_root
        do_uninstall
        exit 0
    fi

    check_root

    # 1. Kiểm tra binary có trong folder không
    local binary_src
    binary_src=$(check_binary)

    # 2. Thu thập config
    prompt_config

    # 3. Tạo thư mục
    setup_dirs

    # 4. Cài binary
    install_binary "$binary_src"

    # 5. Cài CA cert nếu có
    echo -e "${YELLOW}Xử lý CA certificate...${NC}"
    local ca_dest
    ca_dest=$(install_ca_cert)

    # 6. Ghi config
    write_config "$ca_dest"

    # 7. Tạo systemd service
    setup_systemd

    # 8. Khởi động
    start_service

    # 9. Tóm tắt
    show_summary
}

main "$@"
