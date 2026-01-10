export type EventItem = {
  id: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  dateRu?: string;
  dateEn?: string;
  locationRu?: string;
  locationEn?: string;
  images: string[];
  fullStoryRu?: string;
  fullStoryEn?: string;
};

export const events: EventItem[] = [
  {
    id: 'exhibition-manifesto',
    titleRu: 'Выставка «Lingua Universalis. Искусство творения»',
    titleEn: 'Exhibition “Lingua Universalis. The Art of Creation”',
    descRu:
      'Первая масштабная манифестация проекта в Библиотеке иностранной литературы.',
    descEn:
      'The first major manifestation of the project at the Library for Foreign Literature.',
    dateRu: 'Март 2024',
    dateEn: 'March 2024',
    locationRu: 'Москва, Россия',
    locationEn: 'Moscow, Russia',
    images: ['/assets/events/event_01.jpeg', '/assets/events/event_03.jpeg', '/assets/events/event_04.jpg'],
    fullStoryRu: 'Выставка объединила художников из разных стран, став платформой для диалога о универсальном языке искусства. В рамках мероприятия также прошел круглый стол об ИИ как независимом наблюдателе.',
    fullStoryEn: 'The exhibition brought together artists from different countries, becoming a platform for dialogue about the universal language of art. The event also featured a round table on AI as an independent observer.',
  },
  {
    id: 'art-meeting',
    titleRu: 'Встреча «Истоки творчества и новые горизонты»',
    titleEn: 'Art meeting “The Origins of Creativity and New Horizons”',
    descRu: 'Глубокое погружение в философию проекта и роль искусства в современном мире.',
    descEn: 'A deep dive into the project philosophy and the role of art in the modern world.',
    dateRu: 'Апрель 2024',
    dateEn: 'April 2024',
    locationRu: 'Москва, Россия',
    locationEn: 'Moscow, Russia',
    images: ['/assets/events/event_02.jpeg', '/assets/events/event_01.jpeg', '/assets/events/event_03.jpeg'],
    fullStoryRu: 'Участники проекта обсудили, как искусство может служить объединяющей силой в эпоху фрагментации. Встреча стала важным этапом в осмыслении манифеста Lingua Universalis.',
    fullStoryEn: 'Project participants discussed how art can serve as a unifying force in an age of fragmentation. The meeting was a key milestone in conceptualizing the Lingua Universalis manifesto.',
  },
];


