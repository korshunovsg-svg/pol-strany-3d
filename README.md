# Пол Страны · 3D-салоны

Интерактивная модель салонов Крокус, Омск и Ашан с общим коридором.

## Открыть модель

GitHub Pages: https://korshunovsg-svg.github.io/pol-strany-3d/

Прямые ссылки:
- Крокус: https://korshunovsg-svg.github.io/pol-strany-3d/
- Омск: https://korshunovsg-svg.github.io/pol-strany-3d/#omsk
- Ашан: https://korshunovsg-svg.github.io/pol-strany-3d/#ashan

## Включить GitHub Pages

В настройках репозитория откройте **Settings → Pages**:
- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**
- Нажмите **Save**.

## Версия и обновления

Это согласованная копия модели от 19 октября 2026 года (версия 26).
Рабочая версия продолжает дорабатываться отдельно в ChatGPT.
Эта копия обновляется только по отдельной команде владельца: «Обнови версию на GitHub».

## Запуск на компьютере

Нужен обычный HTTP-сервер. Например, при установленном Python:

```bash
python -m http.server 8000 --directory docs
```

Затем откройте http://localhost:8000/.
Файлы сайта находятся в `docs/`; сборка и серверная база данных не требуются.
Библиотека Three.js, изображения и текстуры включены в проект.
