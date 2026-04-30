import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return {
      status: 'ok',
      app: 'VaidyaMarg API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      message: '🏥 VaidyaMarg is up and running!',
    };
  }
}
