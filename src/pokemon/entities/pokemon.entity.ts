import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//Es un único documento y extiende de document de mongoose.
//Añade funcionalidades respectivas como nombre, metodos, ...
@Schema() //Esquema de BBDD
export class Pokemon extends Document{
    
    @Prop({unique:true,index:true})
    name: string;

    @Prop({unique:true,index:true})
    no: number;

    //id: uuid(); //Mongo me lo da
}

// Exporto esquema
export const PokemonSchema = SchemaFactory.createForClass(Pokemon);


//Es una clase para poder definir las reglas de negocio
//Las ENTIDADES hacen referencia exacta a como vamos a querer trabajar en la BBDD.
//Creamos una tabla :> COLECCIÓN
//En la que insertamos registros :> DOCUMENTOS
//Relacionan las entidades con las tablas de BBDD. Cada instancia de esa clase es un registro
