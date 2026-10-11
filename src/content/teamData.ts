export type TeamMember = {
  id: string;
  name: string;
  nameRu: string;
  nameEs: string;
  fullNameEn: string;
  fullNameRu: string;
  fullNameEs: string;
  countryEn: string;
  countryRu: string;
  countryEs: string;
  photoSrc: string;
  blurbRu: string;
  blurbEn: string;
  blurbEs: string;
  bioRu: string;
  bioEn: string;
  bioEs: string;
  visionRu: string;
  visionEn: string;
  visionEs: string;
  exhibitionsRu?: string[];
  exhibitionsEn?: string[];
  exhibitionsEs?: string[];
};

export const teamMembers: TeamMember[] = [
  {
    id: 'joslen-orsini',
    name: 'Joslen Orsini',
    nameRu: 'Йослен Орсини',
    nameEs: 'Joslen Orsini',
    fullNameEn: 'Joslen Arriojas Orsini',
    fullNameRu: 'Йослен Арриохас Орсини',
    fullNameEs: 'Joslen Arriojas Orsini',
    countryEn: 'Venezuela / Russia',
    countryRu: 'Венесуэла / Россия',
    countryEs: 'Venezuela / Rusia',
    photoSrc: '/assets/team/JoslenOrsini.jpg',
    blurbRu: 'Исследователь доисторического искусства и универсальной человеческой идентичности.',
    blurbEn: 'Researcher of prehistoric art and universal human identity.',
    blurbEs: 'Investigador del arte prehistórico y de la identidad humana universal.',
    bioRu:
      'Родился в Венесуэле в 1953 году. С 2014 года живу и занимаюсь активной творческой деятельностью в России. Окончил философский факультет Государственного университета Венесуэлы и Высшую художественную школу «Кристобаль Рохас» (Cristóbal Rojas). Являюсь членом ТСХР (Творческого союза художников России) и Союза абстракционистов России.',
    bioEn:
      'Born in Venezuela in 1953. Since 2014, I have been living and actively pursuing my creative practice in Russia. Graduated from the Faculty of Philosophy at the Central University of Venezuela (State University of Venezuela) and the Cristóbal Rojas School of Visual Arts. I am a member of the Creative Union of Artists of Russia (TSKhR) and the Union of Abstractionists of Russia.',
    bioEs:
      'Nacido en Venezuela en 1953. Desde 2014 vivo y desarrollo una activa labor creativa en Rusia. Graduado de la Facultad de Filosofía de la Universidad Estatal de Venezuela y de la Escuela Superior de Artes Plásticas Cristóbal Rojas. Soy miembro de la Unión Creativa de Artistas de Rusia (TSJR) y de la Unión de Abstraccionistas de Rusia.',
    visionRu:
      'Мое творчество посвящено Доисторическому искусству, которое выражается в нем не как интерпретация или копия, но как результат исследования, идущего от самых его истоков. Цель состоит в том, чтобы прийти к осознанному творению и универсальной человеческой идентичности. От этого проекта ожидаю совместного результата в исследовании универсального языка как творения искусства.',
    visionEn:
      'My work is dedicated to Prehistoric Art, which is expressed in it not as an interpretation or a copy, but as the result of research tracing back to its very origins. The goal is to arrive at conscious creation and a universal human identity. From this project, I expect a collaborative outcome in exploring the universal language as a creation of art.',
    visionEs:
      'Mi obra está dedicada al Arte Prehistórico, el cual se expresa en ella no como una interpretación o copia, sino como el resultado de una investigación que parte desde sus mismos orígenes. El objetivo consiste en llegar a una creación consciente y a una identidad humana universal. De este proyecto espero un resultado conjunto en la investigación del lenguaje universal como creación artística.',
  },
  {
    id: 'thomas-harutunyan',
    name: 'Thomas Harutunyan',
    nameRu: 'Томас Арутюнян',
    nameEs: 'Thomas Harutunyan',
    fullNameEn: 'Thomas Gegamovich Harutunyan',
    fullNameRu: 'Томас Гегамович Арутюнян',
    fullNameEs: 'Thomas Gegamovich Harutunyan',
    countryEn: 'Armenia / Russia',
    countryRu: 'Армения / Россия',
    countryEs: 'Armenia / Rusia',
    photoSrc: '/assets/team/TomasArutunyan.jpg',
    blurbRu: 'Мастер реалистической и абстрактной инсталляции, исследует синергию культур.',
    blurbEn: 'Master of realistic and abstract installation, focusing on cross-cultural synergy.',
    blurbEs: 'Maestro de la instalación realista y abstracta, explora la sinergia de las culturas.',
    bioRu:
      'Родился в Армении. Живет в Москве с 1982 года. Член Творческого союза художников России (ТСХР). Член Союза абстракционистов России. Награжден бронзовой, серебряной и золотой медалями ТСХР. Участник выставок в Москве и Берлине, а также Межрегионального академического проекта ТСХР «Красные ворота» / «Против течения» 2024 г. (Россия) и арт-проектов ТСХР «Арс Лонга» 2021 и 2022 гг. (Москва). Участник выставочного проекта «Преображая мир» Евразийского художественного союза в Центре Ле Корбюзье, 2024 г. (Москва). Работает в различных техниках, включая инсталляцию, как в реалистической, так и в абстрактной манере.',
    bioEn:
      'Born in Armenia. Has lived in Moscow since 1982. Member of the Creative Union of Artists of Russia (TSKhR). Member of the Union of Abstractionists of Russia. Awarded the Bronze, Silver, and Gold Medals of the TSKhR. Participant in exhibitions in Moscow and Berlin, as well as the TSKhR Interregional Academic Project “Red Gates / Against the Current” (2024, Russia) and the TSKhR art projects “Ars Longa” (2021 and 2022, Moscow). Participant in the exhibition project “Transforming the World” of the Eurasian Art Union at the Le Corbusier Center (2024, Moscow). Works in various techniques, including installation, in both realistic and abstract styles.',
    bioEs:
      'Nacido en Armenia. Vive en Moscú desde 1982. Miembro de la Unión Creativa de Artistas de Rusia (TSJR). Miembro de la Unión de Abstraccionistas de Rusia. Galardonado con las medallas de bronce, plata y oro de la TSJR. Participante en exposiciones en Moscú y Berlín, así como en el Proyecto Académico Interregional de la TSJR «Puertas Rojas / Contra la corriente» de 2024 (Rusia) y en los proyectos artísticos de la TSJR «Ars Longa» de 2021 y 2022 (Moscú). Participante en el proyecto expositivo «Transformando el mundo» de la Unión Euroasiática de Arte en el Centro Le Corbusier, 2024 (Moscú). Trabaja en diversas técnicas, incluida la instalación, tanto de manera realista como abstracta.',
    visionRu:
      'Считаю проект «Lingua universalis. Искусство Творения» важным, поскольку каждое творчество черпает свои силы в культурных традициях, но достигает расцвета в контакте с другими культурами. И данный проект — тому подтверждение. Также хочу поддержать своих друзей, художников из других стран.',
    visionEn:
      'I consider the project “Lingua universalis. The Art of Creation” important because every creative practice draws its strength from cultural traditions, yet reaches its full flourishing in contact with other cultures. And this project is proof of that. I also want to support my friends, artists from other countries.',
    visionEs:
      'Considero importante el proyecto «Lingua universalis. El Arte de la Creación», ya que toda creación nutre sus fuerzas de las tradiciones culturales, pero alcanza su plenitud en el contacto con otras culturas. Y este proyecto es prueba de ello. Asimismo, quiero apoyar a mis amigos, artistas de otros países.',
  },
  {
    id: 'omar-godines',
    name: 'Omar Godines',
    nameRu: 'Омар Годинес',
    nameEs: 'Omar Godines',
    fullNameEn: 'Omar Godines',
    fullNameRu: 'Омар Годинес',
    fullNameEs: 'Omar Godines',
    countryEn: 'Cuba / Russia',
    countryRu: 'Куба / Россия',
    countryEs: 'Cuba / Rusia',
    photoSrc: '/assets/team/OmarGodines.jpg',
    blurbRu: 'Исследует синтез древних мифов и современной пластической формы.',
    blurbEn: 'Explores the synthesis of ancient myths and modern plastic language.',
    blurbEs: 'Explora la síntesis de los mitos antiguos y la forma plástica moderna.',
    bioRu:
      'Родился в Гаване, на Кубе, окончил в Гаване художественное училище «Сан-Алехандро» (живопись) и МГХИ им. В. И. Сурикова (Россия). Почетный член Российской академии художеств, член ассоциации художников ЮНЕСКО, состоит в союзах художников МСХ и ТСХ России, Международной художественной академии во Франции, доцент кафедры дизайна Московского государственного университета управления (2012–2016), куратор Фестиваля ибероамериканской культуры в России (2000–2003); персональная выставка в МИДе под эгидой ЮНЕСКО (2019); лауреат премии «Лидеры мнений 2019». Отмечен Благодарностью Министра культуры РФ, награждён серебряной медалью Международной академии современных искусств. Имеет степень Master of Fine Arts.',
    bioEn:
      'Born in Havana, Cuba; graduated from the “San Alejandro” National Academy of Fine Arts in Havana (Painting) and the V. I. Surikov Moscow State Academic Art Institute (Russia). Honorary Member of the Russian Academy of Arts, member of the UNESCO International Association of Art, member of the Moscow Union of Artists (MSKh) and the Creative Union of Artists of Russia (TSKhR), and the International Academy of Arts in France. Associate Professor at the Department of Design at the State University of Management in Moscow (2012–2016), curator of the Festival of Ibero-American Culture in Russia (2000–2003); held a solo exhibition at the Ministry of Foreign Affairs of Russia under the auspices of UNESCO (2019); laureate of the “Opinion Leaders 2019” award. Recipient of a Commendation from the Minister of Culture of the Russian Federation and awarded the Silver Medal of the International Academy of Contemporary Arts. Holds a Master of Fine Arts (MFA) degree.',
    bioEs:
      'Nacido en La Habana, Cuba; graduado en La Habana de la Academia Nacional de Bellas Artes «San Alejandro» (pintura) y del Instituto Estatal Académico de Arte de Moscú V. I. Súrikov (Rusia). Miembro Honorario de la Academia Rusa de las Artes, miembro de la Asociación de Artistas de la UNESCO, miembro de las uniones de artistas de Moscú (MSJ) y de Rusia (TSJR), así como de la Academia Internacional de Arte en Francia; profesor asociado del Departamento de Diseño de la Universidad Estatal de Gestión de Moscú (2012–2016), curador del Festival de Cultura Iberoamericana en Rusia (2000–2003); exposición individual en el Ministerio de Asuntos Exteriores de Rusia bajo el patrocinio de la UNESCO (2019); laureado con el premio «Líderes de Opinión 2019». Reconocido con el Agradecimiento del Ministro de Cultura de la Federación de Rusia y galardonado con la medalla de plata de la Academia Internacional de Artes Contemporáneas. Posee el grado de Master of Fine Arts (MFA).',
    visionRu:
      'Представленные работы отображают анализ процессов художественных противопоставлений, слияний и соприкосновений различных цивилизаций на основе древних мифов в символической трактовке образов, выраженных современным пластическим языком. Поэтические метафоры пронизывают картины символами, которые, переплетаясь, подобно симфонии, ищут тонкую гармонию.',
    visionEn:
      'The presented works reflect an analysis of the processes of artistic juxtapositions, fusions, and encounters between different civilizations, based on ancient myths in a symbolic interpretation of imagery expressed through a modern plastic language. Poetic metaphors permeate the paintings with symbols that intertwine like a symphony in search of subtle harmony.',
    visionEs:
      'Las obras presentadas reflejan un análisis de los procesos de contraposiciones artísticas, fusiones y puntos de contacto entre distintas civilizaciones sobre la base de mitos antiguos, en una interpretación simbólica de las imágenes expresadas mediante un lenguaje plástico moderno. Las metáforas poéticas impregnan los cuadros de símbolos que, entrelazándose como una sinfonía, buscan una sutil armonía.',
  },
  {
    id: 'andrey-vaganov',
    name: 'Andrey Vaganov',
    nameRu: 'Андрей Ваганов',
    nameEs: 'Andrey Vaganov',
    fullNameEn: 'Andrey Vaganov',
    fullNameRu: 'Андрей Ваганов',
    fullNameEs: 'Andrey Vaganov',
    countryEn: 'Russia',
    countryRu: 'Россия',
    countryEs: 'Rusia',
    photoSrc: '/assets/team/AndreyVaganov.jpg',
    blurbRu: 'Медиа-художник: использует ИИ как независимого наблюдателя для поиска скрытых связей.',
    blurbEn: 'Media artist using AI as an independent observer to reveal hidden connections in reality.',
    blurbEs: 'Artista mediático: utiliza la IA como observador independiente para encontrar conexiones ocultas.',
    bioRu:
      'Родился в 2002 году в Дубне. Окончил Московский институт электронной техники (МИЭТ) по специальности «Информационные технологии в дизайне». Призер конкурса графического и коммуникативного дизайна «Культдиджитал» в рамках Международного фестиваля дизайна «Красный проспект», 2023 г. (Новосибирск). Являюсь специалистом в области 3D-моделирования, анимации и генеративного искусственного интеллекта.',
    bioEn:
      'Born in 2002 in Dubna. Graduated from the Moscow Institute of Electronic Technology (MIET) with a degree in “Information Technologies in Design.” Prize-winner of the “Kultdigital” Graphic and Communication Design Competition as part of the “Krasny Prospekt” International Design Festival, 2023 (Novosibirsk). I am a specialist in 3D modeling, animation, and generative artificial intelligence.',
    bioEs:
      'Nacido en 2002 en Dubná. Graduado del Instituto de Tecnología Electrónica de Moscú (MIET) en la especialidad de «Tecnologías de la Información en el Diseño». Premiado en el concurso de diseño gráfico y comunicativo «Kultdigital» en el marco del Festival Internacional de Diseño «Krasny Prospekt», 2023 (Novosibirsk). Soy especialista en el campo del modelado 3D, la animación y la inteligencia artificial generativa.',
    visionRu:
      'Я стремлюсь расширить границы творчества, используя ИИ как независимого наблюдателя, который, будучи оторванным от реальности, обладает уникальным восприятием и глубоким осознанием ее. Искусство отражает общие черты и особенности каждого из нас. Участвуя в проекте «Lingua universalis. Искусство Творения», я хочу показать, что искусство, созданное с помощью ИИ, может раскрыть глубинные связи между всеми нами.',
    visionEn:
      'I strive to expand the boundaries of creativity by using AI as an independent observer which, being detached from reality, possesses a unique perception and a deep awareness of it. Art reflects the common traits and distinct qualities of each of us. By participating in the project “Lingua universalis. The Art of Creation,” I want to show that art created with the help of AI can reveal the deep connections between us all.',
    visionEs:
      'Busco expandir los límites de la creatividad utilizando la IA como un observador independiente que, al estar desligado de la realidad, posee una percepción única y una profunda conciencia de ella. El arte refleja los rasgos comunes y las particularidades de cada uno de nosotros. Al participar en el proyecto «Lingua universalis. El Arte de la Creación», quiero demostrar que el arte creado con la ayuda de la IA puede revelar las conexiones profundas entre todos nosotros.',
  },
  {
    id: 'petr-tsvetkov',
    name: 'Peter Tsvetkov',
    nameRu: 'Петр Цветков',
    nameEs: 'Peter Tsvetkov',
    fullNameEn: 'Peter Anatolyevich Tsvetkov',
    fullNameRu: 'Пётр Анатольевич Цветков',
    fullNameEs: 'Peter Anatolyevich Tsvetkov',
    countryEn: 'Russia',
    countryRu: 'Россия',
    countryEs: 'Rusia',
    photoSrc: '/assets/team/PeterTsvetkov.jpg',
    blurbRu: 'Модернист/абстракционист, ищет основу мира через универсальный язык искусства.',
    blurbEn: 'Modernist/Abstract artist seeking a foundation for peace through the universal language of art.',
    blurbEs: 'Modernista/abstraccionista, busca la base del mundo a través del lenguaje universal del arte.',
    bioRu:
      'Родился в Москве в 1964 году. Окончил МГСША им. С. Н. Андрияки, Трифоновскую иконописную школу, состоит в Союзе художников «Подмосковье», член-корреспондент Петровской Академии Науки и Искусств. Персональные выставки: музей «Садовое кольцо», г. Москва, 2011; галерея «Мост», г. Химки, 2015; павильон «Арт Парк», г. Москва, Измайловский парк, 2017. Победитель арт-фестиваля «Рисуем Покровский собор» 2016 г. с показом картины в Государственном историческом музее на Красной площади. Участник коллективных выставок и арт-проектов ряда галерей в ЦДХ и на других площадках. Художник ведет творческие поиски в области модернизма, абстракции, абстрактного фигуратива. Работы в частных собраниях в России, Италии, США, Австралии.',
    bioEn:
      'Born in Moscow in 1964. Graduated from the S. N. Andriyaka Moscow State Specialized School of Watercolor and Fine Arts and the Trifonovskaya Icon Painting School; member of the “Podmoskovye” Union of Artists and Corresponding Member of the Petrovskaya Academy of Sciences and Arts. Solo exhibitions: “Garden Ring” Museum, Moscow, 2011; “Most” Gallery, Khimki, 2015; “Art Park” Pavilion, Moscow, Izmaylovsky Park, 2017. Winner of the “Painting Pokrovsky Cathedral (St. Basil’s Cathedral)” art festival in 2016, with his painting exhibited at the State Historical Museum on Red Square. Participant in group exhibitions and art projects across several galleries at the Central House of Artists (TsDKh) and other venues. The artist pursues creative exploration in the fields of modernism, abstraction, and abstract figurativism. Works are held in private collections in Russia, Italy, the USA, and Australia.',
    bioEs:
      'Nacido en Moscú en 1964. Graduado de la Escuela Especializada de Acuarela y Bellas Artes de Moscú S. N. Andriyaka y de la Escuela de Iconografía Trífonovskaya; es miembro de la Unión de Artistas «Podmoskovie» y miembro correspondiente de la Academia Petrovskaya de Ciencias y Artes. Exposiciones individuales: Museo «Sadóvoye Koltsó», Moscú, 2011; galería «Most», Jimki, 2015; pabellón «Art Park», Moscú, Parque Izmáilovski, 2017. Ganador del festival de arte «Pintamos la Catedral de la Intercesión (Catedral de San Basilio)» de 2016, con la exhibición de su cuadro en el Museo Histórico Estatal en la Plaza Roja. Participante en exposiciones colectivas y proyectos artísticos de diversas galerías en la Casa Central del Artista (TsDJ) y otros espacios. El artista desarrolla búsquedas creativas en el ámbito del modernismo, la abstracción y la figuración abstracta. Sus obras se encuentran en colecciones privadas en Rusia, Italia, EE. UU. y Australia.',
    visionRu:
      'Присоединяюсь к проекту с надеждой, что истинное искусство, как понятный всем язык, станет фундаментом нового мира, где взаимопонимание людей и народов, основанное на общем прошлом, станет залогом мира и процветания в будущем.',
    visionEn:
      'I join the project with the hope that true art, as a language understandable to everyone, will become the foundation of a new world where mutual understanding among people and nations, based on a shared past, becomes the guarantee of peace and prosperity in the future.',
    visionEs:
      'Me uno al proyecto con la esperanza de que el verdadero arte, como lenguaje comprensible para todos, se convierta en el cimiento de un nuevo mundo, donde el entendimiento mutuo entre las personas y los pueblos, basado en un pasado común, sea garantía de paz y prosperidad en el futuro.',
  },
  {
    id: 'evgeny-globenko',
    name: 'Evgeny Globenko',
    nameRu: 'Евгений Глобенко',
    nameEs: 'Evgeny Globenko',
    fullNameEn: 'Evgeny Globenko',
    fullNameRu: 'Евгений Глобенко',
    fullNameEs: 'Evgeny Globenko',
    countryEn: 'Russia',
    countryRu: 'Россия',
    countryEs: 'Rusia',
    photoSrc: '/assets/team/EvgenyGlobenko.jpg',
    blurbRu: 'Каллиграф и абстрактный художник, исследует «Тишину» и «Святой Грааль».',
    blurbEn: 'Calligrapher and abstract artist exploring the themes of “Silence” and the “Holy Grail.”',
    blurbEs: 'Calígrafo y artista abstracto, investiga el «Silencio» y el «Santo Grial».',
    bioRu:
      'Евгений Глобенко, 1977 г.р. Окончил институт культуры (ГАСК). Первыми уроками рисунка и живописи напутствовал отец, Е. И. Глобенко. Учился в студиях академика В. М. Михайлова, Л. Ф. Дьяконицына. Учился каллиграфии у мастера Каори Исидзимы (Япония). Вошел в международную художественную энциклопедию Allgemeines Künstlerlexikon: die bildenden Künstler aller Zeiten (Leipzig). Член Международной конфедерации художников (IFA) при ЮНЕСКО (1995). Член Международного художественного фонда (2002). Работы находятся в частных коллекциях во Франции, Японии, России, Грузии и Китае.',
    bioEn:
      'Evgeny Globenko, born in 1977. Graduated from the State Academy of Slavic Culture (GASK). Guided in his first lessons of drawing and painting by his father, E. I. Globenko. Studied in the studios of Academician V. M. Mikhailov and L. F. Dyakonitsyn. Studied calligraphy under master Kaori Ishijima (Japan). Included in the international art encyclopedia Allgemeines Künstlerlexikon: die bildenden Künstler aller Zeiten (Leipzig). Member of the International Federation of Artists (IFA) under UNESCO (1995). Member of the International Art Fund (2002). Works are held in private collections in France, Japan, Russia, Georgia, and China.',
    bioEs:
      'Evgeny Globenko, nacido en 1977. Graduado del Instituto de Cultura (Academia Estatal de Cultura Eslava, GASK). Recibió sus primeras lecciones de dibujo y pintura de su padre, E. I. Globenko. Estudió en los talleres del académico V. M. Mijáilov y de L. F. Diakonitsyn. Estudió caligrafía con la maestra Kaori Ishijima (Japón). Incluido en la enciclopedia artística internacional Allgemeines Künstlerlexikon: die bildenden Künstler aller Zeiten (Leipzig). Miembro de la Confederación Internacional de Artistas (IFA) ante la UNESCO (1995). Miembro del Fondo Internacional de Arte (2002). Sus obras se encuentran en colecciones privadas en Francia, Japón, Rusia, Georgia y China.',
    visionRu:
      '«Решение уравнения — абстракция. Так же, как сама абстракция — решение уравнения. Это всегда „что и следовало доказать“. Хорошее уравнение всегда изящно, красиво и просто. С помощью этого уравнения я пытаюсь понять Тишину», — Евгений Глобенко.\n\nТишина, Silentium, Чаша Грааля — одни из центральных тем автора, им посвящены его многие живописные работы. Я ожидаю от проекта синергийного действия: Творец — художник — Творец — зритель. Участники могут аккумулировать энергии Тишины/Света, передавать ее в пространство.',
    visionEn:
      '“Solving an equation is an abstraction. Just as abstraction itself is the solution to an equation. It is always ‘which was to be demonstrated’ (Q.E.D.). A good equation is always elegant, beautiful, and simple. Through this equation, I try to understand Silence,” — Evgeny Globenko.\n\nSilence, Silentium, and the Holy Grail (Chalice of the Grail) are among the author’s central themes, to which many of his paintings are dedicated. From this project, I expect a synergistic action: Creator — Artist — Creator — Viewer. Participants can accumulate the energies of Silence/Light and transmit them into space.',
    visionEs:
      '«La resolución de una ecuación es una abstracción. Así como la abstracción misma es la resolución de una ecuación. Es siempre „lo que se quería demostrar“. Una buena ecuación es siempre elegante, bella y sencilla. Con la ayuda de esta ecuación intento comprender el Silencio», — Evgeny Globenko.\n\nEl Silencio, Silentium y el Santo Grial (el Cáliz del Grial) son algunos de los temas centrales del autor, a los que están dedicadas muchas de sus obras pictóricas. Espero del proyecto una acción sinérgica: Creador — artista — Creador — espectador. Los participantes pueden acumular las energías del Silencio/Luz y transmitirlas al espacio.',
  },
  {
    id: 'meritxell-rodes',
    name: 'Meritxell Rodes',
    nameRu: 'Маричель Родес',
    nameEs: 'Meritxell Rodes',
    fullNameEn: 'Meritxell Rodes',
    fullNameRu: 'Маричель Родес',
    fullNameEs: 'Meritxell Rodes',
    countryEn: 'Spain (Catalonia) / Russia',
    countryRu: 'Испания (Каталония) / Россия',
    countryEs: 'España (Cataluña) / Rusia',
    photoSrc: '/assets/images/team/meritxell-rodes.jpg',
    blurbRu: 'Представитель современного наивного искусства с «каталонским оттенком», певица и художник.',
    blurbEn: 'Representative of modern naive art with a "Catalan touch," singer, and artist.',
    blurbEs: 'Representante del arte naíf moderno con un "toque catalán", cantante y artista.',
    bioRu:
      'Родилась в Барселоне, Каталония (Испания). Художник-живописец, певица. Яркий представитель наивного искусства. Картины Маричель Родес находятся в Балашихинском историко-художественном музее, в частных собраниях. В качестве певицы — лауреат многих песенных конкурсов в России и за рубежом, участница телепрограмм и радиопередач, посвященных русской песне; выступления неоднократно отмечались благодарственными письмами Департамента культуры г. Москвы.',
    bioEn:
      'Born in Barcelona, Catalonia (Spain). Painter and singer. A vivid representative of naive art. Paintings by Meritxell Rodes are held in the Balashikha Museum of History and Art and in private collections. As a singer, she is a laureate of numerous song competitions in Russia and abroad, a participant in television and radio programs dedicated to Russian song, and her performances have been repeatedly recognized with letters of appreciation from the Moscow Department of Culture.',
    bioEs:
      'Nacida en Barcelona, Cataluña (España). Pintora y cantante. Destacada representante del arte naíf. Los cuadros de Meritxell Rodes se encuentran en el Museo Histórico y Artístico de Balashija y en colecciones privadas. Como cantante, ha sido laureada en numerosos concursos de canción en Rusia y en el extranjero, participante en programas de televisión y emisiones de radio dedicados a la canción rusa, y sus actuaciones han sido reconocidas en repetidas ocasiones con cartas de agradecimiento del Departamento de Cultura de Moscú.',
    visionRu:
      'Искусство — единственный способ объединить людей из разных стран, и я думаю, что в проекте «Lingua Universalis» это удастся. Я очень хочу, чтобы нас всех объединила искренность в наших работах.',
    visionEn:
      'Art is the only way to unite people from different countries, and I think that in the “Lingua Universalis” project this will succeed. I truly wish for all of us to be united by sincerity in our works.',
    visionEs:
      'El arte es la única forma de unir a personas de diferentes países y creo que en el proyecto «Lingua Universalis» esto se logrará. Deseo profundamente que a todos nos una la sinceridad en nuestras obras.',
    exhibitionsRu: [
      '2024 — «Россия с испанским акцентом», парк Пестовский, г. Балашиха',
      '2019 — «Две страны в одном сердце», библиотека им. Л. Н. Толстого, г. Москва',
      'Участница выставок «РОССИЙСКАЯ НЕДЕЛЯ ИСКУССТВ», «VANGUARD TODAY», «ТАЛАНТ РОССИИ» и других выставок в России и в Испании.',
    ],
    exhibitionsEn: [
      '2024 — “Russia with a Spanish Accent,” Pestovsky Park, Balashikha',
      '2019 — “Two Countries in One Heart,” Tolstoy Library, Moscow',
      'Participant in the exhibitions “RUSSIAN ART WEEK,” “VANGUARD TODAY,” “TALENT OF RUSSIA,” and other exhibitions in Russia and Spain.',
    ],
    exhibitionsEs: [
      '2024 — «Rusia con acento español», Parque Pestovski, Balashija',
      '2019 — «Dos países en un mismo corazón», Biblioteca Tolstói, Moscú',
      'Participante en las exposiciones «SEMANA DEL ARTE DE RUSIA» (Russian Art Week), «VANGUARD TODAY», «TALENTO DE RUSIA» y otras exposiciones en Rusia y España.',
    ],
  },
];
