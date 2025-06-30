import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get('database')
  getDatabaseInformation() {
    return {
      DB_HOST: this.configService.get<string>('DB_HOST'),
      DB_USER: this.configService.get<string>('DB_USER'),
      DB_PASSWORD: this.configService.get<string>('DB_PASSWORD'),
      DB_NAME: process.env.DB_NAME,
    };
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
