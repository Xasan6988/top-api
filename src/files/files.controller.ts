import { Controller, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {

  @Post('updload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('files'))
  async uploadFile() {

  }
}
