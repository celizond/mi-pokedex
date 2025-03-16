<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar el repositorio
2. Ejecutar
```
yarn install
```
3. Tener Nest CLI instalado
```
npm i -g @nestjs/cli
```
4. Generar docker-compose.yaml
```
version: '3'

services:
  db:
    image: mongo:5
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGODB_DATABASE: nest-pokemon
    volumes:
      - ./mongo:/data/db
```
5. Asegurarse que la iagen está corriendo en docker
```
Docker Desktop > Images
```
6. Levantar la base de datos (sirve también por si se elimina de docker la instancia corriendo)
```
docker-compose up -d
```
7. Conectarse a la base de datos mongo creada
```
MongoDB Compass > mongodb://localhost:27017/nest-pokemon
```
8. Conectar base de datos con nuestra aplicación nest. Más Documentación: https://docs.nestjs.com/techniques/mongodb
```
npm i @nestjs/mongoose mongoose
```
9. Agregar en el app module la referencia a la bbdd
```
MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),
```

10. Crear esquema de Entity
```
@Schema()
export class Pokemon extends Document{
    @Prop({unique:true,index:true})
    name: string;
    @Prop({unique:true,index:true})
    no: number;
}
export const PokemonSchema = SchemaFactory.createForClass(Pokemon);
```
11. Importar en módulo correspondiente la info del Entity
```
imports: [
    MongooseModule.forFeature([
      {
        name: Pokemon.name, //Viene de lo que se extiende del documento en el entity
        schema: PokemonSchema,
      }
    ])
  ]
```
12. Actualizamos estructura de CreatePokemonDto
```
  @IsInt()
  @IsPositive()
  @Min(1)
  no: number;

  @IsString()
  @MinLength(1)
  name: string;
```
13. Agregamos configuración global de los pipes para validaciones generales
```
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  })
);
```
14. Actualizamos service en base a lo que requerimos hacer
```
createPokemonDto.name = createPokemonDto.name.toLowerCase();
```
15. Insertar en BBDD el DTO en el service. Vamos a necesitar la inyección de dependencia
```
 constructor (
    @InjectModel(Pokemon.name) //Nombre de modelo
    private readonly pokemonModel: Model<Pokemon> 
    //Este modelo por si solo no es inyectable. No es un provider. Por eso usemos decorador
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    const pokemon = await this.pokemonModel.create(createPokemonDto);
    return pokemon;
  }
```
16. Manejar error
```
try {
  const pokemon = await this.pokemonModel.create(createPokemonDto);
  return pokemon;
} catch (error) {
  if(error.code === 11000) {
    throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
  }
  console.log(error);
  throw new InternalServerErrorException(`Can't create Pokemon - check server logs`)
}
```
17. Hacer operaciones CRUD - READ ONEs
```
async findOne(term: string) {
    let pokemon: Pokemon | undefined | null;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({no:term});
    }

    //MongoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    //Name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({name:term.toLowerCase().trim()}); 
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not founds`)
    }

    return pokemon;
  }
```
18. Puedo agregar un manejador de excepciones no controladas
```
private handleExceptions(error: any) {
  if(error.code === 11000) {
    throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
  }
  console.log(error);
  throw new InternalServerErrorException(`Can't create Pokemon - check server logs`)
}
```
19. Para hacer un Custom Pipe, debemos generarlo en la carpeta common
```
nest g mo common
nest g pi common/pipes/parseMongoId --no-spec
```
Pipe
```
transform(value: any, metadata: ArgumentMetadata) {
  if(!isValidObjectId(value)) {
    throw new BadRequestException(`${value} is not a valid mongoID`)
  }
  return value;
}
```
Controller
```
remove(@Param('id', ParseMongoIdPipe) id: string) {..}
```
Service
```
async remove(id: string) {
  const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
  if(deletedCount === 0) 
    throw new BadRequestException(`Pokemon with id "${id}" not found`);
}
```
20. Excluir directorio de mongo en gitignore


## Stack usado
* MongoDB
* Nest