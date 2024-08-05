import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'modelMapper',
  standalone: true
})
export class ModelMapperPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
  toSnakeCase(obj: any, ...args: unknown[]): any {
    const snakeObj: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            snakeObj[snakeKey] = obj[key];
        }
    }
    return snakeObj;
  }

}
