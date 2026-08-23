import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { getDb } from './db';

describe('Itens - Margem Update', () => {
  let userId = 1;
  let processoId: number;
  let itemId: number;

  beforeAll(async () => {
    // Ensure database is initialized
    const database = await getDb();
    expect(database).toBeDefined();

    // Create a test processo
    const newProcesso = {
      userId,
      data: '01/04/2026',
      numero: 'TEST-MARGEM-001',
      status: 'Em Andamento' as const,
      link: 'https://example.com',
      dataLimite: '15/04/2026',
      horarioLimite: '14:30',
      nomeOrgao: 'Test Orgao',
      numeroOrgao: '12345',
      numeroPregao: '001',
      anoPregao: '2026',
      arquivado: 0,
    };

    await db.createProcesso(newProcesso);
    const processos = await db.getProcessosByUserId(userId);
    const processo = processos.find(p => p.numero === 'TEST-MARGEM-001');
    
    if (processo) {
      processoId = processo.id;

      // Create a test item
      const newItem = {
        userId,
        processoId: processo.id,
        item: '1',
        descricao: 'Test Item for Margem',
        quantidade: 100,
        valorUnitario: 15.00,
        icms: 18,
        pis: 1.65,
        cofins: 7.6,
        ipi: 0,
        iss: 0,
        margem: 20,
        fretePercentual: 5,
        linkFornecedor: 'https://example.com/item',
        observacoes: 'Test item for margem update',
      };

      await db.createItem(newItem);
      const items = await db.getItensByProcessoId(processo.id);
      const item = items.find(i => i.descricao === 'Test Item for Margem');
      
      if (item) {
        itemId = item.id;
      }
    }
  });

  it('should create an item with initial margem value', async () => {
    const items = await db.getItensByProcessoId(processoId);
    const item = items.find(i => i.id === itemId);
    
    expect(item).toBeDefined();
    expect(parseFloat(item?.margem as any)).toBe(20);
  });

  it('should update margem to a new value', async () => {
    // Update margem from 20 to 25
    await db.updateItem(itemId, {
      margem: 25,
    });

    const items = await db.getItensByProcessoId(processoId);
    const updatedItem = items.find(i => i.id === itemId);
    
    expect(updatedItem).toBeDefined();
    expect(parseFloat(updatedItem?.margem as any)).toBe(25);
  });

  it('should update margem to zero', async () => {
    // Update margem from 25 to 0
    await db.updateItem(itemId, {
      margem: 0,
    });

    const items = await db.getItensByProcessoId(processoId);
    const updatedItem = items.find(i => i.id === itemId);
    
    expect(updatedItem).toBeDefined();
    expect(parseFloat(updatedItem?.margem as any)).toBe(0);
  });

  it('should update margem to a high value', async () => {
    // Update margem from 0 to 50
    await db.updateItem(itemId, {
      margem: 50,
    });

    const items = await db.getItensByProcessoId(processoId);
    const updatedItem = items.find(i => i.id === itemId);
    
    expect(updatedItem).toBeDefined();
    expect(parseFloat(updatedItem?.margem as any)).toBe(50);
  });

  it('should update fretePercentual along with margem', async () => {
    // Update both margem and fretePercentual
    await db.updateItem(itemId, {
      margem: 30,
      fretePercentual: 8,
    });

    const items = await db.getItensByProcessoId(processoId);
    const updatedItem = items.find(i => i.id === itemId);
    
    expect(updatedItem).toBeDefined();
    expect(parseFloat(updatedItem?.margem as any)).toBe(30);
    expect(parseFloat(updatedItem?.fretePercentual as any)).toBe(8);
  });

  it('should return margem as a string from DB (DECIMAL type)', async () => {
    const items = await db.getItensByProcessoId(processoId);
    const item = items.find(i => i.id === itemId);
    
    expect(item).toBeDefined();
    // DECIMAL columns are returned as strings from the database
    expect(typeof item?.margem).toBe('string');
    expect(typeof item?.fretePercentual).toBe('string');
    // But they should be parseable as numbers
    expect(parseFloat(item?.margem as any)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(item?.fretePercentual as any)).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    // Clean up test data
    if (itemId) {
      await db.deleteItem(itemId);
    }
    if (processoId) {
      await db.deleteProcesso(processoId);
    }
  });
});
