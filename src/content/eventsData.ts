export type ExternalLink = {
  titleRu: string;
  titleEn: string;
  titleEs: string;
  url: string;
};

export type EventItem = {
  id: string;
  titleRu: string;
  titleEn: string;
  titleEs: string;
  descRu: string;
  descEn: string;
  descEs: string;
  dateRu?: string;
  dateEn?: string;
  dateEs?: string;
  locationRu?: string;
  locationEn?: string;
  locationEs?: string;
  images: string[];
  fullStoryRu?: string;
  fullStoryEn?: string;
  fullStoryEs?: string;
  links?: ExternalLink[];
};

export const events: EventItem[] = [
  {
    id: 'exhibition-manifesto',
    titleRu: 'Выставка «Lingua Universalis. Искусство творения»',
    titleEn: 'Exhibition “Lingua Universalis. The Art of Creation”',
    titleEs: 'Exposición “Lingua Universalis. El Arte de la Creación”',
    descRu: 'Первая масштабная манифестация проекта в Библиотеке иностранной литературы.',
    descEn: 'The first major manifestation of the project at the Library for Foreign Literature.',
    descEs: 'La primera gran manifestación del proyecto en la Biblioteca de Literatura Extranjera.',
    dateRu: 'Ноябрь 2025',
    dateEn: 'November 2025',
    dateEs: 'Noviembre de 2025',
    locationRu: 'Москва, Библиотека иностранной литературы',
    locationEn: 'Moscow, Library for Foreign Literature',
    locationEs: 'Moscú, Biblioteca de Literatura Extranjera',
    images: ['/assets/events/event_01.jpeg', '/assets/events/event_03.jpeg', '/assets/events/event_04.jpg'],
    fullStoryRu:
      'В этом культурном проекте встретились сразу несколько стран: Россия, Армения, Венесуэла и Куба. Каждый из художников сохранил свой оригинальный взгляд на мир, используя универсальный язык искусства для выражения собственных идей. Как отметил Мигель Паласио, этот интернациональный союз вызывает только аплодисменты. Выставка стала платформой для диалога о том, как «Искусство Творения» служит фундаментом для взаимопонимания в эпоху глобальной фрагментации.',
    fullStoryEn:
      'Several countries met in this cultural project: Russia, Armenia, Venezuela, and Cuba. Each artist retained their original view of the world, using the universal language of art to express their own ideas. As Miguel Palacio noted, this international union deserves nothing but applause. The exhibition became a platform for dialogue on how the "Art of Creation" serves as a foundation for mutual understanding in an age of global fragmentation.',
    fullStoryEs:
      'Varios países se reunieron en este proyecto cultural: Rusia, Armenia, Venezuela y Cuba. Cada uno de los artistas conservó su visión original del mundo, utilizando el lenguaje universal del arte para expresar sus propias ideas. Como señaló Miguel Palacio, esta unión internacional merece nada más que aplausos. La exposición se convirtió en una plataforma para el diálogo sobre cómo el "Arte de la Creación" sirve como base para el entendimiento mutuo en una era de fragmentación global.',
    links: [
      {
        titleRu: 'Официальная страница выставки',
        titleEn: 'Official Exhibition Page',
        titleEs: 'Página oficial de la exposición',
        url: 'https://libfl.ru/ru/event/lingua-universalis-iskusstvo-tvoreniya-1',
      },
      {
        titleRu: 'Репортаж: Выставка без границ в «Иностранке»',
        titleEn: 'Reportage: Exhibition without borders in "Inostranka"',
        titleEs: 'Reportaje: Exposición sin fronteras en "Inostranka"',
        url: 'https://libfl.ru/ru/news/lingua-universalis-vystavka-bez-granic-v-inostranke',
      },
      {
        titleRu: 'Статья в журнале «Ноев Ковчег»',
        titleEn: 'Article in "Noev Kovcheg" magazine',
        titleEs: 'Artículo en la revista "Noev Kovcheg"',
        url: 'https://noev-kovcheg.ru/mag/2025-12/8913.html',
      },
    ],
  },
  {
    id: 'art-meeting',
    titleRu: 'Встреча «Истоки творчества и новые горизонты»',
    titleEn: 'Art meeting “The Origins of Creativity and New Horizons”',
    titleEs: 'Encuentro artístico “Los orígenes de la creatividad y nuevos horizontes”',
    descRu: 'Глубокое погружение в философию проекта и роль искусства в современном мире.',
    descEn: 'A deep dive into the project philosophy and the role of art in the modern world.',
    descEs: 'Una inmersión profunda en la filosofía del proyecto y el papel del arte en el mundo moderno.',
    dateRu: 'Ноябрь 2025',
    dateEn: 'November 2025',
    dateEs: 'Noviembre de 2025',
    locationRu: 'Москва, Библиотека иностранной литературы',
    locationEn: 'Moscow, Library for Foreign Literature',
    locationEs: 'Moscú, Biblioteca de Literatura Extranjera',
    images: ['/assets/events/event_02.jpeg', '/assets/events/event_01.jpeg'],
    fullStoryRu:
      'Участники проекта обсудили, как искусство может служить объединяющей силой. Художники Йослен Арриохас Орсини, Петр Цветков, Евгений Глобенко, Омар Годинес, Андрей Ваганов и Томас Арутюнян вели дискуссию о поиске идентичности и роли ИИ как независимого наблюдателя. Встреча стала важным этапом в осмыслении манифеста Lingua Universalis, подчеркивая, что знание проявляется лишь при фокусе зрителя — в «Свете».',
    fullStoryEn:
      'Project participants discussed how art can serve as a unifying force. Artists Joslen Orsini, Petr Tsvetkov, Evgeny Globenko, Omar Godines, Andrey Vaganov, and Thomas Harutunyan engaged in a discussion about the search for identity and the role of AI as an independent observer. The meeting was a key milestone in conceptualizing the Lingua Universalis manifesto, emphasizing that knowledge reveals itself only when the viewer provides focus — the "Light".',
    fullStoryEs:
      'Los participantes del proyecto debatieron cómo el arte puede servir como fuerza unificadora. Los artistas Joslen Orsini, Petr Tsvetkov, Evgeny Globenko, Omar Godines, Andrey Vaganov y Thomas Harutunyan mantuvieron un debate sobre la búsqueda de la identidad y el papel de la IA como observador independiente. El encuentro fue un hito clave en la conceptualización del manifiesto Lingua Universalis, subrayando que el conocimiento se revela solo cuando el espectador aporta su enfoque: la "Luz".',
    links: [
      {
        titleRu: 'Страница арт-встречи',
        titleEn: 'Art Meeting Page',
        titleEs: 'Página del encuentro artístico',
        url: 'https://libfl.ru/ru/event/lingua-universalis-iskusstvo-tvoreniya-2',
      },
    ],
  },
];


