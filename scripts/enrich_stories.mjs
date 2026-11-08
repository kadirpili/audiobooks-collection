import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const CATALOG_PATH = path.join(ROOT_DIR, 'data', 'catalog.json');
const COVERS_DIR = path.join(ROOT_DIR, 'public', 'covers');

// ============================================================================
// Complete Researched Encyclopedia of all 99 Stories in the Playlist
// ============================================================================

export const STORIES_DB = {
  s5C7fP9ZxcY: {
    originalTitle: 'Masquerade (1959)',
    genre: 'Научная фантастика',
    motif: 'mask_mars',
    palette: ['#1a1025', '#4a1942', '#e88d67'],
    artSearch: 'Halloween mask vintage illustration',
    descriptionRu:
      'В канун Хэллоуина, когда улицы заполнены детьми в карнавальных масках, в дверь Сэма Вудфорда стучится странный гость, утверждающий, что он — настоящий марсианин. Ироничный разговор о пришельцах оборачивается неожиданным финальным твистом, раскрывающим истинную природу самого хозяина дома.'
  },
  E49Tb_giC9M: {
    originalTitle: 'Magnus och Olle (1934)',
    genre: 'Психологическая проза',
    motif: 'nordic_winter',
    palette: ['#0f2027', '#203a43', '#7ec8e3'],
    artSearch: 'Swedish winter snow landscape painting',
    descriptionRu:
      'Тонкая северная новелла нобелевского лауреата Эйвинда Юнсона о взрослении, мужской дружбе и суровой скандинавской природе. История двух юношей, чьи характеры и судьбы проходят проверку холодом, трудом и первыми жизненными утратами.'
  },
  qLAfEVCOggg: {
    originalTitle: 'The Other Woman (1920)',
    genre: 'Психологическая проза',
    motif: 'silhouette_window',
    palette: ['#23191e', '#4f313c', '#d99b82'],
    artSearch: 'Edward Hopper night window painting',
    descriptionRu:
      'Молодой поэт и госслужащий накануне собственной свадьбы одержим тайной страстью к замужней жене булочника. Исповедальный рассказ Шервуда Андерсона о двойственности человеческих желаний и тонкой грани между идеальной любовью и мгновенным порывом.'
  },
  zj0FEdOT6Go: {
    originalTitle: 'New York Mining Disaster (1980)',
    genre: 'Магический реализм',
    motif: 'mine_cage',
    palette: ['#10141d', '#1f2b3e', '#f0a500'],
    artSearch: 'New York night skyscraper vintage photography',
    descriptionRu:
      'Сюрреалистическая притча Харуки Мураками о человеке, который одалживает друзьям чёрный траурный костюм для похорон, и о странном смотрителе зоопарка, каждую ночь убивающем насекомых в герметичной комнате. Метафора хрупкости жизни, одиночества и невидимых катастроф мегаполиса.'
  },
  vOTARp6K_SY: {
    originalTitle: 'Wonderbird (1953)',
    genre: 'Научная фантастика',
    motif: 'cyber_bird',
    palette: ['#0d1b2a', '#1b263b', '#00b4d8'],
    artSearch: 'Futuristic mechanical bird illustration',
    descriptionRu:
      'Ранний научно-фантастический рассказ Харлана Эллисона и Альгиса Будриса о создании совершенного кибернетического оружия — металлической «Чудо-птицы», патрулирующей небо над послевоенной Землёй. Однако обретший сознание механизм начинает задаваться вопросами о смысле своей разрушительной миссии.'
  },
  Gs4X1o6Fn2E: {
    originalTitle: 'Tobias Mindernickel (1898)',
    genre: 'Психологическая драма',
    motif: 'lonely_street',
    palette: ['#1b1917', '#3a332c', '#c2a878'],
    artSearch: 'German expressionism lonely man street painting',
    descriptionRu:
      'Классическая ранняя новелла Томаса Манна о чудаковатом, замкнутом изгое Тобиасе Миндерникеле, живущем в мире собственных комплексов. Попытка обрести живую привязанность в лице купленного щенка Эсава приводит героя к трагическому столкновению любви и болезненной жажды власти.'
  },
  '6RMu0P1AWfk': {
    originalTitle: 'Om man hänger om sina tavlor (1998)',
    genre: 'Лирическая проза',
    motif: 'picture_frames',
    palette: ['#1d2a24', '#2e473b', '#e2c08d'],
    artSearch: 'Nordic interior paintings on wall art',
    descriptionRu:
      'Мудрый и камерный рассказ взрослой прозы Туве Янссон о том, как простая перестановка старых картин в квартире вдруг меняет оптику восприятия всей прожитой жизни, открывая забытые оттенки памяти, привычек и человеческой близости.'
  },
  'Sn7Q-QDLZYA': {
    originalTitle: 'Unglücklichsein / Тоска (1910)',
    genre: 'Экзистенциальная притча',
    motif: 'ghost_room',
    palette: ['#12131a', '#282b3a', '#a3b1c6'],
    artSearch: 'Prague night street lamp Kafka vintage',
    descriptionRu:
      'Ноябрьским вечером в комнату измученного одиночеством рассказчика прямо из коридора входит маленькое привидение-ребёнок. Тонкая, тревожная и парадоксально ироничная миниатюра Франца Кафки о невыносимости отчуждения и призрачности человеческого диалога.'
  },
  gLDZ3Hg3vOg: {
    originalTitle: 'El libro de arena (1975)',
    genre: 'Философская фантастика',
    motif: 'infinite_book',
    palette: ['#24190e', '#4d3319', '#f4c430'],
    artSearch: 'Hourglass desert sand antique book illustration',
    descriptionRu:
      'Библиофил из Буэнос-Айреса приобретает у странствующего торговца Библиями загадочную священную книгу из Индии, страницы которой бесконечны, как песок: ни одну из них невозможно открыть дважды. Шедевр Хорхе Луиса Борхеса об одержимости бесконечностью, разрушающей рассудок.'
  },
  sGnif8PbMlU: {
    originalTitle: 'Солдатёнок (1968)',
    genre: 'Военная драма',
    motif: 'steppe_cinema',
    palette: ['#261c14', '#523a28', '#e69f52'],
    artSearch: 'Kyrgyzstan mountains steppe painting',
    descriptionRu:
      'Пронзительный рассказ Чингиза Айтматова о пятилетнем мальчике Авалбеке, никогда не видевшем своего погибшего на фронте отца. Когда в далёкий киргизский кошар привозят передвижное кино про войну, ребёнок впервые «узнаёт» отца в экранном солдате и переживает его гибель как настоящую.'
  },
  'O_SeDbdE-K4': {
    originalTitle: 'Guys Day Out (2009)',
    genre: 'Научная фантастика',
    motif: 'retro_rocket',
    palette: ['#131829', '#23325b', '#ff7b54'],
    artSearch: 'Retro 1950s science fiction space illustration',
    descriptionRu:
      'Остроумная и тёплая фантастическая зарисовка Эллен Кледжс, стилизованная под золотой век научной фантастики, где рутинный выходной день оборачивается межпланетным приключением с живым юмором и ностальгической атмосферой.'
  },
  Z0ub5mzHKPo: {
    originalTitle: 'Occhi limpidi (1948)',
    genre: 'Лирическая новелла',
    motif: 'ligurian_sea',
    palette: ['#102536', '#1e4866', '#8ecae6'],
    artSearch: 'Italian Riviera sea coast painting',
    descriptionRu:
      'Изящная прозаическая миниатюра итальянского нобелевского лауреата Эудженио Монтале из сборника «Динарская бабочка». Поэтическое размышление о мимолётных встречах, ускользающей красоте взгляда и хрупкой работе человеческой памяти.'
  },
  '9kmCvlyPNFY': {
    originalTitle: 'The Bag That Killed (1956)',
    genre: 'Криминальный нуар',
    motif: 'noir_alley',
    palette: ['#111115', '#292933', '#e63946'],
    artSearch: 'Film noir dark street shadow vintage',
    descriptionRu:
      'Напряжённый криминальный рассказ американского мастера нуара Хала Эллсона. Случайная находка и жадность втягивают героя в смертельную ловушку на тёмных улицах большого города, где расплата наступает быстрее, чем приходит осознание ошибки.'
  },
  'AYaaDtv-6go': {
    originalTitle: 'Tenohira no Shōsetsu / Рассказы на ладони',
    genre: 'Японская классика',
    motif: 'sakura_moon',
    palette: ['#1e1624', '#3d2c47', '#f7b2bd'],
    artSearch: 'Japanese ukiyo-e blossom moon woodblock print',
    descriptionRu:
      'Избранные миниатюры из знаменитого цикла «Рассказы на ладони», который нобелевский лауреат Ясунари Кавабата писал на протяжении всей жизни. Поэтические новеллы-хайку о любви, разлуке, таинстве природы и неуловимой печали быстротечного мира («моно-но аваре»).'
  },
  Fi39d6szKvU: {
    originalTitle: 'Где стояла батарея (1966)',
    genre: 'Повесть о памяти',
    motif: 'coastal_cannon',
    palette: ['#172026', '#2c3e4c', '#d97742'],
    artSearch: 'Naval artillery coast sunset painting',
    descriptionRu:
      'Трогательный рассказ Юрия Яковлева о преемственности поколений и живой памяти о войне. На высоком берегу, где когда-то насмерть стояла зенитная батарея, прошлое перекликается с настоящим в судьбах подростков и ветеранов.'
  },
  IpWJRsO_MPQ: {
    originalTitle: 'La puerta condenada (1956)',
    genre: 'Мистический реализм',
    motif: 'sealed_door',
    palette: ['#1e1518', '#3d262e', '#d4a373'],
    artSearch: 'Old hotel corridor closed door painting',
    descriptionRu:
      'В полупустом старом отеле «Сервантес» в Монтевидео коммерсант Петrone каждую ночь слышит за заколоченной дверью соседнего номера тихий, безутешный плач младенца. Знаменитая мистическая новелла Хулио Кортасара о проникновении потустороннего в обыденную реальность.'
  },
  MUdpEOexeD8: {
    originalTitle: 'The Man in the Brown Coat (1921)',
    genre: 'Психологическая проза',
    motif: 'autumn_coat',
    palette: ['#241a14', '#4a3525', '#dda15e'],
    artSearch: 'Portrait man brown coat early 20th century painting',
    descriptionRu:
      'Историк, способный в деталях воссоздавать великие цивилизации древности и судьбы полководцев, оказывается совершенно бессилен преодолеть немую стену отчуждения между собой и собственной женой. Пронзительная новелла Шервуда Андерсона о трагедии внутренней замкнутости.'
  },
  ixVkXCChtEg: {
    originalTitle: 'The Fall of the House of Usher (1839)',
    genre: 'Готическая классика',
    motif: 'gothic_manor',
    palette: ['#0f0c16', '#2a1f3d', '#9d4edd'],
    artSearch: 'House of Usher illustration Poe',
    descriptionRu:
      'Вершина готической прозы Эдгара Аллана По: рассказчик прибывает в мрачное родовое поместье своего друга детства Родерика Ашера, страдающего от болезненного обострения чувств, в то время как его сестра-близнец леди Мадлен угасает от неведомого недуга.'
  },
  ijE14vJ5i6A: {
    originalTitle: 'Цивилизация напоказ (1969)',
    genre: 'Сатирическая фантастика',
    motif: 'neon_stage',
    palette: ['#141124', '#2e2252', '#00f5d4'],
    artSearch: 'Retro futuristic neon city Japan illustration',
    descriptionRu:
      'Острая сатирическая фантасмагория классика японского постмодернизма Ясутаки Цуцуи о контакте цивилизаций, где внешняя мишура, бюрократический театр и абсурдное стремление пустить пыль в глаза оказываются важнее самой сути прогресса.'
  },
  P3tTAIrOpsg: {
    originalTitle: 'Voyage to Victory (1944)',
    genre: 'Военный очерк',
    motif: 'normandy_waves',
    palette: ['#111d24', '#1f3642', '#70a1b5'],
    artSearch: 'D-Day landing craft Normandy sea 1944',
    descriptionRu:
      'Документально-художественный репортаж Эрнеста Хемингуэя с борта десантного катера во время высадки союзников в Нормандии 6 июня 1944 года. Суровая, сжатая как пружина проза о мужестве, страхе и будничной работе солдат под огнём.'
  },
  NjaaSZYtSRw: {
    originalTitle: 'Apina / Мартышка (1954)',
    genre: 'Экзистенциальная проза',
    motif: 'clockwork_monkey',
    palette: ['#1b181f', '#352f3d', '#e09f3e'],
    artSearch: 'Vintage toy monkey illustration art',
    descriptionRu:
      'Психологическая новелла финского модерниста Юхи Маннеркорпи о внезапном экзистенциальном озарении, одиночестве и памяти, когда случайный образ заставляет человека остановиться посреди привычного бега жизни и заглянуть в собственную бездну.'
  },
  nnyceeTtgms: {
    originalTitle: 'Свечечка (1973)',
    genre: 'Русская лирическая проза',
    motif: 'warm_candle',
    palette: ['#1f1610', '#422d1d', '#ffb703'],
    artSearch: 'Single burning candle dark room painting',
    descriptionRu:
      'Один из самых светлых и пронзительных рассказов Юрия Казакова — вечерний разговор отца с маленьким сыном Алёшей в тишине осенних сумерек, где огонёк восковой свечи становится символом детской чистоты, родительской нежности и защиты от темного мира.'
  },
  ZFVeb6QiJa4: {
    originalTitle: 'Da Xiang Xi Di Er Zuo / Слон сидит спокойно (2017)',
    genre: 'Современная драма',
    motif: 'mist_elephant',
    palette: ['#16191e', '#2a3038', '#8d99ae'],
    artSearch: 'Asian elephant mist dark photography',
    descriptionRu:
      'Пронзительная притча китайского писателя и режиссёра Ху Бо (Ху Цяня) о людях, задыхающихся в серой провинциальной безысходности и мечтающих уехать в северный город Маньчжоули, где в зоопарке, по слухам, сидит слон, совершенно равнодушный к жестокости мира.'
  },
  '1JkyHZmv3nw': {
    originalTitle: "I'm a Fool (1922)",
    genre: 'Классическая новелла',
    motif: 'racehorse_track',
    palette: ['#211a13', '#473625', '#e9c46a'],
    artSearch: 'Horse racing track 1920s illustration',
    descriptionRu:
      'Знаменитый рассказ Шервуда Андерсона: юный конюх на бегах, желая произвести впечатление на прекрасную девушку Люси из богатой семьи, представляется сыном миллионера — и сам закрывает себе путь к настоящему счастью, когда она отвечает ему взаимностью.'
  },
  ckIb8iujKvc: {
    originalTitle: 'A Train Trip (1957)',
    genre: 'Психологическая проза',
    motif: 'steam_train',
    palette: ['#151b1f', '#28363f', '#a8dadc'],
    artSearch: 'Vintage train carriage window night illustration',
    descriptionRu:
      'Поздний полуавтобиографический рассказ Эрнеста Хемингуэя о поездке мальчика Джимми с отцом в поезде. За внешней сдержанностью диалогов и мельканием пейзажей за окном вагона скрывается глубокая драма взросления и семейного надлома.'
  },
  _OvGTqcKO34: {
    originalTitle: 'The Vat (1961)',
    genre: 'Мистическая фантастика',
    motif: 'alchemy_vat',
    palette: ['#191420', '#332640', '#b56576'],
    artSearch: 'Alchemist cauldron vintage engraving',
    descriptionRu:
      'Причудливая и мрачно-ироничная история американского фантаста Эйва (Аврама) Дэвидсона, сочетающая антикварную эрудицию, старинные предания и зловещую тайну, скрытую на дне огромного чана.'
  },
  o2FIT95F8tQ: {
    originalTitle: 'The Wall-to-Wall Grave (1962)',
    genre: 'Остросюжетный детектив',
    motif: 'locked_room',
    palette: ['#141418', '#2c2c34', '#d62828'],
    artSearch: 'Mystery detective shadow illustration 1960s',
    descriptionRu:
      'Изобретательный криминальный триллер Эндрю Бенедикта в духе «Альфред Хичкок представляет», где тщательно спланированное преступление превращает роскошный интерьер в смертельную западню.'
  },
  'vcE-bHq-Isg': {
    originalTitle: 'Man in a Taxi / Мужчина в такси (1981)',
    genre: 'Магический реализм',
    motif: 'night_taxi',
    palette: ['#111622', '#1d2d44', '#ffd166'],
    artSearch: 'Tokyo night taxi neon lights photography',
    descriptionRu:
      'Камерная история Харуки Мураками о картине «Мужчина в такси», висящей в спальне героини, и о тонкой связи между искусством, ночными поездками по городу и необъяснимым чувством одиночества, знакомым каждому жителю мегаполиса.'
  },
  irqIEsXMzwM: {
    originalTitle: 'El disco / Медаль (1975)',
    genre: 'Философская притча',
    motif: 'odin_disc',
    palette: ['#1e1b12', '#3d3522', '#ffd700'],
    artSearch: 'Anglo-Saxon gold coin forest illustration',
    descriptionRu:
      'На краю глухого леса старый дровосек даёт приют бродяге, который называет себя последним потомком рода Одина и хранителем единственного в мире предмета с одной-единственной стороной — золотого диска-медали. Притча Борхеса о слепой алчности, ведущей к утрате чуда.'
  },
  SvYle6oMQt0: {
    originalTitle: 'Философский дневник маньяка-убийцы, жившего в Средние века (1944)',
    genre: 'Философский декаданс',
    motif: 'crimson_katana',
    palette: ['#210b12', '#4a1222', '#e63946'],
    artSearch: 'Medieval Japan samurai mask ukiyo-e',
    descriptionRu:
      'Ранняя эстетско-философская новелла девятнадцатилетнего Юкио Мисимы, стилизованная под средневековые записки аристократа, ищущего в смерти и разрушении высшую, парадоксальную форму вечной красоты.'
  },
  WuMNnFeyp8Y: {
    originalTitle: 'Две женщины (1980)',
    genre: 'Психологическая проза',
    motif: 'abkhaz_veranda',
    palette: ['#17241e', '#2b473a', '#f4a261'],
    artSearch: 'Caucasus mountains sea coast painting',
    descriptionRu:
      'Мудрый и наблюдательный рассказ Фазиля Искандера, в котором за житейской историей двух совершенно разных женских судеб раскрывается глубокое понимание человеческого достоинства, совести и южного колорита.'
  },
  FdOCzhyYs8k: {
    originalTitle: 'The Ogre in the Valley (1959)',
    genre: 'Мифологическое фэнтези',
    motif: 'valley_giant',
    palette: ['#1a2118', '#31402d', '#a3b18a'],
    artSearch: 'Mountain valley giant folklore illustration',
    descriptionRu:
      'Ироничная сказочно-фантастическая притча Эйва Дэвидсона о долине, жители которой веками соседствуют с легендарным великаном-людоедом, и о том, как миф переплетается с человеческим лукавством.'
  },
  qKH6wowUit0: {
    originalTitle: 'Orangen vor ihrem Fenster (1961)',
    genre: 'Военная драма',
    motif: 'window_oranges',
    palette: ['#1c1815', '#3b3028', '#fb8500'],
    artSearch: 'Still life oranges on windowsill painting',
    descriptionRu:
      'Пронзительная новелла швейцарского писателя Юрга Федершпиля: во время Второй мировой войны девушка выставляет на подоконник яркие апельсины как тайный сигнал для скрывающегося возлюбленного-дезертира о том, что путь свободен и опасности нет.'
  },
  xlmOSIu3oME: {
    originalTitle: 'Три коротких рассказа про чудесное',
    genre: 'Притчи и легенды',
    motif: 'jerusalem_lantern',
    palette: ['#1f1a12', '#423522', '#e9c46a'],
    artSearch: 'Old Jerusalem stone street lantern painting',
    descriptionRu:
      'Три мудрые хасидские притчи нобелевского лауреата Шмуэля Йосефа Агнона, в которых повседневный быт старинных местечек и Иерусалима незаметно соприкасается с тихим чудом, верой и судьбой.'
  },
  legRlEtWPvk: {
    originalTitle: 'The Corduroy Pants (1938)',
    genre: 'Лирический юмор',
    motif: 'corduroy_bicycle',
    palette: ['#231b14', '#4a3828', '#f4a261'],
    artSearch: 'Vintage California small town 1930s illustration',
    descriptionRu:
      'Тёплый, полный мягкой самоиронии автобиографический рассказ Уильяма Сарояна о мальчишке из калифорнийского городка Фресно, для которого новые скрипучие вельветовые штаны становятся первым серьёзным испытанием на пути взросления.'
  },
  TSSACGpudyM: {
    originalTitle: 'A Tale of the Ragged Mountains (1844)',
    genre: 'Мистика и гипноз',
    motif: 'ragged_mountains',
    palette: ['#141a24', '#263347', '#90e0ef'],
    artSearch: 'Misty Virginia mountains 19th century painting',
    descriptionRu:
      'Таинственный рассказ Эдгара Аллана По о месмеризме и переселении душ: во время прогулки в туманных Крутых горах Вирджинии Огастес Бедлоу переносится в охваченный восстанием индийский Бенарес XVIII века и переживает собственную прошлую смерть.'
  },
  piHg17Tb6zY: {
    originalTitle: 'Женщины, верящие в карму (1948)',
    genre: 'Ироническая эссеистика',
    motif: 'karma_wheel',
    palette: ['#1e1621', '#3d2a45', '#e0aaff'],
    artSearch: 'Italian salon portrait woman mid-century art',
    descriptionRu:
      'Тонкая психологическая зарисовка нобелевского лауреата Эудженио Монтале о светских дамах, увлекающихся восточной мистикой и переселением душ, чтобы придать поэтический ореол своим земным страстям и капризам.'
  },
  GZqzFTyPB6w: {
    originalTitle: 'Aniara (1956)',
    genre: 'Космический эпос',
    motif: 'starship_aniara',
    palette: ['#070b19', '#121d42', '#4cc9f0'],
    artSearch: 'Deep space nebula starship illustration',
    descriptionRu:
      'Легендарное научно-фантастическое произведение шведского нобелевского лауреата Харри Мартинсона: гигантский космический лайнер «Аниара», увозящий беженцев с отравленной радиацией Земли на Марс, сбивается с курса и навсегда уходит в бездну созвездия Лиры.'
  },
  '1OBVO_PBQJU': {
    originalTitle: 'Troll Bridge (1991)',
    genre: 'Юмористическое фэнтези',
    motif: 'troll_bridge',
    palette: ['#182218', '#2d422d', '#9ef01a'],
    artSearch: 'Stone bridge forest fantasy illustration',
    descriptionRu:
      'Блестящий рассказ Терри Пратчетта из цикла о Плоском мире: престарелый варвар Коэн отправляется к старому каменному мосту, чтобы в честном поединке сразиться с троллем, но вместо кровожадного чудовища встречает усталого семьянина, жалующегося на современность.'
  },
  XjXuQPwvVDw: {
    originalTitle: 'Test (1962)',
    genre: 'Научная фантастика',
    motif: 'highway_test',
    palette: ['#14181f', '#263040', '#ff595e'],
    artSearch: 'Vintage highway car driving night illustration',
    descriptionRu:
      'Классический психологический sci-fi триллер Теодора Томаса: Роберт Проктор спокойно едет по шоссе с матерью, когда потерявший управление встречный автомобиль вовлекает его в жуткую аварию со смертельным исходом — но это лишь начало экзамена.'
  },
  lO9o17_WdfQ: {
    originalTitle: 'Река Оккервиль (1983)',
    genre: 'Русская современная проза',
    motif: 'gramophone_river',
    palette: ['#1a1724', '#332c47', '#f3c677'],
    artSearch: 'Saint Petersburg rainy canal twilight painting',
    descriptionRu:
      'Знаменитый рассказ Татьяны Толстой об одиноком ленинградце Симеонове, влюблённом в божественный голос певицы Веры Васильевны со старых шипящих пластинок. Столкновение хрупкой грёзы с шумной, плотской реальностью живой артистки становится метафорой природы искусства.'
  },
  LD0qCrUnghw: {
    originalTitle: 'The Demoness / Демон (1976)',
    genre: 'Тёмное фэнтези',
    motif: 'crimson_demon',
    palette: ['#220c14', '#471528', '#ff4d6d'],
    artSearch: 'Gothic dark fantasy castle illustration',
    descriptionRu:
      'Завораживающая мистическая притча британской королевы тёмного фэнтези Танит Ли, сотканная из восточной сказочности, древних проклятий и рокового противостояния смертного человека со сверхъестественной силой.'
  },
  jigWULgGx84: {
    originalTitle: 'Der Tod / Смерть (1897)',
    genre: 'Философская новелла',
    motif: 'autumn_sea_cliff',
    palette: ['#14191f', '#25303d', '#adb5bd'],
    artSearch: 'Caspar David Friedrich sea cliff painting',
    descriptionRu:
      'Дневниковая исповедь сорокалетнего графа, живущего с маленькой дочерью Асунсьон в уединённом доме на холодном морском берегу и убеждённого, что смерть придёт за ним ровно в ночь на 12 октября. Глубокая ранняя новелла Томаса Манна о предчувствии рока.'
  },
  GIn4B2eItpE: {
    originalTitle: 'Le Dépeupleur / Опустошитель (1970)',
    genre: 'Антиутопия и абсурд',
    motif: 'cylinder_ladders',
    palette: ['#171717', '#2e2e2e', '#e5e5e5'],
    artSearch: 'Piranesi Carceri labyrinth ladders engraving',
    descriptionRu:
      'Гипнотическая философская антиутопия нобелевского лауреата Сэмюэла Беккета: двести обнажённых тел заперты внутри огромного резинового цилиндра с лестницами и нишами, где каждый продолжает тщетный поиск своего «утраченного» в строгом геометрическом аду.'
  },
  'kc9GA4-t8HQ': {
    originalTitle: 'Нумизматы',
    genre: 'Иронический детектив',
    motif: 'rare_coins',
    palette: ['#1d1912', '#3d3322', '#ffd166'],
    artSearch: 'Antique gold coins collection painting',
    descriptionRu:
      'Остроумный детективный рассказ гроссмейстера американского криминального жанра Стэнли Эллина о страсти коллекционеров редких монет, которая толкает респектабельных людей на изощрённые интриги и преступления.'
  },
  '8NIl-PdbAuo': {
    originalTitle: "Harvey's Dream (2003)",
    genre: 'Психологический хоррор',
    motif: 'kitchen_phone',
    palette: ['#1a1414', '#382424', '#ef476f'],
    artSearch: 'Suburban house morning shadow art',
    descriptionRu:
      'Субботним утром за кухонным столом Харви рассказывает уставшей от тридцатилетнего брака жене Дженет свой пугающе реалистичный ночной кошмар — а она с ужасом замечает за окном детали, предвещающие, что сон уже сбылся.'
  },
  W47ObNzw4C8: {
    originalTitle: 'Убийца / Cain Rose Up (1968)',
    genre: 'Психологический триллер',
    motif: 'sniper_dorm',
    palette: ['#191212', '#3b1e1e', '#e63946'],
    artSearch: 'Dark tower window silhouette illustration',
    descriptionRu:
      'Ранний бескомпромиссный рассказ Стивена Кинга о том, как за внешним благополучием скрывается нарастающее безумие, готовое в один весенний день прорваться наружу необратимой катастрофой.'
  },
  kACnJEYLfFk: {
    originalTitle: 'Battleground / Сражение (1972)',
    genre: 'Мистический триллер',
    motif: 'toy_soldiers',
    palette: ['#141c14', '#263826', '#8ac926'],
    artSearch: 'Toy soldiers miniature battle photography',
    descriptionRu:
      'Профессиональный киллер Джон Рenshaw, устранивший владельца фабрики игрушек, получает посылку с набором миниатюрных оловянных солдатиков, вертолётов и ракетных установок, которые оживают и начинают настоящий штурм его пентхауса.'
  },
  ErmqVBJU2ds: {
    originalTitle: 'The Jaunt / Прыгающий (1981)',
    genre: 'Научно-фантастический хоррор',
    motif: 'warp_portal',
    palette: ['#0b0f26', '#1b2659', '#00f5d4'],
    artSearch: 'Teleportation portal sci-fi illustration',
    descriptionRu:
      'В XXIV веке человечество освоило мгновенную телепортацию («Прыжок») между планетами, но перед перемещением каждого пассажира обязательно погружают в общий наркоз — ибо для бодрствующего сознания доля секунды в портале длится целую вечность.'
  },
  'bhm2jJ-Jgb0': {
    originalTitle: 'The Last Rung on the Ladder (1978)',
    genre: 'Драматическая новелла',
    motif: 'barn_ladder',
    palette: ['#211a12', '#453422', '#f4a261'],
    artSearch: 'Old wooden barn hayloft light painting',
    descriptionRu:
      'Один из самых пронзительных не-мистических рассказов Стивена Кинга: успешный юрист Ларри вспоминает день из детства в Небраске, когда под его восьмилетней сестрой Китти на огромной высоте старого амбара обломилась последняя перекладина деревянной лестницы.'
  },
  'vwExYm-jm6Q': {
    originalTitle: "The Reaper's Image (1969)",
    genre: 'Готический хоррор',
    motif: 'haunted_mirror',
    palette: ['#16131c', '#2d243b', '#c77dff'],
    artSearch: 'Antique ornate mirror dark room',
    descriptionRu:
      'Знаток антиквариата мистер Спенглер осматривает редчайшее елизаветинское зеркало мастера Делвера, за которым тянется мрачная слава: те, кто замечает в его глубине тёмное пятно за своим плечом, бесследно исчезают из мира живых.'
  },
  pyXNGsqyfUU: {
    originalTitle: 'Quitters, Inc. (1978)',
    genre: 'Остросюжетный триллер',
    motif: 'cigarette_cage',
    palette: ['#18181b', '#2e2e36', '#ff9f1c'],
    artSearch: 'Cigarette smoke noir shadow photography',
    descriptionRu:
      'Заядлый курильщик Дик Моррисон обращается в закрытую клинику «Корпорация "Бросайте курить"», гарантирующую 98% успеха. Секрет методики оказывается предельно прост и беспощаден: за каждую выкуренную сигарету жестокому наказанию подвергают его близких.'
  },
  nvmeME2_eYY: {
    originalTitle: 'Night Surf (1969)',
    genre: 'Постапокалипсис',
    motif: 'dark_beach_fire',
    palette: ['#0f1722', '#1d2f45', '#ff6b6b'],
    artSearch: 'Night ocean beach bonfire painting',
    descriptionRu:
      'Атмосферный рассказ Стивена Кинга, ставший прообразом романа «Противостояние»: горстка молодых людей, переживших пандемию супергриппа «Капитан Шустрик», проводит безумную ночь у костра на пустынном океанском побережье в ожидании неминуемого конца.'
  },
  lc7mnbGqUqQ: {
    originalTitle: 'Here There Be Tigers (1968)',
    genre: 'Мистический хоррор',
    motif: 'tiger_eyes',
    palette: ['#1f140e', '#452817', '#ff9f1c'],
    artSearch: 'Bengal tiger dark jungle eyes illustration',
    descriptionRu:
      'Третьеклассник Чарли отпрашивается с урока строгой мисс Бёрд в школьный туалет и с ужасом обнаруживает, что за приоткрытой дверью кафельной комнаты его подстерегает настоящий огромный голодный тигр.'
  },
  'VWieJPzYJ-8': {
    originalTitle: 'The Dune (2011)',
    genre: 'Мистика и судьба',
    motif: 'prophecy_dune',
    palette: ['#1f1b14', '#423826', '#f4d35e'],
    artSearch: 'Florida sand dune ocean island painting',
    descriptionRu:
      'Девяностолетний судья Верховного суда в отставке Харви Бичер открывает своему адвокату тайну необитаемой песчаной дюны у берегов Флориды, на песке которой за несколько дней до смерти сами собой проступают имена обречённых людей.'
  },
  GzdrIaBYlOI: {
    originalTitle: 'Home Delivery (1989)',
    genre: 'Апокалиптический хоррор',
    motif: 'lighthouse_fog',
    palette: ['#121b1e', '#22363d', '#52b788'],
    artSearch: 'Maine island fishing boat fog painting',
    descriptionRu:
      'Беременная вдова Мэдди живёт на крошечном острове Дженнингс у побережья штата Мэн, когда по всему миру мёртвые начинают восставать из могил, а вместе с ними со дна моря возвращается и её погибший муж-рыбак.'
  },
  xVgHynJAd3I: {
    originalTitle: 'Jhonathan and the Witches (1956)',
    genre: 'Тёмная сказка',
    motif: 'three_witches',
    palette: ['#191124', '#34204d', '#b5179e'],
    artSearch: 'Three witches forest cauldron illustration',
    descriptionRu:
      'Уникальный ранний сказочно-мистический рассказ Стивена Кинга (написанный им в девятилетнем возрасте!) о юноше Джонатане, заключившем опасную сделку с тремя коварными лесными ведьмами.'
  },
  LZEdNm4zPKQ: {
    originalTitle: 'Gramma / Деда (1984)',
    genre: 'Лавкрафтовский хоррор',
    motif: 'creaking_stairs',
    palette: ['#1a1318', '#382433', '#e07a5f'],
    artSearch: 'Spooky old house staircase night illustration',
    descriptionRu:
      'Одиннадцатилетний мальчик остаётся вечером один в старом доме присматривать за прикованной к постели, ослепшей и внушающей суеверный ужас старухой, хранящей запретные книги древних тёмных культов.'
  },
  MaOLDCE2Mqk: {
    originalTitle: 'The Lawnmower Man (1975)',
    genre: 'Мифологический хоррор',
    motif: 'pan_lawnmower',
    palette: ['#112115', '#21452b', '#70e000'],
    artSearch: 'Overgrown green garden summer shadow art',
    descriptionRu:
      'Гарольд Паркетт нанимает странного рабочего из службы «Пастораль» подстричь запущенный газон у дома — и становится свидетелем дикого языческого ритуала поклонения древнему лесному богу Пану.'
  },
  '88dXQR_yK_k': {
    originalTitle: 'By the Waters of Babylon (1937)',
    genre: 'Постапокалиптическая классика',
    motif: 'ruined_manhattan',
    palette: ['#141d24', '#263947', '#f4a261'],
    artSearch: 'Post-apocalyptic overgrown ruined city illustration',
    descriptionRu:
      'Основополагающий шедевр постапокалиптической фантастики Стивена Винсента Бене: юный сын жреца Джон переправляется через запретную реку в Мёртвое Место, где некогда жили «боги», и открывает трагическую правду о погибшем Нью-Йорке.'
  },
  RYXZc71CDxk: {
    originalTitle: 'The Devil and Daniel Webster (1936)',
    genre: 'Мистическая притча',
    motif: 'midnight_jury',
    palette: ['#1e1612', '#402c22', '#e76f51'],
    artSearch: '19th century courtroom trial illustration',
    descriptionRu:
      'Фермер из Нью-Гэмпшира Джабез Стоун продаёт душу дьяволу в обмен на семь лет процветания, а когда приходит срок расплаты, нанимает для защиты в полуночном суде перед присяжными из проклятых грешников великого американского оратора Дэниэла Уэбстера.'
  },
  IoXXjFfVyCA: {
    originalTitle: 'Sommernovelette (1911)',
    genre: 'Психологическая новелла',
    motif: 'como_letters',
    palette: ['#14212b', '#264257', '#f6bd60'],
    artSearch: 'Lake Como Italy villa summer painting',
    descriptionRu:
      'Изящная новелла Стефана Цвейга: скучающий пожилой господин в курортном отеле на озере Комо решает ради литературной забавы анонимно писать страстные любовные письма юной девушке — не подозревая, какой бурей отзовётся эта игра в живом сердце.'
  },
  S7WMCm11Vrc: {
    originalTitle: 'Легенда о третьей, «героической»',
    genre: 'Музыкально-историческая новелла',
    motif: 'beethoven_symphony',
    palette: ['#1f1812', '#423022', '#e9c46a'],
    artSearch: 'Beethoven manuscript sheet music candle painting',
    descriptionRu:
      'Вдохновенное эссе-новелла болгарского писателя Стефана Продева о рождении Третьей («Героической») симфонии Бетховена, о гневе композитора, разорвавшего посвящение Наполеону Бонапарту, и о вечном величии свободного духа.'
  },
  PiHmFK5e9Ho: {
    originalTitle: 'Ziemia jego przodków (1963)',
    genre: 'Научная фантастика',
    motif: 'venus_earth',
    palette: ['#121d2b', '#223a59', '#48cae4'],
    artSearch: 'Retro Polish science fiction space art',
    descriptionRu:
      'Философский научно-фантастический рассказ польского писателя Стефана Вайнфельда: потомок колонистов Венеры впервые прилетает на Землю, родину своих предков, и обнаруживает мир всеобщего, но пугающе искусственного благополучия.'
  },
  VUtYyDMTIhE: {
    originalTitle: 'Возвращение / The Return (1924)',
    genre: 'Классическая драма',
    motif: 'colonial_steamer',
    palette: ['#1d1915', '#3d332a', '#d4a373'],
    artSearch: 'Vintage steamship port dusk painting',
    descriptionRu:
      'Тонкая психологическая новелла Сомерсета Моэма о человеке, который после долгих лет скитаний возвращается к прошлой жизни и понимает, что время неумолимо изменило и тех, кого он любил, и его самого.'
  },
  '8CMEY0HTMDg': {
    originalTitle: 'Вояжи с Кейлом I: Выходка гениев или удираем в будущее',
    genre: 'Приключенческая фантастика',
    motif: 'time_machine',
    palette: ['#14142b', '#292959', '#00bbf9'],
    artSearch: 'Time machine chronometer steampunk sci-fi art',
    descriptionRu:
      'Динамичная и полная иронии научно-фантастическая авантюра о дерзком эксперименте непризнанных гениев, решивших совершить головокружительный побег сквозь время прямо в будущее.'
  },
  yVqlxvUqIpM: {
    originalTitle: 'Тоскливая работа',
    genre: 'Фантастическая миниатюра',
    motif: 'office_window',
    palette: ['#171a21', '#2c3340', '#90a4ae'],
    artSearch: 'Minimalist office window city twilight art',
    descriptionRu:
      'Остроумная и парадоксальная новелла японского мастера сверхкороткой фантастики («боси-сётэцу») Синъити Хоси о монотонной рутине, одиночестве и неожиданном способе обрести смысл в самой скучной профессии.'
  },
  '7esNIqS3ik4': {
    originalTitle: 'Котёнок и звёзды',
    genre: 'Философская ирония',
    motif: 'kitten_cosmos',
    palette: ['#131826', '#242f4d', '#ffd166'],
    artSearch: 'Cat looking at starry night sky illustration',
    descriptionRu:
      'Блестящая ироническая притча нобелевского лауреата Синклера Льюиса об «эффекте бабочки»: случайный поступок мальчика, погладившего уличного котёнка, запускает цепочку событий, меняющую судьбы империй и далёких звёздных миров.'
  },
  nMf_sOuiVFE: {
    originalTitle: 'Юфрау Фредерикс (Kronkels)',
    genre: 'Амстердамские зарисовки',
    motif: 'amsterdam_canal',
    palette: ['#181d24', '#2c3645', '#f4a261'],
    artSearch: 'Amsterdam canal houses evening painting',
    descriptionRu:
      'Лирическая и немного грустная зарисовка классика голландской малой прозы Симона Кармиггелта о скромной пожилой даме юфрау Фредерикс, в чьей тихой жизни отражается вся хрупкость и благородство маленьких людей.'
  },
  KsPsyxuv2OI: {
    originalTitle: 'Шкатулка (Kronkels)',
    genre: 'Лирическая миниатюра',
    motif: 'wooden_box',
    palette: ['#211812', '#422f22', '#e9c46a'],
    artSearch: 'Antique carved wooden jewelry box painting',
    descriptionRu:
      'Тёплая новелла Симона Кармиггелта о старой семейной шкатулке и человеческих воспоминаниях, которые порой дороже любых сокровищ, спрятанных под крышкой.'
  },
  Bk0gEAU8Ow0: {
    originalTitle: 'Удивительная книга (Kronkels)',
    genre: 'Ироническая проза',
    motif: 'open_book_cafe',
    palette: ['#1d1914', '#3b3228', '#dda15e'],
    artSearch: 'Old bookshop reading vintage painting',
    descriptionRu:
      'Улыбчивая и мудрая история Симона Кармиггелта о встрече с необычным читателем в амстердамском кафе и о том, как одна книга способна преобразить взгляд на собственную судьбу.'
  },
  X9muyUVCucQ: {
    originalTitle: 'Наш современник (Kronkels)',
    genre: 'Городская новелла',
    motif: 'rain_umbrella',
    palette: ['#161b21', '#2a3440', '#8ecae6'],
    artSearch: 'Rainy European street cafe painting',
    descriptionRu:
      'Наблюдательный портрет человека XX века в исполнении Симона Кармиггелта — с его вечной спешкой, маленькими слабостями, тревогами и неистребимой потребностью в душевном тепле.'
  },
  yWn1izbuhjI: {
    originalTitle: 'Конец (Kronkels)',
    genre: 'Психологическая миниатюра',
    motif: 'autumn_bench',
    palette: ['#1c1816', '#382f2b', '#e07a5f'],
    artSearch: 'Autumn park bench falling leaves painting',
    descriptionRu:
      'Тонкая, сдержанная новелла Симона Кармиггелта о прощании, уходящем времени и тихом мужестве, с которым человек встречает неизбежные перемены жизни.'
  },
  '6TOQ_q3EI3M': {
    originalTitle: 'Враньё (Kronkels)',
    genre: 'Ироническая миниатюра',
    motif: 'two_glasses',
    palette: ['#1f1a16', '#3d332b', '#f4a261'],
    artSearch: 'Dutch tavern conversation painting',
    descriptionRu:
      'Лукавый и человечный рассказ Симона Кармиггелта о безобидной житейской лжи, к которой люди прибегают не ради выгоды, а чтобы немного украсить серые будни или пощадить чувства близких.'
  },
  jdobDTsMSPg: {
    originalTitle: 'В Гааге (Kronkels)',
    genre: 'Городская проза',
    motif: 'hague_tram',
    palette: ['#151e24', '#283945', '#a8dadc'],
    artSearch: 'The Hague street vintage photography painting',
    descriptionRu:
      'Атмосферная прогулка по улицам и кафе Гааги вместе с Симоном Кармиггелтом, где случайный разговор за столиком приоткрывает целую человеческую драму с мягким голландским юмором.'
  },
  '6IvuGBY_04I': {
    originalTitle: 'Småpiker / Девочки',
    genre: 'Скандинавская классика',
    motif: 'nordic_meadow',
    palette: ['#19211b', '#2f4033', '#f2cc8f'],
    artSearch: 'Norwegian girls summer meadow painting',
    descriptionRu:
      'Психологически точный и нежный рассказ норвежского нобелевского лауреата Сигрид Унсет о мире детства, первых девичьих тайнах, радостях и горьких открытиях взросления.'
  },
  uvbSLbaHn_8: {
    originalTitle: 'На улице и дома (1975)',
    genre: 'Ироническая проза',
    motif: 'leningrad_courtyard',
    palette: ['#1c1a17', '#38342e', '#e9c46a'],
    artSearch: 'Leningrad courtyard vintage winter illustration',
    descriptionRu:
      'Блестящий рассказ Сергея Довлатова, построенный на контрасте уличных встреч, редакционных курьёзов и домашних диалогов, где за фирменной довлатовской лёгкостью и абсурдом проступает щемящая нежность к людям.'
  },
  k0WxAPSpBHE: {
    originalTitle: 'Дорога в новую квартиру',
    genre: 'Русская проза XX века',
    motif: 'moving_truck',
    palette: ['#1a1d24', '#303645', '#f4a261'],
    artSearch: 'Soviet city street tram 1970s painting',
    descriptionRu:
      'Ироничный и грустный рассказ Сергея Довлатова о переезде, смене декораций жизни и о том, что от самого себя и своей судьбы невозможно уехать даже по самой широкой дороге в новую квартиру.'
  },
  ywtUrcJ1kPU: {
    originalTitle: 'Виноград (Из книги «Наши», 1983)',
    genre: 'Автобиографическая проза',
    motif: 'autumn_grapes',
    palette: ['#211520', '#422840', '#b56576'],
    artSearch: 'Grapes still life basket painting',
    descriptionRu:
      'Один из лучших рассказов Сергея Довлатова о юности, нелепой подработке на овощебазе и первой влюблённости, написанный с неповторимой точностью фразы, мягкой самоиронией и светлой печалью.'
  },
  'ugpXy_g-myk': {
    originalTitle: 'Den heliga natten & Kejsarens syn (1904)',
    genre: 'Рождественские легенды',
    motif: 'christmas_ember',
    palette: ['#1f1410', '#45281c', '#ffb703'],
    artSearch: 'Nativity star night candle painting',
    descriptionRu:
      'Две классические евангельские легенды шведского нобелевского лауреата Сельмы Лагерлёф — о пастухе, которому горящие угли не обожгли рук в ночь Рождества благодаря состраданию, и о пророческом видении императора Августа на Капитолийском холме.'
  },
  yKYNxHhfqfM: {
    originalTitle: 'The Music on the Hill (1911)',
    genre: 'Мистическая новелла',
    motif: 'pan_flute_hill',
    palette: ['#162118', '#29402d', '#a3b18a'],
    artSearch: 'Pan Greek god forest hill painting',
    descriptionRu:
      'Изысканная и тревожная новелла английского мастера чёрного юмора Саки (Гектора Хью Манро): горожанка Сильвия приезжает в уединённое лесное поместье мужа и легкомысленно бросает вызов древнему языческому богу Пану, чья свирель всё ещё звучит на холмах.'
  },
  'O_-D7UST5cQ': {
    originalTitle: 'Kemuri no Hana / Цветы из дыма',
    genre: 'Научная фантастика',
    motif: 'smoke_flowers',
    palette: ['#181424', '#30264a', '#c77dff'],
    artSearch: 'Colorful smoke abstract art dark background',
    descriptionRu:
      'Поэтичный фантастический рассказ Сакё Комацу о далёкой планете Фальф, обитатели которой владеют эфемерным искусством выращивать в воздухе живые цветы и замки из цветного дыма, и о землянине, попытавшемся превратить это чудо в коммерческий товар.'
  },
  PXS5xjDQuqk: {
    originalTitle: 'Kaijū Gekimetsu / Уничтожение чудовищ',
    genre: 'Космическая фантастика',
    motif: 'alien_leviathan',
    palette: ['#101d24', '#1d3745', '#00f5d4'],
    artSearch: 'Alien planet monster retro sci-fi illustration',
    descriptionRu:
      'Остроумный научно-фантастический рассказ Сакё Комацу о колонизаторах чужой планеты, ведущих войну на истребление против гигантских местных чудовищ — пока не выясняется парадоксальная роль этих существ в эволюции разума.'
  },
  CtyQzypBHrQ: {
    originalTitle: 'Kami ka Kami ka / Бумага или волосы (1963)',
    genre: 'Сатирическая фантастика',
    motif: 'vanishing_paper',
    palette: ['#1f1c16', '#3d372b', '#f4d35e'],
    artSearch: 'Flying books paper tornado illustration',
    descriptionRu:
      'Блестящая сатирическая фантасмагория Сакё Комацу: из-за мутировавшего вируса за одну ночь в мире бесследно растворяется вся бумага — деньги, законы, архивы и книги, погружая бюрократическую цивилизацию в комический хаос.'
  },
  '8m8t9Q4RI2s': {
    originalTitle: 'Kubi ga ochita hanashi / Рассказ о том, как отвалилась голова (1917)',
    genre: 'Философская притча',
    motif: 'samurai_autumn',
    palette: ['#241414', '#4a2424', '#e63946'],
    artSearch: 'Samurai horse rider Japanese painting',
    descriptionRu:
      'Утончённая новелла классика японской литературы Рюноскэ Акутагавы о китайском солдате Хэ Сяо-эре, который, получив удар мечом в бою, мчится на коне вдоль тихой осенней реки и переживает глубокое внутреннее перерождение — прежде чем спустя годы его настигает эхо того давнего ранения.'
  },
  '0P7iYZb3_lM': {
    originalTitle: 'Ikkai no tsuchi / Ком земли (1924)',
    genre: 'Психологическая драма',
    motif: 'earth_clod',
    palette: ['#1e1914', '#3b3026', '#bc6c25'],
    artSearch: 'Japanese village fields vintage woodblock print',
    descriptionRu:
      'Реалистический шедевр Рюноскэ Акутагавы о крестьянской вдове О-Суми и её невестке О-Тами: история непосильного труда, самопожертвования и суровой привязанности к клочку родной земли, который забирает человеческие жизни и даёт им смысл.'
  },
  kHZsfw8tNHo: {
    originalTitle: "I'll Be Waiting (1939)",
    genre: 'Классический нуар',
    motif: 'noir_hotel_lobby',
    palette: ['#10121a', '#1e2436', '#e09f3e'],
    artSearch: '1930s Los Angeles hotel lobby noir illustration',
    descriptionRu:
      'Эталонный нуарный рассказ Рэймонда Чандлера: в ночном холле роскошного отеля «Уиндермир» детектив Тони Резек замечает рыжеволосую девушку Ив Кресy, терпеливо ждущую своего возлюбленного, за которым уже идут наёмные убийцы.'
  },
  'g1m51-zu7bQ': {
    originalTitle: 'The Runaway Lovers (1961)',
    genre: 'Готическая романтика',
    motif: 'gothic_carriage',
    palette: ['#1b111e', '#382040', '#f72585'],
    artSearch: 'Gothic castle lovers moonlight painting',
    descriptionRu:
      'Изящная готическая новелла американского стилиста Рэя Рассела о двух юных влюблённых, сбежавших от деспотичной власти, но схваченных на границе герцогства и приговорённых к самому изощрённому испытанию чувств.'
  },
  MspMHw6GVEA: {
    originalTitle: 'The Black Ferris (1948)',
    genre: 'Мистическая фантастика',
    motif: 'black_ferris',
    palette: ['#141122', '#282047', '#ff9f1c'],
    artSearch: 'Carnival Ferris wheel night dark illustration',
    descriptionRu:
      'Знаменитый рассказ Рэя Брэдбери, положивший начало роману «Надвигается беда»: мальчишки Питер и Хэнк следят за зловещим хозяином бродячего карнавала мистером Кугером, чьё чёрное колесо обозрения при вращении назад возвращает человеку детство, а вперёд — старость.'
  },
  hUNmNcSDS_w: {
    originalTitle: 'The Lake (1944)',
    genre: 'Поэтическая мистика',
    motif: 'sandcastle_lake',
    palette: ['#10212b', '#1e3f52', '#48cae4'],
    artSearch: 'Misty lake pier autumn sunset painting',
    descriptionRu:
      'Тот самый ранний рассказ, в котором Рэй Брэдбери обрёл свой неповторимый поэтический голос: повзрослевший Гарольд возвращается со своей невестой на осенний берег озера Мичиган, где десять лет назад утонула его детская любовь Тэлли.'
  },
  lKQSgLIQTK8: {
    originalTitle: 'Perhaps We Are Going Away (1962)',
    genre: 'Мистическая притча',
    motif: 'prairie_wind',
    palette: ['#211a12', '#453522', '#f4a261'],
    artSearch: 'American prairie twilight horizon painting',
    descriptionRu:
      'Тревожная и завораживающая притча Рэя Брэдбери о странном предчувствии, охватывающем старейшин индейского племени при виде зловещих знаков на горизонте, возвещающих конец прежнего мира.'
  },
  g8yFnzMjkxo: {
    originalTitle: 'День смерти / El Día de Muerte (1947)',
    genre: 'Философская новелла',
    motif: 'mexican_catrina',
    palette: ['#24121b', '#4a2035', '#ffbe0b'],
    artSearch: 'Mexican Day of the Dead marigold candles art',
    descriptionRu:
      'Яркая и глубокая новелла Рэя Брэдбери из мексиканского цикла, в которой карнавальное празднование Дня мёртвых с сахарными черепами и свечами переплетается с размышлением о бренности жизни и достоинстве перед лицом конца.'
  },
  wzj3OoqYQtE: {
    originalTitle: 'The Sunset Harp / Берег на закате',
    genre: 'Поэтическая фантастика',
    motif: 'sunset_mermaid',
    palette: ['#26151c', '#522838', '#ff758f'],
    artSearch: 'Ocean beach golden sunset waves painting',
    descriptionRu:
      'Меланхоличная фантазия Рэя Брэдбери о пустынном океанском побережье в лучах заходящего солнца, где на границе прибоя и сновидений оживают древние чудеса и несбывшиеся человеческие надежды.'
  },
  kYEoLukuEbI: {
    originalTitle: 'En La Noche (1952)',
    genre: 'Латиноамериканская новелла',
    motif: 'southern_night',
    palette: ['#121626', '#222b4d', '#f4a261'],
    artSearch: 'Warm tropical night balcony stars painting',
    descriptionRu:
      'Чувственная, напоенная ночным зноем и звуками южного города миниатюра Рэя Брэдбери о страсти, ревности и примирении супругов под бездонным звёздным небом.'
  },
  c82qPyJfhxg: {
    originalTitle: 'Harry (1955)',
    genre: 'Психологическая мистика',
    motif: 'rose_garden_ghost',
    palette: ['#1e1518', '#3d282e', '#f28482'],
    artSearch: 'English rose garden sunlit shadow painting',
    descriptionRu:
      'Шедевр британской мистической прозы Розмари Тимперли: маленькая приёмная девочка Кристина в солнечные дни разговаривает в саду с рыжеволосым «братом Гарри», которого никто кроме неё не видит — пока приёмная мать не узнаёт страшную правду о прошлом её семьи.'
  },
  eVapFLey9v0: {
    originalTitle: 'Blue Horse, Dancing Mountains (1995)',
    genre: 'Научное фэнтези',
    motif: 'blue_cyber_horse',
    palette: ['#0f1c2e', '#1d385c', '#4cc9f0'],
    artSearch: 'Glowing blue horse mountains fantasy art',
    descriptionRu:
      'Поэтический рассказ Роджера Желязны (номинант премии «Хьюго»): странник верхом на разумном полумеханическом инопланетном скакуне Синем Коне пересекает опасный горный хребет Танцующих Гор, чтобы сыграть в смертельную игру со слепым провидцем.'
  },
  'Do0PM-iSQDg': {
    originalTitle: 'Devil Car (1965)',
    genre: 'Кибер-вестерн',
    motif: 'devil_cadillac',
    palette: ['#241111', '#4d1f1f', '#ff4d4d'],
    artSearch: 'Desert highway muscle car sunset illustration',
    descriptionRu:
      'Культовый постапокалиптический рассказ Роджера Желязны: по бескрайней Великой Пустыне колесят одичавшие беспилотные автомобили, и Мёрдок на специально сконструированной бронированной машине с искусственным интеллектом Дженни охотится на неуловимую чёрную «Машину-дьявола», убившую его брата.'
  },
  olL2U9qRvcI: {
    originalTitle: 'The Bands of Titan (1962)',
    genre: 'Космическая фантастика',
    motif: 'saturn_titan',
    palette: ['#121329', '#252859', '#f7b801'],
    artSearch: 'Saturn rings Titan moon space art',
    descriptionRu:
      'Ранний научно-фантастический рассказ Роджера Желязны об исследовательской экспедиции у колец Сатурна и его спутника Титана, столкнувшейся с загадочным инопланетным феноменом, преобразующим свет, звук и само восприятие космоса.'
  },
  zc_0ka8fly8: {
    originalTitle: 'Corrida (1968)',
    genre: 'Научная фантастика',
    motif: 'cyber_bull',
    palette: ['#261010', '#521c1c', '#fca311'],
    artSearch: 'Spanish bullfighter arena dramatic painting',
    descriptionRu:
      'Яркая и напряжённая научно-фантастическая новелла Роджера Желязны: человек приходит в себя на раскалённом песке арены, но очень скоро осознаёт, что в этой футуристической корриде он вовсе не тореадор.'
  }
};

