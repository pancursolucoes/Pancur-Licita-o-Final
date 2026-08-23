import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Processos - Toggle Destacado", () => {
  let processoId: number;
  const testUserId = 1;

  beforeAll(async () => {
    // Create a test process
    const result = await db.createProcesso({
      userId: testUserId,
      data: "2026-07-14",
      numero: `TEST-TOGGLE-${Date.now()}`,
      status: "Em Andamento",
      link: "https://example.com",
      dataLimite: "2026-07-31",
      horarioLimite: "14:30",
      resultado: "",
      observacoes: "Test process",
      nomeOrgao: "Test Organ",
      numeroOrgao: "123456",
      numeroPregao: "1",
      anoPregao: "2026",
      freteProcesso: "0",
      arquivado: 0,
      destacado: 0,
    });
    processoId = (result as any).insertId;
    if (!processoId) {
      throw new Error("Failed to create test process");
    }
  });

  it("should toggle destacado from 0 to 1", async () => {
    const result = await db.toggleDestacadoProcesso(processoId);
    expect(result).toBeDefined();
    
    // Verify the toggle worked
    const processos = await db.getProcessosByUserId(testUserId);
    const processo = processos.find(p => p.id === processoId);
    expect(processo?.destacado).toBe(1);
  });

  it("should toggle destacado from 1 back to 0", async () => {
    const result = await db.toggleDestacadoProcesso(processoId);
    expect(result).toBeDefined();
    
    // Verify the toggle worked
    const processos = await db.getProcessosByUserId(testUserId);
    const processo = processos.find(p => p.id === processoId);
    expect(processo?.destacado).toBe(0);
  });

  it("should throw error for non-existent process", async () => {
    try {
      await db.toggleDestacadoProcesso(999999);
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Process not found");
    }
  });

  afterAll(async () => {
    // Clean up
    if (processoId) {
      await db.deleteProcesso(processoId);
    }
  });
});
