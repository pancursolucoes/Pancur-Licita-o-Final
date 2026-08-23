import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { getDb } from './db';

describe('Data Persistence', () => {
  let userId = 1;

  beforeAll(async () => {
    // Ensure database is initialized
    const database = await getDb();
    expect(database).toBeDefined();
  });

  it('should create a processo and retrieve it', async () => {
    const newProcesso = {
      userId,
      data: '01/04/2026',
      numero: 'TEST-001',
      descricao: 'Test Processo',
      status: 'Em Andamento' as const,
      link: 'https://example.com',
      dataLimite: '15/04/2026',
      horarioLimite: '14:30',
      resultado: null,
      observacoes: null,
      nomeOrgao: 'Test Orgao',
      numeroOrgao: '12345',
      numeroPregao: '001',
      anoPregao: '2026',
      arquivado: 0,
    };

    // Create
    const result = await db.createProcesso(newProcesso);
    expect(result).toBeDefined();

    // Retrieve
    const processos = await db.getProcessosByUserId(userId);
    expect(processos.length).toBeGreaterThan(0);
    
    const foundProcesso = processos.find(p => p.numero === 'TEST-001');
    expect(foundProcesso).toBeDefined();
    expect(foundProcesso?.descricao).toBe('Test Processo');
    expect(foundProcesso?.status).toBe('Em Andamento');
  });

  it('should update a processo', async () => {
    const processos = await db.getProcessosByUserId(userId);
    const processoToUpdate = processos.find(p => p.numero === 'TEST-001');
    
    if (processoToUpdate) {
      await db.updateProcesso(processoToUpdate.id, {
        status: 'Ganho',
        resultado: 'Vencido',
      });

      const updated = await db.getProcessosByUserId(userId);
      const updatedProcesso = updated.find(p => p.numero === 'TEST-001');
      
      expect(updatedProcesso?.status).toBe('Ganho');
      expect(updatedProcesso?.resultado).toBe('Vencido');
    }
  });

  it('should create an item and retrieve it', async () => {
    const processos = await db.getProcessosByUserId(userId);
    const processo = processos.find(p => p.numero === 'TEST-001');
    
    if (processo) {
      const newItem = {
        userId,
        processoId: processo.id,
        item: '1',
        descricao: 'Test Item',
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
        observacoes: 'Test item',
      };

      // Create
      const result = await db.createItem(newItem);
      expect(result).toBeDefined();

      // Retrieve
      const items = await db.getItensByProcessoId(processo.id);
      expect(items.length).toBeGreaterThan(0);
      
      const foundItem = items.find(i => i.descricao === 'Test Item');
      expect(foundItem).toBeDefined();
      expect(foundItem?.quantidade).toBe(100);
      expect(foundItem?.valorUnitario).toBe(15.00);
    }
  });

  it('should create and retrieve configuracao', async () => {
    const config = {
      userId,
      empresa: 'Test Company',
      cnpj: '12.345.678/0001-90',
      regimeTributario: 'Simples Nacional',
      icmsDefault: 18,
      pisDefault: 165,
      cofinsDefault: 760,
      ipiDefault: 0,
      issDefault: 0,
      margemDefault: 20,
      endereco: 'Rua Teste, 123',
      cep: '00000-000',
      celular: '(11) 99999-9999',
      email: 'test@example.com',
      banco: '336',
      agencia: '0001',
      contaCorrente: '123456-7',
      validadePropostadias: 30,
    };

    // Create
    const result = await db.createConfiguracao(config);
    expect(result).toBeDefined();

    // Retrieve
    const retrieved = await db.getConfiguracaoByUserId(userId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.empresa).toBe('Test Company');
    expect(retrieved?.cnpj).toBe('12.345.678/0001-90');
  });

  it('should update configuracao', async () => {
    await db.updateConfiguracao(userId, {
      empresa: 'Updated Company',
      margemDefault: 25,
    });

    const updated = await db.getConfiguracaoByUserId(userId);
    expect(updated?.empresa).toBe('Updated Company');
    expect(updated?.margemDefault).toBe(25);
  });

  it('should delete an item', async () => {
    const items = await db.getItensByUserId(userId);
    const itemToDelete = items.find(i => i.descricao === 'Test Item');
    
    if (itemToDelete) {
      await db.deleteItem(itemToDelete.id);
      
      const remaining = await db.getItensByUserId(userId);
      const deleted = remaining.find(i => i.id === itemToDelete.id);
      expect(deleted).toBeUndefined();
    }
  });

  it('should delete a processo', async () => {
    const processos = await db.getProcessosByUserId(userId);
    const processoToDelete = processos.find(p => p.numero === 'TEST-001');
    
    if (processoToDelete) {
      await db.deleteProcesso(processoToDelete.id);
      
      const remaining = await db.getProcessosByUserId(userId);
      const deleted = remaining.find(p => p.id === processoToDelete.id);
      expect(deleted).toBeUndefined();
    }
  });
});
