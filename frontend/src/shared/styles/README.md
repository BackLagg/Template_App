# Shared Styles

Общие стили для всего приложения в структуре FSD.

## Структура

- `variables.scss` - переменные (цвета, шрифты, радиусы)
- `fonts.scss` - настройки шрифтов
- `global.scss` - глобальные стили (reset, скроллбары, и т.д.)
- `index.scss` - главный файл, импортирует все стили

## Использование

### В компонентах

```scss
// В SCSS модулях компонентов
@use '../../styles/variables' as *;

.myComponent {
  color: $color-text-primary;
  background: $color-brand-500;
}
```

### В приложении

```typescript
// В App.tsx или index.tsx
import '@shared/styles';
```

## Переменные

Все переменные доступны через `variables.scss`:
- `$color-*` - цвета
- `$font-*` - шрифты
- `$radius` - радиусы скругления
- `$shadow` - тени

