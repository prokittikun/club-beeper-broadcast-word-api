import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LogService } from '../services/log.service';
import { SocketService } from './socket.service';
import { OnModuleInit } from '@nestjs/common';
import { BasicSocketDto } from './dto/BasicSocketDto';
import { BroadcastSocketDto } from './dto/BroadcastSocketDto';

@WebSocketGateway({
  // transports: ['websocket'],
  cors: {
    origin: '*',
  },
  namespace: 'socket',
})
export class SocketGateway
  implements
    OnModuleInit,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  private logger = new LogService(SocketGateway.name);

  @WebSocketServer()
  server: Server;
  constructor(private readonly socketService: SocketService) {}

  onModuleInit() {
    // this.server.on('connection', (socket) => {
    //   this.logger.debug(`${socket.id} Connected`);
    // });
  }

  afterInit() {
    // Start the heartbeat interval
    this.socketService.remove();
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`${this.handleDisconnect.name}`, client.id);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.debug(`${this.handleConnection.name} -> `, client.id);
  }

  @SubscribeMessage('join')
  async join(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BasicSocketDto,
  ): Promise<string> {
    this.logger.debug(`${this.join.name} -> `, client.id, payload.roomId);
    const foundRoom = await this.socketService.join(client.id, payload.roomId);
    if (foundRoom) {
      const resData = {
        status: 200,
        message: 'Joined!',
        data: { roomId: payload.roomId },
      };
      this.server.to(client.id).emit('onJoin', resData);
    } else {
      this.logger.debug(
        `${this.join.name} -> `,
        client.id,
        payload.roomId,
        'Room not found',
      );
      const resData = { status: 404, message: 'Room not found', data: null };
      this.server.to(client.id).emit('onJoin', resData);
    }
    return payload.roomId;
  }

  @SubscribeMessage('leave')
  async leave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BasicSocketDto,
  ): Promise<string> {
    this.logger.debug(`${this.leave.name} -> `, client.id);
    this.socketService.leave(client.id, payload.roomId);
    return payload.roomId;
  }

  @SubscribeMessage('createRoom')
  async createRoom(@ConnectedSocket() client: Socket): Promise<string> {
    this.logger.debug(`${this.createRoom.name} -> `, client.id);
    const createRoom = await this.socketService.createRoom(client.id);
    if (createRoom) {
      const resData = {
        status: 200,
        message: 'Created!',
        data: { roomId: createRoom.roomId },
      };
      this.server.to(client.id).emit('onCreateRoom', resData);
    }
    return client.id;
  }

  @SubscribeMessage('message')
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BroadcastSocketDto,
  ): Promise<string> {
    this.logger.debug(`${this.message.name} -> `, client.id);
    const room = await this.socketService.findOne(payload.roomId);
    if (!room) {
      return 'room not found';
    }
    // random 0 to length of clients
    const random = Math.floor(Math.random() * room.clients.length);
    console.log('random', random);

    // emit each message to each client id
    for (const [index, clients] of room.clients.entries()) {
      if (index === random) continue;
      this.server.to(clients.clientId).emit('onMessage', payload.message);
    }

    return payload.message;
  }

  @SubscribeMessage('ping')
  async ping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BasicSocketDto,
  ): Promise<string> {
    this.logger.debug(`${this.ping.name} -> `, client.id);
    const result = await this.socketService.ping(client.id, payload.roomId);
    return 'pong';
  }

  @SubscribeMessage('checkRoom')
  async checkRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BasicSocketDto,
  ): Promise<string> {
    this.logger.debug(`${this.checkRoom.name} -> `, client.id);
    const result = await this.socketService.findOne(payload.roomId);
    if (!result) {
      this.logger.debug(
        `${this.checkRoom.name} -> `,
        client.id,
        `Room not found`,
      );
      const resData = { status: 404, message: 'Room not found', data: null };
      this.server.to(client.id).emit('onCheckRoom', resData);
    }
    return client.id;
  }

  @SubscribeMessage('startGame')
  async startGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BasicSocketDto,
  ): Promise<string> {
    const result = await this.socketService.startGame(
      client.id,
      payload.roomId,
    );
    if (result) {
      const resData = { status: 200, message: 'Game start!', data: null };
      for (const [index, clients] of result.clients.entries()) {
        this.server.to(clients.clientId).emit('onGameStart', resData);
      }
    }
    return client.id;
  }
}
