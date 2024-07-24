import { Injectable } from '@nestjs/common';
import { Comm } from './comms.entity';
import { communicationsData } from './comms.data';

@Injectable()
export class CommsService {
  private data = communicationsData;
  
  findAll(accountIds?: number[], commIds?: number[]): Comm[] {
    return this.data.filter(comm => 
      (!accountIds || accountIds.length === 0 || accountIds.includes(comm.accountId)) &&
      (!commIds || commIds.length === 0 || commIds.includes(comm.id))
    );
  }

  findById(id: number): Comm {
    return this.data.find(comm => comm.id === id);
  }
}