import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  
  constructor (
    @InjectModel(Pokemon.name) //Nombre de modelo
    private readonly pokemonModel: Model<Pokemon> 
    //Este modelo por si solo no es inyectable. No es un provider. Por eso usemos decorador
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return await this.pokemonModel.find();;
  }

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
      //Excepcion controlada
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not founds`)
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      try {
        //Nos da a nivel funcionalidad todo lo que un modelo se mongoose nos ofrece
        await pokemon.updateOne(updatePokemonDto/* , {new: true} */)
        //Si quiero devolver nuevo objeto agrego new, sino es el viejo valor
        return {...pokemon.toJSON(), ...updatePokemonDto};
      } catch (error) {
        this.handleExceptions(error);
      }
    }
  }

  async remove(id: string) {
    /* const pokemon = await this.findOne(id);
    await pokemon.deleteOne(); 
    //Con la validación extra del parseMongoId si o si acepta mongo id
    const result = await this.pokemonModel.findByIdAndDelete(id);*/
    
    //pero queremos evitar doble consulta
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    //validamos existencia en bbdd para no devolver un falso positivo
    if(deletedCount === 0) 
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
  }

  //Excepciones no controladas
  private handleExceptions(error: any) {
    if(error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - check server logs`)
  }

}
