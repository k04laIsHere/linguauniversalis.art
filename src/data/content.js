// Importing images to ensure they are bundled correctly
import joslenImg from '../../assets/images/image-1.jpg';
import thomasImg from '../../assets/images/image-2.jpg';
import omarImg from '../../assets/images/Омар Годинес Серенада I Х М 100х80 см 1.jpg';
import petrImg from '../../assets/images/image 1.jpg';
import evgenyImg from '../../assets/images/image 2.jpg';
import andreyImg from '../../assets/images/Вселенная 1.jpg';
import heroImg from '../../assets/images/image.jpg';
import aboutImg from '../../assets/images/image-1.jpg'; // Reusing for about section

// Participants Data
const participants = [
  {
    name: 'Йослен Арриохас Орсини',
    role: 'Художник, Философ',
    country: 'Венесуэла',
    desc: 'Исследует пластику наскальной живописи и петроглифов древних людей, раскрывая сокрытые в них коды. Его скульптуры и живописные работы дают современную трактовку первобытному искусству.',
    img: joslenImg
  },
  {
    name: 'Томас Арутюнян',
    role: 'Художник',
    country: 'Армения / Россия',
    desc: 'Живописные полотна полны поэтической символики и свидетельствуют о многогранности творческих интересов.',
    img: thomasImg
  },
  {
    name: 'Омар Годинес',
    role: 'Художник',
    country: 'Куба',
    desc: 'Работы покоряют энергией и буйством красок. Исследует слияния и соприкосновения различных цивилизаций на основе древних мифов.',
    img: omarImg
  },
  {
    name: 'Петр Цветков',
    role: 'Художник',
    country: 'Россия',
    desc: 'Представляет изящные образцы лирической абстракции, где гармоничным сочетаниям цветовых плоскостей всегда сопутствует философский подтекст.',
    img: petrImg
  },
  {
    name: 'Евгений Глобенко',
    role: 'Художник',
    country: 'Россия',
    desc: 'Картины и миниатюры с живописным сенситивом и тонким колоритом. Исследует тему Тишины через абстракцию.',
    img: evgenyImg
  },
  {
    name: 'Андрей Ваганов',
    role: 'AI-художник',
    country: 'Россия',
    desc: 'Представляет визуальные произведения с использованием искусственного интеллекта. Ищет глубинные связи между людьми через цифровое искусство.',
    img: andreyImg
  }
];

export const content = {
  ru: {
    nav: {
      about: 'О проекте',
      events: 'События',
      participants: 'Участники',
      contacts: 'Контакты'
    },
    hero: {
      title: 'LINGUA UNIVERSALIS',
      subtitle: 'ИСКУССТВО ТВОРЕНИЯ',
      description: 'Проект исследует идею искусства как универсального языка, соединяющего современного человека с древними предками.',
      cta: 'Исследовать',
      image: heroImg
    },
    about: {
      title: 'Философия',
      text: [
        'Проект представляет произведения искусства в различных областях (живопись, скульптура, кинематограф). Цель — показать, что язык искусства является самым древним, универсальным и понятным каждому человеку на планете.',
        'Обладая универсальной способностью проникать в духовные сферы, искусство становится инструментом исследования человека и его взаимоотношения со Вселенной. И, в конечном счёте, встречи с самим собой.'
      ],
      image: aboutImg
    },
    events: {
      title: 'События',
      list: [
        {
          title: 'Выставка «Lingua universalis. Искусство творения»',
          date: 'до 30 ноября',
          location: 'Книжный клуб Библиотеки иностранной литературы',
          desc: 'Выставка объединяет работы современных художников из разных стран, отражающие их поиски в искусстве.',
          link: 'https://libfl.ru/ru/event/lingua-universalis-iskusstvo-tvoreniya-1'
        },
        {
          title: 'Арт-встреча «Истоки творчества и новые горизонты»',
          date: 'Смотреть на сайте',
          location: 'Библиотека иностранной литературы',
          desc: 'Дискуссия и встреча с художниками проекта.',
          link: 'https://libfl.ru/ru/event/istoki-tvorchestva-i-novye-gorizonty'
        }
      ]
    },
    participants: {
      title: 'Творцы',
      list: participants
    },
    footer: {
      text: '© 2025 Lingua Universalis. Все права защищены.',
      contacts: 'Москва, ул. Николоямская, д. 1'
    }
  },
  en: {
    nav: {
      about: 'About',
      events: 'Events',
      participants: 'Artists',
      contacts: 'Contact'
    },
    hero: {
      title: 'LINGUA UNIVERSALIS',
      subtitle: 'THE ART OF CREATION',
      description: 'The project explores the idea that art is a universal language connecting modern humans to ancient ancestors.',
      cta: 'Explore',
      image: heroImg
    },
    about: {
      title: 'Philosophy',
      text: [
        'The project presents works of art in various fields (painting, sculpture, cinema). The goal is to show that the language of art is the most ancient, universal and understandable to every person on the planet.',
        'Possessing the universal ability to penetrate into spiritual spheres, art becomes a tool for researching man and his relationship with the Universe. And, ultimately, meeting with oneself.'
      ],
      image: aboutImg
    },
    events: {
      title: 'Events',
      list: [
        {
          title: 'Exhibition "Lingua universalis. The Art of Creation"',
          date: 'until Nov 30',
          location: 'Library for Foreign Literature',
          desc: 'The exhibition brings together works by contemporary artists from different countries.',
          link: 'https://libfl.ru/ru/event/lingua-universalis-iskusstvo-tvoreniya-1'
        },
        {
          title: 'Art Meeting "Origins of Creativity and New Horizons"',
          date: 'Check website',
          location: 'Library for Foreign Literature',
          desc: 'Discussion and meeting with the project artists.',
          link: 'https://libfl.ru/ru/event/istoki-tvorchestva-i-novye-gorizonty'
        }
      ]
    },
    participants: {
      title: 'Creators',
      list: participants
    },
    footer: {
      text: '© 2025 Lingua Universalis. All rights reserved.',
      contacts: 'Moscow, Nikoloyamskaya st., 1'
    }
  }
};