// ============================================================================
// Generate a Bespoke Literary Book Cover SVG for Every Story
// ============================================================================

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine = 22) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxCharsPerLine && cur) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur.trim());
  return lines.slice(0, 3);
}

function getMotifGraphic(motif, accent, id = '') {
  switch (motif) {
    case 'mask_mars':
      return `
        <circle cx="320" cy="148" r="76" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.35"/>
        <circle cx="320" cy="148" r="54" fill="${accent}" opacity="0.16"/>
        <path d="M262 135 Q320 102 378 135 Q368 182 320 170 Q272 182 262 135 Z" fill="none" stroke="${accent}" stroke-width="2.5"/>
        <ellipse cx="294" cy="144" rx="12" ry="7" fill="${accent}" opacity="0.85"/>
        <ellipse cx="346" cy="144" rx="12" ry="7" fill="${accent}" opacity="0.85"/>
      `;
    case 'infinite_book':
    case 'open_book_cafe':
      return `
        <polygon points="282,92 358,92 320,148" fill="none" stroke="${accent}" stroke-width="2" opacity="0.85"/>
        <polygon points="320,148 282,204 358,204" fill="${accent}" opacity="0.22" stroke="${accent}" stroke-width="2"/>
        <path d="M255 198 Q288 182 320 198 Q352 182 385 198" fill="none" stroke="${accent}" stroke-width="2.5"/>
        <circle cx="320" cy="148" r="74" fill="none" stroke="${accent}" stroke-width="1" opacity="0.3"/>
      `;
    case 'gothic_manor':
    case 'gothic_carriage':
    case 'creaking_stairs':
      return `
        <circle cx="355" cy="112" r="32" fill="${accent}" opacity="0.28"/>
        <path d="M250 205 L250 135 L275 100 L300 135 L320 90 L340 135 L365 100 L390 135 L390 205 Z" fill="none" stroke="${accent}" stroke-width="2.2"/>
        <path d="M318 90 L312 140 L326 170 L317 205" fill="none" stroke="#ff6b6b" stroke-width="2"/>
      `;
    case 'starship_aniara':
    case 'warp_portal':
    case 'saturn_titan':
    case 'venus_earth':
    case 'retro_rocket':
      return `
        <circle cx="320" cy="148" r="44" fill="${accent}" opacity="0.22" stroke="${accent}" stroke-width="2"/>
        <ellipse cx="320" cy="148" rx="94" ry="22" fill="none" stroke="${accent}" stroke-width="2" transform="rotate(-18 320 148)"/>
        <circle cx="255" cy="110" r="3" fill="#fff" opacity="0.8"/>
        <circle cx="395" cy="120" r="2.5" fill="#fff" opacity="0.7"/>
        <circle cx="370" cy="188" r="3.5" fill="${accent}"/>
      `;
    case 'black_ferris':
    case 'karma_wheel':
    case 'time_machine':
      return `
        <circle cx="320" cy="148" r="60" fill="none" stroke="${accent}" stroke-width="2.5"/>
        <circle cx="320" cy="148" r="10" fill="${accent}"/>
        <line x1="320" y1="88" x2="320" y2="208" stroke="${accent}" stroke-width="1.4" opacity="0.7"/>
        <line x1="260" y1="148" x2="380" y2="148" stroke="${accent}" stroke-width="1.4" opacity="0.7"/>
        <line x1="277" y1="105" x2="363" y2="191" stroke="${accent}" stroke-width="1.4" opacity="0.7"/>
        <line x1="363" y1="105" x2="277" y2="191" stroke="${accent}" stroke-width="1.4" opacity="0.7"/>
        <path d="M290 214 L320 148 L350 214" fill="none" stroke="${accent}" stroke-width="2.2"/>
      `;
    case 'warm_candle':
    case 'christmas_ember':
    case 'jerusalem_lantern':
      return `
        <circle cx="320" cy="124" r="46" fill="${accent}" opacity="0.2"/>
        <path d="M320 92 C334 114 332 134 320 140 C308 134 306 114 320 92 Z" fill="${accent}"/>
        <rect x="308" y="144" width="24" height="62" rx="4" fill="none" stroke="${accent}" stroke-width="2"/>
      `;
    case 'sakura_moon':
    case 'samurai_autumn':
    case 'crimson_katana':
      return `
        <circle cx="320" cy="146" r="56" fill="${accent}" opacity="0.28"/>
        <path d="M245 182 Q315 130 395 112" fill="none" stroke="#f7f2e7" stroke-width="2.5"/>
        <circle cx="295" cy="152" r="5" fill="${accent}"/>
        <circle cx="335" cy="134" r="6" fill="${accent}"/>
        <circle cx="368" cy="120" r="4.5" fill="${accent}"/>
      `;
    case 'tiger_eyes':
    case 'kitten_cosmos':
    case 'alien_leviathan':
      return `
        <circle cx="320" cy="148" r="68" fill="${accent}" opacity="0.1"/>
        <path d="M262 142 Q288 122 310 145 Q288 158 262 142 Z" fill="${accent}"/>
        <path d="M378 142 Q352 122 330 145 Q352 158 378 142 Z" fill="${accent}"/>
        <ellipse cx="287" cy="142" rx="3.5" ry="9" fill="#09080c"/>
        <ellipse cx="353" cy="142" rx="3.5" ry="9" fill="#09080c"/>
      `;
    case 'sealed_door':
    case 'locked_room':
    case 'silhouette_window':
    case 'window_oranges':
    case 'office_window':
      return `
        <rect x="282" y="88" width="76" height="122" rx="4" fill="${accent}" fill-opacity="0.14" stroke="${accent}" stroke-width="2.2"/>
        <line x1="320" y1="88" x2="320" y2="210" stroke="${accent}" stroke-width="1.4" opacity="0.6"/>
        <line x1="282" y1="148" x2="358" y2="148" stroke="${accent}" stroke-width="1.4" opacity="0.6"/>
        <circle cx="344" cy="156" r="4" fill="${accent}"/>
      `;
    case 'ligurian_sea':
    case 'normandy_waves':
    case 'autumn_sea_cliff':
    case 'sandcastle_lake':
    case 'sunset_mermaid':
    case 'dark_beach_fire':
    case 'lighthouse_fog':
      return `
        <circle cx="320" cy="132" r="38" fill="${accent}" opacity="0.28"/>
        <path d="M240 168 Q280 154 320 168 T400 168" fill="none" stroke="${accent}" stroke-width="2.4"/>
        <path d="M250 184 Q285 172 320 184 T390 184" fill="none" stroke="${accent}" stroke-width="1.8" opacity="0.75"/>
        <path d="M265 200 Q292 190 320 200 T375 200" fill="none" stroke="${accent}" stroke-width="1.4" opacity="0.5"/>
      `;
    case 'steam_train':
    case 'night_taxi':
    case 'highway_test':
    case 'devil_cadillac':
    case 'hague_tram':
    case 'moving_truck':
      return `
        <path d="M240 198 L305 118 L335 118 L400 198" fill="none" stroke="${accent}" stroke-width="2" opacity="0.55"/>
        <line x1="320" y1="122" x2="320" y2="202" stroke="${accent}" stroke-width="2" stroke-dasharray="6 5"/>
        <circle cx="295" cy="162" r="9" fill="${accent}"/>
        <circle cx="345" cy="162" r="9" fill="${accent}"/>
      `;
    default: {
      // Deterministic unique geometric constellation per story ID
      const code = (id.charCodeAt(0) || 65) + (id.charCodeAt(1) || 70);
      const r1 = 42 + (code % 22);
      const rot = (code * 17) % 90;
      return `
        <circle cx="320" cy="148" r="68" fill="none" stroke="${accent}" stroke-width="1.4" opacity="0.35"/>
        <circle cx="320" cy="148" r="${r1}" fill="${accent}" opacity="0.16"/>
        <rect x="286" y="114" width="68" height="68" fill="none" stroke="${accent}" stroke-width="1.8" transform="rotate(${rot} 320 148)"/>
        <path d="M268 188 Q320 108 372 188" fill="none" stroke="${accent}" stroke-width="2.2"/>
      `;
    }
  }
}

