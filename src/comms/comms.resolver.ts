import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { Comm, CommConnection } from './comms.entity';
import { CommsService } from './comms.service';

@Resolver((of) => Comm)
export class CommsResolver {
  constructor(private commsService: CommsService) {}

  @Query(returns => CommConnection)
  async getCommunications(
    @Args('accountIds', { type: () => [Number], nullable: true }) accountIds?: number[],
    @Args('commIds', { type: () => [Number], nullable: true }) commIds?: number[],
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('first', { type: () => Number, nullable: true }) first?: number
  ): Promise<InstanceType<typeof CommConnection>> {
    return this.commsService.getCommunications(accountIds, commIds, after, first);
  }

  @Query((returns) => Comm)
  getCommunication(@Args('id') id: number): Comm {
    return this.commsService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): Comm {
    return this.commsService.findById(reference.id);
  }
}