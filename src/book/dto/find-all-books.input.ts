import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, Max, Min } from 'class-validator';
import { MAX_ITEMS_PER_PAGE, Order, SortBy } from 'src/constants/app';

registerEnumType(Order, {
  name: 'Order',
});

registerEnumType(SortBy, {
  name: 'SortBy',
});

@InputType()
export class FindAllBooksInput {
  @Field(() => Order, { nullable: true })
  @IsEnum(Order)
  @IsOptional()
  order?: Order = Order.DESC;

  @Field(() => SortBy, { nullable: true })
  @IsEnum(SortBy)
  @IsOptional()
  sort?: SortBy;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @IsOptional()
  page?: number;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @Max(MAX_ITEMS_PER_PAGE)
  @IsOptional()
  take?: number;

  @Field(() => Int, { nullable: true })
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
