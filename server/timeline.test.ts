import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { InsertTimelineProcesso, InsertAnexoProcesso } from '../drizzle/schema';

describe('Timeline and Anexos Database Functions', () => {
  const testUserId = 999;
  const testProcessoId = 999;
  const testEtapa = 'Adjudicação/Ganho da Licitação';
  let timelineId: number | null = null;

  beforeAll(async () => {
    // Clean up any existing test data
    try {
      const existing = await db.getTimelinePhaseByProcessoAndEtapa(testProcessoId, testEtapa);
      if (existing) {
        // Data exists from previous test run
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      const timeline = await db.getTimelinePhaseByProcessoAndEtapa(testProcessoId, testEtapa);
      if (timeline) {
        const anexos = await db.getAnexosByTimelineId(timeline.id);
        for (const anexo of anexos) {
          await db.deleteAnexo(anexo.id);
        }
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  it('should create or update a timeline phase', async () => {
    const timelineData: InsertTimelineProcesso = {
      userId: testUserId,
      processoId: testProcessoId,
      etapa: testEtapa,
      descricao: 'Adjudicação/Ganho da Licitação',
      data: new Date(),
      status: 'concluido',
    };

    const result = await db.createOrUpdateTimelinePhase(timelineData, testProcessoId, testEtapa);
    expect(result).toBeDefined();
  });

  it('should retrieve timeline by processo id', async () => {
    const timeline = await db.getTimelineByProcessoId(testProcessoId);
    expect(Array.isArray(timeline)).toBe(true);
    expect(timeline.length).toBeGreaterThan(0);
    timelineId = timeline[0].id;
  });

  it('should retrieve a specific timeline phase', async () => {
    const phase = await db.getTimelinePhaseByProcessoAndEtapa(testProcessoId, testEtapa);
    expect(phase).toBeDefined();
    expect(phase?.etapa).toBe(testEtapa);
    expect(phase?.descricao).toBe('Adjudicação/Ganho da Licitação');
  });

  it('should create an anexo', async () => {
    if (!timelineId) {
      const timeline = await db.getTimelineByProcessoId(testProcessoId);
      timelineId = timeline[0]?.id || null;
    }

    if (!timelineId) {
      throw new Error('No timeline ID available for anexo test');
    }

    const anexoData: InsertAnexoProcesso = {
      userId: testUserId,
      timelineId,
      processoId: testProcessoId,
      nome: 'test-document.pdf',
      url: 'https://example.com/test-document.pdf',
      tipo: 'application/pdf',
      tamanho: 1024,
    };

    const result = await db.createAnexo(anexoData);
    expect(result).toBeDefined();
  });

  it('should retrieve anexos by timeline id', async () => {
    if (!timelineId) {
      const timeline = await db.getTimelineByProcessoId(testProcessoId);
      timelineId = timeline[0]?.id || null;
    }

    if (!timelineId) {
      throw new Error('No timeline ID available for anexo retrieval test');
    }

    const anexos = await db.getAnexosByTimelineId(timelineId);
    expect(Array.isArray(anexos)).toBe(true);
    expect(anexos.length).toBeGreaterThan(0);
    expect(anexos[0].nome).toBe('test-document.pdf');
  });

  it('should update a timeline phase', async () => {
    const updateData: InsertTimelineProcesso = {
      userId: testUserId,
      processoId: testProcessoId,
      etapa: testEtapa,
      descricao: 'Adjudicação/Ganho da Licitação - Updated',
      data: new Date(),
      status: 'pendente',
    };

    const result = await db.createOrUpdateTimelinePhase(updateData, testProcessoId, testEtapa);
    expect(result).toBeDefined();

    // Verify the update
    const updated = await db.getTimelinePhaseByProcessoAndEtapa(testProcessoId, testEtapa);
    expect(updated?.descricao).toBe('Adjudicação/Ganho da Licitação - Updated');
  });
});
