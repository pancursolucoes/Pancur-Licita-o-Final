import { eq, and, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, processos, itensPrecificacao, configuracoes, fornecedores, workspaces, colaboradores, convites, documentosProcesso, oportunidadesPncp, transacoesProcessos, anexosProcessos, timelineProcessos } from "../drizzle/schema";
type TimelineProcesso = typeof timelineProcessos.$inferSelect;
type InsertTimelineProcesso = typeof timelineProcessos.$inferInsert;
type TransacaoProcesso = typeof transacoesProcessos.$inferSelect;
type InsertTransacaoProcesso = typeof transacoesProcessos.$inferInsert;
type InsertDocumentoProcesso = typeof documentosProcesso.$inferInsert;
type OportunidadePncp = typeof oportunidadesPncp.$inferSelect;
type InsertOportunidadePncp = typeof oportunidadesPncp.$inferInsert;
type AnexoProcesso = typeof anexosProcessos.$inferSelect;
type InsertAnexoProcesso = typeof anexosProcessos.$inferInsert;
type Workspace = typeof workspaces.$inferSelect;
type Colaborador = typeof colaboradores.$inferSelect;
type Convite = typeof convites.$inferSelect;
type InsertWorkspace = typeof workspaces.$inferInsert;
type InsertColaborador = typeof colaboradores.$inferInsert;
type InsertConvite = typeof convites.$inferInsert;
type Processo = typeof processos.$inferSelect;
type ItemPrecificacao = typeof itensPrecificacao.$inferSelect;
type Configuracao = typeof configuracoes.$inferSelect;
type Fornecedor = typeof fornecedores.$inferSelect;
type User = typeof users.$inferSelect;
type InsertUser = typeof users.$inferInsert;
type InsertProcesso = typeof processos.$inferInsert;
type InsertItemPrecificacao = typeof itensPrecificacao.$inferInsert;
type InsertConfiguracao = typeof configuracoes.$inferInsert;
type InsertFornecedor = typeof fornecedores.$inferInsert;
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Processos queries
export async function getProcessosByUserId(userId: number) {
  try {
    console.log('[getProcessosByUserId] Starting for userId:', userId);
    const db = await getDb();
    if (!db) {
      console.log('[getProcessosByUserId] Database not available');
      return [];
    }
    
    const workspaceId = await getWorkspaceIdByUserId(userId);
    console.log('[getProcessosByUserId] Got workspaceId:', workspaceId);
    if (!workspaceId) {
      console.log('[getProcessosByUserId] No workspace found for userId:', userId);
      return [];
    }
    
    const result = await db.select().from(processos).where(eq(processos.workspaceId, workspaceId));
    console.log('[getProcessosByUserId] Got', result.length, 'processos');
    return result;
  } catch (error) {
    console.error('[getProcessosByUserId] Error:', error);
    return [];
  }
}

export async function getProcessoById(processoId: number) {
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(processos).where(eq(processos.id, processoId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[getProcessoById] Error:', error);
    return null;
  }
}

export async function createProcesso(data: InsertProcesso, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(processos).values({ ...data, workspaceId });
  return result;
}

export async function updateProcesso(id: number, data: Partial<Processo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(processos).set(data).where(eq(processos.id, id));
}

export async function deleteProcesso(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(processos).where(eq(processos.id, id));
}

export async function toggleDestacadoProcesso(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current process to check current destacado value
  const result = await db.select().from(processos).where(eq(processos.id, id)).limit(1);
  if (result.length === 0) throw new Error("Process not found");
  
  const currentDestacado = result[0].destacado;
  const newDestacado = currentDestacado === 0 ? 1 : 0;
  
  return await db.update(processos).set({ destacado: newDestacado }).where(eq(processos.id, id));
}

// Itens Precificacao queries
export async function getItensByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const workspaceId = await getWorkspaceIdByUserId(userId);
  if (!workspaceId) return [];
  // Get all items for all processes in this workspace
  const allProcessos = await db.select().from(processos).where(eq(processos.workspaceId, workspaceId));
  const processoIds = allProcessos.map(p => p.id);
  if (processoIds.length === 0) return [];
  const items = await db.select().from(itensPrecificacao).where(
    inArray(itensPrecificacao.processoId, processoIds)
  );
  return items.map(item => normalizeItem(item));
}

function normalizeItem(item: any) {
  // Normalizar campos decimal para número com precisão correta
  if (item.valorFinalCustomizado !== null && item.valorFinalCustomizado !== undefined) {
    item.valorFinalCustomizado = parseFloat(String(item.valorFinalCustomizado));
  }
  return item;
}

