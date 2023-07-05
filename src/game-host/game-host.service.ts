import { Injectable } from '@nestjs/common';
import { BasicBodyDto } from './dto/BasicBodyDto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityEnum } from '../database/entity';
import { RoomDB } from '../database/schema/room.schema';
import { LogService } from '../services/log.service';

@Injectable()
export class GameHostService {
  private logger = new LogService(GameHostService.name);

  constructor(
    @InjectModel(EntityEnum.roomDB) private roomModel: Model<RoomDB>,
  ) {}
  async api_checkMyRoom(body: BasicBodyDto) {
    const resp = {
      resCode: 200,
      resData: {
        isHost: await this.checkMyRoom(body),
      },
      msg: 'success',
    };
    return resp;
  }

  async checkMyRoom(body: BasicBodyDto) {
    const foundRoom = await this.roomModel.findOne({
      roomId: body.roomId,
      clients: { $elemMatch: { clientId: body.clientId, role: 'host' } },
    });
    if (foundRoom) {
      return true;
    }
    return false;
  }

  async api_gameStatus(body: BasicBodyDto) {
    const resp = {
      resCode: 200,
      resData: {
        gameStatus: await this.gameStatus(body),
      },
      msg: 'success',
    };
    return resp;
  }

  async gameStatus(body: BasicBodyDto) {
    const foundRoom = await this.roomModel.findOne({ roomId: body.roomId });
    if (foundRoom) {
        console.log(foundRoom.status);
        
      return foundRoom.status;
    }
    return null;
  }
}
