// Catálogo Famat organizado por líneas (según PDF / Excel)
const CATALOGO_LINEAS = [
    // ── PRODUCTOS (unidad) ──────────────────────────────────
    { linea: 'LINEA SAPHIRUS - AMBAR', tipo: 'producto', items: [
        'Aerosol ambar', 'Aerosol para lampazo', 'Difusor aromatico con varillas',
        'Aerosol saphirus', 'Saphirus textil', 'Aceite esencial ambar',
        'Saphirus touch repuesto + dispositivo', 'Saphirus touch repuesto',
        'Dispenser analogico atomizador'
    ]},
    { linea: 'LINEA AUTO', tipo: 'producto', items: [
        'Pinitos Walker', 'Pinitos k78', 'Bolitas perfumadas',
        'Lata en gel mini k78', 'Lata en gel mini glade',
        'Lubricante en aerosol Escudo', 'Silicona aerosol k78', 'Cepillo p/auto'
    ]},
    { linea: 'LINEA ALFOMBRAS', tipo: 'producto', items: [
        'Alfombra baño 60x40 blanco oriental', 'Alfombra de goma ventosa',
        'Alfombra doble base 35x50'
    ]},
    { linea: 'LINEA BALDES', tipo: 'producto', items: [
        'Balde centrifugo tambor acero', 'Balde Mopero 16.5L',
        'Baldes x14', 'Baldes x12', 'Baldes x9'
    ]},
    { linea: 'LINEA BALDE CENTRIFUGO REPUESTO', tipo: 'producto', items: [
        'Repuesto escurridor P/balde 16,5l', 'Cabo P/balde centrifugo + Porta mopa 1,45m'
    ]},
    { linea: 'LINEA BALANCEADO ANIMALES', tipo: 'producto', items: [
        'Comedero chico', 'Comedero grande', 'Palita sanitaria'
    ]},
    { linea: 'LINEA BARRE HOJAS', tipo: 'producto', items: [
        'Barre Hojas Profesional (grande)', 'barre hojas reforzado negro'
    ]},
    { linea: 'LINEA DE BOLSAS', tipo: 'producto', items: [
        'Bolsas de consorcio 60x90 Rosario', 'Bolsas de consorcio 85x110 Rosario',
        'Bolsas de consorcio 90x120 Rosario', 'Bolsas de residuos 45x60 Rosario'
    ]},
    { linea: 'LINEA BROCHES', tipo: 'producto', items: [
        'Broches madera rayita', 'Broches plasticos-madera Make', 'Broches plasticos rayita'
    ]},
    { linea: 'LINEA BURLETTES P/PUERTA', tipo: 'producto', items: [
        'Burletes doble de friselina', 'Burletes doble de cuerina', 'Burletes zocalo doble Premiun'
    ]},
    { linea: 'LINEA DE CABOS', tipo: 'producto', items: [
        'Cabo de madera 1,20', 'Cabo de madera 1,50', 'Cabo de madera 2,00',
        'Cabo de madera P/Barrendero', 'Cabo extrensibles 3,00 mts',
        'Cabo extrensibles 1,50 mts', 'Cabo metalico forrados 1,20'
    ]},
    { linea: 'LINEA CANASTO', tipo: 'producto', items: [
        'Canasto P/broches', 'Canasto redondo mediano',
        'canasto P/ropa cuadrado con tapa', 'Canasto P/ropa redondo con tapa'
    ]},
    { linea: 'LINEA CEPILLOS', tipo: 'producto', items: [
        'Cepillo limpia techo Hongo', 'Cepillo uñas C/piedra pomez', 'Cepillo uñas x2',
        'Cepillo uñas c/u', 'cepillo lava-zapatilla', 'Cepillo planchita y cerrado',
        'Cepillos limpia inodoro chico', 'Cepillos limpia inodoro grande',
        'Cepillo limpia inodoro c/base extralimp', 'Cepillos limpia inodoro c/base salzano',
        'Cepillos limpia inodoro c/base importado Chico'
    ]},
    { linea: 'LINEA CESTO DE BASURA', tipo: 'producto', items: [
        'Cesto de basura 12 l Grande', 'Cesto de basura 5 l chico', 'Cesto de basura c/pedal 13lts'
    ]},
    { linea: 'LINEA CORTINA BAÑO', tipo: 'producto', items: [
        'PROTECTOR C/ GANCHOS CORTINA BAÑO', 'Cortina baño C/protector y ganchos'
    ]},
    { linea: 'LINEA CORTINA PLASTICA', tipo: 'producto', items: ['Cortina plastica de tiras'] },
    { linea: 'LINEA DESODORANTE-DESINFECTANTE', tipo: 'producto', items: [
        'Desinfectante aerosol lysoform', 'Desodorante de ambiente glade',
        'Desodorante de ambiente fraganss', 'Desodorante de ambiente poett',
        'Desodorante en crema rexona 60gr'
    ]},
    { linea: 'LINEA ESCARABADIENTES', tipo: 'producto', items: ['Escarbadiente con dispenser'] },
    { linea: 'LINEA ESCOBAS - ESCOBILLON', tipo: 'producto', items: [
        'Escoba de paja', 'escobeta azteca', 'Escobillon grande florinda/inca',
        'Escobillon mediano huarpe/pandi', 'Escobillon laqueado simil madera', 'Escobillon chico irizar'
    ]},
    { linea: 'LINEA ESPONJAS', tipo: 'producto', items: [
        'Esponjas de acero Make 30grs', 'Esponjas de acero Make 50grs', 'Esponjas de acero make12g',
        'esponjas dorada de 12grs', 'Esponjas dorada de 15grs', 'Esponjas dorada Make 30grs',
        'Esponjas antiadherentes Make', 'Esponja extralimp plus', 'Esponja de baño chica',
        'Esponja de baño grande', 'Esponja fibra verde make', 'Rejillas Dorada doble cara',
        'Esponjas Amarillas salvauñas MORTINER', 'Esponjas Amarillas salvauñas make'
    ]},
    { linea: 'LINEA FOSFOROS', tipo: 'producto', items: ['Fosforos x220', 'Fosforos x400', 'Encendedor'] },
    { linea: 'LINEA FRANELAS', tipo: 'producto', items: ['Franela'] },
    { linea: 'LINEA FUENTON', tipo: 'producto', items: [
        'Fuentos x 13lts', 'fuenton 24lts', 'Fuentos x20lts', 'Fuenton x30lts'
    ]},
    { linea: 'LINEA GATILLOS', tipo: 'producto', items: ['Gatillos (Blanco)', 'gatillos (profesional)'] },
    { linea: 'LINEA GUANTES', tipo: 'producto', items: [
        'Guantes pequeños P', 'Guantes grandes G', 'Guantes medianos M'
    ]},
    { linea: 'LINEA INSECTICIDA', tipo: 'producto', items: [
        'Insecticidas en aerosol raid comun', 'Insecticidas en aerosol shelton',
        'Cebo en bloque raticida geltex', 'Granulado raticida ultra plus',
        'Cebo cucarachas geltek 6 estaciones', 'Cebo mosca granulado',
        'Naftalina', 'NAFTALINA x 200', 'Mata cucaracha acido borico'
    ]},
    { linea: 'LINEA JABON EN PAN', tipo: 'producto', items: [
        'Jabon detergente Quitamanchas', 'Jabon en pan Blanco Ala 200',
        'Jabon en pan gigante 200', 'Jabon en pan cosquin 200'
    ]},
    { linea: 'LINEA JABONETA', tipo: 'producto', items: ['Jabonetas x 1 Qsens', 'Jabonetas x 3 Qsens'] },
    { linea: 'LAMPAZO-REPUESTO BARRENDERO', tipo: 'producto', items: [
        'kit lampazo barrendero+armazon 35cm', 'Kit Lampazo barrendero+Armazon 60cm',
        'Kit Lampazo barrendero+Armazon 80cm', 'Kit Lampazo barrendero+Armazon 100cm',
        'Repuesto Lampazo Barrendero 35cm', 'Repuesto Lampazo Barrendero 60cm',
        'Repuesto Lampazo Barrendero 80cm', 'Repuesto Lampazo Barrendero 100cm',
        'Lampazo x80cm Barrendero MADERA'
    ]},
    { linea: 'LINEA LAMPAZO COMUN', tipo: 'producto', items: [
        'Lampazo de hilo n°40', 'Lampazo azul', 'Lampazo pabilo n 40'
    ]},
    { linea: 'LINEA LIMPIA VIDRIOS', tipo: 'producto', items: [
        'Limpia vidrios+esponjas make 20cm', 'Limpia vidrios+esponjas make 30cm', 'limpia vidrios M/corto'
    ]},
    { linea: 'LINEA LUSTRA MUEBLES', tipo: 'producto', items: ['Lustra muebles Ceramicol', 'Lustra Muebles BLEM'] },
    { linea: 'LINEA MATA MOSCA', tipo: 'producto', items: ['Mata mosca paleta', 'Mata mosca manito'] },
    { linea: 'LINEA MAQUINA AFEITAR', tipo: 'producto', items: ['Gillete prestobarba'] },
    { linea: 'LINEA MOPAS', tipo: 'producto', items: [
        'Mopa centrifugo repuesto', 'Mopa paño', 'Mopa algodón blanca-Gris MT', 'Mopa microfibra'
    ]},
    { linea: 'LINEA PALAS BASURA', tipo: 'producto', items: [
        'Pala c/cabo Mapuche', 'Pala cabo economica COLORES', 'Pala c/cabo NEGRA',
        'Pala mano c/goma', 'Pala de mano sin goma'
    ]},
    { linea: 'LINEA PALANGANAS', tipo: 'producto', items: ['Palangana 4lts', 'Palangana 6lts', 'palangana 9LTS'] },
    { linea: 'LINEA PAPELES', tipo: 'producto', items: [
        'Papel Alumino 28cm', 'Papel film 30mts', 'Papel cocina maxi rollo',
        'Papel de cocina x3 Elegante', 'Papel higienico x4 elegante', 'Papel higienico x4 hiar',
        'papel higienico x6 Niraflor', 'Papel higienico x6 elegante', 'Papel higienco suelto cordial'
    ]},
    { linea: 'LINEA PAPELES DISPENSER', tipo: 'producto', items: [
        'Papel higienico dispenser 8 x300', 'Papel higienico dispenser 8 x 300 c/u',
        'Bobina Industrial 25x400 x2', 'Bobina industral 25x400 C/U',
        'Toallas intercaladas C/U', 'Tollas intercaladas 20X24 x 10'
    ]},
    { linea: 'LINEA PASA CERA', tipo: 'producto', items: ['Pasa cera Grande'] },
    { linea: 'LINEA PASTILLA INODORO', tipo: 'producto', items: [
        'Pastillas p/inodoro Pato (canasta)', 'Pastillas P/inodoro Pato Purific/glade adhesivo'
    ]},
    { linea: 'LINEA PILAS', tipo: 'producto', items: ['Pilas energizer AA', 'Pilas energizer AAA'] },
    { linea: 'LINEA PILETA', tipo: 'producto', items: [
        'Kit para analisis PH cloro', 'Saca hoja P/pileta', 'Saca hoja P/pileta bolsa',
        'Manguera flotante corrugada x metro 5mts o 10mts', 'Cabo telescopico 3,6 mts',
        'Cabo aluminio p/saca hojas', 'Barrefondo 8 ruedas', 'Barrefondo media luna',
        'Boya hongo P/piletas (P/200)', 'Boya hongo Pileta lona (P/50)',
        'Boya grande C/regulador (P/200)', 'Boya grande satelital (P/200)', 'Boya chica satelital (P/50)'
    ]},
    { linea: 'LINEA PLUMEROS', tipo: 'producto', items: [
        'Plumero de pabilo blanco', 'Plumero algodon hilo grueso', 'Plumero algodon hilo super grueso'
    ]},
    { linea: 'LINEA PULVERIZADOR', tipo: 'producto', items: [
        'Pulverizador multiuso 500cc', 'Pulverizador multiuso 750cc', 'Pulverizador multiuso 1L'
    ]},
    { linea: 'LINEA REPELENTE - ESPIRAL - TABLETAS', tipo: 'producto', items: [
        'Repelente off', 'repelente 911', 'Tabletas P/mosquitos x12', 'Tabletas P/mosquitos C/U',
        'Raid espiral x unidad', 'Raid espiral x12'
    ]},
    { linea: 'LINEA REJILLAS', tipo: 'producto', items: [
        'Rejilla bar especial linea 10', 'Rejillas microfibra 60x40', 'Rejillas Esponjas linea 10',
        'Rejillas lava autos liviana linea 10', 'Rejilla paños multiusos sueltos'
    ]},
    { linea: 'LINEA REPASADORES', tipo: 'producto', items: [
        'REPASADORES DE TOLLA Make', 'Repasadores tollas fribran',
        'Repasadores Eco', 'Repasadores toalla mister trapo'
    ]},
    { linea: 'LINEA RIEGO', tipo: 'producto', items: [
        'Sapito riego', 'Manguera 15 mts 1/2', 'Manguera 25 mts 1/2'
    ]},
    { linea: 'LINEA SAHUMERIOS', tipo: 'producto', items: [
        'Carbon neutro sagrada madre C/U (Caja de 24)', 'Bomba humo sagrada madre x4',
        'Cono cascada x10', 'sahumerios banglades x10 finos', 'Sahumerios triple duracion x 5 gruesos'
    ]},
    { linea: 'LINEA SECADOR PARA PISO', tipo: 'producto', items: [
        'Secador doble Salzano 41cm', 'Secador doble Salzano 35 cm',
        'SECADOR DOBLE ECO house', 'Secador de piso salzano'
    ]},
    { linea: 'LINEA SOPAPA', tipo: 'producto', items: ['Sopapa Grande20CM', 'Sopapa Chica11CM', 'Sopapa C/mango'] },
    { linea: 'LINEA TRAMPA P/MOSCA', tipo: 'producto', items: ['Trampa P/mosca'] },
    { linea: 'LINEA TRAPO PISO', tipo: 'producto', items: [
        'Trapo de pisos blancos', 'Trapo de pisos consorcios blanco MT',
        'Trapo de pisos consorcios gris MT', 'Trapo de pisos gris MT',
        'Trapo de pisos rayados linea 10', 'Trapo de pisos blanco linea 10', 'Trapo de pisos gris linea 10'
    ]},
    { linea: 'LINEA VELAS', tipo: 'producto', items: ['Velas Cortas 10cm', 'Velas Largas 20cm'] },
    { linea: 'LINEA VIRULANA', tipo: 'producto', items: ['Virulana x10 (lana de acero)'] },
    { linea: 'LINEA TOALLA FEMENINA - ALGODON', tipo: 'producto', items: [
        'Toallas femeninas doncella x 8', 'Protector diario doncella x20', 'Algodón doncella'
    ]},

    // ── LÍQUIDOS (litros) ───────────────────────────────────
    { linea: 'LINEA P/AUTO', tipo: 'liquido', items: [
        'Shaapoo P/autos', 'Silicona de vainilla y Transparente',
        'Limpiador desengrasante para manos',
        'Shampoo para autos sin frotar 850cc en 20l de auga', 'Renovador Vinilico (silicona)'
    ]},
    { linea: 'LINEA DE ALCOHOL', tipo: 'liquido', items: ['Alcohol puro', 'Alcohol de quemar'] },
    { linea: 'LINEA BAÑO', tipo: 'liquido', items: [
        'Quita Sarro', 'Composicion P/baños quimicos', 'Limpiador desinfectante para baños'
    ]},
    { linea: 'LINEA DE BOMBAS', tipo: 'liquido', items: [
        'Bombas efervescentes', 'Jabon maravilla', 'Bombas blanqueadoras'
    ]},
    { linea: 'LINEA DE CERAS', tipo: 'liquido', items: [
        'Cera blem', 'Cera Glo Cot', 'Cera 8M incolora', 'Cera Echo incolora',
        'Cera Negra-Roja 8M', 'Porcelanato (CERA)'
    ]},
    { linea: 'LINEA CREOLINA', tipo: 'liquido', items: ['Creolina'] },
    { linea: 'LINEA COCINA', tipo: 'liquido', items: [
        'Desengrasante industrial', 'Desengrasante cocina', 'Cif en Crema', 'Limpia Horno'
    ]},
    { linea: 'LINEA DERRIBANTE P/INSECTO', tipo: 'liquido', items: ['Derribante'] },
    { linea: 'LINEA DESODORANTE P/PISO', tipo: 'liquido', items: [
        'Desodorante P/piso', 'Desinfectante P/piso'
    ]},
    { linea: 'LINEA DETERGENTE', tipo: 'liquido', items: [
        'Detergente conc. Neutro', 'Detergente Nacarado', 'Detergente de Glicerina',
        'Detergente industrial', 'Detergente T/Cif', 'Detergente conc-neutro puro'
    ]},
    { linea: 'LINEA INSECTICIDA (LIQUIDO)', tipo: 'liquido', items: [
        'Insecticida perfumado T/flit', 'Repelente P/mosquito'
    ]},
    { linea: 'LINEA JABON PREMIUM', tipo: 'liquido', items: [
        'Jabon liquido ala/suav. premiun', 'Jabon liquido desengrasante',
        'Jabon liquido Famat/suav. Doble perfume', 'Jabon liquido ariel premiun',
        'Jabon liquido ropa fina', 'Jabon liquido skip premiun', 'Jabon Ace', 'Jabon ultra perfumado'
    ]},
    { linea: 'LINEA JABON ECONOMICO', tipo: 'liquido', items: [
        'Jabon liquido ARIEL Eco', 'Jabon skip con suavizante', 'Jabon liquido skip eco',
        'Jabon liquido Ala c/suavizante eco', 'Jabon liquido extra c/suavizante'
    ]},
    { linea: 'LINEA JABON TOCADOR P/MANOS', tipo: 'liquido', items: ['Jabon Tocador'] },
    { linea: 'LINEA LAVANDINA', tipo: 'liquido', items: [
        'Lavandina', 'Lavandina en gel', 'Lavandina R/blanca', 'Lavandina R/color'
    ]},
    { linea: 'LINEA LAVAVAJILLAS', tipo: 'liquido', items: [
        'Abrillantador P/lavavajillas', 'Sal P/lavavaijllas', 'Jabon en gel P/lavavajillas'
    ]},
    { linea: 'LINEA LIMPIA VIDRIOS (LIQUIDO)', tipo: 'liquido', items: ['Limpia vidrios'] },
    { linea: 'LINEA LIMPIADOR P/LAVARROPA', tipo: 'liquido', items: [
        'Lava Matic', 'Pastilla limpia lavarropas x12 (caja)', 'Pastilla limpia lavarropas C/U'
    ]},
    { linea: 'LINEA LIQUIDO P/LAMPAZO', tipo: 'liquido', items: [
        'Liquido P/lampazo C/cera Fragancia frutilla',
        'Liquido P/lampazo siliconado y perfumado', 'Liquido lampazo plus'
    ]},
    { linea: 'LINEA LUSTRA MUEBLES (LIQUIDO)', tipo: 'liquido', items: ['Lustra mueble cremoso'] },
    { linea: 'LINEA MATA ALACRAN', tipo: 'liquido', items: ['Mata alacran'] },
    { linea: 'LINEA DOY PACK', tipo: 'liquido', items: ['Doy Pack limpia vidrio', 'Doy Pack lysoform'] },
    { linea: 'LINEA PERFUME P/ROPA', tipo: 'liquido', items: [
        'Perfume P/ropa al alcohol', 'Perfume P/ropa al agua', 'Perfumina'
    ]},
    { linea: 'LINEA PILETA (LIQUIDO)', tipo: 'liquido', items: [
        'Cloro', 'Pastillas de cloro triple accion x 5 200g',
        'Pastillas de cloro triple accion C/U 200g', 'Pastilla de cloro 50g',
        'Clarificante Precipitante', 'Alguicida', 'Cloro granulado',
        'Cloro granulado multifuncion', 'Regulador pH'
    ]},
    { linea: 'LINEA QUITA MANCHAS P/ROPA', tipo: 'liquido', items: [
        'Quita manchas Trenet', 'Quita manchas oxi'
    ]},
    { linea: 'LINEA REPELENTE P/PERROGATO', tipo: 'liquido', items: [
        'Repelente para perRo y gato (NO Toxico)'
    ]},
    { linea: 'LINEA SHAMPOO-ENJUAGUE', tipo: 'liquido', items: ['Shampoo-enjuague sedal'] },
    { linea: 'LINEA SHAMPOO PERRO', tipo: 'liquido', items: [
        'Crema enjuague canino', 'Shampoo canino'
    ]},
    { linea: 'LINEA SUAVIZANTE', tipo: 'liquido', items: [
        'Suavizante celeste Clasico', 'Suavizante Blanco Clasico',
        'Suavizante comfort', 'Suavizante coniglio', 'Suavizante vivere',
        'Suavizante Downy Doble Perfume', 'Suavizante ultra perfumado'
    ]},
    { linea: 'LINEA VINAGRE', tipo: 'liquido', items: ['Vinagre de limpieza'] },

    // ── A GRANEL (kilos) ────────────────────────────────────
    { linea: 'LINEA BALANCEADO ANIMALES (GRANEL)', tipo: 'granel', items: [
        'Comida P/gato Vagoneta', 'Comida P/cachorro Vagoneta',
        'comida P/perro Vagoneta', 'Balanceado P/conejo'
    ]},
    { linea: 'LINEA DE BICARBONATO - PERCARBONATO', tipo: 'granel', items: [
        'Bicarbonato de sodio', 'Percarbonato'
    ]},
    { linea: 'LINEA COCINA (GRANEL)', tipo: 'granel', items: ['Polvo limpiador tipo odex'] },
    { linea: 'LINEA JABON EN POLVO X KILO', tipo: 'granel', items: [
        'jabon en polvo clorado', 'jabon en polvo'
    ]},
    { linea: 'LINEA SODA CAUTICA X KILO', tipo: 'granel', items: ['Soda Cautica granulado'] }
];
