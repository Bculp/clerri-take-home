import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Document } from './document.model';
import { DocumentsStore } from './documents.store';

@Injectable()
export class DocumentsService implements OnModuleInit {
  private documentsCache: Document[] = [];

  constructor(private readonly store: DocumentsStore) {}

  // The list endpoint is hit on every page load and the document set is small,
  // so we keep a ready-to-serve copy in memory instead of rebuilding it per request.
  onModuleInit(): void {
    this.documentsCache = this.store.all();
  }

  async findAll(): Promise<Document[]> {
    return this.documentsCache;
  }

  async create(title: string): Promise<Document> {
    return this.store.insert(title);
  }

  async delete(id: string): Promise<void> {
    const document = this.store.findById(id);

    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    if (document.lockedBy !== null) {
      throw new ConflictException(`Document ${id} is locked by ${document.lockedBy}`);
    }

    this.store.remove(id);
  }
}
