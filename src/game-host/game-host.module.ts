import { Module } from '@nestjs/common';
import { GameHostService } from './game-host.service';
import { GameHostController } from './game-host.controller';
import { RoomSchema } from '../database/schema/room.schema';
import { EntityEnum } from '../database/entity';
import { MongooseModule } from '@nestjs/mongoose';
import { LogService } from '../services/log.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: EntityEnum.roomDB, schema: RoomSchema },
  ]),],
  controllers: [GameHostController],
  providers: [GameHostService, LogService]
})
export class GameHostModule {}
