import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketModule } from './socket/socket.module';
import { LogService } from './services/log.service';
import { GameHostModule } from './game-host/game-host.module';
import { config } from "dotenv";
config();

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URL, //mongodb://localhost:27017/testDB?retryWrites=true&w=majority
  ),
    SocketModule,
    GameHostModule,
  ],
  controllers: [AppController],
  providers: [AppService, LogService],
})
export class AppModule {}
