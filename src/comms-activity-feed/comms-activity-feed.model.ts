import { Field, ObjectType, ID } from '@nestjs/graphql';
import { PageInfo } from './../comms/page-info.dto';

@ObjectType()
export class CommActivityFeedItem {
  @Field(() => ID)
  id: string;

  @Field()
  creationDate: Date;
}

@ObjectType()
export class CommActivityFeed {
  @Field(() => [CommActivityFeedEdge])
  edges: CommActivityFeedEdge[];

  @Field(() => [CommActivityFeedItem])
  nodes: CommActivityFeedItem[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}

@ObjectType()
export class CommActivityFeedEdge {
  @Field(() => String)
  cursor: string;

  @Field(() => CommActivityFeedItem)
  node: CommActivityFeedItem;
}
