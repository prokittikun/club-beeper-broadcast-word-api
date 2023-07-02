import { Body, Controller, Post } from '@nestjs/common';
import { GameHostService } from './game-host.service';
import { BasicBodyDto } from './dto/BasicBodyDto';

@Controller('gameHost')
export class GameHostController {
  constructor(private readonly gameHostService: GameHostService) {}

  @Post('checkMyRoom')
  async checkMyRoom(@Body() body: BasicBodyDto) {
    return await this.gameHostService.api_checkMyRoom(body);
  }

  @Post('gameStatus')
  async gameStatus(@Body() body: BasicBodyDto) {
    return await this.gameHostService.api_gameStatus(body);
  }


  
}
