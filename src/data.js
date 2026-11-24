/* Camisa 11 — dados base. Clubes reais; jogadores, atributos e valores são gerados pelo jogo. */
var C11_DATA = {
  divisions: {
    A: ['Flamengo','Palmeiras','Cruzeiro','Fluminense','Botafogo','Atlético Mineiro','São Paulo','Bahia','Corinthians','Internacional','Grêmio','Vasco da Gama','Bragantino','Santos','Athletico Paranaense','Mirassol','Vitória','Coritiba','Chapecoense','Remo'],
    B: ['Fortaleza','Sport','Ceará','Juventude','Atlético Goianiense','Cuiabá','Goiás','América-MG','Grêmio Novorizontino','Criciúma','Vila Nova','Avaí','CRB','Ponte Preta','Operário-PR','Náutico','Botafogo-SP','Londrina','Athletic','São Bernardo'],
    C: ['Paysandu','Guarani','Santa Cruz','Amazonas','Ferroviária','Volta Redonda','Figueirense','Brusque','Caxias','Botafogo-PB','Maringá','Ypiranga','Confiança','Ituano','Anápolis','Barra','Floresta','Itabaiana','Maranhão','Inter de Limeira'],
    D: ['CSA','ABC','Sampaio Corrêa','Portuguesa','Joinville','Retrô','Tombense','Nacional-AM','Treze','Brasil de Pelotas','ASA','Gama','América-RJ','Água Santa','Noroeste','Nova Iguaçu','Madureira','Aparecidense','Manauara','Rio Branco-ES']
  },
  // c1 principal, c2 secundária, c3 detalhe, pat: liso | listras | listras_h | faixa | faixa_h | metade
  kits: {
    'América-RJ':['#c8102e','#ffffff','#c8102e','liso'],'Água Santa':['#1d4fa0','#ffffff','#d4202b','liso'],'Noroeste':['#c8102e','#ffffff','#c8102e','liso'],
    'Nova Iguaçu':['#f28c00','#ffffff','#0b7a3b','liso'],'Madureira':['#f2c200','#1d4fa0','#d4202b','listras'],'Aparecidense':['#0b7a3b','#ffffff','#0b7a3b','listras'],
    'Manauara':['#0e2c5a','#f2c200','#0e2c5a','liso'],
    'Athletic':['#111111','#ffffff','#111111','listras'],'São Bernardo':['#f2c200','#111111','#f2c200','liso'],'Ypiranga':['#0b7a3b','#f2c200','#0b7a3b','listras'],
    'Confiança':['#1d4fa0','#ffffff','#1d4fa0','liso'],'Ituano':['#c8102e','#111111','#ffffff','listras'],'Anápolis':['#c8102e','#ffffff','#c8102e','liso'],
    'Barra':['#0e2c5a','#d4202b','#ffffff','liso'],'Floresta':['#0b7a3b','#ffffff','#0b7a3b','liso'],'Itabaiana':['#1c4e9c','#ffffff','#d4202b','liso'],
    'Maranhão':['#1d4fa0','#d4202b','#ffffff','listras'],'CSA':['#1d4fa0','#ffffff','#1d4fa0','listras'],'ABC':['#111111','#ffffff','#111111','liso'],
    'Sampaio Corrêa':['#f2c200','#0b7a3b','#d4202b','faixa_h'],'Brasiliense':['#f2c200','#0b7a3b','#f2c200','liso'],'Joinville':['#d4202b','#111111','#ffffff','listras'],
    'Portuguesa':['#d4202b','#0b7a3b','#ffffff','faixa_h'],'Retrô':['#0e2c5a','#f2c200','#0e2c5a','liso'],'Tombense':['#c8102e','#ffffff','#c8102e','liso'],
    'Nacional-AM':['#1d4fa0','#ffffff','#1d4fa0','liso'],'América-RN':['#c8102e','#ffffff','#c8102e','liso'],'Treze':['#111111','#ffffff','#111111','listras'],
    'Brasil de Pelotas':['#c8102e','#111111','#c8102e','listras'],'Ferroviário':['#c8102e','#111111','#ffffff','listras'],'ASA':['#111111','#ffffff','#111111','liso'],
    'Gama':['#0b7a3b','#ffffff','#0b7a3b','liso'],'Uberlândia':['#0b7a3b','#ffffff','#0b7a3b','liso'],'Goiatuba':['#1d4fa0','#ffffff','#1d4fa0','liso'],
    'Juazeirense':['#f2c200','#1d4fa0','#f2c200','liso'],
    'Flamengo':['#c8102e','#111111','#ffffff','listras_h'],'Palmeiras':['#0b6b3a','#ffffff','#0b6b3a','liso'],'Cruzeiro':['#1450a0','#ffffff','#1450a0','liso'],
    'Fluminense':['#8c1d3a','#0f6b3d','#ffffff','listras'],'Athletico Paranaense':['#c8102e','#111111','#ffffff','listras_h'],'Bahia':['#1f5fae','#e4002b','#ffffff','faixa_h'],
    'Atlético Mineiro':['#111111','#ffffff','#c9a227','listras'],'Santos':['#ffffff','#111111','#ffffff','liso'],'Bragantino':['#ffffff','#d50032','#0c2340','liso'],
    'Vasco da Gama':['#111111','#ffffff','#e4002b','faixa'],'São Paulo':['#ffffff','#e4002b','#111111','faixa_h'],'Botafogo':['#111111','#ffffff','#111111','listras'],
    'Corinthians':['#ffffff','#111111','#ffffff','liso'],
    'Internacional':['#d50032','#ffffff','#d50032','liso'],'Grêmio':['#2f86c9','#111111','#ffffff','listras'],'Fortaleza':['#1f4e9c','#d50032','#ffffff','listras_h'],
    'Coritiba':['#00703c','#ffffff','#00703c','liso'],'Vitória':['#d50032','#111111','#ffffff','listras_h'],'Mirassol':['#ffd200','#00843d','#ffd200','liso'],
    'Sport':['#d50032','#111111','#ffd200','listras_h'],'Ceará':['#111111','#ffffff','#111111','listras'],'Juventude':['#00843d','#ffffff','#00843d','listras'],
    'Goiás':['#00843d','#ffffff','#00843d','liso'],'Remo':['#0a2463','#ffffff','#0a2463','liso'],'Chapecoense':['#00843d','#ffffff','#00843d','liso'],
    'Grêmio Novorizontino':['#ffd200','#111111','#ffd200','liso'],
    'Atlético Goianiense':['#d50032','#111111','#d50032','listras'],'Cuiabá':['#ffd200','#00843d','#ffd200','liso'],'Criciúma':['#ffd200','#111111','#ffffff','listras'],
    'Vila Nova':['#d50032','#ffffff','#d50032','liso'],'Náutico':['#d50032','#ffffff','#d50032','listras'],'Avaí':['#1f5fae','#ffffff','#1f5fae','listras'],
    'América-MG':['#00843d','#111111','#ffffff','listras'],'Ponte Preta':['#111111','#ffffff','#111111','faixa'],'CRB':['#d50032','#ffffff','#d50032','listras_h'],
    'Paysandu':['#4aa3df','#ffffff','#4aa3df','listras'],'Guarani':['#00843d','#ffffff','#00843d','liso'],'Santa Cruz':['#d50032','#111111','#ffffff','listras_h'],
    'Figueirense':['#111111','#ffffff','#111111','listras'],
    'Botafogo-PB':['#111111','#ffffff','#d50032','listras'],'Ferroviária':['#8c1d3a','#ffffff','#8c1d3a','liso'],'ABC':['#111111','#ffffff','#111111','liso'],
    'Sampaio Corrêa':['#ffd200','#d50032','#00843d','listras_h'],'Brasiliense':['#ffd200','#00843d','#ffd200','liso'],'Gama':['#00843d','#ffffff','#00843d','liso'],
    'Treze':['#111111','#ffffff','#111111','listras'],'CSA':['#1f5fae','#ffffff','#1f5fae','listras'],'Brusque':['#ffd200','#d50032','#ffffff','faixa_h'],
    'Rio Branco-ES':['#111111','#ffffff','#111111','listras'],'Vitória-ES':['#1f5fae','#ffffff','#1f5fae','liso'],'Portuguesa-SP':['#d50032','#00843d','#ffffff','faixa_h'],
    'Ypiranga-RS':['#ffd200','#00843d','#ffd200','liso'],'Londrina':['#4aa3df','#ffffff','#4aa3df','listras'],'Operário-PR':['#111111','#ffffff','#111111','listras'],'Botafogo-SP':['#d50032','#ffffff','#111111','listras'],'Volta Redonda':['#ffd200','#111111','#ffffff','listras'],'Amazonas':['#ffd200','#111111','#ffd200','liso'],'Maringá':['#1f5fae','#ffffff','#1f5fae','liso'],'Inter de Limeira':['#111111','#ffffff','#111111','listras'],'Caxias':['#8c1d3a','#ffffff','#8c1d3a','liso']
  },
  short: {'Athletico Paranaense':'Athletico','Atlético Mineiro':'Atlético-MG','Bragantino':'Bragantino','Vasco da Gama':'Vasco','Grêmio Novorizontino':'Novorizontino','Atlético Goianiense':'Atlético-GO','Sampaio Corrêa':'Sampaio','Nacional-AM':'Nacional','América-RJ':'América-RJ','Brasil de Pelotas':'Brasil-RS','São Bernardo':'S. Bernardo'},
  first: ['Gabriel','Lucas','Matheus','Pedro','Guilherme','Rafael','Felipe','Bruno','Vinícius','Thiago','Caio','João','Diego','André','Rodrigo','Leonardo','Gustavo','Eduardo','Daniel','Marcelo','Igor','Yuri','Wesley','Everton','Ruan','Kauã','Arthur','Davi','Enzo','Samuel','Henrique','Vitor','Luan','Erick','Jean','Wallace','Douglas','Marcos','Fábio','Alex','Renan','Cauê','Júlio','Hugo','Otávio','Murilo','Nathan','Anderson','Wellington','Ramon','Breno','Alan','Patrick','Robson','Elias','Fernando','Ítalo','Lorran','Matheus','Gabriel'],
  last: ['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Ferreira','Rodrigues','Almeida','Nascimento','Carvalho','Araújo','Ribeiro','Gomes','Martins','Rocha','Barbosa','Moura','Cardoso','Teixeira','Correia','Mendes','Freitas','Pinto','Vieira','Monteiro','Batista','Duarte','Farias','Campos','Nogueira','Macedo','Siqueira','Prado','Brandão','Leite','Rezende','Fonseca','Queiroz','Tavares','Assis','Paiva','Sales','Bezerra','Matos','Peixoto','Xavier'],
  nick: ['Gabizinho','Pedrinho','Juninho','Neto','Kaio','Tchê','Dudu','Biel','Paulinho','Luizão','Zé Carlos','Marquinhos','Fabinho','Thiaguinho','Ricardinho','Netinho','Léo','Vitinho','Cacá','Didi','Toninho','Mosquito','Pirata','Tutinha','Rony','Bobô','Galego','Baiano','Cearense','Mineiro']
};
if (typeof module !== 'undefined') module.exports = C11_DATA;
