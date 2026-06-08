import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient, type GameItemType } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

const ALL_PERMISSIONS = [
  "manage_players",
  "manage_games",
  "manage_items",
  "manage_raffles",
  "manage_matches",
  "view_stats",
  "manage_users",
] as const;

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

function getPoolConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: Number(url.searchParams.get("connection_limit") || 5),
  };
}

const adapter = new PrismaMariaDb(getPoolConfig(process.env.DATABASE_URL ?? ""));
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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const pesTeamGroups = [
  {
    name: "Copa do Mundo",
    teams: [
      "Brasil",
      "Argentina",
      "Inglaterra",
      "França",
      "Espanha",
      "Portugal",
      "Bélgica",
      "Alemanha",
      "Holanda",
      "Noruega",
    ],
  },
  {
    name: "Brasileirão",
    teams: [
      "Corinthians",
      "Flamengo",
      "Palmeiras",
      "Santos",
      "Botafogo",
      "Atlético-MG",
      "Cruzeiro",
      "Fluminense",
      "Grêmio",
      "Internacional",
    ],
  },
  {
    name: "Champions League",
    teams: [
      "PSG",
      "Arsenal",
      "Manchester City",
      "Real Madrid",
      "Barcelona",
      "Atlético de Madrid",
      "Liverpool",
      "Bayern de Munique",
      "Chelsea",
      "Milan",
    ],
  },
  {
    name: "Lendas",
    teams: [
      "Fireblast",
      "MeanMachine",
      "Monsters",
      "Powerball",
      "Predators",
      "Ranmakes",
      "ScreamBeem",
      "ThunderStrike",
      "WarmStorm",
      "Wildcats",
    ],
  },
];

const mortalKombat9CharacterNames = [
  "Baraka",
  "Cyber Sub-Zero",
  "Cyrax",
  "Ermac",
  "Freddy Krueger",
  "Jade",
  "Jax",
  "Johnny Cage",
  "Kabal",
  "Kano",
  "Kenshi",
  "Kitana",
  "Kratos",
  "Kung Lao",
  "Liu Kang",
  "Mileena",
  "Nightwolf",
  "Noob Saibot",
  "Quan Chi",
  "Raiden",
  "Rain",
  "Reptile",
  "Scorpion",
  "Sektor",
  "Shang Tsung",
  "Sheeva",
  "Sindel",
  "Skarlet",
  "Smoke",
  "Sonya Blade",
  "Stryker",
  "Sub-Zero",
];

const gameItems: Array<{
  id: string;
  gameSlug: string;
  name: string;
  type: GameItemType;
  groupName?: string;
}> = [
  ...pesTeamGroups.flatMap((group) =>
    group.teams.map((name) => ({
      id: `pes-${slugify(name)}`,
      gameSlug: "pes",
      name,
      type: "team" as const,
      groupName: group.name,
    })),
  ),

  ...mortalKombat9CharacterNames.map((name) => ({
    id: `mk-${slugify(name)}`,
    gameSlug: "mortal-kombat",
    name,
    type: "character" as const,
  })),

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

const adminUser = {
  name: process.env.AUTH_ADMIN_NAME || "Administrador",
  email: (process.env.AUTH_ADMIN_EMAIL || "admin@sorteador.local").toLowerCase(),
  password: process.env.AUTH_ADMIN_PASSWORD || "admin12345",
};

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

  await prisma.user.upsert({
    where: { email: adminUser.email },
    update: {
      name: adminUser.name,
      role: "admin",
      playerId: null,
      active: true,
      permissions: {
        deleteMany: {},
        create: ALL_PERMISSIONS.map((permission) => ({ permission })),
      },
    },
    create: {
      name: adminUser.name,
      email: adminUser.email,
      passwordHash: await hashPassword(adminUser.password),
      role: "admin",
      playerId: null,
      active: true,
      permissions: {
        create: ALL_PERMISSIONS.map((permission) => ({ permission })),
      },
    },
  });

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
        groupName: item.groupName ?? null,
        active: true,
      },
      create: {
        id: item.id,
        gameId,
        name: item.name,
        type: item.type,
        groupName: item.groupName ?? null,
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
