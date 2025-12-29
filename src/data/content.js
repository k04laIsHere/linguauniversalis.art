// Importing images from the team, art, and gallery folders
import joslenImg from '../../assets/team/JoslenOrsini.jpg';
import thomasImg from '../../assets/team/TomasArutunyan.jpg';
import omarImg from '../../assets/team/OmarGodines.jpg';
import petrImg from '../../assets/team/PeterTsvetkov.jpg';
import evgenyImg from '../../assets/team/EvgenyGlobenko.jpg';
import andreyImg from '../../assets/team/AndreyVaganov.jpg';

import art1 from '../../assets/art/art-1.jpg';
import art2 from '../../assets/art/art-2.jpg';
import art3 from '../../assets/art/art-3.jpg';
import art4 from '../../assets/art/art-4.jpg';
import art5 from '../../assets/art/art-5.jpg';
import art6 from '../../assets/art/art-6.jpg';

import gallery1 from '../../assets/gallery/BreathofNature.jpg';
import gallery2 from '../../assets/gallery/Tellings.jpg';
import gallery3 from '../../assets/gallery/thePath.jpg';
import gallery4 from '../../assets/gallery/TheUnityofTheUniverse.jpg';

const participants = [
  {
    id: 'joslen',
    name: 'Йослен Арриохас Орсини',
    role: 'Художник, Философ',
    country: 'Венесуэла',
    bio: 'Родился в Венесуэле в 1953 году. Мое творчество посвящено Доисторическому искусству, которое выражается в нем не как интерпретация или копия, но как результат исследования, идущего от самых его истоков. Цель состоит в том, чтобы прийти к осознанному творению и универсальной универсальной человеческой идентичности.',
    img: joslenImg,
    quote: 'От этого проекта ожидаю совместного результата в исследовании универсального языка, как творения искусства.'
  },
  {
    id: 'thomas',
    name: 'Томас Арутюнян',
    role: 'Художник',
    country: 'Армения / Россия',
    bio: 'Член Творческого союза художников России. Родился в Армении. Живет в Москве с 1982 года. Работает в различных техниках, включая инсталляцию, как в реалистической, так и в абстрактной манере.',
    img: thomasImg,
    quote: 'Каждое творчество черпает свои силы в культурных традициях, но достигает расцвета в контакте с другими культурами.'
  },
  {
    id: 'omar',
    name: 'Омар Годинес',
    role: 'Художник',
    country: 'Куба',
    bio: 'Почетный член Российской академии художеств. Представленные работы отображают анализ процессов художественных противопоставлений, слияний и соприкосновений различных цивилизаций на основе древних мифов.',
    img: omarImg,
    quote: 'Поэтические метафоры пронизывают картины символами, которые, переплетаясь, подобно симфонии, ищут тонкую гармонию.'
  },
  {
    id: 'petr',
    name: 'Петр Цветков',
    role: 'Художник',
    country: 'Россия',
    bio: 'Окончил МГСША им. С. Н. Андрияки, Трифоновскую иконописную школу. Художник ведет творческие поиски в области модернизма, абстракции, абстрактного фигуратива.',
    img: petrImg,
    quote: 'Истинное искусство, как понятный всем язык, станет фундаментом нового мира.'
  },
  {
    id: 'evgeny',
    name: 'Евгений Глобенко',
    role: 'Художник',
    country: 'Россия',
    bio: 'Член Международной конфедерации художников (IFA) при ЮНЕСКО. Учился каллиграфии у мастера Каори Исидзимы (Япония). Исследует тему Тишины через абстракцию.',
    img: evgenyImg,
    quote: 'С помощью этого уравнения я пытаюсь понять Тишину.'
  },
  {
    id: 'andrey',
    name: 'Андрей Ваганов',
    role: 'AI-художник',
    country: 'Россия',
    bio: 'Специалист в области 3D-моделирования и генеративного ИИ. Использует ИИ как независимого наблюдателя, обладающего уникальным восприятием реальности.',
    img: andreyImg,
    quote: 'Искусство, созданное с помощью ИИ, может раскрыть глубинные связи между всеми нами.'
  }
];

