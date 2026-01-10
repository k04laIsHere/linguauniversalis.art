export type GalleryWork = {
  id: string;
  artist: string;
  titleEn: string;
  titleRu: string;
  src: string;
  tags: string[];
};

const enc = (path: string) => encodeURI(path);

export const galleryWorks: GalleryWork[] = [
  {
    id: 'andreyvaganov-breathofnature',
    artist: 'Andrey Vaganov',
    titleEn: 'Breath of Nature',
    titleRu: 'Breath of Nature',
    src: enc('/assets/gallery/AndreyVaganov_BreathofNature.jpg'),
    tags: ['andreyvaganov'],
  },
  {
    id: 'andreyvaganov-tellings',
    artist: 'Andrey Vaganov',
    titleEn: 'Tellings',
    titleRu: 'Tellings',
    src: enc('/assets/gallery/AndreyVaganov_Tellings.jpg'),
    tags: ['andreyvaganov'],
  },
  {
    id: 'andreyvaganov-thepath',
    artist: 'Andrey Vaganov',
    titleEn: 'The Path',
    titleRu: 'The Path',
    src: enc('/assets/gallery/AndreyVaganov_ThePath.jpg'),
    tags: ['andreyvaganov'],
  },
  {
    id: 'andreyvaganov-theunityoftheuniverse',
    artist: 'Andrey Vaganov',
    titleEn: 'The Unity of The Universe',
    titleRu: 'The Unity of The Universe',
    src: enc('/assets/gallery/AndreyVaganov_TheUnityofTheUniverse.jpg'),
    tags: ['andreyvaganov'],
  },

  {
    id: 'evgenyglobenko-1',
    artist: 'Evgeny Globenko',
    titleEn: 'Work 1',
    titleRu: 'Работа 1',
    src: enc('/assets/gallery/EvgenyGlobenko_1.jpg'),
    tags: ['evgenyglobenko'],
  },
  {
    id: 'evgenyglobenko-2',
    artist: 'Evgeny Globenko',
    titleEn: 'Work 2',
    titleRu: 'Работа 2',
    src: enc('/assets/gallery/EvgenyGlobenko_2.jpg'),
    tags: ['evgenyglobenko'],
  },
  {
    id: 'evgenyglobenko-cup-of-silence',
    artist: 'Evgeny Globenko',
    titleEn: 'Cup of Silence',
    titleRu: 'Cup of Silence',
    src: enc('/assets/gallery/EvgenyGlobenko_Cup of Silence.jpg'),
    tags: ['evgenyglobenko'],
  },
  {
    id: 'evgenyglobenko-silence',
    artist: 'Evgeny Globenko',
    titleEn: 'Silence',
    titleRu: 'Тишина',
    src: enc('/assets/gallery/EvgenyGlobenko_Silence.jpg'),
    tags: ['evgenyglobenko'],
  },

  {
    id: 'joslen-orsisini-1',
    artist: 'Joslen Orsini',
    titleEn: 'Work 1',
    titleRu: 'Работа 1',
    src: enc('/assets/gallery/Joslen_Orisini-1.jpg'),
    tags: ['joslenorsini'],
  },
  {
    id: 'joslenorsini-fairytales',
    artist: 'Joslen Orsini',
    titleEn: 'Fairytales',
    titleRu: 'Fairytales',
    src: enc('/assets/gallery/JoslenOrsini_Fairytales.jpg'),
    tags: ['joslenorsini'],
  },
  {
    id: 'joslenorsini-language',
    artist: 'Joslen Orsini',
    titleEn: 'Language',
    titleRu: 'Язык',
    src: enc('/assets/gallery/JoslenOrsini_Language.jpg'),
    tags: ['joslenorsini'],
  },
  {
    id: 'joslenorsini-the-amazon-1',
    artist: 'Joslen Orsini',
    titleEn: 'The Amazon 1',
    titleRu: 'The Amazon 1',
    src: enc('/assets/gallery/JoslenOrsini_The Amazon 1.jpg'),
    tags: ['joslenorsini'],
  },
  {
    id: 'joslenorsini-theuniverse',
    artist: 'Joslen Orsini',
    titleEn: 'The Universe',
    titleRu: 'Вселенная',
    src: enc('/assets/gallery/JoslenOrsini_TheUniverse.jpg'),
    tags: ['joslenorsini'],
  },

  {
    id: 'omargodines-kantantab',
    artist: 'Omar Godines',
    titleEn: 'Kantanta B',
    titleRu: 'Kantanta B',
    src: enc('/assets/gallery/OmarGodines_KantantaB.jpg'),
    tags: ['omargodines'],
  },
  {
    id: 'omargodines-serenada-i',
    artist: 'Omar Godines',
    titleEn: 'Serenada I',
    titleRu: 'Serenada I',
    src: enc('/assets/gallery/OmarGodines_Serenada I.jpg'),
    tags: ['omargodines'],
  },
  {
    id: 'omargodines-serenada-ii',
    artist: 'Omar Godines',
    titleEn: 'Serenada II',
    titleRu: 'Serenada II',
    src: enc('/assets/gallery/OmarGodines_Serenada II.jpg'),
    tags: ['omargodines'],
  },
  {
    id: 'omargodines-serenada-iii',
    artist: 'Omar Godines',
    titleEn: 'Serenada III',
    titleRu: 'Serenada III',
    src: enc('/assets/gallery/OmarGodines_Serenada III.jpg'),
    tags: ['omargodines'],
  },

  {
    id: 'petertsvetkov-1',
    artist: 'Petr Tsvetkov',
    titleEn: 'Work 1',
    titleRu: 'Работа 1',
    src: enc('/assets/gallery/PeterTsvetkov_1.jpg'),
    tags: ['petrtsvetkov'],
  },
  {
    id: 'petertsvetkov-2',
    artist: 'Petr Tsvetkov',
    titleEn: 'Work 2',
    titleRu: 'Работа 2',
    src: enc('/assets/gallery/PeterTsvetkov_2.jpg'),
    tags: ['petrtsvetkov'],
  },
  {
    id: 'petertsvetkov-3',
    artist: 'Petr Tsvetkov',
    titleEn: 'Work 3',
    titleRu: 'Работа 3',
    src: enc('/assets/gallery/PeterTsvetkov_3.jpg'),
    tags: ['petrtsvetkov'],
  },
  {
    id: 'petertsvetkov-4',
    artist: 'Petr Tsvetkov',
    titleEn: 'Work 4',
    titleRu: 'Работа 4',
    src: enc('/assets/gallery/PeterTsvetkov_4.jpg'),
    tags: ['petrtsvetkov'],
  },

  {
    id: 'thomasharutunyan-coldcorner',
    artist: 'Thomas Harutunyan',
    titleEn: 'Cold Corner',
    titleRu: 'Cold Corner',
    src: enc('/assets/gallery/ThomasHarutunyan_ColdCorner.jpg'),
    tags: ['thomasharutunyan'],
  },
  {
    id: 'thomasharutunyan-romeoandjuliet',
    artist: 'Thomas Harutunyan',
    titleEn: 'Romeo And Juliet',
    titleRu: 'Romeo And Juliet',
    src: enc('/assets/gallery/ThomasHarutunyan_RomeoAndJuliet.jpg'),
    tags: ['thomasharutunyan'],
  },
  {
    id: 'thomasharutunyan-spontaniousresult',
    artist: 'Thomas Harutunyan',
    titleEn: 'Spontanious Result',
    titleRu: 'Spontanious Result',
    src: enc('/assets/gallery/ThomasHarutunyan_SpontaniousResult.jpg'),
    tags: ['thomasharutunyan'],
  },
  {
    id: 'thomasharutunyan-theeclipse',
    artist: 'Thomas Harutunyan',
    titleEn: 'The Eclipse',
    titleRu: 'The Eclipse',
    src: enc('/assets/gallery/ThomasHarutunyan_TheEclipse.jpg'),
    tags: ['thomasharutunyan'],
  },
];


