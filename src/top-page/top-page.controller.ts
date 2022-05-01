import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { IdvalidationPipe } from '../pipes/id.validation.pipe';
import { CreateTopPageDto } from './dto/create-top-page.dto';
import { FindTopPageDto } from './dto/find-top-page.dto';
import { TOP_PAGE_ALIAS_NOT_FOUND_ERROR, TOP_PAGE_NOT_FOUND_ERROR } from './top-page.constants';
import { TopPageService } from './top-page.service';

@Controller('top-page')
export class TopPageController {
  constructor(
    private readonly topPageService: TopPageService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() dto: CreateTopPageDto) {
    return this.topPageService.create(dto);
  }


  @Get(':id')
  async get(@Param('id', IdvalidationPipe) id: string) {
    const findedTopPage = await this.topPageService.findById(id);

    if (!findedTopPage) {
      throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR)
    }

    return findedTopPage;
  }

  @Get('byAlias/:alias')
  async getByAlias(@Param('alias') alias: string) {
    const findedTopPage = await this.topPageService.findByAlias(alias);

    if (!findedTopPage) {
      throw new NotFoundException(TOP_PAGE_ALIAS_NOT_FOUND_ERROR)
    }

    return findedTopPage;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', IdvalidationPipe) id: string) {
    const deletedTopPage = await this.topPageService.deleteById(id);

    if(!deletedTopPage) {
      throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patch(@Param('id', IdvalidationPipe) id: string, @Body() dto: CreateTopPageDto) {
    const updatedTopPage = await this.topPageService.updateById(id, dto);

    if(!updatedTopPage) {
      throw new NotFoundException(TOP_PAGE_NOT_FOUND_ERROR);
    }

    return updatedTopPage;
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('find')
  async find(@Body() dto: FindTopPageDto) {
    return this.topPageService.findByCategory(dto.firstCategory);
  }

  @Get('textSearch/:text')
  async textSearch(@Param('text') text: string) {
    return this.topPageService.findByText(text);
  }
}
