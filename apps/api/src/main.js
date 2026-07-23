"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const document = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder().setTitle('Núcleo de Controle Financeiro Pessoal').setVersion('1.0.0').build());
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = Number(process.env.API_PORT ?? 3001);
    await app.listen(port);
}
void bootstrap();
