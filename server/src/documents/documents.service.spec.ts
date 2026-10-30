import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { DocumentsStore } from './documents.store';

describe('DocumentsService', () => {
  let moduleRef: TestingModule;
  let service: DocumentsService;
  let store: DocumentsStore;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [DocumentsService, DocumentsStore],
    }).compile();

    await moduleRef.init();

    service = moduleRef.get(DocumentsService);
    store = moduleRef.get(DocumentsStore);
  });

  it('returns the full list of documents', async () => {
    const documents = await service.findAll();

    expect(documents).toHaveLength(20);
    expect(documents[0]).toMatchObject({ id: 'doc-01', title: 'Q3 Vendor Agreement' });
  });

  it('creates a document with the given title', async () => {
    const created = await service.create('Renewal Terms — Acme');

    expect(created.title).toBe('Renewal Terms — Acme');
    expect(created.lockedBy).toBeNull();
    expect(created.id).toBeTruthy();
  });

  it('deletes an unlocked document', async () => {
    await service.delete('doc-01');

    expect(store.findById('doc-01')).toBeUndefined();
    expect(store.all()).toHaveLength(19);
  });
});
