import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
    //podemos hacer transformaciones basados en la metadata
  transform(value: any, metadata: ArgumentMetadata) {
    //aseguramos de que siempre sea un mongo id
    if(!isValidObjectId(value)) {
      throw new BadRequestException(`${value} is not a valid mongoID`)
    }
    return value;
  }
}
