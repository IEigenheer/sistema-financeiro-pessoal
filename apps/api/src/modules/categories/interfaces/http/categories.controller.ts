import { Category as CategoryContract } from '@finance/contracts';
import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';


import { CategoryService } from '../../application/category.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('/categories')
export class CategoriesController {
  constructor(@Inject(CategoryService) private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOkResponse({ type: [Object] })
  async list(): Promise<CategoryContract[]> {
    return this.categoryService.list();
  }

  @Post()
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryContract> {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateCategoryDto })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<CategoryContract> {
    return this.categoryService.update(id, dto);
  }
}
