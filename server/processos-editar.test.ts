import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { AuthenticatedUser } from "./_core/types/manusTypes";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 998,
    openId: "test-user-observacoes",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("processos - editar com observacoes", () => {
  let processoId: number;
  const { ctx } = createAuthContext();
  const caller = appRouter.createCaller(ctx);

  beforeAll(async () => {
    // Criar um processo de teste
    await caller.processos.create({
      data: new Date().toISOString().split('T')[0],
      numero: "EDIT-TEST-001",
      status: "Em Andamento",
      nomeOrgao: "Órgão de Teste",
    });

    // Obter o ID do processo criado
    const processos = await caller.processos.list();
    const testProcesso = processos.find(p => p.numero === "EDIT-TEST-001");
    if (testProcesso) {
      processoId = testProcesso.id;
    }
  });

  it("should create a processo without observacoes", async () => {
    const processos = await caller.processos.list();
    const testProcesso = processos.find(p => p.numero === "EDIT-TEST-001");
    
    expect(testProcesso).toBeDefined();
    expect(testProcesso?.observacoes).toBeUndefined();
  });

  it("should update processo with observacoes", async () => {
    if (!processoId) {
      throw new Error("processoId not set");
    }

    // Atualizar o processo com observações
    await caller.processos.update({
      id: processoId,
      data: {
        observacoes: "Observação adicionada durante edição",
      },
    });

    // Verificar se as observações foram atualizadas
    const processos = await caller.processos.list();
    const updatedProcesso = processos.find(p => p.id === processoId);
    
    expect(updatedProcesso).toBeDefined();
    expect(updatedProcesso?.observacoes).toBe("Observação adicionada durante edição");
  });

  it("should update observacoes multiple times", async () => {
    if (!processoId) {
      throw new Error("processoId not set");
    }

    // Primeira atualização
    await caller.processos.update({
      id: processoId,
      data: {
        observacoes: "Primeira observação",
      },
    });

    let processos = await caller.processos.list();
    let updatedProcesso = processos.find(p => p.id === processoId);
    expect(updatedProcesso?.observacoes).toBe("Primeira observação");

    // Segunda atualização
    await caller.processos.update({
      id: processoId,
      data: {
        observacoes: "Segunda observação",
      },
    });

    processos = await caller.processos.list();
    updatedProcesso = processos.find(p => p.id === processoId);
    expect(updatedProcesso?.observacoes).toBe("Segunda observação");
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (processoId) {
      await caller.processos.delete(processoId);
    }
  });
});
