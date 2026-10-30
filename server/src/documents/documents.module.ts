import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsStore } from './documents.store';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsStore],
})
export class DocumentsModule {}
