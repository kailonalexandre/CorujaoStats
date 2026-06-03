import type { Server, Socket } from "socket.io";

import type { PesUiGameState } from "@/modules/pes";

export const PES_SOCKET_PATH = "/api/socket/io";

type JoinPesGamesPayload = {
  groupId?: string;
};

type JoinPesGamePayload =
  | string
  | {
      gameId?: string;
      id?: string;
      groupId?: string;
    };

type PesSocketCallbacks = {
  listGames: (groupId?: string) => Promise<PesUiGameState[]>;
  getGame: (gameId: string, groupId?: string) => Promise<PesUiGameState | null>;
};

declare global {
  var pesSocketServer: Server | undefined;
}

function pesGamesRoom(groupId?: string) {
  return groupId ? `pes:games:${groupId}` : "pes:games";
}

function pesGameRoom(gameId: string) {
  return `pes:game:${gameId}`;
}

function parseJoinPesGamePayload(payload: JoinPesGamePayload) {
  if (typeof payload === "string") {
    return {
      gameId: payload,
      groupId: undefined,
    };
  }

  return {
    gameId: payload.gameId ?? payload.id,
    groupId: payload.groupId,
  };
}

export function setPesSocketServer(io: Server) {
  globalThis.pesSocketServer = io;
}

export function getPesSocketServer() {
  return globalThis.pesSocketServer;
}

export function registerPesSocketHandlers(io: Server, callbacks: PesSocketCallbacks) {
  io.on("connection", (socket: Socket) => {
    socket.on("joinPesGames", async (payload: JoinPesGamesPayload | undefined) => {
      const groupId = payload?.groupId;
      socket.join(pesGamesRoom(groupId));
      socket.emit("pesGamesUpdated", await callbacks.listGames(groupId));
    });

    socket.on("joinPesGame", async (payload: JoinPesGamePayload) => {
      const { gameId, groupId } = parseJoinPesGamePayload(payload);
      if (!gameId) return;

      socket.join(pesGameRoom(gameId));
      const state = await callbacks.getGame(gameId, groupId);
      if (state) socket.emit("pesGameStateUpdated", state);
    });

    socket.on("leavePesGame", (payload: JoinPesGamePayload) => {
      const { gameId } = parseJoinPesGamePayload(payload);
      if (!gameId) return;

      socket.leave(pesGameRoom(gameId));
    });
  });
}

export function emitPesGamesUpdated(games: PesUiGameState[], groupId?: string) {
  getPesSocketServer()?.to(pesGamesRoom(groupId)).emit("pesGamesUpdated", games);
}

export function emitPesGameStateUpdated(gameState: PesUiGameState) {
  getPesSocketServer()?.to(pesGameRoom(gameState.id)).emit("pesGameStateUpdated", gameState);
}
