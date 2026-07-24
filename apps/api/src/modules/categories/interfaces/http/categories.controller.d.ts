import { Category as CategoryContract } from '@finance/contracts';
import { CategoryService } from '../../application/category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    list(): Promise<CategoryContract[]>;
    create(dto: CreateCategoryDto): Promise<CategoryContract>;
    update(id: string, dto: UpdateCategoryDto): Promise<CategoryContract>;
}
