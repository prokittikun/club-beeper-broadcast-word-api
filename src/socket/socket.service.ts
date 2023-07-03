import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { EntityEnum } from '../database/entity';
import { RoomDB, SocketDB } from '../database/schema/room.schema';
import { LogService } from '../services/log.service';
import generateString from '../services/generateString';
import { GameHostService } from '../game-host/game-host.service';

@Injectable()
export class SocketService {
  private logger = new LogService(SocketService.name);

  constructor(
    @InjectModel(EntityEnum.roomDB) private roomModel: Model<RoomDB>,
    @InjectModel(EntityEnum.socketDB) private socketModel: Model<SocketDB>,
    private gameHostService: GameHostService,
  ) {}

  async startGame(clientId: string, roomId: string) {
    const checkIsHost = await this.gameHostService.checkMyRoom({ clientId: clientId, roomId: roomId,  });
    if(!checkIsHost) return;
    const result = await this.roomModel.findOne({ roomId });
    if (result) {
      result.status = 1;
      return await result.save();
    }
    return null;
  }

  async createRoom(clientId: string) {
    // const createRoom = new this.roomModel();
    // createRoom.roomId = roomId;
    // createRoom.clients = [clientId];

    const newClient = {
      clientId: clientId,
      role: 'host',
      activeAt: new Date(),
    };
    const stringGenerate = generateString();
    const roomId = "C-B" + stringGenerate;
    const createRoom = new this.roomModel({
      roomId: roomId,
      clients: [newClient],
    });
    await createRoom.save();
    return await createRoom.save();
  }

  async join(clientId: string, roomId: string) {
    const result = await this.roomModel.findOne({ roomId });
    if (result) {
      const clientList = result.clients.map((client) => client.clientId);

      if (clientList.includes(clientId)) {
        return 'you are in this room';
      }
      result.clients.push({ clientId: clientId, role: 'player', activeAt: new Date() });
      return await result.save();
    }else{
      return null;
    }
  }

  async leave(clientId: string, roomId: string) {
    const result = await this.roomModel.findOne({ roomId });
    if (result) {
      console.log(clientId);
      const clientList = result.clients.map((client) => client.clientId);
      if (!clientList.includes(clientId)) {
        console.log('not in room');
        return 'you are not in this room';
      }
      result.clients = result.clients.filter(
        (client) => client.clientId !== clientId,
      );
      if (result.clients.length === 0) {
        console.log('delete');

        return await this.roomModel.deleteOne({ roomId });
      } else {
        console.log('leave');

        return await result.save();
      }
    }
    return null;
  }

  async remove() {
    try {
      setInterval(async () => {
        this.logger.debug('THIS TIME TO REMOVE');
        const result: RoomDB[] = await this.roomModel.find();
        if (result) {
          for (const [index, iterator] of result.entries()) {
            if (iterator.clients.length === 0) {
              await this.roomModel.deleteOne({ roomId: iterator.roomId });
              this.logger.debug(`DELETE ${iterator.roomId}} ROOM`);
              continue;
            }
            for (const [index, clientData] of iterator.clients.entries()) {
              if (
                new Date().getTime() - clientData.activeAt.getTime() >
                15000
              ) {
                const result = await this.roomModel.findOneAndUpdate(
                  { roomId: iterator.roomId },
                  { $pull: { clients: { clientId: clientData.clientId } } },
                  { new: true },
                );
                this.logger.debug(`DELETE ${clientData.clientId}} SOCKET`);
                if (!result.clients || result.clients.length === 0) {
                  await this.roomModel.deleteOne({ roomId: iterator.roomId });
                  this.logger.debug(`DELETE ${iterator.roomId} ROOM`);
                  continue;
                }
              }
            }
          }
        } else {
          return;
        }
      }, 5000);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async ping(clientId: string, roomId: string) {
    return await this.roomModel.findOneAndUpdate(
      { roomId, 'clients.clientId': clientId },
      { $set: { 'clients.$.activeAt': new Date() } },
      { new: true },
    );
  }

  async findOne(roomId: string) {
    const result = await this.roomModel.findOne({ roomId });
    if (!result) {
      return null;
    }
    return result;
  }
}
