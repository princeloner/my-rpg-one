<template>
  <div class="background">
    <div class="title" v-if="false">
      <h1>{{ title }}</h1>
    </div>
    <div v-if="!isMMO" class="content">
      <!-- Контейнер для профиля и локаций -->
      <div class="profile-container">
        <!-- Блок профиля и кошелька -->
        <div class="profile-section" :class="{'pulse': hasNewQuests && !questsVisible}">
          <h2 class="section-title">
            <span>{{ showSettings ? 'Настройки' : (showProfile ? 'Профиль игрока' : 'Инвентарь') }}</span>
            <button v-if="!showSettings" @click="toggleSettings" class="icon-button">
              <svg xmlns="http://www.w3.org/2000/svg" class="settings-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button v-if="showSettings" @click="toggleSettings" class="back-button">
              Назад
            </button>
          </h2>
          
          <!-- Профиль игрока -->
          <div v-if="showProfile && !showSettings" class="profile-content">
            <!-- Иконка персонажа -->
            <div class="character-info">
              <div class="character-icon"></div>
              <div class="character-details">
                <span class="character-name">{{ username }}</span>
                <span class="character-id">ID: {{ userId || '12345678' }}</span>
              </div>
            </div>
            
            <!-- Статус кошелька и подключение -->
            <div class="wallet-status">
              <div class="wallet-info">
                <span class="status-label">Статус кошелька</span>
                <span v-if="walletAddress" class="wallet-connected">
                  Подключен: {{ formatAddress(walletAddress) }}
                </span>
                <span v-else class="wallet-disconnected">Не подключен</span>
                <span 
                  v-if="walletAddress && tonBalance !== null" 
                  class="wallet-balance"
                  @click="toggleBalanceVisibility"
                >
                  Баланс: {{ balanceVisible ? tonBalance : '****' }} TON
                  <svg xmlns="http://www.w3.org/2000/svg" class="eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      :d="balanceVisible ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" 
                    />
                  </svg>
                </span>
              </div>
              
              <button 
                v-if="!walletAddress" 
                @click="connectWallet" 
                :disabled="walletConnecting"
                class="wallet-button"
                :class="{'wallet-connecting': walletConnecting}"
              >
                {{ walletConnecting ? 'Подключение...' : 'Подключить' }}
              </button>
              <button 
                v-else 
                @click="disconnectWallet"
                class="wallet-button wallet-disconnect"
              >
                Отключить
              </button>
            </div>
            
            <!-- Сообщение об ошибке -->
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <!-- Информация о персонаже -->
            <div class="character-stats">
              <div class="stat-row">
                <span>Уровень</span>
                <span class="stat-value">{{ playerLevel }}</span>
              </div>
              
              <div class="stat-row">
                <span>Опыт</span>
                <span>{{ playerXp }} / {{ playerLevel * 100 }}</span>
              </div>
              
              <div class="xp-bar">
                <div class="xp-progress" :style="{ width: `${Math.min(100, (playerXp / (playerLevel * 100)) * 100)}%` }"></div>
              </div>
            </div>
            
            <!-- Кнопка инвентаря -->
            <button @click="toggleInventory" class="inventory-button">
              Открыть инвентарь
            </button>
          </div>
          
          <!-- Настройки -->
          <div v-else-if="showSettings" class="settings-content">
            <!-- Изменение персонажа -->
            <div class="settings-section">
              <div class="settings-row">
                <span>Изменить персонажа</span>
                <button class="settings-action-button">Изменить</button>
              </div>
            </div>
            
            <!-- Настройки интерфейса -->
            <div class="settings-section">
              <h3 class="settings-heading">Настройки интерфейса</h3>
              
              <div class="settings-options">
                <div class="toggle-option">
                  <span>Тёмная тема</span>
                  <div class="toggle-switch active">
                    <div class="toggle-handle right"></div>
                  </div>
                </div>
                
                <div class="toggle-option">
                  <span>Звуковые эффекты</span>
                  <div class="toggle-switch">
                    <div class="toggle-handle left"></div>
                  </div>
                </div>
                
                <div class="toggle-option">
                  <span>Вибрация</span>
                  <div class="toggle-switch active">
                    <div class="toggle-handle right"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Игровые настройки -->
            <div class="settings-section">
              <h3 class="settings-heading">Игровые настройки</h3>
              
              <div class="settings-options">
                <div class="select-option">
                  <span>Сложность игры</span>
                  <select class="settings-select">
                    <option>Легкая</option>
                    <option>Средняя</option>
                    <option>Сложная</option>
                  </select>
                </div>
                
                <div class="select-option">
                  <span>Скорость анимации</span>
                  <select class="settings-select">
                    <option>Медленная</option>
                    <option>Нормальная</option>
                    <option>Быстрая</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- О игре -->
            <div class="settings-section">
              <h3 class="settings-heading">О игре</h3>
              <p class="about-version">Версия: 0.1.0 Beta</p>
              <p class="about-developer">Разработчик: @sinjedzhi</p>
              <div class="about-links">
                <button class="about-link">Помощь</button>
                <button class="about-link">Контакты</button>
              </div>
            </div>
          </div>
          
          <!-- Инвентарь -->
          <div v-else class="inventory-content">
            <div class="inventory-grid">
              <div 
                v-for="(item, index) in inventory" 
                :key="index" 
                class="inventory-slot"
                :class="{ 'empty-slot': !item }"
              >
                <template v-if="item">
                  <span class="item-initial">{{ item.name.charAt(0) }}</span>
                  <span v-if="item.quantity > 1" class="item-quantity">{{ item.quantity }}</span>
                </template>
              </div>
            </div>
            
            <!-- Кнопка возврата к профилю -->
            <button @click="toggleInventory" class="return-button">
              Вернуться к профилю
            </button>
          </div>
        </div>

        <!-- Выбор локации -->
        <div class="locations-section">
          <h2 class="section-title">
            <span>{{ questsVisible ? 'Квесты' : 'Локации' }}</span>
            <span v-if="!questsVisible" class="location-hint">(нажми на локацию для игры)</span>
          </h2>
          
          <div class="scrollable-content">
            <!-- Квесты -->
            <div v-if="questsVisible" class="quests-container">
              <div 
                v-for="quest in questItems" 
                :key="quest.id" 
                class="quest-item"
                :class="{'new-quest': quest.isNew}"
              >
                <div class="quest-header">
                  <h3 class="quest-title">{{ quest.title }}</h3>
                  <span v-if="quest.isNew" class="new-badge">НОВЫЙ</span>
                </div>
                <p class="quest-description">{{ quest.description }}</p>
                
                <div v-if="quest.rewards" class="quest-rewards">
                  <span class="rewards-label">Награды:</span>
                  <div class="rewards-list">
                    <span v-if="quest.rewards.xp" class="xp-reward">+{{ quest.rewards.xp }} XP</span>
                    <span v-if="quest.rewards.gold" class="gold-reward">+{{ quest.rewards.gold }} Gold</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Локации -->
            <div v-else class="locations-container">
              <button 
                @click="startGame"
                class="location-item active"
              >
                <span>Темный лес</span>
                <span class="level-range">Уровень 1-5</span>
              </button>
              
              <button class="location-item disabled">
                <span>Подземелье гоблинов</span>
                <span class="level-range">Уровень 5-10</span>
              </button>
              
              <button class="location-item disabled">
                <span>Заброшенная крепость</span>
                <span class="level-range">Уровень 10-15</span>
              </button>
            </div>
          </div>
          
          <div class="toggle-container">
            <button 
              @click="toggleQuestsVisibility"
              class="toggle-button"
              :class="{'pulse': !questsVisible && hasNewQuests}"
            >
              {{ questsVisible ? 'Показать локации' : 'Показать квесты' }}
              <span v-if="!questsVisible && hasNewQuests" class="quest-badge">
                {{ newQuestsCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <rpg-login v-else class="margin-bottom"></rpg-login>
  </div>
</template>

<script lang="ts">
import { Control } from '@rpgjs/client'
import { defineComponent } from 'vue'
import { TonConnectUI } from '@tonconnect/ui'

// Определение типов
interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  level?: number;
  effect?: string;
}

interface QuestItem {
  id: string;
  title: string;
  description: string;
  isNew: boolean;
  rewards?: {
    xp?: number;
    gold?: number;
    items?: string[];
  };
}

// @ts-ignore
const isMMORPG = import.meta.env.VITE_RPG_TYPE == 'mmorpg'

// Проверка на Telegram WebApp
// @ts-ignore
const isTelegram = window.Telegram && window.Telegram.WebApp

// Инициализация TonConnect UI
const tonConnectUI = new TonConnectUI({
  manifestUrl: window.location.origin + '/tonconnect-manifest.json'
});

const name = 'rpg-title-screen'

export default defineComponent({
  name,
  inject: ['rpgEngine', 'rpgGui', 'rpgGuiInteraction', 'rpgKeypress', 'rpgSound'],
  data() {
    return {
      // Основные настройки
      title: '',
      isMMO: false,
      isFullscreen: false, // Состояние полноэкранного режима
      // @ts-ignore - игнорируем ошибку типов для Telegram API
      isTelegram: !!(window.Telegram && window.Telegram.WebApp), // Проверка на Telegram WebApp
      
      // Wallet состояния
      walletAddress: null as string | null,
      walletConnecting: false,
      connected: false,
      tonBalance: null as number | null,
      balanceVisible: true,
      error: null as string | null,
      
      // UI состояния
      showProfile: true,
      showSettings: false,
      inventoryOpen: false,
      questsVisible: false,
      
      // User данные
      username: "Имя персонажа",
      userId: null as string | number | null,
      playerLevel: 1,
      playerXp: 0,
      
      // Данные игры
      inventory: [
        { id: 'item-1', name: 'Меч новичка', type: 'weapon', level: 1, quantity: 1 },
        { id: 'item-2', name: 'Зелье здоровья', type: 'consumable', effect: 'heal', quantity: 5 },
        { id: 'item-3', name: 'Деревянный щит', type: 'armor', level: 1, quantity: 1 },
        { id: 'item-4', name: 'Монеты', type: 'currency', quantity: 250 },
        null, null, null, null, // Пустые слоты
        null, null, null, null
      ] as (InventoryItem | null)[],
      
      questItems: [
        {
          id: 'quest-001',
          title: 'Начальный квест',
          description: 'Подключите кошелек TON для получения начальных предметов',
          isNew: true,
          rewards: { xp: 50, gold: 100 }
        },
        {
          id: 'quest-002',
          title: 'Исследование леса',
          description: 'Исследуйте Темный лес и найдите первый артефакт',
          isNew: false,
          rewards: { xp: 100, gold: 200, items: ['Древний свиток'] }
        }
      ] as QuestItem[],
      
      // Обработчик подписки
      obsKeyPress: null as any,
      tonConnectUI: null as typeof tonConnectUI | null
    }
  },
  mounted() {
    const { screenTitle } = this.rpgEngine.globalConfig
    if (screenTitle) {
      this.title = screenTitle.title
      if (screenTitle.music) {
        this.rpgSound.get(screenTitle.music).play()
      }
    }
    
    // Инициализация Telegram WebApp если мы в Telegram
    // @ts-ignore
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        // @ts-ignore
        window.Telegram.WebApp.ready(); // Уведомляем что приложение загрузилось
        // @ts-ignore
        window.Telegram.WebApp.expand(); // Расширяем веб-приложение
        
        // Запускаем полноэкранный режим с небольшой задержкой, чтобы UI успел инициализироваться
        setTimeout(() => {
          this.enableFullscreen();
        }, 1000);
      } catch (error) {
        console.error('Ошибка при инициализации Telegram WebApp:', error);
      }
    }
    
    this.obsKeyPress = this.rpgKeypress.subscribe(({ control }) => {
      if (!control) return
      if (control.actionName == Control.Back) {
        this.showSettings = false
        this.showProfile = true
        this.questsVisible = false
      }
    })
    
    // Инициализация TonConnect
    this.tonConnectUI = tonConnectUI
    
    // Проверка текущего подключения
    this.checkWalletConnection()
    
    // Подписка на изменения статуса кошелька
    this.tonConnectUI.onStatusChange(this.handleWalletStatusChange)
    
    // Включаем полноэкранный режим, если игра запущена в Telegram
    // Removed from here as we've added it above with a delay
  },
  unmounted() {
    if (this.obsKeyPress) {
      this.obsKeyPress.unsubscribe()
    }
    
    // Отписка от событий TonConnect
    if (this.tonConnectUI) {
      this.tonConnectUI.uiDisconnectDisposable?.()
    }
    
    // Удаляем слушатели событий Telegram при размонтировании
    // @ts-ignore
    if (window.Telegram && window.Telegram.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.offEvent('fullscreenChanged')
      // @ts-ignore
      window.Telegram.WebApp.offEvent('fullscreenFailed')
    }
  },
  computed: {
    // Проверка на наличие новых квестов
    hasNewQuests(): boolean {
      return this.questItems.some(quest => quest.isNew)
    },
    // Количество новых квестов
    newQuestsCount(): number {
      return this.questItems.filter(quest => quest.isNew).length
    }
  },
  methods: {
    // Форматирование адреса кошелька
    formatAddress(address: string): string {
      if (!address) return ''
      return `${address.slice(0, 6)}...${address.slice(-6)}`
    },
    
    // Проверка подключения кошелька
    async checkWalletConnection(): Promise<void> {
      try {
        if (!this.tonConnectUI) return
        
        const activeWallet = this.tonConnectUI.wallet
        
        if (activeWallet) {
          this.walletAddress = activeWallet.account.address
          this.connected = true
          
          // Отмечаем квест как выполненный
          this.completeWalletQuest()
          
          // Получаем баланс TON
          await this.fetchTonBalance(activeWallet.account.address)
        }
      } catch (err) {
        console.error('Ошибка при проверке подключения кошелька:', err)
      }
    },
    
    // Обработчик изменения статуса кошелька
    async handleWalletStatusChange(wallet: any): Promise<void> {
      try {
        if (wallet) {
          this.walletAddress = wallet.account.address
          this.connected = true
          
          // Отмечаем квест как выполненный
          this.completeWalletQuest()
          
          // Получаем баланс TON
          await this.fetchTonBalance(wallet.account.address)
        } else {
          this.walletAddress = null
          this.tonBalance = null
          this.connected = false
        }
      } catch (err) {
        console.error('Ошибка при обработке изменения статуса кошелька:', err)
      }
    },
    
    // Получение баланса TON
    async fetchTonBalance(address: string): Promise<void> {
      try {
        // Используем TonAPI для получения баланса
        const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`)
        const data = await response.json()
        
        if (data && data.result) {
          // Конвертируем нанотоны в тоны (1 TON = 10^9 нанотонов)
          const balanceTon = parseFloat(data.result) / 1_000_000_000
          this.tonBalance = parseFloat(balanceTon.toFixed(4))
        } else {
          this.tonBalance = 0
        }
      } catch (error) {
        console.error('Ошибка при получении баланса TON:', error)
        this.tonBalance = 0
      }
    },
    
    // Отмечаем квест подключения кошелька как выполненный
    completeWalletQuest(): void {
      this.questItems = this.questItems.map(item => 
        item.id === 'quest-001' 
          ? { ...item, isNew: false }
          : item
      )
    },
    
    // Управление кошельком
    async connectWallet(): Promise<void> {
      try {
        if (!this.tonConnectUI) {
          this.error = "Ошибка инициализации TonConnect"
          return
        }
        
        this.walletConnecting = true
        this.error = null
        
        // Если кошелек уже подключен
        if (this.tonConnectUI.wallet) {
          console.log('Кошелек уже подключен:', this.tonConnectUI.wallet.account.address)
          this.walletAddress = this.tonConnectUI.wallet.account.address
          this.connected = true
          this.walletConnecting = false
          return
        }
        
        // Открываем модальное окно выбора кошелька
        await this.tonConnectUI.openModal()
        this.walletConnecting = false
      } catch (err) {
        console.error('Ошибка при подключении кошелька:', err)
        this.error = 'Не удалось подключить кошелек. Попробуйте снова.'
        this.walletConnecting = false
      }
    },
    
    // Отключение кошелька
    async disconnectWallet(): Promise<void> {
      try {
        if (!this.tonConnectUI) return
        
        await this.tonConnectUI.disconnect()
        this.walletAddress = null
        this.tonBalance = null
        this.connected = false
      } catch (err) {
        console.error('Ошибка при отключении кошелька:', err)
        this.error = 'Не удалось отключить кошелек. Попробуйте снова.'
      }
    },
    
    // Переключение видимости баланса
    toggleBalanceVisibility(): void {
      this.balanceVisible = !this.balanceVisible
    },
    
    // Переключение между профилем и инвентарем
    toggleInventory(): void {
      this.showProfile = !this.showProfile
    },
    
    // Переключение между настройками
    toggleSettings(): void {
      this.showSettings = !this.showSettings
      if (!this.showSettings && !this.showProfile) {
        this.showProfile = true
      }
    },
    
    // Переключение между локациями и квестами
    toggleQuestsVisibility(): void {
      this.questsVisible = !this.questsVisible
    },
    
    // Начало игры
    startGame(): void {
      this.rpgGuiInteraction('rpg-title-screen', 'start-game')
    },
    
    // Автоматически включить полноэкранный режим в Telegram
    enableFullscreen(): void {
      // @ts-ignore
      if (window.Telegram && window.Telegram.WebApp) {
        try {
          // @ts-ignore
          window.Telegram.WebApp.requestFullscreen();
          
          // Добавляем слушатели событий для мониторинга изменений полноэкранного режима
          // @ts-ignore
          window.Telegram.WebApp.onEvent('fullscreenChanged', () => {
            // @ts-ignore
            this.isFullscreen = window.Telegram.WebApp.isFullscreen;
          });
          
          // @ts-ignore
          window.Telegram.WebApp.onEvent('fullscreenFailed', (params) => {
            console.error('Ошибка при открытии полноэкранного режима:', params.error);
          });
        } catch (error) {
          console.error('Ошибка при активации полноэкранного режима:', error);
        }
      }
    },
  }
})
</script>

<style scoped lang="scss">
$title-screen-font-size: 40px !default;
$title-screen-font-color: white !default;
$title-screen-font-border-color: black !default;
$title-screen-background: none !default;
$font-family-press-p2: 'Press Start 2P', cursive, monospace;

/* Импорт шрифта Press Start 2P через Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* Keyframes для пульсации */
@keyframes pulse {
  0%, 100% {
    border-color: rgba(202, 138, 4, 0.5);
  }
  50% {
    border-color: rgba(202, 138, 4, 1);
  }
}

.pulse {
  animation: pulse 2s infinite;
}

.title {
  position: absolute;
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 50px;
  font-family: $font-family-press-p2;
  font-size: $title-screen-font-size;
  & h1 {
    color: white;
    text-shadow: 
        -1px -1px 0 $title-screen-font-border-color, 
        1px -1px 0 $title-screen-font-border-color, 
        -1px 1px 0 $title-screen-font-border-color, 
        1px 1px 0 $title-screen-font-border-color;
  }
}

.background {
  position: absolute;
  background-color: black;
  width: 100%;
  height: 100%;
  display: flex;
  background-size: cover;
  font-family: $font-family-press-p2;
}

.content {
  width: 100%;
  height: 100%;
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.profile-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  
  
  @media (min-width: 640px) {
    flex-direction: row;
    gap: 20px;
    padding: 77px 10px;
  }
}

.profile-section, .locations-section {
  flex: 1;
  background-color: #00000099;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  @media (min-width: 640px) {
    padding: 16px;
    margin-bottom: 20px;
    
  }
  
  &:hover {
    border-color: #f59e0b;
    transition: border-color 0.3s;
  }
}

.section-title {
  font-size: 16px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #4b5563;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #f59e0b;
  font-family: $font-family-press-p2;
  
  @media (min-width: 640px) {
    font-size: 18px;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
}

.icon-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: #1f2937;
    transition: background-color 0.3s;
  }
}

.settings-icon {
  height: 20px;
  width: 20px;
  color: #000000;
}

.back-button {
  font-size: 12px;
  color: white;
  font-family: $font-family-press-p2;
  
  &:hover {
    color: white;
    transition: color 0.3s;
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.character-info {
  display: flex;
  align-items: center;
}

.character-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background-image: url('/character-icon.png');
  background-size: cover;
  background-position: center;
  
  @media (min-width: 640px) {
    width: 64px;
    height: 64px;
  }
}

.character-details {
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (min-width: 640px) {
    margin-left: 12px;
  }
}

.character-name {
  font-size: 14px;
  font-weight: bold;
  line-height: 1.2;
  font-family: $font-family-press-p2;
  color: #9ca3af;
  
  @media (min-width: 640px) {
    font-size: 18px;
  }
}

.character-id {
  font-size: 12px;
  color: #9ca3af;
}

.wallet-status {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.wallet-info {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 14px;
  color: #9ca3af;
  white-space: nowrap;
}

.wallet-connected {
  font-size: 12px;
  color: #34d399;
}

.wallet-disconnected {
  font-size: 12px;
  color: #6b7280;
}

.wallet-balance {
  font-size: 12px;
  color: #fbbf24;
  margin-top: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.eye-icon {
  height: 12px;
  width: 12px;
  margin-left: 4px;
  opacity: 0.7;
}

.wallet-button {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #1d4ed8;
  color: white;
  font-family: $font-family-press-p2;
  
  &:hover {
    background-color: #2563eb;
    transition: background-color 0.3s;
  }
  
  &.wallet-connecting {
    background-color: #4b5563;
    color: white;
    cursor: not-allowed;
  }
  
  &.wallet-disconnect {
    background-color: #047857;
    color: white;
    
    &:hover {
      background-color: #059669;
    }
  }
}

.error-message {
  background-color: rgba(153, 27, 27, 0.3);
  border: 1px solid #991b1b;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  color: #fca5a5;
}

.character-stats {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #4b5563;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 4px;
}

.stat-value {
  color: #93c5fd;
}

.xp-bar {
  width: 100%;
  height: 6px;
  background-color: #4b5563;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.xp-progress {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 3px;
}

.inventory-button, .return-button {
  margin-top: 8px;
  padding: 8px 0;
  width: 100%;
  border: 1px solid #4b5563;
  border-radius: 6px;
  background-color: #1f2937;
  font-size: 14px;
  color: white;
  font-family: $font-family-press-p2;
  
  &:hover {
    background-color: #374151;
    transition: background-color 0.3s;
  }
}

/* Settings Styles */
.settings-content {
  overflow-y: auto;
  max-height: 360px;
}

.settings-section {
  padding: 16px;
  background-color: rgba(31, 41, 55, 0.7);
  border-radius: 8px;
  border: 1px solid #4b5563;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    border-color: #f59e0b;
    transition: border-color 0.3s;
  }
}

.settings-heading {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 12px;
  font-family: $font-family-press-p2;
  color: #f59e0b;
}

.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.settings-action-button {
  font-size: 12px;
  padding: 4px 8px;
  background-color: rgba(30, 58, 138, 0.5);
  border: 1px solid #1e40af;
  border-radius: 4px;
  color: white;
  font-family: $font-family-press-p2;
  
  &:hover {
    background-color: #1e40af;
    transition: background-color 0.3s;
  }
}

.settings-options {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-option, .select-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #d1d5db;
  padding: 8px 0;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
  
  &:last-child {
    border-bottom: none;
  }
}

.toggle-switch {
  width: 40px;
  height: 20px;
  background-color: #4b5563;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &.active {
    background-color: #f59e0b;
  }
}

.toggle-handle {
  position: absolute;
  top: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  
  &.left {
    left: 2px;
  }
  
  &.right {
    right: 2px;
  }
}

.settings-select {
  background-color: #4b5563;
  font-size: 12px;
  border-radius: 4px;
  padding: 4px 8px;
  border: 1px solid #374151;
  font-family: $font-family-press-p2;
}

.about-version, .about-developer {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.about-links {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #4b5563;
  display: flex;
  justify-content: space-between;
}

.about-link {
  font-size: 12px;
  color: #3b82f6;
  font-family: $font-family-press-p2;
  
  &:hover {
    color: #60a5fa;
    transition: color 0.3s;
  }
}

/* Inventory Styles */
.inventory-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 45px);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 8px;
  
  @media (min-width: 640px) {
    gap: 16px;
    margin-bottom: 12px;
  }
}

.inventory-slot {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #1f2937;
  border: 1px solid #4b5563;
  
  @media (min-width: 640px) {
    width: 48px;
    height: 48px;
  }
  
  &.empty-slot {
    background-color: rgba(31, 41, 55, 0.3);
    border: 1px solid rgba(75, 85, 99, 0.5);
  }
}

.item-initial {
  font-size: 12px;
  font-family: $font-family-press-p2;
}

.item-quantity {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 10px;
  background-color: #111827;
  padding: 0 4px;
  border-radius: 2px;
  font-family: $font-family-press-p2;
}

/* Locations & Quests Styles */
.location-hint {
  font-size: 10px;
  color: #9ca3af;
  margin-left: 6px;
  
  @media (min-width: 640px) {
    font-size: 12px;
    margin-left: 8px;
  }
}

.scrollable-content {
  max-height: 30vh;
  overflow-y: auto;
  padding-right: 4px;
  margin-right: -4px;
  padding-bottom: 8px;
  
  @media (min-width: 640px) {
    max-height: 50vh;
    padding-bottom: 12px;
  }
}

.quests-container, .locations-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quest-item {
  padding: 12px;
  border-radius: 6px;
  background-color: #1f2937;
  border: 1px solid #4b5563;
  
  &.new-quest {
    background-color: rgba(146, 64, 14, 0.2);
    border-color: #92400e;
  }
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.quest-title {
  font-size: 14px;
  font-weight: bold;
  font-family: $font-family-press-p2;
}

.new-badge {
  background-color: #d97706;
  color: black;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  font-family: $font-family-press-p2;
}

.quest-description {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.quest-rewards {
  margin-top: 8px;
  padding-top: 4px;
  border-top: 1px solid #4b5563;
  font-size: 12px;
}

.rewards-label {
  color: #6b7280;
}

.rewards-list {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.xp-reward {
  color: #93c5fd;
}

.gold-reward {
  color: #fbbf24;
}

.location-item {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  background-color: #1f2937;
  text-align: left;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-family: $font-family-press-p2;
  
  @media (min-width: 640px) {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  &:hover {
    background-color: #374151;
    transition: background-color 0.3s;
  }
  
  &.active {
    background-color: #1f2937;
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.level-range {
  font-size: 12px;
  color: #6b7280;
}

.toggle-container {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #4b5563;
}

.toggle-button {
  width: 100%;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: #1f2937;
  font-size: 14px;
  text-align: center;
  position: relative;
  color: white;
  font-family: $font-family-press-p2;
  
  &:hover {
    background-color: #374151;
    transition: background-color 0.3s;
  }
  
  &.pulse {
    border: 1px solid #d97706;
  }
}

.quest-badge {
  display: inline-block;
  margin-left: 8px;
  background-color: #d97706;
  color: black;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 9999px;
  font-family: $font-family-press-p2;
}

/* Play Button */
.play-button-container {
  width: 100%;
  max-width: 320px;
  margin: 16px auto;
}

.play-button {
  width: 100%;
  padding: 12px 0;
  border-radius: 6px;
  border: 1px solid #4b5563;
  background-color: #1f2937;
  color: white;
  font-family: $font-family-press-p2;
  font-size: 16px;
  letter-spacing: 1px;
  
  &:hover {
    background-color: #374151;
    transition: background-color 0.3s;
  }
}

.margin-bottom {
  margin-bottom: 50px;
}
</style>