const placeholder = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80'

export default {
  ru: {
    langLabel: 'EN',
    hero: {
      title: 'Лингва\nУниверсалис',
      subtitle: 'Искусство создания — языки, образы, время',
      image: placeholder
    },
    manifesto: {
      heading: 'Манифест',
      text: 'Мы говорим на языке образа. В каждом звуке — штрих, в каждом штрихе — звук. Это эксперимент и ритуал; коллаж из смыслов и пустот.'
    },
    characters: [
      { name: 'Автор', role: 'Создатель', desc: 'Тот, кто шепчет краскам.', img: placeholder },
      { name: 'Язык', role: 'Проявление', desc: 'Система, что рождает образы.', img: placeholder },
      { name: 'Зритель', role: 'Соавтор', desc: 'Тот, кто завершает работу взглядом.', img: placeholder }
    ],
    journey: [
      { year: '2024', text: 'Начало, первые эскизы.' },
      { year: '2025', text: 'Выставки и эксперименты.' }
    ],
    gallery: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder],
    contact: { email: 'info@lingua.art' }
  },
  en: {
    langLabel: 'RU',
    hero: {
      title: 'Lingua\nUniversalis',
      subtitle: 'The art of creation — languages, images, time',
      image: placeholder
    },
    manifesto: {
      heading: 'Manifesto',
      text: 'We speak the language of image. Every sound is a stroke, every stroke a sound. This is experiment and ritual; a collage of meanings and gaps.'
    },
    characters: [
      { name: 'Author', role: 'Creator', desc: 'One who whispers to pigments.', img: placeholder },
      { name: 'Language', role: 'Apparition', desc: 'The system that births images.', img: placeholder },
      { name: 'Viewer', role: 'Co-author', desc: 'One who completes the work with a gaze.', img: placeholder }
    ],
    journey: [
      { year: '2024', text: 'The beginning, first sketches.' },
      { year: '2025', text: 'Exhibitions and experiments.' }
    ],
    gallery: [placeholder, placeholder, placeholder, placeholder, placeholder, placeholder],
    contact: { email: 'info@lingua.art' }
  }
}
