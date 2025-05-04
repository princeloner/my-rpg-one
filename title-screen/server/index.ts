import { RpgServer, RpgModule, RpgPlayer } from '@rpgjs/server'

@RpgModule<RpgServer>({ 
    player: {
        onConnected(player: RpgPlayer) {
            // Открываем титульный экран
            const gui = player.gui('rpg-title-screen')
            gui.on('start-game', () => {
                // Закрываем титульный экран и запускаем игру
                gui.close()
                player.changeMap('simplemap')
            })
            gui.open()
        }
    }
})
export default class RpgServerModule {}