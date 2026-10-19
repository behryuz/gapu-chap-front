import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Рекомендация «слайс используется в одном месте — слейте его с потребителем».
    // Мы сознательно держим каждое пользовательское действие (войти, выйти из комнаты,
    // отправить сообщение…) отдельной фичей: так их видно по структуре папок и их
    // легко переиспользовать. Строгие правила (запрещённые импорты, публичный API) включены.
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    // В слое app «providers» — устоявшееся имя из документации FSD.
    files: ['./src/app/**'],
    rules: {
      'fsd/segments-by-purpose': 'off',
      'fsd/no-segmentless-slices': 'off',
    },
  },
]);
