import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error);
    });

    socket.on("error", (error: { message: string }) => {
      console.error("❌ Socket.IO error:", error.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event handlers
export const joinChat = (chatId: string) => {
  socket?.emit("chat:join", chatId);
};

export const leaveChat = (chatId: string) => {
  socket?.emit("chat:leave", chatId);
};

export const sendMessage = (data: { chatId: string; text: string; attachments?: string[] }) => {
  socket?.emit("message:send", data);
};

export const startTyping = (chatId: string) => {
  socket?.emit("typing:start", chatId);
};

export const stopTyping = (chatId: string) => {
  socket?.emit("typing:stop", chatId);
};

export const markMessagesAsRead = (chatId: string) => {
  socket?.emit("message:read", { chatId });
};

export const markMessageAsDelivered = (messageId: string) => {
  socket?.emit("message:delivered", messageId);
};

export const getOnlineUsers = () => {
  socket?.emit("users:online");
};

// Socket event listeners
export const onNewMessage = (callback: (data: any) => void) => {
  socket?.on("message:new", callback);
};

export const onChatUpdated = (callback: (data: any) => void) => {
  socket?.on("chat:updated", callback);
};

export const onTypingUpdate = (callback: (data: any) => void) => {
  socket?.on("typing:update", callback);
};

export const onUserOnline = (callback: (data: any) => void) => {
  socket?.on("user:online", callback);
};

export const onUserOffline = (callback: (data: any) => void) => {
  socket?.on("user:offline", callback);
};

export const onMessagesRead = (callback: (data: any) => void) => {
  socket?.on("messages:read", callback);
};

export const onMessageStatus = (callback: (data: any) => void) => {
  socket?.on("message:status", callback);
};

export const onOnlineUsersList = (callback: (users: string[]) => void) => {
  socket?.on("users:online:list", callback);
};

// Remove listeners
export const offNewMessage = (callback?: (data: any) => void) => {
  if (callback) {
    socket?.off("message:new", callback);
    return;
  }
  socket?.off("message:new");
};

export const offChatUpdated = (callback?: (data: any) => void) => {
  if (callback) {
    socket?.off("chat:updated", callback);
    return;
  }
  socket?.off("chat:updated");
};

export const offTypingUpdate = (callback?: (data: any) => void) => {
  if (callback) {
    socket?.off("typing:update", callback);
    return;
  }
  socket?.off("typing:update");
};

export const offUserOnline = (callback?: (data: any) => void) => {
  if (callback) {
    socket?.off("user:online", callback);
    return;
  }
  socket?.off("user:online");
};

export const offUserOffline = (callback?: (data: any) => void) => {
  if (callback) {
    socket?.off("user:offline", callback);
    return;
  }
  socket?.off("user:offline");
};

export const offMessagesRead = (callback?: (data: any) => void) => {
  if (callback) {
    socket?.off("messages:read", callback);
    return;
  }
  socket?.off("messages:read");
};

export const offMessageStatus = (callback?: (data: any) => void) => {
  if (callback) {
    socket?.off("message:status", callback);
    return;
  }
  socket?.off("message:status");
};

export const offOnlineUsersList = (callback?: (users: string[]) => void) => {
  if (callback) {
    socket?.off("users:online:list", callback);
    return;
  }
  socket?.off("users:online:list");
};
