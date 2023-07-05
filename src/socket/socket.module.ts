import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { LogService } from '../services/log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EntityEnum } from '../database/entity';
import { RoomSchema } from '../database/schema/room.schema';
import { GameHostModule } from '../game-host/game-host.module';
import { GameHostService } from '../game-host/game-host.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EntityEnum.roomDB, schema: RoomSchema },
    ]),
    GameHostModule,
  ],
  providers: [SocketGateway, SocketService, LogService, GameHostService],
})
export class SocketModule {}
