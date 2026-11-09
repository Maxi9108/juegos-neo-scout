// Master Bank of Scout Questions & Answers + Automatic Generator + Weekly Rotation Engine

export const SCOUT_RAMAS = [
  { id: 'todas', name: 'Todas las Ramas', emoji: '⚜️', color: '#F59E0B' },
  { id: 'castores', name: 'Castores (5-7 años)', emoji: '🦫', color: '#38BDF8' },
  { id: 'manada', name: 'Manada / Lobatos (7-11 años)', emoji: '🐺', color: '#FBBF24' },
  { id: 'unidad', name: 'Unidad / Tropa Scout (11-14 años)', emoji: '⛺', color: '#10B981' },
  { id: 'caminantes', name: 'Caminantes / Pioneros (14-17 años)', emoji: '🧭', color: '#0284C7' },
  { id: 'rovers', name: 'Rovers (17-21 años)', emoji: '🚣', color: '#EF4444' },
  { id: 'adultos', name: 'Educadores / Dirigentes / Familia', emoji: '🔥', color: '#8B5CF6' }
];

export const DEFAULT_QUESTIONS = [
  // =====================================================================
  // 1. CABUYERÍA Y PIONERISMO (Kabu el Castor 🦫)
  // =====================================================================
  {
    id: 'cab-1',
    category: 'cabuyeria',
    rama: 'todas',
    question: '¿Para qué sirve principalmente el nudo As de Guía (Bowline)?',
    options: [
      'Para unir dos sogas de diferente grosor',
      'Hacer una gaza fija que no se corre ni se aprieta bajo carga',
      'Iniciar un amarre cuadrado en un mástil',
      'Rematar la punta de una cuerda deshilachada'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El As de Guía es el rey de los nudos: crea una gaza fija y segura que no se corre bajo tensión y es fácil de desatar tras recibir carga.'
  },
  {
    id: 'cab-2',
    category: 'cabuyeria',
    rama: 'todas',
    question: '¿Qué nudo se utiliza por excelencia para iniciar la mayoría de los amarres de pionerismo?',
    options: [
      'Nudo Llano o Rizo',
      'Nudo Ocho',
      'Nudo Ballestrinque',
      'Nudo Pescador'
    ],
    correctAnswer: 2,
    difficulty: 'facil',
    explanation: 'El Ballestrinque es el nudo base para iniciar y rematar la mayoría de los amarres (cuadrado, redondo, etc.).'
  },
  {
    id: 'cab-3',
    category: 'cabuyeria',
    rama: 'unidad',
    question: '¿Cómo se llama el extremo libre de una cuerda con el que se maniobra o se hace el nudo?',
    options: [
      'Chicote',
      'Firme',
      'Seno',
      'Mena'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'El chicote es la punta libre de la cuerda, el firme es la parte larga principal y el seno es el arco o doblez formado en ella.'
  },
  {
    id: 'cab-4',
    category: 'cabuyeria',
    rama: 'caminantes',
    question: '¿Qué amarre debes utilizar cuando dos maderos se cruzan y tienden a separarse en diagonal?',
    options: [
      'Amarre Cuadrado',
      'Amarre Diagonal',
      'Amarre Trípode',
      'Amarre Redondo o Paralelo'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El amarre diagonal se emplea cuando las varas forman tijeras o están sometidas a fuerzas que tienden a abrirlas en ángulo oblicuo.'
  },
  {
    id: 'cab-5',
    category: 'cabuyeria',
    rama: 'caminantes',
    question: '¿Cuál es la función principal del Nudo Margarita?',
    options: [
      'Asegurar una tienda de campaña a una estaca',
      'Acortar una cuerda o reforzar una sección debilitada sin cortarla',
      'Unir dos cuerdas mojadas o resbaladizas',
      'Hacer una escalera de mano rápida'
    ],
    correctAnswer: 1,
    difficulty: 'avanzado',
    explanation: 'El nudo Margarita permite reducir el largo de un cabo o proteger una parte rozada o desgastada manteniéndola fuera de tensión.'
  },
  {
    id: 'cab-6',
    category: 'cabuyeria',
    rama: 'manada',
    question: '¿Qué nudo se usa en la insignia scout mundial y sirve para unir dos cuerdas del mismo grosor?',
    options: [
      'Nudo Llano o Rizo',
      'Nudo Vuelta de Escota',
      'Nudo Leñador',
      'Nudo Alondra'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El Nudo Llano o Rizo une dos cabos de igual mena y simboliza la hermandad mundial en la Flor de Lis.'
  },
  {
    id: 'cab-7',
    category: 'cabuyeria',
    rama: 'unidad',
    question: '¿Cuál es el nudo ideal para unir dos cuerdas de DIFERENTE grosor?',
    options: [
      'Nudo Llano',
      'Vuelta de Escota (Simple o Doble)',
      'Nudo Capuchino',
      'Nudo Presilla de Alondra'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El Vuelta de Escota es el nudo específico para empalmar cuerdas de distinto diámetro con total firmeza.'
  },
  {
    id: 'cab-8',
    category: 'cabuyeria',
    rama: 'rovers',
    question: 'En un amarre cuadrado o diagonal, ¿cómo se llaman las vueltas finales que se dan entre los dos troncos para tensar toda la unión?',
    options: [
      'Vueltas de ahorque o ajuste',
      'Vueltas muertas',
      'Falcaceado',
      'Cote de seguridad'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'Después de las vueltas envolventes (llanas), se aplican de 2 a 3 vueltas de ahorque perpendiculares para estrangular y dar máxima rigidez al amarre.'
  },
  {
    id: 'cab-9',
    category: 'cabuyeria',
    rama: 'unidad',
    question: '¿Para qué sirve el "Falcaceado" en el extremo de una soga?',
    options: [
      'Para que la cuerda pese más al lanzarla',
      'Para evitar que los cordones del chicote se deshilachen o destrencen',
      'Para medir la longitud en metros',
      'Para atar el mástil principal'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El falcaceado consiste en envolver firmemente con hilo fino la punta de una cuerda para impedir que se desarme.'
  },
  {
    id: 'cab-10',
    category: 'cabuyeria',
    rama: 'todas',
    question: '¿Qué nudo tensor se usa en los vientos de la carpa para poder estirar o aflojar la cuerda fácilmente?',
    options: [
      'Vuelta de Braza',
      'Nudo Tensor o Boca de Lobo',
      'Vuelta de Gancho',
      'Nudo de Galera'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El nudo tensor de carpa permite deslizar el bucle sobre el firme para regular la tensión del viento ante el viento o la lluvia.'
  },

  // =====================================================================
  // 2. HISTORIA Y TRADICIÓN (Búho Baden 🦉)
  // =====================================================================
  {
    id: 'his-1',
    category: 'historia',
    rama: 'todas',
    question: '¿En qué año y lugar se llevó a cabo el primer campamento experimental scout de la historia?',
    options: [
      '1907 en la Isla de Brownsea, Inglaterra',
      '1908 en Gilwell Park, Londres',
      '1910 en Mafeking, Sudáfrica',
      '1905 en Birkenhead, Gales'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'Entre el 1 y el 8 de agosto de 1907, Robert Baden-Powell reunió a 20 muchachos en la Isla de Brownsea para probar el método scout.'
  },
  {
    id: 'his-2',
    category: 'historia',
    rama: 'todas',
    question: '¿Cómo se llama el libro fundamental escrito por Baden-Powell publicado por entregas en 1908?',
    options: [
      'Manual del Lobo',
      'Escultismo para Muchachos (Scouting for Boys)',
      'Remando tu propia Canoa',
      'Aventuras en Mafeking'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Escultismo para Muchachos (Scouting for Boys) se publicó quincenalmente en 1908 y dio origen inmediato a las primeras patrullas autónomas.'
  },
  {
    id: 'his-3',
    category: 'historia',
    rama: 'todas',
    question: '¿Por qué los scouts nos saludamos tradicionalmente con la mano izquierda?',
    options: [
      'Porque es la mano más cercana al corazón y representa confianza entre guerreros desarmados',
      'Porque Baden-Powell era zurdo de nacimiento',
      'Porque así lo ordenó la reina de Inglaterra en el primer Jamboree',
      'Para tener la mano derecha libre para sostener el báculo'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'Los guerreros Ashanti soltaban su escudo (llevado en la mano izquierda) para estrechar la izquierda como prueba suprema de confianza y valentía.'
  },
  {
    id: 'his-4',
    category: 'historia',
    rama: 'unidad',
    question: '¿Quién fue la primera Guía Mayor del Mundo y esposa de Baden-Powell?',
    options: [
      'Agnes Baden-Powell',
      'Olave Saint Claire Soames',
      'Juliette Gordon Low',
      'Vera Barclay'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'Lady Olave Baden-Powell lideró el Movimiento Guía Mundial como Jefa Guía Mundial y dedicó su vida a expandirlo.'
  },
  {
    id: 'his-5',
    category: 'historia',
    rama: 'todas',
    question: '¿Qué representa la Flor de Lis en la simbología de los mapas antiguos y en el escultismo?',
    options: [
      'La brújula que siempre señala el Norte y el camino recto a seguir',
      'La realeza británica de la época eduardiana',
      'Las tres comidas del día en campamento',
      'La unión de los continentes'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'Baden-Powell la adoptó porque en las cartas marinas la Flor de Lis marcaba el Norte; así el scout nunca pierde el rumbo.'
  },
  {
    id: 'his-6',
    category: 'historia',
    rama: 'manada',
    question: '¿En qué famosa obra literaria de Rudyard Kipling se inspira el marco simbólico de la Manada de Lobatos?',
    options: [
      'La Isla del Tesoro',
      'El Libro de las Tierras Vírgenes (El Libro de la Selva)',
      'Colmillo Blanco',
      'Las Aventuras de Tom Sawyer'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Baden-Powell contó con la amistad de Rudyard Kipling para ambientar la Manada en la historia de Mowgli, Akela, Baloo y Bagheera.'
  },
  {
    id: 'his-7',
    category: 'historia',
    rama: 'caminantes',
    question: '¿En qué ciudad sudafricana organizó Baden-Powell en 1899 un cuerpo de cadetes jóvenes para llevar mensajes y primeros auxilios?',
    options: [
      'Pretoria',
      'Mafeking',
      'Ciudad del Cabo',
      'Johannesburgo'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'Durante los 217 días de defensa de Mafeking, los jóvenes cadetes demostraron que asumían grandes responsabilidades si se confiaba en ellos.'
  },
  {
    id: 'his-8',
    category: 'historia',
    rama: 'rovers',
    question: '¿Cómo se llama el libro que Baden-Powell escribió especialmente para la Rama Rover en 1922?',
    options: [
      'Roverismo hacia el Éxito (Rovering to Success)',
      'Guía para el Jefe de Tropa',
      'El Camino de la Selva',
      'Cartas a un Patrullero'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'En "Roverismo hacia el Éxito", B-P invita a los jóvenes adultos a remar su propia canoa sorteando los escollos de la vida mediante el servicio.'
  },
  {
    id: 'his-9',
    category: 'historia',
    rama: 'todas',
    question: '¿Qué día se celebra mundialmente el Día del Fundador / Día del Pensamiento Scout?',
    options: [
      '22 de febrero (natalicio de Robert y Olave Baden-Powell)',
      '1 de agosto (inicio del campamento de Brownsea)',
      '23 de abril (Día de San Jorge)',
      '8 de enero'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'Tanto Robert Baden-Powell (1857) como su esposa Olave (1889) nacieron un 22 de febrero.'
  },
  {
    id: 'his-10',
    category: 'historia',
    rama: 'unidad',
    question: '¿Quién es el Santo Patrono mundial de los Scouts, elegido por Baden-Powell como modelo de caballerosidad y valor?',
    options: [
      'San Francisco de Asís',
      'San Jorge',
      'San Pablo',
      'San Ignacio'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'San Jorge simboliza al jinete que vence las dificultades (el dragón) con honor, coraje y espíritu de servicio.'
  },

  // =====================================================================
  // 3. PRIMEROS AUXILIOS Y SALVAMENTO (Berni el San Bernardo 🐶)
  // =====================================================================
  {
    id: 'pri-1',
    category: 'primeros_auxilios',
    rama: 'todas',
    question: '¿Qué significa la regla mnemotécnica P.A.S. en una situación de emergencia?',
    options: [
      'Prevenir, Atender, Sanar',
      'Proteger, Avisar, Socorrer',
      'Presionar, Analizar, Salvar',
      'Pausar, Actuar, Sellar'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Proteger (la escena para no ser otra víctima), Avisar (a servicios de emergencia) y Socorrer (atender a los heridos).'
  },
  {
    id: 'pri-2',
    category: 'primeros_auxilios',
    rama: 'todas',
    question: '¿Cuál es la primera acción inmediata ante una quemadura menor de primer o segundo grado?',
    options: [
      'Aplicar pasta de dientes o manteca sobre la piel',
      'Enfriar con abundante agua corriente limpia y templada por 10 a 20 minutos',
      'Romper las ampollas para drenar el líquido',
      'Colocar hielo directo sobre la herida'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'El agua limpia y fresca alivia el dolor, detiene el avance del daño térmico y previene infecciones. Nunca hielo directo ni ungüentos caseros.'
  },
  {
    id: 'pri-3',
    category: 'primeros_auxilios',
    rama: 'caminantes',
    question: 'En Reanimación Cardiopulmonar (RCP) para adultos, ¿cuál es la relación de compresiones y ventilaciones recomendada?',
    options: [
      '15 compresiones por 2 ventilaciones',
      '30 compresiones por 2 ventilaciones',
      '50 compresiones continuas sin parar',
      '10 compresiones por 1 ventilación'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El estándar universal es 30 compresiones torácicas profundas y rápidas (100-120 por minuto) seguidas de 2 insuflaciones de rescate.'
  },
  {
    id: 'pri-4',
    category: 'primeros_auxilios',
    rama: 'unidad',
    question: '¿Para qué sirve colocar a una persona en Posición Lateral de Seguridad (PLS)?',
    options: [
      'Para inmovilizar posibles fracturas en la columna',
      'Evitar que la lengua o el vómito obstruyan las vías respiratorias en personas inconscientes que respiran',
      'Detener hemorragias en las extremidades inferiores',
      'Elevar la temperatura corporal rápidamente'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'La PLS mantiene despejada la vía aérea y permite que cualquier fluido drene de la boca sin provocar asfixia.'
  },
  {
    id: 'pri-5',
    category: 'primeros_auxilios',
    rama: 'unidad',
    question: 'Si una persona sufre una picadura de abeja con el aguijón aún dentro, ¿cómo debe retirarse?',
    options: [
      'Apretando el saco de veneno con una pinza de cejas',
      'Raspando suavemente con una tarjeta plástica o superficie roma sin comprimir el saco',
      'Succionando con la boca el veneno',
      'Cubriéndolo con barro seco'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'Apretar con pinzas exprime el veneno restante dentro de la piel. Raspar con una superficie recta lo expulsa limpiamente.'
  },
  {
    id: 'pri-6',
    category: 'primeros_auxilios',
    rama: 'todas',
    question: 'Ante un sangrado nasal (epistaxis), ¿cuál es la postura correcta que debe adoptar el afectado?',
    options: [
      'Echar la cabeza hacia atrás para que no caiga sangre',
      'Inclinar levemente la cabeza hacia adelante y presionar la parte blanda de la nariz durante 5-10 minutos',
      'Acostarse boca arriba totalmente plano',
      'Correr para activar la circulación'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Inclinar la cabeza hacia adelante evita tragar sangre (lo que provoca náuseas y vómitos), mientras la presión directa forma el coágulo.'
  },
  {
    id: 'pri-7',
    category: 'primeros_auxilios',
    rama: 'caminantes',
    question: '¿Qué maniobra se aplica a una persona consciente que sufre atragantamiento total (no puede toser, hablar ni respirar)?',
    options: [
      'Maniobra de Heimlich (compresiones abdominales) combinada con golpes interescapulares',
      'Darle un vaso de agua fría rápidamente',
      'Introducir los dedos a ciegas en la garganta',
      'Acostarla en el piso y levantarle los pies'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'Los 5 golpes entre los omóplatos y las 5 compresiones abdominales (Heimlich) generan una tos artificial que expulsa el cuerpo extraño.'
  },
  {
    id: 'pri-8',
    category: 'primeros_auxilios',
    rama: 'unidad',
    question: '¿Cómo se puede improvisar un cabestrillo de emergencia en campamento para inmovilizar un brazo lesionado?',
    options: [
      'Usando el pañuelo scout abierto en triángulo atado con un nudo llano',
      'Atando el brazo con una soga gruesa al cuello',
      'Con ramas espinosas',
      'Dejando el brazo colgando con peso'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El pañuelo scout fue diseñado en forma triangular precisamente para servir como vendaje o cabestrillo de primeros auxilios en terreno.'
  },
  {
    id: 'pri-9',
    category: 'primeros_auxilios',
    rama: 'rovers',
    question: '¿Cuáles son los signos clásicos de insolación o golpe de calor en una caminata?',
    options: [
      'Piel muy fría y escalofríos leves',
      'Piel caliente y enrojecida, mareo, dolor de cabeza intenso, confusión y pulso acelerado',
      'Hambre repentina y sueño leve',
      'Estornudos frecuentes'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El golpe de calor es una urgencia médica: requiere llevar al afectado a la sombra, refrescar su cuerpo con paños húmedos e hidratar si está consciente.'
  },
  {
    id: 'pri-10',
    category: 'primeros_auxilios',
    rama: 'todas',
    question: 'Ante una hemorragia externa abundante en un brazo o pierna, ¿cuál es el primer paso inmediato?',
    options: [
      'Lavar con alcohol puro',
      'Ejercer presión directa y firme sobre la herida con un apósito o tela limpia',
      'Colocar barro o hojas verdes',
      'Hacer caminar a la persona'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'La compresión directa sostenida con gasas o tela limpia es el método primario y más seguro para detener la mayoría de las hemorragias.'
  },

  // =====================================================================
  // 4. NATURALEZA Y RASTREO (Lobo Rastreador 🐺)
  // =====================================================================
  {
    id: 'nat-1',
    category: 'naturaleza',
    rama: 'todas',
    question: 'En el hemisferio sur, ¿qué constelación es la principal referencia nocturna para encontrar el Polo Sur celeste?',
    options: [
      'La Osa Mayor',
      'La Cruz del Sur (Crux)',
      'Orión',
      'Casiopea'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Prolongando el eje mayor de la Cruz del Sur aproximadamente 4,5 veces hacia su base se localiza el punto del Sur celeste.'
  },
  {
    id: 'nat-2',
    category: 'naturaleza',
    rama: 'todas',
    question: '¿Qué significa el signo de pista consistente en un círculo con un punto en el centro (ʘ)?',
    options: [
      'Peligro en el camino',
      'Agua potable cercana',
      'Fin de pista / He vuelto a casa',
      'Girar a la derecha'
    ],
    correctAnswer: 2,
    difficulty: 'facil',
    explanation: 'El círculo con punto central es el célebre signo que significa "He terminado mi labor y he vuelto a casa", presente en la tumba de Baden-Powell.'
  },
  {
    id: 'nat-3',
    category: 'naturaleza',
    rama: 'unidad',
    question: '¿Por qué el musgo en los troncos de los árboles suele crecer con mayor abundancia en un lado específico?',
    options: [
      'En el lado más húmedo y protegido de la luz solar directa',
      'Siempre apunta exactamente al Este geográfico',
      'Solo crece donde los pájaros anidan',
      'En el lado donde corre el viento caliente'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'El musgo requiere sombra y humedad; en el hemisferio sur suele abundar en la cara Sur del tronco (lejos del sol que transita al Norte).'
  },
  {
    id: 'nat-4',
    category: 'naturaleza',
    rama: 'caminantes',
    question: '¿Qué revela el rastro de huellas si la pisada muestra una mayor profundidad en la punta del pie que en el talón?',
    options: [
      'Que la persona caminaba muy lentamente o descansando',
      'Que la persona iba corriendo o cargando peso hacia adelante',
      'Que la persona caminaba descalza',
      'Que la persona iba marchando hacia atrás'
    ],
    correctAnswer: 1,
    difficulty: 'avanzado',
    explanation: 'Al correr o acelerar el paso, el impulso y el peso se transfieren bruscamente a la parte delantera y los dedos del pie.'
  },
  {
    id: 'nat-5',
    category: 'naturaleza',
    rama: 'todas',
    question: '¿Qué indica el principio de campismo "No Deje Rastro" (Leave No Trace)?',
    options: [
      'Solo enterrar la basura en el bosque',
      'Planificar, minimizar el impacto, llevarse todos los residuos y dejar el lugar mejor de como se encontró',
      'No encender fuego bajo ninguna circunstancia',
      'Caminar únicamente fuera de los senderos señalizados'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'El lema scout: "Deja el mundo en mejores condiciones de cómo lo encontraste", base de las 7 normas de No Deje Rastro.'
  },
  {
    id: 'nat-6',
    category: 'naturaleza',
    rama: 'manada',
    question: 'En los signos de pista scouts, ¿qué significa un triángulo dibujado en el suelo o con ramitas (△)?',
    options: [
      'Peligro o atención',
      'Camino libre para correr',
      'Campamento a 10 kilómetros',
      'Río navegable'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El triángulo es la señal universal de "¡Peligro!" o "¡Atención!" en las pistas scouts.'
  },
  {
    id: 'nat-7',
    category: 'naturaleza',
    rama: 'unidad',
    question: '¿Qué significa un signo de pista formado por un rectángulo con un número adentro (ej. [4]) junto a una flecha?',
    options: [
      'Que faltan 4 horas de caminata',
      'Mensaje oculto a 4 pasos en la dirección indicada por la flecha',
      'Que solo pueden pasar 4 scouts',
      'Que hay 4 carpas armadas'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El rectángulo con número y flecha indica "Mensaje escondido a X pasos en esa dirección".'
  },
  {
    id: 'nat-8',
    category: 'naturaleza',
    rama: 'caminantes',
    question: '¿Cómo se diferencia generalmente la huella de un cánido (perro/zorro/lobo) de la de un felino (puma/gato montés)?',
    options: [
      'El cánido suele marcar las uñas delante de los dedos, mientras el felino las retrae al caminar',
      'El felino tiene 6 dedos en cada pata',
      'El cánido deja huellas cuadradas',
      'No existe ninguna diferencia'
    ],
    correctAnswer: 0,
    difficulty: 'avanzado',
    explanation: 'Los cánidos no poseen uñas retráctiles, por lo que sus garras quedan marcadas frente a las almohadillas digitales.'
  },
  {
    id: 'nat-9',
    category: 'naturaleza',
    rama: 'todas',
    question: '¿Qué tipo de nubes oscuras y de gran desarrollo vertical anuncian tormentas eléctricas o lluvias intensas?',
    options: [
      'Cirros',
      'Cumulonimbos',
      'Estratos altos',
      'Nubes lenticulares'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'Los cumulonimbos tienen forma de yunque gigante y son indicadores directos de tormentas fuertes y chaparrones.'
  },
  {
    id: 'nat-10',
    category: 'naturaleza',
    rama: 'manada',
    question: '¿De qué lado deben colocarse los signos de pista durante un recorrido para que la patrulla los encuentre fácilmente?',
    options: [
      'Del lado derecho del sendero y a una altura o lugar visible sin dañar árboles vivos',
      'Enterrados bajo medio metro de tierra',
      'Colgados en las copas más altas de los árboles',
      'Pintados con aerosol en las rocas'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'Por convención scout, las señales se trazan al lado derecho del camino utilizando elementos naturales del suelo sin dañar la flora.'
  },

  // =====================================================================
  // 5. CAMPISMO Y ORIENTACIÓN (Zorro Fogatero 🦊)
  // =====================================================================
  {
    id: 'cam-1',
    category: 'campismo',
    rama: 'todas',
    question: '¿Hacia dónde debe apuntar preferentemente la entrada de una carpa en una zona de campamento?',
    options: [
      'En dirección contraria a los vientos dominantes para evitar que embolse aire y lluvia',
      'Siempre mirando directo a una pendiente empinada',
      'Apuntando directamente al fogón a menos de un metro',
      'Hacia la zona más baja del terreno donde se estanca agua'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'La carpa debe ofrecer su perfil aerodinámico al viento dominante y mantener la puerta resguardada de las ráfagas y el agua.'
  },
  {
    id: 'cam-2',
    category: 'campismo',
    rama: 'todas',
    question: '¿Qué tipo de fogata es ideal como base para encender fuego por su buena circulación de oxígeno?',
    options: [
      'Fogata en Trinchera',
      'Fogata Pirámide o Tipí',
      'Fogata en Estrella',
      'Fogata Polinesia'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'La fogata pirámide concentra el calor ascendente en el centro sobre la yesca y permite una excelente ventilación para prender.'
  },
  {
    id: 'cam-3',
    category: 'campismo',
    rama: 'unidad',
    question: '¿Qué se debe verificar antes de usar un hacha de mano en campamento?',
    options: [
      'Que la hoja esté floja para absorber el golpe',
      'El "círculo de seguridad" despejado a tu alrededor y que el cabo esté firmemente encuñado a la cabeza metálica',
      'Mojar el mango en aceite para que resbale con suavidad',
      'Pintar el filo con esmalte protector'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'Nunca se empuña un hacha sin despejar el círculo de alcance de brazos y herramienta, comprobando siempre la fijación del ojo y cuña.'
  },
  {
    id: 'cam-4',
    category: 'campismo',
    rama: 'caminantes',
    question: 'Al armar una mochila de travesía, ¿dónde deben ubicarse los objetos más pesados (como carpa o comida pesada)?',
    options: [
      'En el fondo de la mochila, golpeando la cintura',
      'Cerca de la espalda y a media altura entre los omóplatos',
      'En los bolsillos laterales exteriores',
      'Colgando en la parte superior exterior balanceándose'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'El peso pegado a la espalda y a media altura mantiene el centro de gravedad del cuerpo alineado y evita lesiones lumbares.'
  },
  {
    id: 'cam-5',
    category: 'campismo',
    rama: 'todas',
    question: '¿Qué técnica de purificación de agua en campo es la más eficaz y universal contra bacterias, virus y parásitos?',
    options: [
      'Filtrar a través de un pañuelo de tela',
      'Hervir a borbotones continuos durante al menos 1 a 3 minutos',
      'Dejar reposar el agua durante 2 horas al sol',
      'Añadir una cucharada de sal común'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'La ebullición vigorosa mata todos los patógenos vivos transmisibles por agua. La filtración solo quita sedimentos pero no virus ni microbios.'
  },
  {
    id: 'cam-6',
    category: 'campismo',
    rama: 'unidad',
    question: 'En una brújula, ¿cuántos grados sexagesimales corresponden exactamente al punto cardinal OESTE (W)?',
    options: [
      '90°',
      '180°',
      '270°',
      '360°'
    ],
    correctAnswer: 2,
    difficulty: 'intermedio',
    explanation: 'En la rosa de los vientos: Norte = 0° (o 360°), Este = 90°, Sur = 180° y Oeste = 270°.'
  },
  {
    id: 'cam-7',
    category: 'campismo',
    rama: 'unidad',
    question: '¿Cuáles son los tres elementos indispensables del "Triángulo del Fuego" para mantener una fogata encendida?',
    options: [
      'Viento, tierra y agua',
      'Combustible (leña), Comburente (oxígeno) y Calor (energía de ignición)',
      'Papel, fósforos y piedras',
      'Humo, ceniza y brasas'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Si falta cualquiera de los tres (oxígeno, calor o combustible), el fuego se apaga. Por eso al echar agua quitamos calor y al echar tierra quitamos oxígeno.'
  },
  {
    id: 'cam-8',
    category: 'campismo',
    rama: 'caminantes',
    question: '¿Para qué es ideal la "Fogata en Estrella" o "Fuego de Indio"?',
    options: [
      'Para iluminar un estadio entero',
      'Para mantener un fuego lento y duradero toda la noche consumiendo troncos largos de a poco',
      'Para hornear pan bajo tierra',
      'Para secar ropa colgada encima'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'En la fogata estrella los maderos se juntan en el centro y se van empujando hacia adentro a medida que se consumen, ahorrando leña y esfuerzo.'
  },
  {
    id: 'cam-9',
    category: 'campismo',
    rama: 'todas',
    question: '¿Cómo se entrega correctamente un cuchillo o cortaplumas cerrado o abierto a otro scout?',
    options: [
      'Lanzándolo suavemente por el aire',
      'Tomándolo por el lomo de la hoja (con el filo hacia afuera) y ofreciendo el mango al compañero hasta que diga "Gracias"',
      'Apoyándolo en el pasto oculto entre hojas',
      'Con la punta hacia adelante'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Siempre se ofrece la empuñadura y no se suelta hasta que quien lo recibe confirma verbalmente que lo tiene firme.'
  },
  {
    id: 'cam-10',
    category: 'campismo',
    rama: 'rovers',
    question: 'En lectura de mapas topográficos, ¿qué indica el hecho de que las "curvas de nivel" estén muy juntas entre sí?',
    options: [
      'Que el terreno es completamente llano',
      'Que hay una pendiente muy pronunciada o acantilado',
      'Que hay un lago profundo',
      'Que es un bosque tupido'
    ],
    correctAnswer: 1,
    difficulty: 'avanzado',
    explanation: 'Cuanto más próximas están las líneas de igual altitud (curvas de nivel), mayor es el desnivel en poca distancia horizontal.'
  },

  // =====================================================================
  // 6. LEY, PROMESA Y ESTILO DE VIDA (Águila de Honor 🦅)
  // =====================================================================
  {
    id: 'ley-1',
    category: 'ley_valores',
    rama: 'todas',
    question: '¿Cuál es el Lema Mundial de los Scouts promulgado por Baden-Powell?',
    options: [
      'Siempre Listos (Be Prepared)',
      'Siempre Mejores',
      'Servir y Proteger',
      'Unidos Venceremos'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: '"Be Prepared" (Siempre Listo / Siempre Listos): estar en condiciones mentales y físicas de cumplir el deber y ayudar a los demás.'
  },
  {
    id: 'ley-2',
    category: 'ley_valores',
    rama: 'todas',
    question: '¿Qué recuerdan los tres dedos erguidos en la seña scout?',
    options: [
      'Los tres campamentos del año',
      'Las tres partes de la Promesa Scout (Deberes con Dios/principios, con los demás y con uno mismo)',
      'Las tres comidas scouts',
      'Las tres ramas mayores'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'Los tres dedos representan los tres principios fundamentales de la Promesa Scout, y el pulgar sobre el meñique simboliza que el fuerte protege al débil.'
  },
  {
    id: 'ley-3',
    category: 'ley_valores',
    rama: 'todas',
    question: '¿Cuál es la insignia del nudo que une la cinta de la Flor de Lis mundial?',
    options: [
      'El Nudo Llano o Rizo, que simboliza la hermandad de los scouts de todo el mundo',
      'El Nudo As de Guía',
      'El Nudo Ocho',
      'El Nudo Cirujano'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'La cuerda que rodea la flor de lis está cerrada con un nudo llano, representando la indestructible fraternidad scout internacional.'
  },
  {
    id: 'ley-4',
    category: 'ley_valores',
    rama: 'todas',
    question: '¿Qué compromiso diario característico asume todo scout?',
    options: [
      'Hacer al menos una Buena Acción a alguien cada día',
      'Hacer 20 nudos antes del anochecer',
      'Cantar el himno scout al amanecer',
      'Llevar siempre una brújula en el bolsillo'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'La "Buena Acción diaria" es el hábito cotidiano que plasma el servicio al prójimo en la vida de un scout.'
  },
  {
    id: 'ley-5',
    category: 'ley_valores',
    rama: 'todas',
    question: 'En la Ley Scout tradicional, ¿cómo se describe la relación del scout con la naturaleza y los animales?',
    options: [
      'El scout conquista y domina la naturaleza salvaje',
      'El scout ve en la naturaleza la obra de Dios y protege a los animales y las plantas',
      'El scout solo cuida los animales domésticos',
      'El scout no interviene en ningún ecosistema'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'El artículo de la Ley Scout destaca que el scout ama y defiende la naturaleza, respetando la vida vegetal y animal.'
  },
  {
    id: 'ley-6',
    category: 'ley_valores',
    rama: 'manada',
    question: '¿Cuál es el Lema de la Manada de Lobatos?',
    options: [
      'Siempre Mejor (Haremos lo Mejor)',
      'Servir',
      'Compartir',
      'Explorar sin límites'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El lema del Lobato y la Lobata es "¡Siempre Mejor!", esforzándose cada día por superarse con alegría.'
  },
  {
    id: 'ley-7',
    category: 'ley_valores',
    rama: 'rovers',
    question: '¿Cuál es el Lema propio de la Rama Rover?',
    options: [
      'Servir',
      'Aventura',
      'Descubrir',
      'Observar'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El lema Rover es "Servir", reflejando el compromiso ciudadano y solidario del joven adulto en la sociedad.'
  },
  {
    id: 'ley-8',
    category: 'ley_valores',
    rama: 'unidad',
    question: '¿Qué significan las dos estrellas de cinco puntas en los pétalos laterales de la Flor de Lis?',
    options: [
      'El día y la noche',
      'La verdad y el conocimiento, y sus 10 puntas recuerdan los 10 artículos de la Ley Scout',
      'Los dos hemisferios de la Tierra',
      'Las dos guerras mundiales'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'Las dos estrellas simbolizan los ojos abiertos del scout hacia la verdad y la vida al aire libre, y suman diez puntas por los diez puntos de la Ley.'
  },
  {
    id: 'ley-9',
    category: 'ley_valores',
    rama: 'todas',
    question: 'Según la Ley Scout, ¿cómo actúa el scout frente a las dificultades o contratiempos?',
    options: [
      'Se queja y abandona la actividad',
      'Es animoso y sonríe y canta en las dificultades',
      'Culpa al guía de patrulla',
      'Espera a que otro lo resuelva'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'El optimismo activo y la resiliencia con buen humor ante la lluvia, el cansancio o los retos son sellos del espíritu scout.'
  },
  {
    id: 'ley-10',
    category: 'ley_valores',
    rama: 'caminantes',
    question: '¿Cómo se llama el sistema educativo creado por Baden-Powell basado en pequeños grupos de amigos con roles y liderazgo compartido?',
    options: [
      'Sistema de Patrullas',
      'Sistema de Escuadrones',
      'Sistema de Clanes Verticales',
      'Sistema de Comisiones'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El Sistema de Patrullas es el corazón del método scout: pequeños equipos donde cada integrante tiene una responsabilidad real.'
  }
];

// Additional dynamic question templates for Automatic Question Generation & Weekly Rotation
export const AUTO_GENERATED_POOL = [
  {
    id: 'auto-cab-1',
    category: 'cabuyeria',
    rama: 'unidad',
    question: '¿Qué nudo de tope se realiza en el extremo de una cuerda para evitar que se pase por una polea o argolla?',
    options: ['Nudo Ocho (Lasca)', 'Nudo Ballestrinque', 'Nudo Alondra', 'Nudo Pescador'],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El Nudo en Ocho o Lasca es el nudo de tope por excelencia: abulta el chicote y no daña las fibras de la soga.'
  },
  {
    id: 'auto-cab-2',
    category: 'cabuyeria',
    rama: 'caminantes',
    question: '¿Qué amarre se emplea para unir tres palos que formarán la base de una torre, lavatorio o cocina elevada?',
    options: ['Amarre Trípode (o en Ocho)', 'Amarre Cuadrado', 'Nudo Rizo', 'Vuelta de Braza'],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'El amarre trípode entrelaza tres maderos paralelos en forma de ocho permitiendo luego abrir las patas para formar un trípode estable.'
  },
  {
    id: 'auto-his-1',
    category: 'historia',
    rama: 'todas',
    question: '¿Qué instrumento sonoro hizo sonar Baden-Powell la mañana del 1 de agosto de 1907 para inaugurar el campamento de Brownsea?',
    options: ['Un cuerno de antílope Kudu', 'Una campana de barco', 'Un silbato de locomotora', 'Un tambor escocés'],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'B-P utilizó el cuerno de Kudu traído de África para despertar a los primeros 20 scouts en la Isla de Brownsea.'
  },
  {
    id: 'auto-his-2',
    category: 'historia',
    rama: 'unidad',
    question: '¿Cuáles fueron las cuatro patrullas originales del primer campamento scout en la Isla de Brownsea?',
    options: [
      'Toros, Lobos, Chorlitos y Cuervos',
      'Águilas, Leones, Tigres y Panteras',
      'Halcones, Castores, Zorros y Osos',
      'Cobras, Pumas, Cóndores y Delfines'
    ],
    correctAnswer: 0,
    difficulty: 'avanzado',
    explanation: 'Las 4 patrullas históricas de Brownsea fueron Toros (Bulls), Lobos (Wolves), Chorlitos (Curlews) y Cuervos (Ravens).'
  },
  {
    id: 'auto-pri-1',
    category: 'primeros_auxilios',
    rama: 'todas',
    question: '¿Qué elemento NO debe faltar nunca en el botiquín básico de una patrulla scout?',
    options: [
      'Guantes descartables de látex/nitrilo, gasas estériles, vendas y antiséptico',
      'Antibióticos recetados fuertes sin control médico',
      'Agujas de coser ropa',
      'Algodón deshilachado para meter dentro de heridas abiertas'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'Los guantes de bioseguridad, gasas estériles, vendas y solución antiséptica son la base segura de todo botiquín scout.'
  },
  {
    id: 'auto-pri-2',
    category: 'primeros_auxilios',
    rama: 'unidad',
    question: 'Ante un esguince de tobillo durante una caminata, ¿qué indica el protocolo RICE / HICER?',
    options: [
      'Reposo, Hielo (frío local), Compresión suave y Elevación del miembro',
      'Correr más rápido para calentar el tobillo',
      'Aplicar calor intenso y masajear con fuerza',
      'Quitar el calzado en medio del barro y seguir caminando'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'Reposo, Frío local indirecto, Compresión elástica moderada y Elevación reducen la inflamación y el daño ligamentario.'
  },
  {
    id: 'auto-nat-1',
    category: 'naturaleza',
    rama: 'todas',
    question: 'Si colocas varias piedras encimadas (una grande abajo y una pequeña arriba), ¿qué indica en signos de pista?',
    options: [
      'Este es el buen camino (si hay una tercera piedra al costado, indica doblar hacia ese lado)',
      'Prohibido acampar',
      'Peligro de derrumbe',
      'Agua contaminada'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'Las pircas o piedras superpuestas son señales clásicas de senderismo y rastreo scout para marcar la senda correcta.'
  },
  {
    id: 'auto-nat-2',
    category: 'naturaleza',
    rama: 'manada',
    question: 'En la Manada, ¿quién enseña la Ley de la Selva a los lobatos y quién les enseña a cazar y rastrear?',
    options: [
      'Baloo (el oso sabio) y Bagheera (la pantera negra)',
      'Shere Khan y Tabaqui',
      'Los Bandar-log',
      'Rikki-Tikki-Tavi'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'En El Libro de las Tierras Vírgenes, Baloo es el maestro de la Ley de la Selva y Bagheera enseña la destreza y la observación.'
  },
  {
    id: 'auto-cam-1',
    category: 'campismo',
    rama: 'unidad',
    question: '¿Para qué sirve la "Fogata Reflector" en un campamento scout?',
    options: [
      'Para dirigir el calor hacia una carpa o refugio y hornear alimentos frente a una pared de troncos verdes',
      'Para hacer señales de humo a los aviones',
      'Para fundir metales',
      'Para apagar el fuego rápido'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'La pared trasera de troncos refleja el calor radiante hacia el frente, ideal para cocinar al asador o calentar un vivac.'
  },
  {
    id: 'auto-cam-2',
    category: 'campismo',
    rama: 'todas',
    question: 'Al levantar el campamento, ¿cómo se verifica que el lugar del fogón esté 100% apagado antes de retirarse?',
    options: [
      'Mojando abundantemente, removiendo las brasas y comprobando con el dorso de la mano que las cenizas estén totalmente frías',
      'Solo tapando las brasas rojas con hojas secas',
      'Mirando desde lejos que no salga llama',
      'Soplando fuerte las brasas'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'Un fogón nunca se abandona tibio: se ahoga con agua, se remueve tierra y ceniza y se verifica que esté frío al tacto.'
  },
  {
    id: 'auto-ley-1',
    category: 'ley_valores',
    rama: 'todas',
    question: '¿Qué simboliza el anillo o pasador que sujeta el pañuelo scout en el cuello?',
    options: [
      'La unión de la patrulla y el recordatorio de hacer la Buena Acción diaria',
      'El rango militar del scout',
      'La cantidad de años en el grupo',
      'El peso de la mochila'
    ],
    correctAnswer: 0,
    difficulty: 'facil',
    explanation: 'El pasador (como el Gilwell de cuero trenzado) mantiene unido el pañuelo y recuerda el compromiso fraterno y servicial.'
  },
  {
    id: 'auto-ley-2',
    category: 'ley_valores',
    rama: 'caminantes',
    question: '¿Cuáles son las tres Virtudes Scouts tradicionales?',
    options: [
      'Lealtad, Abnegación y Pureza',
      'Fuerza, Velocidad y Astucia',
      'Riqueza, Fama y Poder',
      'Silencio, Orden y Marcha'
    ],
    correctAnswer: 0,
    difficulty: 'intermedio',
    explanation: 'Las tres virtudes clásicas que coronan los pétalos de la Flor de Lis son Lealtad, Abnegación (entrega generosa) y Pureza.'
  }
];

// Combine Master List (for the complete Q&A Catalog)
export function getMasterQuestionCatalog() {
  const combined = [...DEFAULT_QUESTIONS, ...AUTO_GENERATED_POOL];
  return combined;
}

// Get ISO Week Number for automatic weekly rotation
export function getCurrentWeekSeed() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = (now - startOfYear) / 86400000;
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
}

// Deterministic / Seeded or Manual Shuffle for Weekly Rotation
export function rotateAndShuffleQuestions(questions, customSeed = null) {
  const seed = customSeed !== null ? customSeed : getCurrentWeekSeed();
  const list = [...questions];

  // Fisher-Yates with seed + randomness when requested manually
  let m = list.length;
  let s = seed * 9301 + 49297;
  while (m) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    const i = Math.floor(rnd * m--);
    const t = list[m];
    list[m] = list[i];
    list[i] = t;
  }
  return list;
}

// Generate Automatic Questions by Rama & Category
export function generateAutomaticQuestionSet({ rama = 'todas', category = 'todas', count = 10 } = {}) {
  const catalog = getMasterQuestionCatalog();
  let filtered = catalog.filter(q => {
    const matchRama = rama === 'todas' || !q.rama || q.rama === 'todas' || q.rama === rama;
    const matchCat = category === 'todas' || q.category === category;
    return matchRama && matchCat;
  });

  if (filtered.length === 0) {
    filtered = catalog;
  }

  // Shuffle randomly
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
