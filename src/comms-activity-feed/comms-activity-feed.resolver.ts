import { Resolver, Query, Args } from '@nestjs/graphql';
import { CommsActivityFeedService } from './comms-activity-feed.service';
import { CommActivityFeed } from './comms-activity-feed.model';
import { SortOrder } from '../comms/comms.entity';

@Resolver(() => CommActivityFeed)
export class CommsActivityFeedResolver {
  constructor(private readonly commsActivityFeedService: CommsActivityFeedService) {}

  @Query(() => CommActivityFeed)
  getCommsActivityFeed(
    @Args('accountId') accountId: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('first', { type: () => Number, nullable: true }) first?: number,
    @Args('sort', { type: () => String, nullable: true }) sort?: SortOrder
  ): Promise<CommActivityFeed> {
    return this.commsActivityFeedService.getCommsActivityFeed(accountId, after, first, sort);
  }
}
