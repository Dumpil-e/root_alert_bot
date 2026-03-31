#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# === НАСТРОЙКИ — менять только здесь ===
REPO="https://github.com/Dumpil-e/root_alert_bot.git"
BRANCH="main"
INSTALL_DIR="/opt/well_alert_bot"
SERVICE_NAME="well_alert_bot"
# =======================================

echo -e "${GREEN}=== Well Alert Bot installer ===${NC}"

# Проверка node
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не найден! Установи Node.js 22+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${RED}Нужен Node.js 22+, у тебя $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js $(node -v) — OK${NC}"

# Проверка git
if ! command -v git &> /dev/null; then
    echo -e "${RED}git не найден!${NC}"
    exit 1
fi

# Клонируем репозиторий
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Директория уже существует, обновляем...${NC}"
    cd $INSTALL_DIR
    git pull origin $BRANCH
else
    echo -e "${YELLOW}Клонируем репозиторий...${NC}"
    git clone -b $BRANCH $REPO $INSTALL_DIR
    cd $INSTALL_DIR
fi

# Проверка .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Создаём .env из примера...${NC}"
    cp .env.example .env
    echo -e "${RED}Заполни .env файл:${NC}"
    echo -e "  ${YELLOW}nano ${INSTALL_DIR}/.env${NC}"
    echo -e "${RED}Затем запусти снова:${NC}"
    echo -e "  ${YELLOW}${INSTALL_DIR}/install.sh${NC}"
    exit 1
fi

# Проверка что значения заполнены
source .env
if [ -z "$DEV_TOKEN" ] || [ -z "$ZABBIX_SECRET" ]; then
    echo -e "${RED}Заполни DEV_TOKEN и ZABBIX_SECRET в .env!${NC}"
    echo -e "  ${YELLOW}nano ${INSTALL_DIR}/.env${NC}"
    exit 1
fi

# Установка зависимостей
echo -e "${YELLOW}Устанавливаем зависимости...${NC}"
npm install

# Сборка
echo -e "${YELLOW}Собираем проект...${NC}"
npm run build

# Создание systemd сервиса
echo -e "${YELLOW}Настраиваем systemd сервис...${NC}"
CURRENT_USER=$(whoami)

tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=Well Alert Bot
After=network.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${INSTALL_DIR}
ExecStart=/usr/bin/node ${INSTALL_DIR}/dist/main.js
Restart=on-failure
RestartSec=5s
StartLimitIntervalSec=60s
StartLimitBurst=10
EnvironmentFile=${INSTALL_DIR}/.env
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME

echo -e "${GREEN}=== Установка завершена! ===${NC}"
echo -e "Директория:  ${YELLOW}${INSTALL_DIR}${NC}"
echo -e "Статус:      ${YELLOW}sudo systemctl status ${SERVICE_NAME}${NC}"
echo -e "Логи:        ${YELLOW}sudo journalctl -u ${SERVICE_NAME} -f${NC}"
echo -e "Обновление:  ${YELLOW}${INSTALL_DIR}/update.sh${NC}"