function generateCoverSvg(item, meta) {
  const [c1, c2, accent] = meta.palette || ['#14121d', '#2b243d', '#e5a95c'];
  const titleLines = wrapText(item.title, 24);
  const motifArt = getMotifGraphic(meta.motif, accent, item.id);

  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="320" y="${262 + i * 30}" text-anchor="middle" fill="#f7f2e7" font-family="'Cormorant Garamond', Georgia, serif" font-size="27" font-weight="700">${escapeXml(
          line
        )}</text>`
    )
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
  <defs>
    <linearGradient id="bg_${item.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="65%" stop-color="${c2}" />
      <stop offset="100%" stop-color="#09080c" />
    </linearGradient>
    <radialGradient id="glow_${item.id}" cx="50%" cy="42%" r="48%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.28" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="640" height="360" fill="url(#bg_${item.id})" />
  <rect width="640" height="360" fill="url(#glow_${item.id})" />

  <!-- Decorative Literary Frame -->
  <rect x="18" y="18" width="604" height="324" rx="10" fill="none" stroke="${accent}" stroke-opacity="0.28" stroke-width="1.2" />
  <rect x="24" y="24" width="592" height="312" rx="7" fill="none" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1" />

  <!-- Genre & Original Title Header -->
  <text x="320" y="50" text-anchor="middle" fill="${accent}" font-family="'Inter', sans-serif" font-size="11" font-weight="600" letter-spacing="2.5">${escapeXml(
    (meta.genre || 'КЛАССИЧЕСКАЯ ПРОЗА').toUpperCase()
  )}</text>

  <!-- Central Story Motif Artwork -->
  ${motifArt}

  <!-- Book Title & Author -->
  ${titleSvg}
  <text x="320" y="326" text-anchor="middle" fill="${accent}" font-family="'Inter', sans-serif" font-size="13.5" font-weight="500" letter-spacing="0.8">${escapeXml(
    item.author
  )} • ${escapeXml(meta.originalTitle || '')}</text>
</svg>`;
}