const ancientGallery = [
  { img: art1, title: 'Paleolithic Echo', year: '2024', location: 'Altamira Series' },
  { img: art2, title: 'Universal Thread', year: '2023', location: 'Void Series' },
  { img: art3, title: 'Silentium', year: '2024', location: 'Cave Shadows' },
  { img: art4, title: 'Digital Fossil', year: '2024', location: 'Neural Network' },
  { img: art5, title: 'The Descent', year: '2023', location: 'Memory Matrix' },
  { img: art6, title: 'Quantum Glyph', year: '2024', location: 'Origin Point' }
];

const digitalGallery = [
  { img: gallery1, title: 'Breath of Nature', year: '2025', location: 'Nature Cycle' },
  { img: gallery2, title: 'Tellings', year: '2025', location: 'Mythos' },
  { img: gallery3, title: 'The Path', year: '2025', location: 'Journey' },
  { img: gallery4, title: 'Unity of Universe', year: '2025', location: 'Cosmos' }
];

export const content = {
  ru: {
    hero: {
      title: 'LINGUA UNIVERSALIS',
      subtitle: 'ИСКУССТВО ТВОРЕНИЯ',
      philosophy: 'Проект на стыке доисторического и будущего. Каждая деталь дизайна — часть единого, взаимосвязанного целого.',
      connection: 'Истинная связь между культурами возможна только через универсальный язык искусства и наши общие человеческие истоки.'
    },
    sections: {
      philosophy: 'Философия',
      ancientGallery: 'Древняя Галерея',
      digitalGallery: 'Цифровая Галерея',
      team: 'Творцы',
      movie: 'Фильм',
      events: 'События',
      contact: 'Связь'
    },
    participants,
    ancientGallery,
    digitalGallery,
    events: {
      title: 'События',
      list: [
        {
          title: 'Выставка «Lingua universalis. Искусство творения»',
          location: 'Книжный клуб Библиотеки иностранной литературы',
          desc: 'Выставка объединяет работы современных художников из разных стран.',
          link: 'https://libfl.ru/ru/event/lingua-universalis-iskusstvo-tvoreniya-1'
        },
        {
          title: 'Арт-встреча «Истоки творчества и новые горизонты»',
          location: 'Библиотека иностранной литературы',
          desc: 'Дискуссия и встреча с художниками проекта.',
          link: 'https://libfl.ru/ru/event/istoki-tvorchestva-i-novye-horizonty'
        }
      ]
    },
    footer: {
      text: '© 2025 Lingua Universalis. Искусство Творения.',
      contacts: 'Москва, ул. Николоямская, д. 1'
    }
  },
  en: {
    hero: {
      title: 'LINGUA UNIVERSALIS',
      subtitle: 'THE ART OF CREATION',
      philosophy: 'The project is a bridge between the prehistoric and the future. Every design element is a piece of a singular, interconnected whole.',
      connection: 'Real connection between cultures is only possible through the universal language of art and our shared human origins.'
    },
    sections: {
      philosophy: 'Philosophy',
      ancientGallery: 'Ancient Gallery',
      digitalGallery: 'Digital Gallery',
      team: 'The Creators',
      movie: 'Film',
      events: 'Events',
      contact: 'Contact'
    },
    participants: participants.map(p => ({
      ...p,
      role: p.id === 'andrey' ? 'AI Artist' : 'Artist',
      bio: p.id === 'joslen' ? 'Born in Venezuela in 1953. My work is dedicated to Prehistoric art, expressed not as interpretation but as research from its origins.' : p.bio
    })),
    ancientGallery,
    digitalGallery,
    events: {
      title: 'Events',
      list: [
        {
          title: 'Exhibition "Lingua universalis. The Art of Creation"',
          location: 'Library for Foreign Literature',
          desc: 'An exhibition bringing together contemporary artists from different countries.',
          link: 'https://libfl.ru/ru/event/lingua-universalis-iskusstvo-tvoreniya-1'
        }
      ]
    },
    footer: {
      text: '© 2025 Lingua Universalis. The Art of Creation.',
      contacts: 'Moscow, Nikoloyamskaya st., 1'
    }
  }
};
