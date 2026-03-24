import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino/LoggerModule';
import { loggerConfig } from './config/pino-module-config';
import { MetricsModule } from './observability/metrics/metrics.module';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionGlobalFilter } from './common/filters/exception-global-filter';
import { UserModule } from './modules/users/users.module';

@Module({
  imports: [LoggerModule.forRoot(loggerConfig), MetricsModule, UserModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionGlobalFilter,
    },
  ],
})
export class AppModule {}
