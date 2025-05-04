import { RpgModule, RpgClient } from '@rpgjs/client'


@RpgModule<RpgClient>({
    engine: {
        // Удаляем автоматический запуск основной игры
    }
})

export default class RpgClientEngine {}