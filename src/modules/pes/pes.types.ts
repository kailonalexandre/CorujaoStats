export type PesMatchStage = "group" | "repechage" | "final";

export type PesMatchStatus = "pending" | "draw_needs_penalties" | "finished";

export type PesRandom = () => number;

export type PesPlayer = {
  id: string;
  name: string;
  nickname?: string | null;
  photoUrl?: string | null;
  teamId?: string | null;
  teamName?: string | null;
};

export type PesPlayerInput = {
  id: string;
  name: string;
  nickname?: string | null;
  photoUrl?: string | null;
};

export type PesTeamInput = {
  id: string;
  name: string;
};

export type PesTournamentOptions = {
  groupCount: number;
  useRepechage?: boolean;
  allowTeamReuse?: boolean;
  random?: PesRandom;
};

export type PesDrawGroupsInput = {
  players: PesPlayerInput[];
  numberOfGroups: number;
  availableTeams: PesTeamInput[];
  useRepechage?: boolean;
  random?: PesRandom;
};

export type PesDrawGroupsResult =
  | {
      ok: true;
      groupData: PesGroup[];
      useRepechage: boolean;
    }
  | {
      ok: false;
      error: string;
      groupData: [];
      useRepechage: boolean;
    };

export type PesParticipant = PesPlayer & {
  team: PesTeamInput | null;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export type PesGroup = {
  id: string;
  letter: string;
  players: PesParticipant[];
};

export type PesMatchPlayer = {
  id: string;
  name: string;
  team: PesTeamInput | null;
};

export type PesMatch = {
  id: string;
  stage: PesMatchStage;
  round: number;
  groupId: string | null;
  groupLetter?: string | null;
  groupIndex?: number | null;
  matchIndex: number;
  player1Id?: string | null;
  player2Id?: string | null;
  player1Name: string;
  player2Name: string;
  player1: PesMatchPlayer;
  player2: PesMatchPlayer | null;
  goals1: number | null;
  goals2: number | null;
  pen1: number | null;
  pen2: number | null;
  penalties1: number | null;
  penalties2: number | null;
  winnerPlayerId: string | null;
  winnerId: string | null;
  loserId: string | null;
  draw: boolean;
  isFinished: boolean;
  status: PesMatchStatus;
  isBye: boolean;
};

export type PesRepechageContext = {
  matchId: string;
  playerToReplaceIfLoseId: string;
};

export type PesChampion = {
  playerId: string;
  name: string;
  nickname?: string | null;
  photoUrl?: string | null;
  teamName?: string | null;
  team: PesTeamInput | null;
  stage?: Extract<PesMatchStage, "final" | "repechage">;
};

export type PesTournamentState = {
  groups: PesGroup[];
  matches: PesMatch[];
  matchIdCounter: number;
  useRepechage: boolean;
  repechageContext: PesRepechageContext[];
  champion: PesChampion | null;
  repechageChampion: PesChampion | null;
};

export type PesScoreInput = {
  matchId: string;
  goals1: number;
  goals2: number;
  penalties1?: number | null;
  penalties2?: number | null;
};

export type PesGroupScoreInput = {
  gameState: PesTournamentState;
  matchId: string;
  goals1: number;
  goals2: number;
};

export type PesKnockoutScoreInput = PesGroupScoreInput & {
  pen1?: number | null;
  pen2?: number | null;
};

export type PesStanding = {
  playerId: string;
  playerName: string;
  photoUrl?: string | null;
  teamName?: string | null;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  position: number;
};

export type PesStandingRow = PesParticipant &
  PesStanding & {
  position: number;
  groupId: string;
  groupLetter: string;
  qualified: boolean;
  repechageEligible: boolean;
};

export type PesGroupStanding = {
  groupId: string;
  groupLetter: string;
  players: PesStandingRow[];
};

export type PesStandingsOptions = {
  useRepechage?: boolean;
};

export type PesQualifiedPlayer = {
  playerId: string;
  playerName: string;
  photoUrl?: string | null;
  teamName?: string | null;
  groupLetter: string;
  position: number;
};

export type PesQualifiedPlayersResult = {
  qualifiedPlayers: PesQualifiedPlayer[];
  repechagePlayers: PesQualifiedPlayer[];
};

export type PesChampionCheckResult = {
  champion: PesChampion | null;
  repechageChampion: PesChampion | null;
};

export type PesGameState = {
  id: string;
  name: string;
  gameType?: "pes";
  groupData: PesGroup[];
  matchData: PesMatch[];
  standings: PesStanding[];
  useRepechage: boolean;
  champion: PesChampion | null;
  repechageChampion: PesChampion | null;
  updatedAt: Date;
};

export type PesUiPlayer = {
  id: string;
  name: string;
  nickname?: string | null;
  photoUrl?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  position: number;
  qualified: boolean;
  repechageEligible: boolean;
};

export type PesUiGroup = {
  id: string;
  letter: string;
  players: PesUiPlayer[];
};

export type PesUiMatch = {
  id: string;
  stage: PesMatchStage;
  round: number;
  group: string | null;
  groupIndex: number | null;
  matchIndex: number;
  player1: string;
  player2: string;
  player1PhotoUrl?: string | null;
  player2PhotoUrl?: string | null;
  player1Team?: string | null;
  player2Team?: string | null;
  goals1: number | null;
  goals2: number | null;
  pen1: number | null;
  pen2: number | null;
  winner: string | null;
  draw: boolean;
  isFinished: boolean;
};

export type PesUiGameState = {
  id: string;
  name: string;
  gameType: "pes";
  groupData: PesUiGroup[];
  matchData: PesUiMatch[];
  standings: PesGroupStanding[];
  useRepechage: boolean;
  champion: PesChampion | null;
  repechageChampion: PesChampion | null;
  updatedAt: Date;
};
