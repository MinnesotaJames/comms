import { Injectable } from '@nestjs/common';
import { Comm, CommConnection } from './comms.entity';
import { communicationsData } from './comms.data';
import { encodeCursor, decodeCursor } from './cursor';

@Injectable()
export class CommsService {
  private data = communicationsData;
  
  async getCommunications(
    accountIds?: number[],
    commIds?: number[],
    after?: string,
    first?: number,
    sort?: 'ASC' | 'DESC'
  ): Promise<InstanceType<typeof CommConnection>> {
    let filteredData = communicationsData;
    
    if (accountIds) {
      filteredData = filteredData.filter(comm => accountIds.includes(comm.accountId));
    }

    if (commIds) {
      filteredData = filteredData.filter(comm => commIds.includes(comm.id));
    }

    // Sorting by creationDate
    if (sort) {
      filteredData.sort((a, b) => {
        const dateA = new Date(a.creationDate);
        const dateB = new Date(b.creationDate);
        return sort === 'ASC' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      });
    }


    // Pagination logic
    let startIndex = 0;
    if (after) {
      const cursorIndex = filteredData.findIndex(comm => comm.id === decodeCursor(after));
      if (cursorIndex >= 0) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedData = filteredData.slice(startIndex, startIndex + (first || filteredData.length));
    const edges = paginatedData.map(comm => ({
      cursor: encodeCursor(comm.id),
      node: comm
    }));

    const pageInfo = {
      hasNextPage: startIndex + (first || filteredData.length) < filteredData.length,
      endCursor: edges.length > 0 ? encodeCursor(paginatedData[paginatedData.length - 1].id) : null
    };

    return {
      edges,
      nodes: paginatedData,
      pageInfo
    };
  }

  findById(id: number): Comm {
    return this.data.find(comm => comm.id === id);
  }
}