export async function getItensByProcessoId(processoId: number) {
  try {
    console.log('[getItensByProcessoId] Starting for processoId:', processoId);
    const db = await getDb();
    if (!db) {
      console.log('[getItensByProcessoId] Database not available');
      return [];
    }
    const items = await db.select().from(itensPrecificacao).where(eq(itensPrecificacao.processoId, processoId));
    console.log('[getItensByProcessoId] Got', items.length, 'itens');
    return items.map(item => normalizeItem(item));
  } catch (error) {
    console.error('[getItensByProcessoId] Error:', error);
    return [];
  }
}

export async function createItem(data: InsertItemPrecificacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(itensPrecificacao).values(data);
}

export async function updateItem(id: number, data: Partial<ItemPrecificacao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Filtrar apenas campos válidos e não-null
  // MAS permitir null para valorFinalCustomizado (para limpá-lo)
  const validFields = Object.entries(data).reduce((acc, [key, value]) => {
    if (key === 'valorFinalCustomizado' && value === null) {
      acc[key] = null;
    } else if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as any);
  
  if (Object.keys(validFields).length === 0) {
    throw new Error("No values to set");
  }
  
  return await db.update(itensPrecificacao).set(validFields as any).where(eq(itensPrecificacao.id, id));
}

export async function deleteItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(itensPrecificacao).where(eq(itensPrecificacao.id, id));
}

// Configuracoes queries
export async function getConfiguracaoByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(configuracoes).where(eq(configuracoes.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createConfiguracao(data: InsertConfiguracao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(configuracoes).values(data);
}

export async function updateConfiguracao(userId: number, data: Partial<Configuracao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(configuracoes).set(data).where(eq(configuracoes.userId, userId));
}


// Fornecedores CRUD
export async function getFornecedoresByUserId(userId: number): Promise<Fornecedor[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(fornecedores).where(eq(fornecedores.userId, userId));
}

export async function getFornecedorById(id: number): Promise<Fornecedor | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(fornecedores).where(eq(fornecedores.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createFornecedor(data: InsertFornecedor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(fornecedores).values(data);
}

export async function updateFornecedor(id: number, data: Partial<Fornecedor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(fornecedores).set(data).where(eq(fornecedores.id, id));
}

export async function deleteFornecedor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(fornecedores).where(eq(fornecedores.id, id));
}

export async function searchFornecedores(userId: number, query: string): Promise<Fornecedor[]> {
  const db = await getDb();
  if (!db) return [];
  const searchTerm = `%${query}%`;
  return await db.select().from(fornecedores).where(
    and(
      eq(fornecedores.userId, userId),
      // Search in nome, email, telefone, ramo, cidade
      // Note: MySQL LIKE is case-insensitive by default
    )
  );
}

// Timeline Processos queries
export async function getTimelineByUserId(userId: number): Promise<TimelineProcesso[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(timelineProcessos)
    .innerJoin(processos, eq(timelineProcessos.processoId, processos.id))
    .where(eq(processos.userId, userId))
    .then(results => results.map(r => r.timelineProcessos));
}

export async function getTimelineByProcessoId(processoId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Buscar timeline items
  const timelineItems = await db.select().from(timelineProcessos).where(eq(timelineProcessos.processoId, processoId));
  
  // Para cada item, buscar seus anexos
  const itemsWithAnexos = await Promise.all(
    timelineItems.map(async (item) => {
      const anexos = await db.select().from(anexosProcessos).where(eq(anexosProcessos.timelineId, item.id));
      return {
        ...item,
        anexos
      };
    })
  );
  
  return itemsWithAnexos;
}

export async function getTimelinePhaseByProcessoAndEtapa(processoId: number, etapa: string): Promise<TimelineProcesso | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(timelineProcessos).where(
    and(
      eq(timelineProcessos.processoId, processoId),
      eq(timelineProcessos.etapa, etapa)
    )
  ).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateTimelinePhase(data: InsertTimelineProcesso, processoId: number, etapa: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  console.log('[createOrUpdateTimelinePhase] Input:', { data, processoId, etapa });
  
  const existing = await getTimelinePhaseByProcessoAndEtapa(processoId, etapa);
  console.log('[createOrUpdateTimelinePhase] Existing:', existing);
  
  if (existing) {
    console.log('[createOrUpdateTimelinePhase] Updating with data:', data);
    const result = await db.update(timelineProcessos).set(data).where(
      and(
        eq(timelineProcessos.processoId, processoId),
        eq(timelineProcessos.etapa, etapa)
      )
    );
    console.log('[createOrUpdateTimelinePhase] Update result:', result);
    return result;
  } else {
    console.log('[createOrUpdateTimelinePhase] Inserting with data:', data);
    const result = await db.insert(timelineProcessos).values(data);
    console.log('[createOrUpdateTimelinePhase] Insert result:', result);
    return result;
  }
}

// Anexos Processos queries
export async function getAnexosByTimelineId(timelineId: number): Promise<AnexoProcesso[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(anexosProcessos).where(eq(anexosProcessos.timelineId, timelineId));
}

export async function getAnexosByProcessoId(processoId: number): Promise<AnexoProcesso[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(anexosProcessos).where(eq(anexosProcessos.processoId, processoId));
}

export async function createAnexo(data: InsertAnexoProcesso) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(anexosProcessos).values(data);
}

export async function getAnexoById(id: number): Promise<AnexoProcesso | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(anexosProcessos).where(eq(anexosProcessos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteAnexo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(anexosProcessos).where(eq(anexosProcessos.id, id));
}

// Transacoes Processos queries
export async function getTransacoesByProcessoId(processoId: number): Promise<TransacaoProcesso[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transacoesProcessos).where(eq(transacoesProcessos.processoId, processoId));
}

export async function createTransacao(data: InsertTransacaoProcesso) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(transacoesProcessos).values(data);
}

export async function deleteTransacao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(transacoesProcessos).where(eq(transacoesProcessos.id, id));
}

