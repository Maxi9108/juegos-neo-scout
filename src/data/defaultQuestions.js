export const DEFAULT_QUESTIONS = [
  // --- CABUYERÍA Y PIONERISMO ---
  {
    id: 'cab-1',
    category: 'cabuyeria',
    question: '¿Para qué sirve principalmente el nudo As de Guía (Bowline)?',
    options: [
      'Para unir dos sogas de diferente grosor',
      'Hacer una gaza fija que no se corre ni se aprieta',
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
    question: '¿Cuál es la función del Nudo Margarita?',
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

  // --- HISTORIA Y TRADICIÓN ---
  {
    id: 'his-1',
    category: 'historia',
    question: '¿En qué año y lugar se llevó a cabo el primer campamento experimental scout de la historia?',
    options: [
      '1907 en la Isla de Brownsea, Inglaterra',
      '1908 en Gillwell Park, Londres',
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

  // --- PRIMEROS AUXILIOS Y SALVAMENTO ---
  {
    id: 'pri-1',
    category: 'primeros_auxilios',
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
    question: 'Si una persona sufre una picadura de abeja con el aguijón aún dentro, ¿cómo debe retirarse?',
    options: [
      'Apretando el saco de veneno con una pinza de cejas',
      'Raspando suavemente con una tarjeta plástica o el lomo de un cuchillo sin comprimir el saco',
      'Succionando con la boca el veneno',
      'Dejándolo adentro hasta que se caiga solo'
    ],
    correctAnswer: 1,
    difficulty: 'intermedio',
    explanation: 'Apretar con pinzas exprime el veneno restante dentro de la piel. Raspar con una superficie recta lo expulsa limpiamente.'
  },

  // --- NATURALEZA Y RASTREO ---
  {
    id: 'nat-1',
    category: 'naturaleza',
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

  // --- CAMPISMO Y ORIENTACIÓN ---
  {
    id: 'cam-1',
    category: 'campismo',
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

  // --- LEY, PROMESA Y ESTILO DE VIDA ---
  {
    id: 'ley-1',
    category: 'ley_valores',
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
    question: 'En la Ley Scout tradicional, ¿cómo se describe la relación del scout con la naturaleza y los animales?',
    options: [
      'El scout conquista y domina la naturaleza salvaje',
      'El scout ve en la naturaleza la obra de Dios y protege a los animales y las plantas',
      'El scout solo cuida los animales domésticos',
      'El scout no interviene en ningún ecosistema'
    ],
    correctAnswer: 1,
    difficulty: 'facil',
    explanation: 'El 6to artículo de la Ley Scout destaca que el scout es amigo de la naturaleza, respetando la vida vegetal y animal.'
  }
];

