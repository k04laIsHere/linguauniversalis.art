const ASSETS_BASE = '/assets'

const data = {
  ru: {
    langLabel: 'RU',
    hero: {
      title: 'Lingua Universalis',
      subtitle: 'Искусство Созидания',
      image: `${ASSETS_BASE}/Афиша.jpg`
    },
    manifesto: {
      heading: 'Манифест',
      text: `Искусство — универсальный язык, связующий нас с древними предками. Через образ, след и символ мы находим мост между временами.`
    },
    characters: [
      { name: 'Джослен', role: 'Шаман', desc: 'Хранитель первобытной памяти', img: `${ASSETS_BASE}/Работа1.jpg` },
      { name: 'Режиссёр', role: 'Искатель', desc: 'Ведёт путь к смыслу', img: `${ASSETS_BASE}/Работа2.jpg` },
      { name: 'Художник', role: 'Создатель', desc: 'Переводит мир в образ', img: `${ASSETS_BASE}/Работа3.jpg` }
    ],
    journey: [
      { year: '2023', title: 'Выставка', desc: 'Кураторская экспозиция — диалог с древним.' },
      { year: '2024', title: 'Круглый стол', desc: 'Философская дискуссия о языке искусства.' },
      { year: 'Будущее', title: 'Тёмная мастерская', desc: 'Место для экспериментов и ритуалов.' }
    ],
    gallery: [
      `${ASSETS_BASE}/Работа1.jpg`,
      `${ASSETS_BASE}/Работа2.jpg`,
      `${ASSETS_BASE}/Работа3.jpg`,
      `${ASSETS_BASE}/Работа4.jpg`
    ],
    contact: {
      email: 'info@lingua-universalis.example',
      links: ['Проект', 'Контакты']
    }
  },
  en: {
    langLabel: 'EN',
    hero: {
      title: 'Lingua Universalis',
      subtitle: 'The Art of Creation',
      image: `${ASSETS_BASE}/Афиша.jpg`
    },
    manifesto: {
      heading: 'Manifesto',
      text: `Art is a universal language connecting us with our ancient ancestors. Through form and symbol we build bridges across time.`
    },
    characters: [
      { name: 'Joslen', role: 'The Shaman', desc: 'Keeper of primal memory', img: `${ASSETS_BASE}/Работа1.jpg` },
      { name: 'The Director', role: 'The Seeker', desc: 'Guides toward meaning', img: `${ASSETS_BASE}/Работа2.jpg` },
      { name: 'The Artist', role: 'The Creator', desc: 'Translates the world into image', img: `${ASSETS_BASE}/Работа3.jpg` }
    ],
    journey: [
      { year: '2023', title: 'Exhibition', desc: 'Curated show — a dialogue with the ancient.' },
      { year: '2024', title: 'Round Table', desc: 'Philosophical conversation about the language of art.' },
      { year: 'Future', title: 'The Dark Workshop', desc: 'A place for experiments and rituals.' }
    ],
    gallery: [
      `${ASSETS_BASE}/Работа1.jpg`,
      `${ASSETS_BASE}/Работа2.jpg`,
      `${ASSETS_BASE}/Работа3.jpg`,
      `${ASSETS_BASE}/Работа4.jpg`
    ],
    contact: {
      email: 'info@lingua-universalis.example',
      links: ['Project', 'Contacts']
    }
  }
}

export default data
