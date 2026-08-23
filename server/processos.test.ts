import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("processos - observacoes", () => {
  let processoId: number;
  const userId = 999; // ID de teste

  beforeAll(async () => {
    // Criar um processo de teste
    const result = await db.createProcesso({
      userId,
      data: new Date().toISOString().split('T')[0],
      numero: "TEST001",
      status: "Em Andamento",
      observacoes: "Observação inicial",
      nomeOrgao: "Órgão de Teste",
    });
    
    // Obter o ID do processo criado
    const processos = await db.getProcessosByUserId(userId);
    const testProcesso = processos.find(p => p.numero === "TEST001");
    if (testProcesso) {
      processoId = testProcesso.id;
    }
  });

  it("should save observacoes when creating a processo", async () => {
    const processos = await db.getProcessosByUserId(userId);
    const testProcesso = processos.find(p => p.numero === "TEST001");
    
    expect(testProcesso).toBeDefined();
    expect(testProcesso?.observacoes).toBe("Observação inicial");
  });

  it("should update observacoes when updating a processo", async () => {
    if (!processoId) {
      throw new Error("processoId not set");
    }

    // Atualizar as observações
    await db.updateProcesso(processoId, {
      observacoes: "Observação atualizada",
    });

    // Verificar se as observações foram atualizadas
    const processos = await db.getProcessosByUserId(userId);
    const updatedProcesso = processos.find(p => p.id === processoId);
    
    expect(updatedProcesso).toBeDefined();
    expect(updatedProcesso?.observacoes).toBe("Observação atualizada");
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (processoId) {
      await db.deleteProcesso(processoId);
    }
  });
});
