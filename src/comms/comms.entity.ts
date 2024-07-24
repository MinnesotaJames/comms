import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Paginated } from './paginated';

@ObjectType()
@Directive('@key(fields: "id")')
export class Comm {
  @Field(type => ID)
  id: number;

  @Field()
  accountId: number;

  @Field()
  message: string;

  @Field()
  creationDate: Date;

  @Field()
  type: string;
}

export const CommConnection = Paginated(Comm);