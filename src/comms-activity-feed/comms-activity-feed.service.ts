import { Injectable } from '@nestjs/common';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  gql,
} from '@apollo/client/core';
import fetch from 'cross-fetch';
import { CommsService } from './../comms/comms.service';
import {
  CommActivityFeed,
  CommActivityFeedEdge,
} from './comms-activity-feed.model';
import { encodeCursor, decodeCursor } from './complex-cursor';

@Injectable()
export class CommsActivityFeedService {
  private readonly disputesClient: ApolloClient<any>;
  private readonly notesClient: ApolloClient<any>;

  constructor(private readonly commsService: CommsService) {
    this.disputesClient = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:3002/graphql',
        fetch,
      }),
      cache: new InMemoryCache(),
    });
    this.notesClient = new ApolloClient({
      link: new HttpLink({
        uri: 'http://localhost:3003/graphql',
        fetch,
      }),
      cache: new InMemoryCache(),
    });
  }

  async getCommsActivityFeed(
    accountId: number,
    after?: string,
    first?: number,
    sort?: 'ASC' | 'DESC',
  ): Promise<CommActivityFeed> {
    const decodedCursor = decodeCursor(after);

    const communications = await this.commsService.getCommunications(
      [accountId],
      null,
      decodedCursor.commsCursor,
      first,
      sort,
    );

    const typedCommunications = communications.edges.map((edge) => (
      { ...edge, node: { ...edge.node, __typename: 'Comm' }
    }));

    const notesQuery = gql`
      query feedNotes(
        $accountId: Float!
        $first: Float
        $afterNotes: String
        $sort: String
      ) {
        getNotes(
          accountIds: [$accountId]
          first: $first
          after: $afterNotes
          sort: $sort
        ) {
          edges {
            cursor
            node {
              id
              message
              creationDate
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;

    const disputesQuery = gql`
      query feedDisputes(
        $accountId: Float!
        $first: Float
        $afterDisputes: String
        $sort: String
      ) {
        getDisputes(
          accountIds: [$accountId]
          first: $first
          sort: $sort
          after: $afterDisputes
        ) {
          edges {
            cursor
            node {
              id
              eventName
              creationDate
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;

    const { data: disputesData } = await this.disputesClient.query({
      query: disputesQuery,
      variables: {
        accountId,
        first,
        afterDisputes: decodedCursor.disputesCursor,
        sort,
      },
    });

    const { data: notesData } = await this.notesClient.query({
      query: notesQuery,
      variables: {
        accountId,
        first,
        afterDisputes: decodedCursor.disputesCursor,
        sort,
      },
    });

    console.log('disputesData', disputesData);
    console.log('notesData', notesData);
    console.log("typedCommunications", typedCommunications);

    const combinedFeed = [
      ...typedCommunications,
      ...disputesData.getDisputes.edges,
      ...notesData.getNotes.edges,
    ].sort(
      (a, b) =>
        new Date(b.node.creationDate).getTime() -
        new Date(a.node.creationDate).getTime(),
    );

    // Only keep the latest `first` records and drop the others
    const slicedFeed = combinedFeed.slice(0, first);

    console.log('slicedFeed', slicedFeed);

    // Encode the endCursor based on the position in the data
    const newCursor = {
      commsCursor: this.extractLastCursor(slicedFeed, 'Comm'),
      notesCursor: this.extractLastCursor(slicedFeed, 'Note'),
      disputesCursor: this.extractLastCursor(slicedFeed, 'Dispute'),
    };

    console.log('newCursor', newCursor);

    return {
      edges: (slicedFeed as CommActivityFeedEdge[]) || [],
      nodes: slicedFeed.map(({ node }) => node) || [],
      pageInfo: {
        hasNextPage: combinedFeed.length > first,
        endCursor: encodeCursor(newCursor),
      },
    };
  }

  private extractLastCursor(feed: any[], type: string): string | null {
    const lastItem = feed.filter((item) => item.node.__typename === type).pop();
    return lastItem ? lastItem.cursor : null;
  }
}