// Oportunidades PNCP queries
export async function getOportunidadesPncpByUserId(userId: number): Promise<OportunidadePncp[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(oportunidadesPncp).where(eq(oportunidadesPncp.userId, userId));
}

export async function getOportunidadePncpById(id: number): Promise<OportunidadePncp | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const resultado = await db.select().from(oportunidadesPncp).where(eq(oportunidadesPncp.id, id));
  return resultado[0];
}

export async function createOportunidadePncp(data: InsertOportunidadePncp): Promise<OportunidadePncp> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se já existe
  const existe = await db.select().from(oportunidadesPncp).where(eq(oportunidadesPncp.numeroControlePncp, data.numeroControlePncp));
  if (existe.length > 0) {
    return existe[0];
  }
  
  await db.insert(oportunidadesPncp).values(data);
  const resultado = await db.select().from(oportunidadesPncp).where(eq(oportunidadesPncp.numeroControlePncp, data.numeroControlePncp));
  return resultado[0] as OportunidadePncp;
}

export async function sincronizarOportunidadeComProcesso(oportunidadeId: number, processoId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(oportunidadesPncp).set({ processoId, sincronizado: 1 }).where(eq(oportunidadesPncp.id, oportunidadeId));
}

export async function deleteOportunidadePncp(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(oportunidadesPncp).where(eq(oportunidadesPncp.id, id));
}

// Documentos Processo queries
export async function getDocumentosByProcessoId(processoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(documentosProcesso).where(eq(documentosProcesso.processoId, processoId));
}

export async function createDocumento(data: InsertDocumentoProcesso) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(documentosProcesso).values(data);
}

export async function deleteDocumento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(documentosProcesso).where(eq(documentosProcesso.id, id));
}


// Workspaces queries
export async function createWorkspace(data: InsertWorkspace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(workspaces).values(data);
}

export async function getWorkspaceByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(workspaces).where(eq(workspaces.ownerId, ownerId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getWorkspaceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Colaboradores queries
export async function createColaborador(data: InsertColaborador) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(colaboradores).values(data);
}

export async function getColaboradoresByWorkspaceId(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(colaboradores).where(eq(colaboradores.workspaceId, workspaceId));
}

export async function deleteColaborador(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(colaboradores).where(eq(colaboradores.id, id));
}

export async function getColaboradorByWorkspaceAndUser(workspaceId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(colaboradores).where(
    and(
      eq(colaboradores.workspaceId, workspaceId),
      eq(colaboradores.userId, userId)
    )
  ).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Convites queries
export async function createConvite(data: InsertConvite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(convites).values(data);
}

export async function getConviteByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(convites).where(eq(convites.token, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getWorkspaceIdByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  // First check if user is owner of a workspace
  const workspace = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
  if (workspace.length > 0) return workspace[0].id;
  
  // Otherwise check if user is a collaborator
  const collab = await db.select().from(colaboradores).where(eq(colaboradores.userId, userId)).limit(1);
  if (collab.length > 0) return collab[0].workspaceId;
  
  return null;
}

export async function getConvitesByWorkspaceId(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(convites).where(eq(convites.workspaceId, workspaceId));
}

export async function updateConvite(id: number, data: Partial<Convite>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(convites).set(data).where(eq(convites.id, id));
}

export async function deleteConvite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(convites).where(eq(convites.id, id));
}

// Itens Precificação queries
export async function getItensPrecificacaoByProcessoId(processoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(itensPrecificacao).where(eq(itensPrecificacao.processoId, processoId));
}

export async function getItensPrecificacaoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(itensPrecificacao).where(eq(itensPrecificacao.id, id));
  return result.length > 0 ? result[0] : undefined;
}

export async function createItensPrecificacao(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(itensPrecificacao).values(data);
}

export async function updateItensPrecificacao(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(itensPrecificacao).set(data).where(eq(itensPrecificacao.id, id));
}

export async function deleteItensPrecificacao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(itensPrecificacao).where(eq(itensPrecificacao.id, id));
}