// ============================================================================
// Category, Theme, Region & Nobel Laureate Classification Engine
// ============================================================================

const NOBEL_AUTHORS = new Set([
  'Эйвинд Юнсон',
  'Томас Манн',
  'Эудженио Монтале',
  'Ясунари Кавабата',
  'Эрнест Хемингуэй',
  'Шмуэль Агнон',
  'Харри Мартинсон',
  'Сэмюэл Беккет',
  'Синклер Льюис',
  'Сигрид Унсет',
  'Сельма Лагерлёф',
  'Редьярд Киплинг',
  'Джозеф Редьярд Киплинг',
  'Рабиндранат Тагор',
  'Перл Бак',
  'Пер Лагерквист',
  'Пауль Хейзе',
  'Патрик Уайт',
  'Михаил Шолохов',
  'Мигель Астуриас',
  'Луиджи Пиранделло',
  'Кнут Гамсун',
  'Камило Хосе Села',
  'Йоханнес Йенсен',
  'Иосиф Бродский',
  'Иво Андрич',
  'Иван Бунин',
  'Жан Поль Сартр',
  'Джон Стейнбек',
  'Джон Голсуорси',
  'Грация Деледда',
  'Герта Мюллер',
  'Герман Гессе',
  'Генрих Бёлль',
  'Габриэль Гарсиа Маркес',
  'Владислав Реймонт',
  'Борис Пастернак',
  'Бертран Рассел',
  'Бернард Шоу',
  'Анатоль Франс',
  'Андре Жид',
  'Альбер Камю',
  'Александр Солженицын'
]);

