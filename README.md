# Root Alert Bot

Бот для отправки алертов из Zabbix в мессенджер Root.

## Требования

- Debian/Ubuntu Linux
- Node.js 22+
- git

## Установка
```bash
curl -fsSL https://raw.githubusercontent.com/Dumpil-e/root_alert_bot/main/install.sh | bash
```

После установки заполнить `.env` и `config.json`, затем запустить скрипт снова.

## Конфигурация

### .env
```
DEV_TOKEN=      # токен из Root Developer Portal
ZABBIX_SECRET=  # секретный ключ для вебхука Zabbix
```

### config.json
```json
{
    "channels": {
        "general": "id канала",
        "warning": "id канала",
        "info":    "id канала"
    },
    "rules": {
        "Not classified": { "channel": "info",    "mentionRoles": [] },
        "Info":           { "channel": "info",    "mentionRoles": [] },
        "Warning":        { "channel": "warning", "mentionRoles": [] },
        "Average":        { "channel": "warning", "mentionRoles": [] },
        "High":           { "channel": "general", "mentionRoles": [] },
        "Disaster":       { "channel": "general", "mentionRoles": [] }
    }
}
```

ID каналов можно найти в настройках сообщества Root.

## Zabbix

В настройках вебхука добавить заголовок:
```
X-Secret-Token: значение из ZABBIX_SECRET
```

## Управление
```bash
systemctl status root_alert_bot     # статус
journalctl -u root_alert_bot -f     # логи
systemctl restart root_alert_bot    # перезапуск
./update.sh                         # обновление
```

## Обновление
```bash
cd /opt/root_alert_bot
./update.sh
```