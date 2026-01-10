import { Server } from 'socket.io';
import roomHandler from './handler/room.handler';


export const initSocket = (server: any) => {
  const io = new Server(server, { cors: { origin: '*' } });
  console.log('socket inizilization ==========>');

  io.on('connection', socket => {
    console.log('User connected', socket.id);

    roomHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
  });

  return io;
};

