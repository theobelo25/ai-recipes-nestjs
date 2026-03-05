import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './domain/auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getRoot() {
    return this.appService.getRoot();
  }

  // healthcheck
  @Get('health')
  @Public()
  getHealth() {
    return this.appService.getRoot();
  }
}
