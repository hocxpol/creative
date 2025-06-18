import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import User from "../models/User";
import Queue from "../models/Queue";
import Ticket from "../models/Ticket";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import { CounterManager } from "./counter";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL
    }
  });

  io.on("connection", async socket => {
    const { token } = socket.handshake.query;
    let tokenData = null;
    try {
      tokenData = verify(token as string, authConfig.secret);
    } catch (error) {
      socket.disconnect();
      return io;
    }
    const counters = new CounterManager();

    let user: User = null;
    let userId = tokenData.id;

    if (userId && userId !== "undefined" && userId !== "null") {
      user = await User.findByPk(userId, { include: [ Queue ] });
      if (user) {
        user.online = true;
        await user.save();
      } else {
        socket.disconnect();
        return io;
      }
    } else {
      socket.disconnect();
      return io;
    }

    socket.join(`company-${user.companyId}-mainchannel`);
    socket.join(`user-${user.id}`);

    socket.on("joinChatBox", async (ticketId: string) => {
      if (!ticketId || ticketId === "undefined") {
        return;
      }
      Ticket.findByPk(ticketId).then(
        (ticket) => {
          if (ticket && ticket.companyId === user.companyId
            && (ticket.userId === user.id || user.profile === "admin")) {
            let c: number;
            if ((c = counters.incrementCounter(`ticket-${ticketId}`)) === 1) {
              socket.join(ticketId);
            }
          } else {
          }
        },
        (error) => {
        }
      );
    });
    
    socket.on("leaveChatBox", async (ticketId: string) => {
      if (!ticketId || ticketId === "undefined") {
        return;
      }

      let c: number;
      // o último que sair apaga a luz

      if ((c = counters.decrementCounter(`ticket-${ticketId}`)) === 0) {
        socket.leave(ticketId);
      }
    });

    socket.on("joinNotification", async () => {
      let c: number;
      if ((c = counters.incrementCounter("notification")) === 1) {
        if (user.profile === "admin") {
          socket.join(`company-${user.companyId}-notification`);
        } else {
          user.queues.forEach((queue) => {
            socket.join(`queue-${queue.id}-notification`);
          });
          if (user.allTicket === "enabled") {
            socket.join("queue-null-notification");
          }
        }
      }
    });
    
    socket.on("leaveNotification", async () => {
      let c: number;
      if ((c = counters.decrementCounter("notification")) === 0) {
        if (user.profile === "admin") {
          socket.leave(`company-${user.companyId}-notification`);
        } else {
          user.queues.forEach((queue) => {
            socket.leave(`queue-${queue.id}-notification`);
          });
          if (user.allTicket === "enabled") {
            socket.leave("queue-null-notification");
          }
        }
      }
    });
 
    socket.on("joinTickets", (status: string) => {
      if (counters.incrementCounter(`status-${status}`) === 1) {
        if (user.profile === "admin") {
          socket.join(`company-${user.companyId}-${status}`);
        } else if (status === "pending") {
          user.queues.forEach((queue) => {
            socket.join(`queue-${queue.id}-pending`);
          });
          if (user.allTicket === "enabled") {
            socket.join("queue-null-pending");
          }
        }
      }
    });
    
    socket.on("leaveTickets", (status: string) => {
      if (counters.decrementCounter(`status-${status}`) === 0) {
        if (user.profile === "admin") {
          socket.leave(`company-${user.companyId}-${status}`);
        } else if (status === "pending") {
          user.queues.forEach((queue) => {
            socket.leave(`queue-${queue.id}-pending`);
          });
          if (user.allTicket === "enabled") {
            socket.leave("queue-null-pending");
          }
        }
      }
    });
    
    // Handler para mensagens encaminhadas
    socket.on("message:forwarded", (data) => {
      logger.debug(`Message forwarded event received: ${JSON.stringify(data)}`);
      // O frontend pode usar este evento para atualizar a UI
      // e mostrar indicadores de encaminhamento
    });

    // Handler para atualização de status do usuário
    socket.on("userStatus", async () => {
      if (user) {
        try {
          await user.update({ online: true });
        } catch (err) {
        }
      }
    });

    // Handler para reconexão
    socket.on("reconnect", async () => {
      if (user) {
        try {
          await user.update({ online: true });
        } catch (err) {
        }
      }
    });

    // Handler para desconexão
    socket.on("disconnect", async () => {
      if (user) {
        try {
          await user.update({ online: false });
        } catch (err) {
        }
      }
    });

    socket.emit("ready");
  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};

// Função auxiliar para garantir que os dados enviados sejam válidos
export const emitValidData = (socket: SocketIO, event: string, data: any) => {
  try {
    // Verifica se os dados são válidos antes de enviar
    if (data && typeof data === 'object') {
      // Se for um array, garante que seja um array válido
      if (Array.isArray(data)) {
        socket.emit(event, data);
      } 
      // Se for um objeto, garante que seja um objeto válido
      else if (data !== null) {
        socket.emit(event, data);
      }
    }
  } catch (err) {
    logger.error(`Error emitting socket event ${event}: ${err}`);
  }
};
