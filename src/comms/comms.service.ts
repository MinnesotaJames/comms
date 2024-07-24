import { Injectable } from '@nestjs/common';
import { Comm } from './comms.entity';
import { communicationsData } from './comms.data';
import { encodeCursor, decodeCursor } from './cursor';

@Injectable()
export class CommsService {
  private data = communicationsData;
  
  async getCommunications(
    accountIds?: number[],
    commIds?: number[],
    after?: string,
    first?: number
  ): Promise<{
    edges: { cursor: string; node: Comm }[];
    nodes: Comm[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  }> {
    // Filter and sort the data
    const filteredData = communicationsData
      .filter(comm => !accountIds || accountIds.includes(comm.accountId))
      .filter(comm => !commIds || commIds.includes(comm.id));

    filteredData.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());

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