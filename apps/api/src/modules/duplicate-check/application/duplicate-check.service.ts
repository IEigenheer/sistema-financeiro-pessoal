import { Injectable } from '@nestjs/common';

@Injectable()
export class DuplicateCheckService {
  normalizeDescription(value: string): string {
    return value.trim().toLocaleLowerCase('pt-BR');
  }
}
