# YouTube Cinema Speed Panel 🎬

**Панель управления скоростью YouTube в режиме кинотеатра**

[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-v2.3-brightgreen)](https://greasyfork.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features / Возможности

- **Speed control** — 1x, 1.25x, 1.5x, 1.75x, 2x, 2.2x; appears at bottom center on hover
  Панель управления скоростью воспроизведения — появляется в центре внизу при наведении

- **Night mode** — dims video to 60% for comfortable viewing in dark
  Ночной режим — затемняет видео до 60%

- **Dynamic edge glow** — analyzes video colors and casts ambient glow around video
  Динамическое свечение по краям — анализирует цвета видео и создаёт подсветку

- **Pure cinema layout** — hides sidebar, comments, search bar, microphone
  Чистый кинотеатр — скрывает сайдбар, комментарии, строку поиска, микрофон

- **Auto-hide UI** — speed bar appears on hover at bottom center, hides after 5 seconds
  Панель скорости автоматически скрывается — появляется в центре внизу при наведении, исчезает через 5 секунд

---

## Installation / Установка

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Install the script from [Greasy Fork](https://greasyfork.org/) or click the raw `.user.js` file
3. Open any YouTube video — the cinema mode activates automatically

---

1. Установите [Tampermonkey](https://www.tampermonkey.net/) или [Violentmonkey](https://violentmonkey.github.io/)
2. Установите скрипт с [Greasy Fork](https://greasyfork.org/) или откройте сырой `.user.js` файл
3. Откройте любое видео на YouTube — режим кинотеатра включится автоматически

---

## Usage / Использование

| Action | Description |
|--------|-------------|
| **Speed bar** | Hover to show, click a speed button |
| **Night Mode** | Click the "Night" button |
| **Edge glow** | Updates every 300ms based on video colors |

| Действие | Описание |
|----------|----------|
| **Панель скорости** | Наведите мышь, нажмите кнопку скорости |
| **Ночной режим** | Кнопка "Night" включает/выключает |
| **Свечение краёв** | Обновляется каждые 300 мс |

---

## Notes / Примечания

If edge glow doesn't work on some videos — this is due to CORS/MediaSource restrictions and doesn't affect other features.

Если свечение не работает на некоторых видео — это связано с ограничениями CORS/MediaSource и не влияет на остальные функции.

---

## Author / Автор

**Олег Зубков (Oleg Zubkov)**  
© 2026  
License: MIT

---

## Links / Ссылки

- [GitHub Repository](https://github.com/oleg7483/youtube-cinema-speed-panel)
- [Report Issue](https://github.com/oleg7483/youtube-cinema-speed-panel/issues)