const AUTHOR_REGION = {
  'Чарльз Фрич': 'США',
  'Эйвинд Юнсон': 'Скандинавия',
  'Шервуд Андерсон': 'США',
  'Харуки Мураками': 'Япония и Азия',
  'Харлан Эллисон и Альгис Будрис': 'США',
  'Томас Манн': 'Европа и Британия',
  'Туве Янссон': 'Скандинавия',
  'Франц Кафка': 'Европа и Британия',
  'Хорхе Луис Борхес': 'Латинская Америка',
  'Чингиз Айтматов': 'Русская и советская проза',
  'Эллен Кледжс': 'США',
  'Эудженио Монтале': 'Европа и Британия',
  'Хал Эллсон': 'США',
  'Ясунари Кавабата': 'Япония и Азия',
  'Юрий Яковлев': 'Русская и советская проза',
  'Хулио Кортасар': 'Латинская Америка',
  'Эдгар Аллан По': 'США',
  'Ясутаки Цуцуи': 'Япония и Азия',
  'Эрнест Хемингуэй': 'США',
  'Юха Маннеркорпи': 'Скандинавия',
  'Юрий Казаков': 'Русская и советская проза',
  'Ху Цянь': 'Япония и Азия',
  'Эйв Дэвидсон': 'США',
  'Эндрю Бенедикт': 'США',
  'Юкио Мисима': 'Япония и Азия',
  'Мисима Юкио': 'Япония и Азия',
  'Фазиль Искандер': 'Русская и советская проза',
  'Юрг Федершпиль': 'Европа и Британия',
  'Шмуэль Агнон': 'Япония и Азия',
  'Уильям Сароян': 'США',
  'Харри Мартинсон': 'Скандинавия',
  'Терри Пратчетт': 'Европа и Британия',
  'Теодор Томас': 'США',
  'Татьяна Толстая': 'Русская и советская проза',
  'Танит Ли': 'Европа и Британия',
  'Сэмюэл Беккет': 'Европа и Британия',
  'Стэнли Эллин': 'США',
  'Стивен Кинг': 'США',
  'Стивен Винсент Бене': 'США',
  'Стефан Цвейг': 'Европа и Британия',
  'Стефан Продев': 'Европа и Британия',
  'Стефан Вайнфельд': 'Европа и Британия',
  'Сомерсет Моэм': 'Европа и Британия',
  'Слай А. Аллес': 'Европа и Британия',
  'Синъити Хоси': 'Япония и Азия',
  'Синклер Льюис': 'США',
  'Симон Кармиггелт': 'Европа и Британия',
  'Сигрид Унсет': 'Скандинавия',
  'Сергей Довлатов': 'Русская и советская проза',
  'Сельма Лагерлёф': 'Скандинавия',
  'Саки (Гектор Хью Манро)': 'Европа и Британия',
  'Сакё Комацу': 'Япония и Азия',
  'Рюноскэ Акутагава': 'Япония и Азия',
  'Акутагава Рюноскэ': 'Япония и Азия',
  'Рэймонд Чандлер': 'США',
  'Рэй Рассел': 'США',
  'Рэй Брэдбери': 'США',
  'Розмари Тимперли': 'Европа и Британия',
  'Роджер Желязны': 'США',
  'Роберт Янг': 'США',
  'Роберт Франклин Янг': 'США',
  'Роберт Шекли': 'США',
  'Роберт Силверберг': 'США',
  'Роберт Льюис Стивенсон': 'Европа и Британия',
  'Роберт Ирвин Говард': 'США',
  'Говард Роберт Ирвин': 'США',
  'Роберт Блох': 'США',
  'Роальд Дал': 'Европа и Британия',
  'Ричард Мэтисон': 'США',
  'Ричард Катровас': 'США',
  'Ричард Бах': 'США',
  'Рид Грачев': 'Русская и советская проза',
  'Редьярд Киплинг': 'Европа и Британия',
  'Джозеф Редьярд Киплинг': 'Европа и Британия',
  'Рафаэл Лафферти': 'США',
  'Рабиндранат Тагор': 'Япония и Азия',
  'Пол Андерсон': 'США',
  'Пол Андресон': 'США',
  'Питер Акройд': 'Европа и Британия',
  'Пирс Энтони': 'США',
  'Петр Гнедич': 'Русская и советская проза',
  'Перл Бак': 'США',
  'Пер Лагерквист': 'Скандинавия',
  'Пауль Хейзе': 'Европа и Британия',
  'Патрик Уайт': 'Европа и Британия',
  'Патрик Зюскинд': 'Европа и Британия',
  'Оскар Уайльд': 'Европа и Британия',
  'Олдокс Хаксли': 'Европа и Британия',
  'Огюст де Вилье де Лиль-Адан': 'Европа и Британия',
  'О. Генри': 'США',
  'Нодар Думбадзе': 'Русская и советская проза',
  'Нина Садур': 'Русская и советская проза',
  'Ник Хорнби': 'Европа и Британия',
  'Найо Марш': 'Европа и Британия',
  'Мюррей Лейнстер': 'США',
  'Михаэль Энде': 'Европа и Британия',
  'Михаил Шолохов': 'Русская и советская проза',
  'Михаил Веллер': 'Русская и советская проза',
  'Михаил Булгаков': 'Русская и советская проза',
  'Михаил Арцыбашев': 'Русская и советская проза',
  'Мигель де Унамуно': 'Европа и Британия',
  'Мигель де Сервантес': 'Европа и Британия',
  'Мигель Астуриас': 'Латинская Америка',
  'Мартин Гарднер': 'США',
  'Максим Горький': 'Русская и советская проза',
  'Людмила Улицкая': 'Русская и советская проза',
  'Людмила Петрушевская': 'Русская и советская проза',
  'Луис Сепульведа': 'Латинская Америка',
  'Луиджи Пиранделло': 'Европа и Британия',
  'Луиджи Малерба': 'Европа и Британия',
  'Лоуренс Блок': 'США',
  'Лоис Макмастер Буджолд': 'США',
  'Лино Альдани': 'Европа и Британия',
  'Ли Киллоу': 'США',
  'Ли Голян': 'Япония и Азия',
  'Ли Брекетт': 'США',
  'Лестер дель Рей': 'США',
  'Леонид Андреев': 'Русская и советская проза',
  'Лео Перуц': 'Европа и Британия',
  'Леннокс Робинсон': 'Европа и Британия',
  'Лев Кассиль': 'Русская и советская проза',
  'Ларс Густаффсон': 'Скандинавия',
  'Ларри Нивен': 'США',
  'Кэтрин Энн Портер': 'США',
  'Кэролайн Черри': 'США',
  'Курт Воннегут': 'США',
  'Константин Симонов': 'Русская и советская проза',
  'Константин Победин': 'Русская и советская проза',
  'Константин Паустовский': 'Русская и советская проза',
  'Константин Паустовский': 'Русская и советская проза',
  'Кобо Абэ': 'Япония и Азия',
  'Кнут Гамсун': 'Скандинавия',
  'Клиффорд Саймак': 'США',
  'Клайв Баркер': 'Европа и Британия',
  'Кит Ломер': 'США',
  'Карлос Фуэнтес': 'Латинская Америка',
  'Карло Эмилио Гадда': 'Европа и Британия',
  'Карл Густав Юнг': 'Европа и Британия',
  'Карл Ганс Штробль': 'Европа и Британия',
  'Карен Джой Фаулер': 'США',
  'Камило Хосе Села': 'Европа и Британия',
  'К. М. О’Доннелл': 'США',
  'Йоханнес Йенсен': 'Скандинавия',
  'Исабель Альенде': 'Латинская Америка',
  'Ирина Полянская': 'Русская и советская проза',
  'Ирвин Шоу': 'США',
  'Иосиф Бродский': 'Русская и советская проза',
  'Илья Туричин': 'Русская и советская проза',
  'Игнасио Альдекоа': 'Европа и Британия',
  'Иво Андрич': 'Европа и Британия',
  'Ивлин Во': 'Европа и Британия',
  'Иван Бунин': 'Русская и советская проза',
  'Зенна Хендерсон': 'США',
  'Жюль Ренар': 'Европа и Британия',
  'Жюль Верн': 'Европа и Британия',
  'Жерар Клейн': 'Европа и Британия',
  'Жан Рэй': 'Европа и Британия',
  'Жан Поль Сартр': 'Европа и Британия',
  'Жак Стернберг': 'Европа и Британия',
  'Ефим Зозуля': 'Русская и советская проза',
  'Евгений Стаховский': 'Русская и советская проза',
  'Евгений Замятин': 'Русская и советская проза',
  'Евгений Евтушенко': 'Русская и советская проза',
  'Дэнни Плэчта': 'США',
  'Дуглас Адамс': 'Европа и Британия',
  'Дорис Дёрри': 'Европа и Британия',
  'Дональд Уэстлейк': 'США',
  'Дональд Бартельми': 'США',
  'Дино Буццати': 'Европа и Британия',
  'Дин Кунц': 'США',
  'Джулиан Барнс': 'Европа и Британия',
  'Джон Энтони': 'США',
  'Джон Чивер': 'США',
  'Джон Фаулз': 'Европа и Британия',
  'Джон Стейнбек': 'США',
  'Джон Лутц': 'США',
  'Джон Кристофер': 'Европа и Британия',
  'Джон Кольер': 'Европа и Британия',
  'Джон Голсуорси': 'Европа и Британия',
  'Джойс Кэри': 'Европа и Британия',
  'Джо Холдеман': 'США',
  'Джо Горс': 'США',
  'Джин Вулф': 'США',
  'Джером Клапка Джером': 'Европа и Британия',
  'Джером Дэвид Сэлинджер': 'США',
  'Джек Лондон': 'США',
  'Джеймс Планкетт': 'Европа и Британия',
  'Джеймс Блиш': 'США',
  'Джеймс Баллард': 'Европа и Британия',
  'Деймон Найт': 'США',
  'Дафна Дюморье': 'Европа и Британия',
  'Густав Майринк': 'Европа и Британия',
  'Густаво Адольфо Беккер': 'Европа и Британия',
  'Грэм Свифт': 'Европа и Британия',
  'Грей Бир': 'США',
  'Грация Деледда': 'Европа и Британия',
  'Гордон Диксон': 'США',
  'Говард Филлипс Лавкрафт': 'США',
  'Грант Аллен': 'Европа и Британия',
  'Гилберт Кит Честертон': 'Европа и Британия',
  'Глеб Алексеев': 'Русская и советская проза',
  'Ги де Мопассан': 'Европа и Британия',
  'Герта Мюллер': 'Европа и Британия',
  'Герман Гессе': 'Европа и Британия',
  'Герберт Франке': 'Европа и Британия',
  'Герберт Уэллс': 'Европа и Британия',
  'Генрих Бёлль': 'Европа и Британия',
  'Генри Слезар': 'США',
  'Геннадий Семенихин': 'Русская и советская проза',
  'Ганс Эрих Носсак': 'Европа и Британия',
  'Ганс Гейнц Эверс': 'Европа и Британия',
  'Габриэль Гарсиа Маркес': 'Латинская Америка',
  'Всеволод Иванов': 'Русская и советская проза',
  'Вольфдитрих Шнурре': 'Европа и Британия',
  'Вейо Мери': 'Скандинавия',
  'Варлам Шаламов': 'Русская и советская проза',
  'Вольфганг Борхерт': 'Европа и Британия',
  'Владислав Реймонт': 'Европа и Британия',
  'Владимир Набоков': 'Русская и советская проза',
  'Владимир Богомолов': 'Русская и советская проза',
  'Винсент Старретт': 'США',
  'Вильгельм Гауф': 'Европа и Британия',
  'Виктор Пелевин': 'Русская и советская проза',
  'Виктор Аус': 'Русская и советская проза',
  'Викентий Вересаев': 'Русская и советская проза',
  'Василь Быков': 'Русская и советская проза',
  'Василий Шукшин': 'Русская и советская проза',
  'Василий Гроссман': 'Русская и советская проза',
  'Булат Окуджава': 'Русская и советская проза',
  'Брэм Стокер': 'Европа и Британия',
  'Брет Гарт': 'США',
  'Брайт Чак': 'США',
  'Брайан Олдисс': 'Европа и Британия',
  'Борис Пастернак': 'Русская и советская проза',
  'Борис Виан': 'Европа и Британия',
  'Болеслав Прус': 'Европа и Британия',
  'Богумил Грабал': 'Европа и Британия',
  'Боб Шоу': 'Европа и Британия',
  'Амброз Бирс': 'США',
  'Билл Бикел': 'США',
  'Бертран Рассел': 'Европа и Британия',
  'Александр Закгейм': 'Русская и советская проза',
  'Бертрам Чандлер': 'США',
  'Бернард Маламуд': 'США',
  'Бертольд Брехт': 'Европа и Британия',
  'Бернард Шоу': 'Европа и Британия',
  'Артур Чарльз Кларк': 'Европа и Британия',
  'Артур Конан Дойл': 'Европа и Британия',
  'Аркадий Аверченко': 'Русская и советская проза',
  'Антуан де Сент-Экзюпери': 'Европа и Британия',
  'Антонио Табукки': 'Европа и Британия',
  'Антонио де Труэба': 'Европа и Британия',
  'Анри Барбюс': 'Европа и Британия',
  'Анна Гавальд': 'Европа и Британия',
  'Андрей Синявский': 'Русская и советская проза',
  'Андрей Платонов': 'Русская и советская проза',
  'Андре Моруа': 'Европа и Британия',
  'Анатоль Франс': 'Европа и Британия',
  'Андре Жид': 'Европа и Британия',
  'Аманда Дэвис': 'США',
  'Альфред Ван Вогт': 'США',
  'Альфред Бестер': 'США',
  'Альберто Моравиа': 'Европа и Британия',
  'Альбер Камю': 'Европа и Британия',
  'Алексей Пантелеев': 'Русская и советская проза',
  'Александр Солженицын': 'Русская и советская проза',
  'Александр Куприн': 'Русская и советская проза',
  'Алан Маршал': 'Европа и Британия',
  'Айзек Азимов': 'США',
  'Адольфо Биой Касарес': 'Латинская Америка',
  'Агота Кристоф': 'Европа и Британия',
  'Японский квайдан': 'Япония и Азия'
};

