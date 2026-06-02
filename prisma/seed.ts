import { PrismaClient, type GameItemType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

const defaultGroup = {
  id: "default-group",
  name: "Grupo Principal",
};

const games = [
  {
    id: "game-pes",
    name: "PES",
    slug: "pes",
    description: "Sorteio de times e registro de partidas de futebol.",
  },
  {
    id: "game-mortal-kombat",
    name: "Mortal Kombat",
    slug: "mortal-kombat",
    description: "Sorteio de personagens e historico de lutas.",
  },
  {
    id: "game-cs-go",
    name: "CS:GO",
    slug: "cs-go",
    description: "Sorteio de mapas, times e estatisticas de FPS.",
  },
  {
    id: "game-battlefield",
    name: "Battlefield",
    slug: "battlefield",
    description: "Sorteio de mapas, classes e estatisticas de batalha.",
  },
] as const;

const gameItems: Array<{
  id: string;
  gameSlug: string;
  name: string;
  type: GameItemType;
}> = [
  { id: "pes-real-madrid", gameSlug: "pes", name: "Real Madrid", type: "team" },
  { id: "pes-barcelona", gameSlug: "pes", name: "Barcelona", type: "team" },
  { id: "pes-manchester-city", gameSlug: "pes", name: "Manchester City", type: "team" },
  { id: "pes-liverpool", gameSlug: "pes", name: "Liverpool", type: "team" },
  { id: "pes-bayern-de-munique", gameSlug: "pes", name: "Bayern de Munique", type: "team" },
  { id: "pes-psg", gameSlug: "pes", name: "PSG", type: "team" },
  { id: "pes-milan", gameSlug: "pes", name: "Milan", type: "team" },
  { id: "pes-inter-de-milao", gameSlug: "pes", name: "Inter de Milao", type: "team" },
  { id: "pes-arsenal", gameSlug: "pes", name: "Arsenal", type: "team" },
  { id: "pes-borussia-dortmund", gameSlug: "pes", name: "Borussia Dortmund", type: "team" },

  { id: "mk-scorpion", gameSlug: "mortal-kombat", name: "Scorpion", type: "character" },
  { id: "mk-sub-zero", gameSlug: "mortal-kombat", name: "Sub-Zero", type: "character" },
  { id: "mk-liu-kang", gameSlug: "mortal-kombat", name: "Liu Kang", type: "character" },
  { id: "mk-raiden", gameSlug: "mortal-kombat", name: "Raiden", type: "character" },
  { id: "mk-johnny-cage", gameSlug: "mortal-kombat", name: "Johnny Cage", type: "character" },
  { id: "mk-sonya-blade", gameSlug: "mortal-kombat", name: "Sonya Blade", type: "character" },
  { id: "mk-kitana", gameSlug: "mortal-kombat", name: "Kitana", type: "character" },
  { id: "mk-mileena", gameSlug: "mortal-kombat", name: "Mileena", type: "character" },
  { id: "mk-baraka", gameSlug: "mortal-kombat", name: "Baraka", type: "character" },
  { id: "mk-noob-saibot", gameSlug: "mortal-kombat", name: "Noob Saibot", type: "character" },

  { id: "cs-dust-ii", gameSlug: "cs-go", name: "Dust II", type: "map" },
  { id: "cs-inferno", gameSlug: "cs-go", name: "Inferno", type: "map" },
  { id: "cs-mirage", gameSlug: "cs-go", name: "Mirage", type: "map" },
  { id: "cs-nuke", gameSlug: "cs-go", name: "Nuke", type: "map" },
  { id: "cs-cache", gameSlug: "cs-go", name: "Cache", type: "map" },
  { id: "cs-train", gameSlug: "cs-go", name: "Train", type: "map" },
  { id: "cs-overpass", gameSlug: "cs-go", name: "Overpass", type: "map" },
  { id: "cs-vertigo", gameSlug: "cs-go", name: "Vertigo", type: "map" },
  { id: "cs-ancient", gameSlug: "cs-go", name: "Ancient", type: "map" },
  { id: "cs-anubis", gameSlug: "cs-go", name: "Anubis", type: "map" },

  { id: "bf-operation-metro", gameSlug: "battlefield", name: "Operation Metro", type: "map" },
  { id: "bf-caspian-border", gameSlug: "battlefield", name: "Caspian Border", type: "map" },
  { id: "bf-siege-of-shanghai", gameSlug: "battlefield", name: "Siege of Shanghai", type: "map" },
  { id: "bf-golmud-railway", gameSlug: "battlefield", name: "Golmud Railway", type: "map" },
  { id: "bf-assault", gameSlug: "battlefield", name: "Assault", type: "class" },
  { id: "bf-engineer", gameSlug: "battlefield", name: "Engineer", type: "class" },
  { id: "bf-support", gameSlug: "battlefield", name: "Support", type: "class" },
  { id: "bf-recon", gameSlug: "battlefield", name: "Recon", type: "class" },
];

const players = [
  {
    id: "player-kyle",
    name: "Kyle",
    nickname: "Kyle",
    photoUrl: null,
  },
  {
    id: "player-henderson",
    name: "Henderson",
    nickname: "Henderson",
    photoUrl: null,
  },
] as const;

async function normalizeLegacyGames() {
  const legacyCsGo = await prisma.game.findUnique({
    where: { slug: "cs-go-cs2" },
  });
  const currentCsGo = await prisma.game.findUnique({
    where: { slug: "cs-go" },
  });

  if (legacyCsGo && !currentCsGo) {
    await prisma.game.update({
      where: { slug: "cs-go-cs2" },
      data: {
        id: "game-cs-go",
        name: "CS:GO",
        slug: "cs-go",
        description: "Sorteio de mapas, times e estatisticas de FPS.",
      },
    });
  }
}

async function main() {
  await normalizeLegacyGames();

  await prisma.group.upsert({
    where: { id: defaultGroup.id },
    update: {
      name: defaultGroup.name,
    },
    create: defaultGroup,
  });

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        name: game.name,
        description: game.description,
      },
      create: game,
    });
  }

  const gamesBySlug = await prisma.game.findMany({
    select: {
      id: true,
      slug: true,
    },
  });
  const gameIdBySlug = new Map(gamesBySlug.map((game) => [game.slug, game.id]));

  for (const item of gameItems) {
    const gameId = gameIdBySlug.get(item.gameSlug);

    if (!gameId) {
      throw new Error(`Jogo nao encontrado para o slug: ${item.gameSlug}`);
    }

    await prisma.gameItem.upsert({
      where: { id: item.id },
      update: {
        gameId,
        name: item.name,
        type: item.type,
        active: true,
      },
      create: {
        id: item.id,
        gameId,
        name: item.name,
        type: item.type,
        active: true,
      },
    });
  }

  for (const player of players) {
    await prisma.player.upsert({
      where: { id: player.id },
      update: {
        name: player.name,
        nickname: player.nickname,
        photoUrl: player.photoUrl,
        groupId: defaultGroup.id,
      },
      create: {
        ...player,
        groupId: defaultGroup.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
