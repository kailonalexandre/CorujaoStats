import type { GameItemType } from "@prisma/client";

export const gameItemTypeLabels: Record<GameItemType, string> = {
  team: "Time",
  character: "Personagem",
  map: "Mapa",
  class: "Classe",
  weapon: "Arma",
  other: "Outro",
};

export const gameItemTypeDescriptions: Record<GameItemType, string> = {
  team: "Clubes e selecoes para jogos de futebol.",
  character: "Lutadores, operadores ou personagens jogaveis.",
  map: "Cenarios ou mapas que podem ser sorteados.",
  class: "Classes, funcoes ou estilos de jogo.",
  weapon: "Armas ou equipamentos especificos.",
  other: "Use para qualquer coisa que nao entre nas opcoes acima.",
};

export function getGameItemTypeLabel(type: GameItemType) {
  return gameItemTypeLabels[type] ?? type;
}
