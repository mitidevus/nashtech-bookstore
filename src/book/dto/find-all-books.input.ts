import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, Max, Min } from 'class-validator';
import { MAX_ITEMS_PER_PAGE, Order } from 'constants/app';

registerEnumType(Order, {
  name: 'Order',
});

@InputType()
export class FindAllBooksInput {
  @Field(() => Order, { nullable: true })
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @Max(MAX_ITEMS_PER_PAGE)
  @IsOptional()
  take?: number;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