const SCIFI_AUTHORS = new Set([
  'Роберт Янг', 'Роберт Франклин Янг', 'Роберт Шекли', 'Роберт Силверберг',
  'Ричард Мэтисон', 'Рафаэл Лафферти', 'Пол Андерсон', 'Пол Андресон',
  'Пирс Энтони', 'Олдокс Хаксли', 'Мюррей Лейнстер', 'Лоис Макмастер Буджолд',
  'Лино Альдани', 'Ли Киллоу', 'Ли Брекетт', 'Лестер дель Рей', 'Ларри Нивен',
  'Кэролайн Черри', 'Курт Воннегут', 'Клиффорд Саймак', 'Кит Ломер', 'К. М. О’Доннелл',
  'Зенна Хендерсон', 'Жюль Верн', 'Жерар Клейн', 'Жак Стернберг', 'Дэнни Плэчта',
  'Дуглас Адамс', 'Джон Энтони', 'Джон Кристофер', 'Джо Холдеман', 'Джин Вулф',
  'Джеймс Блиш', 'Джеймс Баллард', 'Деймон Найт', 'Грей Бир', 'Гордон Диксон',
  'Герберт Франке', 'Герберт Уэллс', 'Брайан Олдисс', 'Боб Шоу', 'Бертрам Чандлер',
  'Артур Чарльз Кларк', 'Альфред Ван Вогт', 'Альфред Бестер', 'Айзек Азимов',
  'Рэй Брэдбери', 'Роджер Желязны', 'Сакё Комацу', 'Синъити Хоси', 'Ясутаки Цуцуи'
]);

