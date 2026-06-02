import type { Server as HttpServer } from "node:http";
import type { Socket as NetSocket } from "node:net";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketServer } from "socket.io";

import { getPesGameStateById, listActivePesGameStates } from "@/modules/pes";
import {
  PES_SOCKET_PATH,
  registerPesSocketHandlers,
  setPesSocketServer,
} from "@/lib/realtime/pes-realtime";

type SocketServerResponse = NextApiResponse & {
  socket: NetSocket & {
    server: HttpServer & {
      io?: SocketServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function socketHandler(_request: NextApiRequest, response: SocketServerResponse) {
  if (!response.socket.server.io) {
    const io = new SocketServer(response.socket.server, {
      path: PES_SOCKET_PATH,
      addTrailingSlash: false,
    });

    registerPesSocketHandlers(io, {
      listGames: listActivePesGameStates,
      getGame: getPesGameStateById,
    });
    response.socket.server.io = io;
    setPesSocketServer(io);
  } else {
    setPesSocketServer(response.socket.server.io);
  }

  response.status(200).json({
    ok: true,
    path: PES_SOCKET_PATH,
  });
}
