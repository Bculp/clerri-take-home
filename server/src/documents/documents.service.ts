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

  async bulkDelete(ids: string[]): Promise<void> {
    const documents = ids.map((id) => this.store.findById(id));

    const missingIds = ids.filter((_, index) => !documents[index]);
    if (missingIds.length > 0) {
      throw new NotFoundException({ message: 'Some documents were not found', missingIds });
    }

    const found = documents.filter((doc): doc is Document => doc !== undefined);
    const lockedIds = found.filter((doc) => doc.lockedBy !== null).map((doc) => doc.id);
    if (lockedIds.length > 0) {
      throw new ConflictException({ message: 'Some documents are locked', lockedIds });
    }

    for (const id of ids) {
      this.store.remove(id);
    }
  }
}