const HORROR_MYSTIC_AUTHORS = new Set([
  'Говард Филлипс Лавкрафт', 'Стивен Кинг', 'Роберт Блох', 'Роберт Льюис Стивенсон',
  'Роберт Ирвин Говард', 'Говард Роберт Ирвин', 'Огюст де Вилье де Лиль-Адан',
  'Нина Садур', 'Лео Перуц', 'Клайв Баркер', 'Карл Ганс Штробль', 'Жан Рэй',
  'Дин Кунц', 'Джон Кольер', 'Дафна Дюморье', 'Густав Майринк',
  'Густаво Адольфо Беккер', 'Ганс Гейнц Эверс', 'Вильгельм Гауф', 'Брэм Стокер',
  'Амброз Бирс', 'Японский квайдан', 'Эдгар Аллан По', 'Танит Ли', 'Розмари Тимперли'
]);

const NOIR_CRIME_AUTHORS = new Set([
  'Роальд Дал', 'Найо Марш', 'Лоуренс Блок', 'Дональд Уэстлейк', 'Джон Лутц',
  'Джо Горс', 'Гилберт Кит Честертон', 'Генри Слезар', 'Винсент Старретт',
  'Артур Конан Дойл', 'Стэнли Эллин', 'Рэймонд Чандлер', 'Грант Аллен'
]);

const IRONY_CITY_AUTHORS = new Set([
  'Сергей Довлатов', 'Симон Кармиггелт', 'Уильям Сароян', 'Терри Пратчетт',
  'О. Генри', 'Нодар Думбадзе', 'Ник Хорнби', 'Михаил Веллер', 'Джером Клапка Джером',
  'Аркадий Аверченко', 'Богумил Грабал', 'Ивлин Во', 'Саки (Гектор Хью Манро)',
  'Ефим Зозуля', 'Билл Бикел', 'Мартин Гарднер', 'Дональд Бартельми'
]);

const PARABLE_MAGIC_AUTHORS = new Set([
  'Хорхе Луис Борхес', 'Хулио Кортасар', 'Габриэль Гарсиа Маркес', 'Исабель Альенде',
  'Карлос Фуэнтес', 'Мигель Астуриас', 'Луис Сепульведа', 'Адольфо Биой Касарес',
  'Франц Кафка', 'Герман Гессе', 'Дино Буццати', 'Кобо Абэ', 'Харуки Мураками',
  'Михаэль Энде', 'Ричард Бах', 'Пер Лагерквист', 'Виктор Пелевин', 'Андрей Синявский',
  'Оскар Уайльд', 'Анатоль Франс', 'Бертран Рассел', 'Карл Густав Юнг', 'Борис Виан'
]);

const PALETTES_BY_STYLE = {
  scifi: [
    ['#0c182c', '#18345e', '#5cd6ff'],
    ['#12132e', '#262861', '#88a2ff'],
    ['#0a2129', '#144452', '#4ee6c4'],
    ['#1b132b', '#362259', '#c282ff']
  ],
  mystic: [
    ['#170f1c', '#331b3f', '#d972ff'],
    ['#1c1014', '#401b24', '#ff6b7b'],
    ['#0f171a', '#1d3138', '#75d4c6'],
    ['#1a1510', '#382c1e', '#e8a856']
  ],
  noir: [
    ['#12141a', '#242936', '#f0b254'],
    ['#1a1215', '#362028', '#ff7a6b'],
    ['#101820', '#1f3142', '#70b5f9']
  ],
  irony: [
    ['#1a1612', '#382d20', '#f5b963'],
    ['#141c18', '#263b30', '#7ed9a6'],
    ['#1c1624', '#352847', '#f09ce3']
  ],
  parable: [
    ['#171326', '#2f254f', '#eab66a'],
    ['#121f24', '#213f4a', '#6ad7e8'],
    ['#211612', '#452c22', '#f29d6b']
  ],
  drama: [
    ['#16141f', '#2d2740', '#e5a95c'],
    ['#121a21', '#223545', '#82c0eb'],
    ['#1f1518', '#3d262d', '#eb96a4'],
    ['#171c16', '#2b3829', '#a6d696']
  ]
};

const MOTIFS_POOL = ['cosmos', 'skull', 'city', 'clock', 'forest', 'sea', 'eye', 'book', 'heart', 'train', 'bird', 'mask'];

