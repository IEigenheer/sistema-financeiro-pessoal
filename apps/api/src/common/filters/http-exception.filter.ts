import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Erro interno inesperado.' };

    response.status(status).json({
      statusCode: status,
      error: status >= 500 ? 'Internal Server Error' : 'Bad Request',
      message: typeof payload === 'string' ? payload : (payload as Record<string, unknown>).message ?? 'Erro inesperado.',
    });
  }
}
