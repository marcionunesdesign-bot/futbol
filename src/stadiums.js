/* FUTBOL — estádios reais dos clubes (nome popular, cidade, capacidade aproximada) e o "jeitão" visual de cada um.
   Nomes comerciais de patrocinador foram trocados pelo nome popular do estádio.
   t: arena (moderna, arquibancada colada) | bowl (oval grande) | classic (4 arquibancadas retas) | small (só a principal coberta)
   roof: full | partial | main | none · seats: cores das cadeiras · grass: tom do gramado · syn: gramado sintético
   ends: arquibancadas atrás dos gols (full | low | none) · open: um lado aberto (ferradura) · track: pista de atletismo */
const C11_STADIUMS=(()=>{
  const S={
    // Série A
    'Flamengo':{n:'Maracanã',c:'Rio de Janeiro',cap:78000,t:'bowl',roof:'full',seats:['#1f4fa0','#f2c230','#f4f4f4'],tiers:2},
    'Fluminense':{n:'Maracanã',c:'Rio de Janeiro',cap:78000,t:'bowl',roof:'full',seats:['#1f4fa0','#f2c230','#f4f4f4'],tiers:2},
    'Palmeiras':{n:'Arena Palestra Itália',c:'São Paulo',cap:43000,t:'arena',roof:'full',seats:['#1f5c38','#2a2f33'],syn:1,tiers:2},
    'Cruzeiro':{n:'Mineirão',c:'Belo Horizonte',cap:62000,t:'bowl',roof:'full',seats:['#9aa3ab','#2f5aa8'],tiers:2},
    'Atlético Mineiro':{n:'Arena do Galo',c:'Belo Horizonte',cap:46000,t:'arena',roof:'full',seats:['#1b1b1b','#e8e8e8'],tiers:2},
    'Botafogo':{n:'Nilton Santos (Engenhão)',c:'Rio de Janeiro',cap:44000,t:'arena',roof:'full',seats:['#2a2d31','#f4f4f4'],syn:1,arches:1,tiers:2},
    'São Paulo':{n:'Morumbi',c:'São Paulo',cap:66000,t:'bowl',roof:'partial',seats:['#c8102e','#f4f4f4','#151515'],tiers:2},
    'Bahia':{n:'Fonte Nova',c:'Salvador',cap:48000,t:'arena',roof:'full',seats:['#1d4fa0','#d4202b','#f4f4f4'],open:1,tiers:2},
    'Corinthians':{n:'Arena Corinthians',c:'São Paulo',cap:49000,t:'arena',roof:'partial',seats:['#3b4046','#1a1a1a'],tiers:2},
    'Internacional':{n:'Beira-Rio',c:'Porto Alegre',cap:50000,t:'bowl',roof:'full',seats:['#c8102e'],tiers:2},
    'Grêmio':{n:'Arena do Grêmio',c:'Porto Alegre',cap:55000,t:'arena',roof:'full',seats:['#1d6fb8','#2a2f33'],tiers:2},
    'Vasco da Gama':{n:'São Januário',c:'Rio de Janeiro',cap:21000,t:'classic',roof:'main',seats:['#f0f0f0','#1a1a1a']},
    'Bragantino':{n:'Nabi Abi Chedid',c:'Bragança Paulista',cap:17000,t:'small',roof:'main',seats:['#d4202b','#f4f4f4'],ends:'low'},
    'Santos':{n:'Vila Belmiro',c:'Santos',cap:16000,t:'classic',roof:'main',seats:['#f4f4f4','#1a1a1a']},
    'Athletico Paranaense':{n:'Arena da Baixada',c:'Curitiba',cap:42000,t:'arena',roof:'full',seats:['#b0121b','#1a1a1a'],syn:1,tiers:2},
    'Mirassol':{n:'Maião',c:'Mirassol',cap:15000,t:'small',roof:'main',seats:['#f2c230','#0b7a3b'],ends:'low'},
    'Vitória':{n:'Barradão',c:'Salvador',cap:30000,t:'bowl',roof:'partial',seats:['#c8102e','#1a1a1a']},
    'Coritiba':{n:'Couto Pereira',c:'Curitiba',cap:40000,t:'classic',roof:'partial',seats:['#0b5d2a','#f4f4f4'],tiers:2},
    'Chapecoense':{n:'Arena Condá',c:'Chapecó',cap:20000,t:'classic',roof:'main',seats:['#0b7a3b','#f4f4f4']},
    'Remo':{n:'Baenão',c:'Belém',cap:13000,t:'classic',roof:'main',seats:['#1b2f6b','#f4f4f4']},
    // Série B
    'Fortaleza':{n:'Castelão',c:'Fortaleza',cap:63000,t:'bowl',roof:'full',seats:['#1d4fa0','#d4202b','#f4f4f4'],tiers:2},
    'Ceará':{n:'Castelão',c:'Fortaleza',cap:63000,t:'bowl',roof:'full',seats:['#1d4fa0','#d4202b','#f4f4f4'],tiers:2},
    'Sport':{n:'Ilha do Retiro',c:'Recife',cap:27000,t:'classic',roof:'main',seats:['#c8102e','#1a1a1a']},
    'Juventude':{n:'Alfredo Jaconi',c:'Caxias do Sul',cap:19000,t:'classic',roof:'main',seats:['#0b7a3b','#f4f4f4']},
    'Atlético Goianiense':{n:'Antônio Accioly',c:'Goiânia',cap:12000,t:'small',roof:'main',seats:['#c8102e','#1a1a1a'],ends:'low'},
    'Cuiabá':{n:'Arena Pantanal',c:'Cuiabá',cap:44000,t:'arena',roof:'full',seats:['#0b7a3b','#f2c230'],tiers:2},
    'Goiás':{n:'Serrinha',c:'Goiânia',cap:14000,t:'small',roof:'main',seats:['#0b5d2a','#f4f4f4'],ends:'low'},
    'América-MG':{n:'Independência',c:'Belo Horizonte',cap:23000,t:'arena',roof:'full',seats:['#0b7a3b','#f4f4f4']},
    'Grêmio Novorizontino':{n:'Jorge Ismael de Biasi',c:'Novo Horizonte',cap:16000,t:'small',roof:'main',seats:['#f2c230','#1a1a1a'],ends:'low'},
    'Criciúma':{n:'Heriberto Hülse',c:'Criciúma',cap:19000,t:'classic',roof:'main',seats:['#f2c230','#1a1a1a']},
    'Vila Nova':{n:'OBA',c:'Goiânia',cap:11000,t:'small',roof:'main',seats:['#c8102e','#f4f4f4'],ends:'low'},
    'Avaí':{n:'Ressacada',c:'Florianópolis',cap:17000,t:'classic',roof:'main',seats:['#1d4fa0','#f4f4f4']},
    'CRB':{n:'Rei Pelé',c:'Maceió',cap:17000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'Ponte Preta':{n:'Moisés Lucarelli',c:'Campinas',cap:19000,t:'classic',roof:'main',seats:['#1a1a1a','#f4f4f4']},
    'Operário-PR':{n:'Germano Krüger',c:'Ponta Grossa',cap:10000,t:'small',roof:'main',seats:['#1a1a1a','#f4f4f4'],ends:'low'},
    'Náutico':{n:'Aflitos',c:'Recife',cap:19000,t:'classic',roof:'main',seats:['#c8102e','#f4f4f4']},
    'Botafogo-SP':{n:'Santa Cruz',c:'Ribeirão Preto',cap:29000,t:'bowl',roof:'main',seats:['#c8102e','#1a1a1a']},
    'Londrina':{n:'Estádio do Café',c:'Londrina',cap:30000,t:'bowl',roof:'main',seats:['#5fa8dc','#f4f4f4']},
    'Athletic':{n:'Joaquim Portugal',c:'São João del-Rei',cap:6000,t:'small',roof:'main',seats:['#1a1a1a','#f4f4f4'],ends:'none'},
    'São Bernardo':{n:'Primeiro de Maio',c:'São Bernardo do Campo',cap:15000,t:'small',roof:'main',seats:['#f2c230','#1a1a1a'],ends:'low'},
    // Série C
    'Paysandu':{n:'Curuzu',c:'Belém',cap:16000,t:'classic',roof:'main',seats:['#5fa8dc','#f4f4f4']},
    'Guarani':{n:'Brinco de Ouro',c:'Campinas',cap:29000,t:'bowl',roof:'main',seats:['#0b7a3b','#f4f4f4']},
    'Santa Cruz':{n:'Arruda',c:'Recife',cap:60000,t:'bowl',roof:'main',seats:['#c8102e','#1a1a1a','#f4f4f4'],tiers:2},
    'Amazonas':{n:'Carlos Zamith',c:'Manaus',cap:10000,t:'small',roof:'main',seats:['#f2c230','#1a1a1a'],ends:'low'},
    'Ferroviária':{n:'Fonte Luminosa',c:'Araraquara',cap:20000,t:'bowl',roof:'main',seats:['#7a1f2b','#f4f4f4'],track:1},
    'Volta Redonda':{n:'Raulino de Oliveira',c:'Volta Redonda',cap:18000,t:'classic',roof:'main',seats:['#f2c230','#1a1a1a']},
    'Figueirense':{n:'Orlando Scarpelli',c:'Florianópolis',cap:19000,t:'classic',roof:'main',seats:['#1a1a1a','#f4f4f4']},
    'Brusque':{n:'Augusto Bauer',c:'Brusque',cap:5000,t:'small',roof:'main',seats:['#c8102e','#f2c230'],ends:'none'},
    'Caxias':{n:'Centenário',c:'Caxias do Sul',cap:22000,t:'classic',roof:'main',seats:['#7a1f2b','#f4f4f4']},
    'Botafogo-PB':{n:'Almeidão',c:'João Pessoa',cap:25000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'Maringá':{n:'Willie Davids',c:'Maringá',cap:21000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'Ypiranga':{n:'Colosso da Lagoa',c:'Erechim',cap:22000,t:'bowl',roof:'main',seats:['#0b7a3b','#f2c230'],track:1},
    'Confiança':{n:'Batistão',c:'Aracaju',cap:15000,t:'bowl',roof:'main',seats:['#1d4fa0','#f4f4f4']},
    'Ituano':{n:'Novelli Júnior',c:'Itu',cap:18000,t:'classic',roof:'main',seats:['#c8102e','#1a1a1a']},
    'Anápolis':{n:'Jonas Duarte',c:'Anápolis',cap:13000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'Barra':{n:'Estádio do Barra',c:'Itajaí',cap:5500,t:'small',roof:'main',seats:['#1d4fa0','#f4f4f4'],ends:'low',fresh:1},
    'Floresta':{n:'Presidente Vargas',c:'Fortaleza',cap:20000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'Itabaiana':{n:'Etelvino Mendonça',c:'Itabaiana',cap:10000,t:'small',roof:'main',seats:['#1d4fa0','#f4f4f4'],ends:'low'},
    'Maranhão':{n:'Castelão',c:'São Luís',cap:40000,t:'bowl',roof:'main',seats:['#9aa3ab'],tiers:2},
    'Inter de Limeira':{n:'Limeirão',c:'Limeira',cap:18000,t:'bowl',roof:'main',seats:['#1a1a1a','#f4f4f4']},
    // Série D
    'CSA':{n:'Rei Pelé',c:'Maceió',cap:17000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'ABC':{n:'Frasqueirão',c:'Natal',cap:18000,t:'classic',roof:'main',seats:['#1a1a1a','#f4f4f4']},
    'Sampaio Corrêa':{n:'Castelão',c:'São Luís',cap:40000,t:'bowl',roof:'main',seats:['#9aa3ab'],tiers:2},
    'Portuguesa':{n:'Canindé',c:'São Paulo',cap:19000,t:'classic',roof:'main',seats:['#c8102e','#0b7a3b']},
    'Joinville':{n:'Arena Joinville',c:'Joinville',cap:22000,t:'arena',roof:'partial',seats:['#c8102e','#1a1a1a']},
    'Retrô':{n:'Arena de Pernambuco',c:'São Lourenço da Mata',cap:45000,t:'arena',roof:'full',seats:['#c8102e','#f4f4f4'],tiers:2},
    'Tombense':{n:'Almeidão',c:'Tombos',cap:3000,t:'small',roof:'main',seats:['#c8102e','#f4f4f4'],ends:'none'},
    'Nacional-AM':{n:'Arena da Amazônia',c:'Manaus',cap:44000,t:'arena',roof:'full',seats:['#f2c230','#e86a1f','#c8102e'],tiers:2},
    'Treze':{n:'Amigão',c:'Campina Grande',cap:19000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'Brasil de Pelotas':{n:'Bento Freitas',c:'Pelotas',cap:18000,t:'classic',roof:'main',seats:['#c8102e','#1a1a1a']},
    'ASA':{n:'Coaracy da Mata Fonseca',c:'Arapiraca',cap:17000,t:'bowl',roof:'main',seats:['#9aa3ab']},
    'Gama':{n:'Bezerrão',c:'Gama',cap:20000,t:'bowl',roof:'main',seats:['#0b7a3b','#f4f4f4']},
    'América-RJ':{n:'Giulite Coutinho',c:'Mesquita',cap:13000,t:'small',roof:'main',seats:['#c8102e','#f4f4f4'],ends:'low'},
    'Água Santa':{n:'Distrital do Inamar',c:'Diadema',cap:10000,t:'small',roof:'main',seats:['#1d4fa0','#f4f4f4'],ends:'low'},
    'Noroeste':{n:'Alfredo de Castilho',c:'Bauru',cap:18000,t:'classic',roof:'main',seats:['#c8102e','#f4f4f4']},
    'Nova Iguaçu':{n:'Laranjão',c:'Nova Iguaçu',cap:6000,t:'small',roof:'main',seats:['#f28c00','#f4f4f4'],ends:'none'},
    'Madureira':{n:'Conselheiro Galvão',c:'Rio de Janeiro',cap:5000,t:'small',roof:'main',seats:['#f2c230','#1d4fa0'],ends:'none'},
    'Manauara':{n:'Carlos Zamith',c:'Manaus',cap:10000,t:'small',roof:'main',seats:['#f28c00','#1a1a1a'],ends:'low'},
    'Aparecidense':{n:'Aníbal Batista de Toledo',c:'Aparecida de Goiânia',cap:6000,t:'small',roof:'main',seats:['#1d4fa0','#f4f4f4'],ends:'none'},
    'Rio Branco-ES':{n:'Kleber Andrade',c:'Cariacica',cap:21000,t:'arena',roof:'partial',seats:['#9aa3ab','#1a1a1a']},
  };
  // gramado: cada estádio tem um tom e um corte (determinístico pelo nome)
  const hash=s=>{let h=7;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h};
  const GR=[['#2f7a35','#388a3d'],['#2a7231','#327f38'],['#356f2e','#3e7d34'],['#2e7d3c','#368e45'],['#3a7a2f','#45893a']];
  function of(club){const name=club&&(club.name||club.id)||'';let s=S[name];
    if(!s){const cap=club&&club.div==='A'?40000:club&&club.div==='B'?20000:12000;s={n:'Estádio Municipal',c:'',cap,t:cap>30000?'bowl':cap>15000?'classic':'small',roof:'main',seats:['#9aa3ab'],ends:cap>15000?'full':'low'}}
    const h=hash(s.n);const g=s.syn?['#2f8c3a','#36993f']:GR[h%GR.length];
    return Object.assign({ends:'full',tiers:1,mow:s.syn?'stripes':['stripes','stripes','wide','checker'][h%4],wear:s.syn?0:s.t==='small'?.32:s.t==='classic'?.22:.12,grass:g,id:s.n},s)}
  return {of,list:S};
})();
