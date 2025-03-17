import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

//Escuchar solicidutes y regresar respuestas
@Controller('seed')
export class SeedController {

  constructor(private readonly seedService: SeedService) {}

  @Get()
  executeSeed() {
    return this.seedService.executeSeed();
  }
  
}
