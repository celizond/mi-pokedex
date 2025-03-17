import { join } from 'path'; //Paquetes de node al principio
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PokemonModule } from './pokemon/pokemon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [ServeStaticModule.forRoot({
    rootPath: join(__dirname,'..','public'),
    }),
    //pegado a ServeStaticModule la referencia a la bbdd
    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
     PokemonModule,
     CommonModule,
     SeedModule],
})
export class AppModule {}
