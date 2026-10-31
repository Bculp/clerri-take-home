import { BadRequestException, Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { DocumentsService } from './documents.service';

const MAX_BULK_DELETE_IDS = 100;

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  @Post()
  async create(@Body() dto: { title: string }) {
    return this.documentsService.create(dto.title);
  }

  @Post('bulk-delete')
  @HttpCode(200)
  async bulkDelete(@Body() dto: { ids?: unknown } | undefined) {
    const ids = dto?.ids;

    if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BULK_DELETE_IDS) {
      throw new BadRequestException(`ids must be an array of 1 to ${MAX_BULK_DELETE_IDS} document ids`);
    }

    if (!ids.every((id) => typeof id === 'string')) {
      throw new BadRequestException('ids must be strings');
    }

    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('ids must not contain duplicates');
    }

    await this.documentsService.bulkDelete(ids);

    return { success: true };
  }
}
