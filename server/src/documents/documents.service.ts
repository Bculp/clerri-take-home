import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Document } from './document.model';
import { DocumentsStore } from './documents.store';

@Injectable()
export class DocumentsService {
  constructor(private readonly store: DocumentsStore) {}

  async findAll(): Promise<Document[]> {
    return this.store.all();
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
