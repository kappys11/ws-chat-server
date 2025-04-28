const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const debounce = require("just-debounce-it");

// Configuración de Express
const app = express();
app.use(cors());
app.use(express.json());

// Crear servidor HTTP y Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // En producción, especifica los dominios permitidos
  },
});

// Almacenar usuarios conectados
const connectedUsers = new Map();
const typingUsers = new Map();

// Manejar conexiones de Socket.IO
io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Cuando un usuario se une al chat
  socket.on("join", ({ username }) => {
    // Verificar si el nombre de usuario ya está en uso
    const userExists = [...connectedUsers.values()].some(
      (user) => user.username === username
    );

    if (!username || userExists) {
      socket.emit("error", {
        message: "Nombre de usuario no válido o ya en uso",
      });
      return;
    }

    // Guardar información del usuario
    connectedUsers.set(socket.id, { id: socket.id, username });

    // Enviar respuesta al usuario que se unió
    socket.emit("joined", {
      username,
      users: [...connectedUsers.values()].map((user) => user.username),
    });

    // Notificar a todos los usuarios que alguien se unió
    io.emit("new_message", {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
      author: "Sistema",
      text: `${username} se ha unido al chat`,
      timestamp: Date.now(),
    });

    // Actualizar la lista de usuarios para todos
    io.emit(
      "users_updated",
      [...connectedUsers.values()].map((user) => user.username)
    );

    console.log(`${username} (${socket.id}) se unió al chat`);
  });

  // Cuando un usuario envía un mensaje
  socket.on("message", (messageData) => {
    const user = connectedUsers.get(socket.id);

    if (!user) {
      socket.emit("error", { message: "No estás conectado" });
      return;
    }

    // Añadir ID único al mensaje
    const message = {
      ...messageData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
    };

    // Broadcast el mensaje a todos los usuarios
    stopUserTyping.flush();
    io.emit("new_message", message);
  });

  // Cuando un usuario se desconecta
  socket.on("leave", ({ username }) => {
    handleUserDisconnect(socket.id, username);
  });

  // Manejar desconexiones
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      handleUserDisconnect(socket.id, user.username);
    }
  });

  // manejar usuarios escribiendo
  const stopUserTyping = debounce((socketId) => {
    if (!typingUsers.has(socketId)) {
      return;
    }
    typingUsers.delete(socketId);
    io.emit("users_typing", [...typingUsers.values()]);
  }, 1000);

  socket.on("typing", () => {
    const user = connectedUsers.get(socket.id);
    if (user && !typingUsers.has(socket.id)) {
      typingUsers.set(socket.id, user.username);
      io.emit("users_typing", [...typingUsers.values()]);
    }
    stopUserTyping(socket.id);
  });

  function handleUserDisconnect(socketId, username) {
    // Eliminar usuario de la lista de conectados
    connectedUsers.delete(socketId);

    // Notificar a todos que un usuario se desconectó
    if (username) {
      io.emit("new_message", {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
        author: "Sistema",
        text: `${username} ha abandonado el chat`,
        timestamp: Date.now(),
      });

      // Actualizar lista de usuarios
      io.emit(
        "users_updated",
        [...connectedUsers.values()].map((user) => user.username)
      );

      console.log(`${username} (${socketId}) se desconectó del chat`);
    }
  }
});

// Ruta de API para comprobar el estado del servidor
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    users: connectedUsers.size,
    time: new Date().toISOString(),
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Socket.IO escuchando en el puerto ${PORT}`);
});
