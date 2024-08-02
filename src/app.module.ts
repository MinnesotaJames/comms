import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { CommsResolver } from './comms/comms.resolver';
import { CommsService } from './comms/comms.service';
import { CommsActivityFeedResolver } from './comms-activity-feed/comms-activity-feed.resolver';
import { CommsActivityFeedService } from './comms-activity-feed/comms-activity-feed.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [CommsResolver, CommsService, CommsActivityFeedResolver, CommsActivityFeedService],
})
export class AppModule {}