export function inferStoryMeta(item) {
  if (STORIES_DB[item.id]) {
    return STORIES_DB[item.id];
  }

  const author = item.author || 'Dionysus';
  const title = item.title || 'Рассказ';
  const tl = title.toLowerCase();
  const hash = Array.from(item.id || title).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  let style = 'drama';
  let genre = 'Классическая и психологическая проза';
  let motif = MOTIFS_POOL[hash % MOTIFS_POOL.length];

  if (SCIFI_AUTHORS.has(author) || /косм|марс|планет|звезд|звёзд|мутант|робот|галактик|корабл|астероид|будущ|машин|молекул/i.test(tl)) {
    style = 'scifi';
    genre = 'Научная фантастика';
    motif = /время|час|ждат|вчера/i.test(tl) ? 'clock' : 'cosmos';
  } else if (HORROR_MYSTIC_AUTHORS.has(author) || /кошмар|призрак|мертв|мёртв|ужас|тьм|колдун|чароде|ведьм|дьявол|проклят|череп|кров|ноч|монстр|зомби|квайдан/i.test(tl)) {
    style = 'mystic';
    genre = 'Мистика, готика и тёмная проза';
    motif = /лес|дерев|сад/i.test(tl) ? 'forest' : /глаз|взгляд|сон/i.test(tl) ? 'eye' : 'skull';
  } else if (NOIR_CRIME_AUTHORS.has(author) || /убийств|сыщик|детектив|преступ|вор|пистолет|выстрел|суд|алиби|труп|жертв/i.test(tl)) {
    style = 'noir';
    genre = 'Остросюжетный детектив и нуар';
    motif = 'city';
  } else if (IRONY_CITY_AUTHORS.has(author) || /анекдот|шутк|смеш|дамы|кошк|щенок|индюк|сковородк|блондин/i.test(tl)) {
    style = 'irony';
    genre = 'Ироническая и городская новелла';
    motif = 'city';
  } else if (PARABLE_MAGIC_AUTHORS.has(author) || /сказк|легенд|притч|ангел|бог|лили|зеркал|лабиринт|сон|тень/i.test(tl)) {
    style = 'parable';
    genre = 'Философская притча и магический реализм';
    motif = 'book';
  } else {
    if (/мор[ея]|океан|остров|корабл|берег|река/i.test(tl)) motif = 'sea';
    else if (/любов|сердц|женщин|девушк|невест|поцелу/i.test(tl)) motif = 'heart';
    else if (/поезд|дорог|вокзал|улиц|путь/i.test(tl)) motif = 'train';
    else if (/птиц|лебед|воро[нб]|крыл/i.test(tl)) motif = 'bird';
    else if (/лес|сад|осен|снег|холм|поле/i.test(tl)) motif = 'forest';
    else motif = 'book';
  }

  const palettes = PALETTES_BY_STYLE[style] || PALETTES_BY_STYLE.drama;
  const palette = palettes[hash % palettes.length];
  const isNobel = NOBEL_AUTHORS.has(author);
  const region = AUTHOR_REGION[author] || 'Европа и Британия';

  let descriptionRu = '';
  if (style === 'scifi') {
    descriptionRu = `Научно-фантастический рассказ «${title}» мастера жанра (${author}). История исследует столкновение человека с неизведанным космосом, парадоксами времени и технологиями будущего, проверяющими границы разума и человечности.`;
  } else if (style === 'mystic') {
    descriptionRu = `Атмосферная мистическая новелла «${title}» (${author}). Напряжённое повествование на грани реальности и потустороннего кошмара, где древние тайны, рок и скрытые страхи проступают сквозь привычный мир.`;
  } else if (style === 'noir') {
    descriptionRu = `Остросюжетная криминально-психологическая история «${title}» (${author}) с неожиданным финальным поворотом, тонким расчётом, иронией судьбы и безупречно выстроенной интригой.`;
  } else if (style === 'irony') {
    descriptionRu = `Тонкая, наблюдательная и ироничная новелла «${title}» (${author}). Зарисовка о парадоксах повседневной жизни, человеческих слабостях, живом юморе и светлой грусти за фасадом обыденных встреч.`;
  } else if (style === 'parable') {
    descriptionRu = `Глубокая философская новелла-притча «${title}» (${author}${isNobel ? ', лауреат Нобелевской премии по литературе' : ''}). Метафорическое размышление о природе памяти, иллюзий, времени и тайных законах человеческой судьбы.`;
  } else {
    descriptionRu = `Пронзительное произведение классической прозы «${title}» (${author}${isNobel ? ', лауреат Нобелевской премии по литературе' : ''}, ${region}). Глубокая психологическая драма о нравственном выборе, любви, памяти и хрупкости человеческих судеб в исполнении Евгения Стаховского.`;
  }

  return {
    originalTitle: `${author} — «${title}»`,
    genre,
    motif,
    palette,
    artSearch: `${author} writer portrait`,
    descriptionRu
  };
}

export function classifyStoryCategories(item, meta) {
  const genre = (meta.genre || item.genre || '').toLowerCase();
  const desc = (meta.descriptionRu || item.descriptionRu || '').toLowerCase();
  const author = item.author || '';

  // 1. Primary Category (by Genre & Plot)
  let categoryId = 'drama';
  let categoryName = 'Психологическая драма и Классика';

  if (
    genre.includes('фантаст') ||
    genre.includes('косм') ||
    genre.includes('постапокал') ||
    genre.includes('кибер')
  ) {
    categoryId = 'scifi';
    categoryName = 'Научная фантастика и Будущее';
  } else if (
    genre.includes('хоррор') ||
    genre.includes('готич') ||
    genre.includes('мистич') ||
    genre.includes('мистика') ||
    genre.includes('тёмн') ||
    genre.includes('триллер')
  ) {
    categoryId = 'mystic_horror';
    categoryName = 'Мистика, Хоррор и Готика';
  } else if (genre.includes('нуар') || genre.includes('детектив') || genre.includes('криминал')) {
    categoryId = 'noir_crime';
    categoryName = 'Нуар, Детектив и Криминал';
  } else if (
    genre.includes('ирони') ||
    genre.includes('юмор') ||
    genre.includes('амстердам') ||
    genre.includes('городск') ||
    author === 'Сергей Довлатов' ||
    author === 'Симон Кармиггелт' ||
    author === 'Уильям Сароян' ||
    author === 'Терри Пратчетт'
  ) {
    categoryId = 'irony_city';
    categoryName = 'Ирония, Юмор и Городские истории';
  } else if (
    genre.includes('притч') ||
    genre.includes('магическ') ||
    genre.includes('экзистенц') ||
    genre.includes('антиутоп') ||
    genre.includes('легенд') ||
    genre.includes('фэнтези') ||
    genre.includes('философ')
  ) {
    categoryId = 'parable_magic';
    categoryName = 'Философские притчи и Магический реализм';
  }

  // 2. Thematic tags derived from Russian description & plot
  const themes = [];
  if (/косм|планет|марс|сатурн|титан|звёзд|звезд|корабл|пришел|вселенн|телепорт|будущ/i.test(desc)) {
    themes.push('Космос и иные миры');
  }
  if (/призрак|привиден|ведьм|дьявол|проклят|зеркал|кладбищ|мертв|мёртв|ужас|кошмар|мистич|потусторон/i.test(desc)) {
    themes.push('Тайна и сверхъестественное');
  }
  if (/одиноч|мегаполис|отел|кафе|такси|квартир|улиц|город|комнат/i.test(desc)) {
    themes.push('Одиночество и город');
  }
  if (/любов|влюблен|влюблён|невест|брак|ревность|чувств|сердц|женщин|девушк/i.test(desc)) {
    themes.push('Любовь и отношения');
  }
  if (/детств|мальчик|девочк|сын|сестр|взрослен|воспоминан|памят|прошл/i.test(desc)) {
    themes.push('Память и детство');
  }
  if (/войн|фронт|солдат|десант|батаре|бо[йю]|катастроф|апокалипс/i.test(desc)) {
    themes.push('Война и испытания');
  }
  if (/убий|преступ|киллер|детектив|наказан|суд|испытан|месть|алчност/i.test(desc)) {
    themes.push('Преступление и расплата');
  }
  if (/ирон|юмор|шутк|смешн|абсурд|курьёз|лукав|сатир/i.test(desc)) {
    themes.push('Тонкая ирония и сатира');
  }
  if (themes.length === 0) {
    themes.push('Судьба и выбор');
  }

  const region = AUTHOR_REGION[author] || 'Европа и Британия';
  const isNobelLaureate = NOBEL_AUTHORS.has(author);

  return {
    categoryId,
    categoryName,
    themes,
    region,
    isNobelLaureate
  };
}

// ============================================================================
// Query Wikimedia Commons for Unique Original/Archival Artwork
// ============================================================================

const usedUrls = new Set();

async function queryCommonsOnce(q) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
    `filetype:bitmap ${q}`
  )}&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=640&format=json`;

  const resp = await fetch(url, {
    headers: { 'User-Agent': 'DionysusAudiobookLibrary/1.0 (https://localhost:3456)' }
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
  for (const p of pages) {
    const thumb = p?.imageinfo?.[0]?.thumburl || p?.imageinfo?.[0]?.url;
    const titleLower = (p?.title || '').toLowerCase();
    if (
      thumb &&
      !usedUrls.has(thumb) &&
      /\.(jpg|jpeg|png|webp)$/i.test(thumb.split('?')[0]) &&
      !thumb.toLowerCase().includes('.pdf') &&
      !thumb.toLowerCase().includes('.djvu') &&
      !titleLower.endsWith('.pdf') &&
      !titleLower.endsWith('.djvu') &&
      !titleLower.includes('logo') &&
      !titleLower.includes('icon') &&
      !titleLower.includes('signature') &&
      !titleLower.includes('map') &&
      !titleLower.includes('maske')
    ) {
      usedUrls.add(thumb);
      return thumb;
    }
  }
  return null;
}

async function searchWikimediaImage(query, fallbackAuthor = '') {
  try {
    const clean = query.replace(/\b(illustration|painting|vintage|photography|art)\b/gi, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const candidates = [
      query,
      words.slice(0, 3).join(' '),
      words.slice(0, 2).join(' ') + ' painting',
      words.slice(0, 2).join(' '),
      fallbackAuthor
    ].filter(Boolean);

    for (const c of candidates) {
      const found = await queryCommonsOnce(c);
      if (found) return found;
    }
  } catch (e) {
    // Ignore network error and fallback to generated SVG cover
  }
  return null;
}

async function main() {
  await fs.mkdir(COVERS_DIR, { recursive: true });
  const catalog = JSON.parse(await fs.readFile(CATALOG_PATH, 'utf8'));

  console.log(`Enriching ${catalog.items.length} stories with Russian descriptions, original artwork & generated covers...`);

  const BATCH_SIZE = 25;
  for (let i = 0; i < catalog.items.length; i += BATCH_SIZE) {
    const slice = catalog.items.slice(i, i + BATCH_SIZE);
    await Promise.all(
      slice.map(async (item) => {
        const meta = inferStoryMeta(item);

        // 1. Write custom illustrated SVG cover
        const svgContent = generateCoverSvg(item, meta);
        const svgPath = path.join(COVERS_DIR, `${item.id}.svg`);
        await fs.writeFile(svgPath, svgContent, 'utf8');
        const generatedCoverUrl = `/covers/${item.id}.svg`;
        const youtubeThumbnailUrl = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;

        // 2. Keep Wikimedia Commons archival art if already resolved, or use Dionysus curated painting thumbnail
        const existingWiki =
          item.originalCoverUrl &&
          item.originalCoverUrl.startsWith('http') &&
          !item.originalCoverUrl.includes('i.ytimg.com') &&
          !item.originalCoverUrl.toLowerCase().includes('.pdf') &&
          !item.originalCoverUrl.toLowerCase().includes('.djvu') &&
          !item.originalCoverUrl.toLowerCase().includes('maske')
            ? item.originalCoverUrl
            : null;
        const primaryCover = existingWiki || youtubeThumbnailUrl;

        const classification = classifyStoryCategories(item, meta);

        item.originalTitle = meta.originalTitle;
        item.genre = meta.genre;
        item.categoryId = classification.categoryId;
        item.categoryName = classification.categoryName;
        item.themes = classification.themes;
        item.region = classification.region;
        item.isNobelLaureate = classification.isNobelLaureate;
        item.narrator = 'Евгений Стаховский';
        item.descriptionRu = meta.descriptionRu;
        item.description = meta.descriptionRu;
        item.generatedCoverUrl = generatedCoverUrl;
        item.originalCoverUrl = primaryCover;
        item.youtubeThumbnailUrl = youtubeThumbnailUrl;
        item.thumbnailUrl = primaryCover;
        item.highResThumbnail = primaryCover;
      })
    );
  }

  catalog.updatedAt = new Date().toISOString();
  await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Successfully updated data/catalog.json (${catalog.items.length} stories) and public/covers/*.svg!`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
