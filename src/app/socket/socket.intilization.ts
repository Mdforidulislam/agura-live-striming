// app/socket.ts
import { Server, Socket } from 'socket.io';
import roomHandler from './handler/room.handler';



export const socketInilization = (io: Server) => {

         io.on('connection', (socket: Socket) => {
             console.log('connected server =====>');
             roomHandler(io, socket); // setup server  
             socket.on("test",(data)=>{
                console.log(data,'checking data here ====++++>');
             });
         });
}