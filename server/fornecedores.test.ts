import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { getDb } from './db';

describe('Fornecedores - CRUD Operations', () => {
  let userId = 1;
  let fornecedorId: number;

  beforeAll(async () => {
    // Ensure database is initialized
    const database = await getDb();
    expect(database).toBeDefined();
  });

  it('should create a fornecedor', async () => {
    const newFornecedor = {
      userId,
      nome: 'Fornecedor Test',
      site: 'https://fornecedor-test.com',
      ramo: 'Eletrônicos',
      contato: 'João Silva',
      email: 'joao@fornecedor-test.com',
      telefone: '(11) 3333-3333',
      celular: '(11) 99999-9999',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      cnpj: '12.345.678/0001-90',
      inscricaoEstadual: '123.456.789.012',
      observacoes: 'Fornecedor de teste',
      ativo: 1,
    };

    const result = await db.createFornecedor(newFornecedor);
    expect(result).toBeDefined();

    // Get the created fornecedor
    const fornecedores = await db.getFornecedoresByUserId(userId);
    const created = fornecedores.find(f => f.nome === 'Fornecedor Test');
    
    expect(created).toBeDefined();
    expect(created?.email).toBe('joao@fornecedor-test.com');
    expect(created?.ramo).toBe('Eletrônicos');
    
    if (created) {
      fornecedorId = created.id;
    }
  });

  it('should retrieve all fornecedores for a user', async () => {
    const fornecedores = await db.getFornecedoresByUserId(userId);
    
    expect(fornecedores).toBeDefined();
    expect(Array.isArray(fornecedores)).toBe(true);
    expect(fornecedores.length).toBeGreaterThan(0);
  });

  it('should retrieve a specific fornecedor by id', async () => {
    const fornecedor = await db.getFornecedorById(fornecedorId);
    
    expect(fornecedor).toBeDefined();
    expect(fornecedor?.id).toBe(fornecedorId);
    expect(fornecedor?.nome).toBe('Fornecedor Test');
  });

  it('should update a fornecedor', async () => {
    await db.updateFornecedor(fornecedorId, {
      ramo: 'Informática',
      email: 'novo@fornecedor-test.com',
    });

    const updated = await db.getFornecedorById(fornecedorId);
    
    expect(updated?.ramo).toBe('Informática');
    expect(updated?.email).toBe('novo@fornecedor-test.com');
  });

  it('should toggle fornecedor status (ativo/inativo)', async () => {
    await db.updateFornecedor(fornecedorId, {
      ativo: 0,
    });

    let fornecedor = await db.getFornecedorById(fornecedorId);
    expect(fornecedor?.ativo).toBe(0);

    await db.updateFornecedor(fornecedorId, {
      ativo: 1,
    });

    fornecedor = await db.getFornecedorById(fornecedorId);
    expect(fornecedor?.ativo).toBe(1);
  });

  it('should search fornecedores', async () => {
    const results = await db.searchFornecedores(userId, 'Fornecedor Test');
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it('should delete a fornecedor', async () => {
    await db.deleteFornecedor(fornecedorId);

    const deleted = await db.getFornecedorById(fornecedorId);
    expect(deleted).toBeNull();
  });

  afterAll(async () => {
    // Cleanup is done by the delete test
  });
});
