import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { Comm } from './comms.entity';
import { CommsService } from './comms.service';

@Resolver((of) => Comm)
export class CommsResolver {
  constructor(private commsService: CommsService) {}

  @Query((returns) => [Comm])
  getCommunications(
    @Args('accountIds', { type: () => [Number], nullable: true }) accountIds?: number[],
    @Args('commIds', { type: () => [Number], nullable: true }) commIds?: number[],
  ): Comm[] {
    return this.commsService.findAll(accountIds, commIds);
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