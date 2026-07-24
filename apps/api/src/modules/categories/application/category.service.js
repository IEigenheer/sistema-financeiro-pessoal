"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const audit_service_1 = require("../../audit/application/audit.service");
let CategoryService = class CategoryService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async list() {
        const categories = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
        return categories.map((category) => this.toContract(category));
    }
    async create(input) {
        const created = await this.prisma.category.create({
            data: {
                name: input.name.trim(),
                normalizedName: this.normalizeName(input.name),
            },
        });
        await this.auditService.record({
            entityName: 'CATEGORY',
            entityId: created.id,
            operation: 'CREATE',
            changeOrigin: 'LOCAL_USER',
            previousValues: null,
            nextValues: created,
        });
        return this.toContract(created);
    }
    async update(id, input) {
        const previous = await this.prisma.category.findUniqueOrThrow({ where: { id } });
        const updated = await this.prisma.category.update({
            where: { id },
            data: {
                ...(input.name ? { name: input.name.trim(), normalizedName: this.normalizeName(input.name) } : {}),
                ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
            },
        });
        await this.auditService.record({
            entityName: 'CATEGORY',
            entityId: updated.id,
            operation: 'UPDATE',
            changeOrigin: 'LOCAL_USER',
            previousValues: previous,
            nextValues: updated,
        });
        return this.toContract(updated);
    }
    normalizeName(value) {
        return value.trim().toLocaleLowerCase('pt-BR');
    }
    toContract(category) {
        return {
            id: category.id,
            name: category.name,
            isActive: category.isActive,
        };
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], CategoryService);
