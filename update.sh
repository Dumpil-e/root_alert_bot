#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVICE_NAME="well_alert_bot"
BRANCH="main"

echo -e "${GREEN}=== Well Alert Bot updater ===${NC}"

# Проверка что мы в git репозитории
if [ ! -d ".git" ]; then
    echo -e "${RED}Не git репозиторий!${NC}"
    exit 1
fi

# Получаем текущий коммит
CURRENT=$(git rev-parse HEAD)

# Получаем последний коммит с remote
git fetch origin $BRANCH

LATEST=$(git rev-parse origin/$BRANCH)

if [ "$CURRENT" = "$LATEST" ]; then
    echo -e "${GREEN}Уже последняя версия (${CURRENT:0:7})${NC}"
    exit 0
fi

echo -e "${YELLOW}Найдена новая версия!${NC}"
echo -e "Текущая: ${CURRENT:0:7}"
echo -e "Новая:   ${LATEST:0:7}"
echo -e "\nИзменения:"
git log --oneline $CURRENT..origin/$BRANCH

# Сохраняем список изменений для уведомления
CHANGES=$(git log --oneline $CURRENT..origin/$BRANCH | head -10)

# Подтверждение
read -p "Обновить? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo -e "${YELLOW}Отменено${NC}"
    exit 0
fi

# Останавливаем сервис
echo -e "${YELLOW}Останавливаем сервис...${NC}"
systemctl stop $SERVICE_NAME

# Сохраняем .env
cp .env .env.backup

# Сохраняем config.json если есть
if [ -f "config.json" ]; then
    cp config.json config.json.backup
fi

# Обновляем код
echo -e "${YELLOW}Обновляем код...${NC}"
git pull origin $BRANCH

# Восстанавливаем .env
cp .env.backup .env
rm .env.backup

# Восстанавливаем config.json если был бекап
if [ -f "config.json.backup" ]; then
    cp config.json.backup config.json
    rm config.json.backup
else
    echo -e "${YELLOW}Создаём config.json из примера...${NC}"
    cp config.example.json config.json
    echo -e "${RED}Заполни config.json перед использованием:${NC}"
    echo -e "  ${YELLOW}nano $(pwd)/config.json${NC}"
fi

# Обновляем зависимости если изменился package.json
if git diff $CURRENT HEAD -- package.json | grep -q .; then
    echo -e "${YELLOW}Обновляем зависимости...${NC}"
    npm install
fi

# Пересобираем
echo -e "${YELLOW}Собираем проект...${NC}"
npm run build

# Запускаем сервис
echo -e "${YELLOW}Запускаем сервис...${NC}"
systemctl start $SERVICE_NAME

# Ждём запуска и отправляем уведомление в Root
sleep 3
curl -s -X POST http://localhost:3000/notify \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"🔄 Бот обновлён.\nБыло: ${CURRENT:0:7}\nСтало: ${LATEST:0:7}\nИзменения:\n${CHANGES}\"}" \
    && echo -e "${GREEN}Уведомление отправлено в Root${NC}" \
    || echo -e "${YELLOW}Не удалось отправить уведомление в Root${NC}"

echo -e "${GREEN}=== Обновление завершено! ===${NC}"
echo -e "Версия: ${LATEST:0:7}"
echo -e "Логи:   ${YELLOW}journalctl -u ${SERVICE_NAME} -f${NC}"