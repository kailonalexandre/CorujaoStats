"use client";

import { io, type Socket } from "socket.io-client";

import { PES_SOCKET_PATH } from "./pes-realtime";

type JoinPesGamesPayload = {
  groupId?: string;
};

type JoinPesGamePayload = {
  gameId: string;
  groupId?: string;
};

let pesSocket: Socket | null = null;

export async function getPesSocket() {
  if (pesSocket) return pesSocket;

  await fetch("/api/socket");

  pesSocket = io({
    path: PES_SOCKET_PATH,
    addTrailingSlash: false,
  });

  return pesSocket;
}

export async function joinPesGames(payload?: JoinPesGamesPayload) {
  const socket = await getPesSocket();
  socket.emit("joinPesGames", payload);
  return socket;
}

export async function joinPesGame(payload: JoinPesGamePayload) {
  const socket = await getPesSocket();
  socket.emit("joinPesGame", payload);
  return socket;
}

export async function leavePesGame(payload: JoinPesGamePayload) {
  const socket = await getPesSocket();
  socket.emit("leavePesGame", payload);
  return socket;
}
