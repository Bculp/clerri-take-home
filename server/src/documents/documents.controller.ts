import { Body, Controller, Get, Post } from '@nestjs/common';
import { DocumentsService } from './documents.service';

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
  async bulkDelete(@Body() dto: { ids: string[] }) {
    for (const id of dto.ids) {
      await this.documentsService.delete(id);
    }

    return { success: true };
  }
}
