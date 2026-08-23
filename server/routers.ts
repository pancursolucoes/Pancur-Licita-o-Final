import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
const COOKIE_NAME = "session";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  processos: router({
    create: protectedProcedure
      .input(z.object({
        numero: z.string(),
        descricao: z.string().optional(),
        data: z.string().optional(),
        dataLimite: z.string().optional(),
        horarioLimite: z.string().optional(),
        link: z.string().optional(),
        nomeOrgao: z.string().optional(),
        numeroOrgao: z.string().optional(),
        numeroPregao: z.string().optional(),
        anoPregao: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const workspaceId = await db.getWorkspaceIdByUserId(ctx.user.id);
        if (!workspaceId) throw new Error("Workspace not found");
        return db.createProcesso({
          userId: ctx.user.id,
          workspaceId,
          numero: input.numero,
          descricao: input.descricao || "",
          data: input.data || new Date().toLocaleDateString('pt-BR'),
          dataLimite: input.dataLimite,
          horarioLimite: input.horarioLimite,
          link: input.link,
          nomeOrgao: input.nomeOrgao,
          numeroOrgao: input.numeroOrgao,
          numeroPregao: input.numeroPregao,
          anoPregao: input.anoPregao,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProcessosByUserId(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          numero: z.string().optional(),
          descricao: z.string().optional(),
          data: z.string().optional(),
          dataLimite: z.string().optional(),
          horarioLimite: z.string().optional(),
          link: z.string().optional(),
          nomeOrgao: z.string().optional(),
          numeroOrgao: z.string().optional(),
          numeroPregao: z.string().optional(),
          anoPregao: z.string().optional(),
          status: z.string().optional(),
          resultado: z.string().optional(),
          observacoes: z.string().optional(),
          freteProcesso: z.string().optional(),
        }).optional(),
        numero: z.string().optional(),
        descricao: z.string().optional(),
        dataLimite: z.string().optional(),
        horarioLimite: z.string().optional(),
        link: z.string().optional(),
        nomeOrgao: z.string().optional(),
        numeroOrgao: z.string().optional(),
        numeroPregao: z.string().optional(),
        anoPregao: z.string().optional(),
        status: z.string().optional(),
        resultado: z.string().optional(),
        observacoes: z.string().optional(),
        freteProcesso: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processo = processos.find(p => p.id === input.id);
        if (!processo) throw new TRPCError({ code: 'NOT_FOUND' });
        if (!processo || processo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const updateData: any = input.data || {};
        
        // Handle flat input fields
        if (input.numero !== undefined) updateData.numero = input.numero;
        if (input.descricao !== undefined) updateData.descricao = input.descricao;
        if (input.dataLimite !== undefined) updateData.dataLimite = input.dataLimite;
        if (input.horarioLimite !== undefined) updateData.horarioLimite = input.horarioLimite;
        if (input.link !== undefined) updateData.link = input.link;
        if (input.nomeOrgao !== undefined) updateData.nomeOrgao = input.nomeOrgao;
        if (input.numeroOrgao !== undefined) updateData.numeroOrgao = input.numeroOrgao;
        if (input.numeroPregao !== undefined) updateData.numeroPregao = input.numeroPregao;
        if (input.anoPregao !== undefined) updateData.anoPregao = input.anoPregao;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.resultado !== undefined) updateData.resultado = input.resultado;
        if (input.observacoes !== undefined) updateData.observacoes = input.observacoes;
        if (input.freteProcesso !== undefined) updateData.freteProcesso = input.freteProcesso;

        return db.updateProcesso(input.id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processo = processos.find(p => p.id === input.id);
        if (!processo) throw new TRPCError({ code: 'NOT_FOUND' });
        return db.deleteProcesso(input.id);
      }),

    toggleDestacado: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processo = processos.find(p => p.id === input.id);
        if (!processo) throw new TRPCError({ code: 'NOT_FOUND' });
        if (!processo || processo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return db.toggleDestacadoProcesso(input.id);
      }),
  }),

  itensPrecificacao: router({
    create: protectedProcedure
      .input(z.object({
        processoId: z.number(),
        item: z.string(),
        descricao: z.string(),
        quantidade: z.number(),
        valorUnitario: z.union([z.string(), z.number()]),
        icms: z.number(),
        pis: z.number(),
        cofins: z.number(),
        ipi: z.number(),
        iss: z.number(),
        margem: z.union([z.string(), z.number()]),
        linkFornecedor: z.string().optional(),
        observacoes: z.string().optional(),
        imagemUrl: z.string().optional(),
        fichaTecnica: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const processo = await db.getProcessoById(input.processoId);
        if (!processo || processo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        return db.createItem({
          userId: ctx.user.id,
          processoId: input.processoId,
          item: input.item,
          descricao: input.descricao,
          quantidade: input.quantidade,
          valorUnitario: String(input.valorUnitario),
          icms: input.icms,
          pis: input.pis,
          cofins: input.cofins,
          ipi: input.ipi,
          iss: input.iss,
          margem: String(input.margem),
          linkFornecedor: input.linkFornecedor,
          observacoes: input.observacoes,
          imagemUrl: input.imagemUrl,
          fichaTecnica: input.fichaTecnica,
        });
      }),

    list: protectedProcedure
      .input(z.object({ processoId: z.number() }))
      .query(async ({ ctx, input }) => {
        console.log('[itensPrecificacao.list] Starting for processoId:', input.processoId);
        // Se processoId é 0, retorna lista vazia (nenhum processo selecionado)
        if (input.processoId === 0) {
          console.log('[itensPrecificacao.list] No processo selected, returning empty list');
          return [];
        }
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processo = processos.find(p => p.id === input.processoId);
        if (!processo) {
          console.log('[itensPrecificacao.list] Processo not found');
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const itens = await db.getItensByProcessoId(input.processoId);
        console.log('[itensPrecificacao.list] Returning', itens.length, 'itens');
        return itens;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        processoId: z.number().optional(),
        item: z.string().optional(),
        descricao: z.string().optional(),
        quantidade: z.number().optional(),
        valorUnitario: z.union([z.string(), z.number()]).optional(),
        icms: z.number().optional(),
        pis: z.number().optional(),
        cofins: z.number().optional(),
        ipi: z.number().optional(),
        iss: z.number().optional(),
        margem: z.union([z.string(), z.number()]).optional(),
        linkFornecedor: z.string().optional(),
        observacoes: z.string().optional(),
        imagemUrl: z.string().optional(),
        valorFinalCustomizado: z.union([z.string(), z.number()]).nullable().optional(),
        fichaTecnica: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const item = await db.getItensPrecificacaoById(input.id);
        if (!item || item.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const updateData: any = {};
        if (input.item !== undefined) updateData.item = input.item;
        if (input.descricao !== undefined) updateData.descricao = input.descricao;
        if (input.quantidade !== undefined) updateData.quantidade = input.quantidade;
        if (input.valorUnitario !== undefined) updateData.valorUnitario = String(input.valorUnitario);
        if (input.icms !== undefined) updateData.icms = input.icms;
        if (input.pis !== undefined) updateData.pis = input.pis;
        if (input.cofins !== undefined) updateData.cofins = input.cofins;
        if (input.ipi !== undefined) updateData.ipi = input.ipi;
        if (input.iss !== undefined) updateData.iss = input.iss;
        if (input.margem !== undefined) updateData.margem = String(input.margem);
        if (input.linkFornecedor !== undefined) updateData.linkFornecedor = input.linkFornecedor;
        if (input.observacoes !== undefined) updateData.observacoes = input.observacoes;
        if (input.imagemUrl !== undefined) updateData.imagemUrl = input.imagemUrl;
        if (input.valorFinalCustomizado !== undefined) {
          updateData.valorFinalCustomizado = input.valorFinalCustomizado === null ? null : String(input.valorFinalCustomizado);
          console.log('[updateItem] valorFinalCustomizado:', input.valorFinalCustomizado, '-> updateData:', updateData.valorFinalCustomizado);
        }
        if (input.fichaTecnica !== undefined) updateData.fichaTecnica = input.fichaTecnica;
        
        // Se os impostos mudaram, limpar valorFinalCustomizado para forcar recalcular
        const taxesChanged = input.icms !== undefined || input.pis !== undefined || input.cofins !== undefined || input.ipi !== undefined || input.iss !== undefined;
        if (taxesChanged && input.valorFinalCustomizado === undefined) {
          updateData.valorFinalCustomizado = null;
        }

        return db.updateItem(input.id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const itens = await db.getItensByUserId(ctx.user.id);
        const item = itens.find(i => i.id === input.id);
        if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
        return db.deleteItem(input.id);
      }),

    listAll: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getItensByUserId(ctx.user.id);
      }),
  }),

  configuracoes: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getConfiguracaoByUserId(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        empresa: z.string().optional(),
        cnpj: z.string().optional(),
        regimeTributario: z.string().optional(),
        icmsDefault: z.number().optional(),
        pisDefault: z.number().optional(),
        cofinsDefault: z.number().optional(),
        ipiDefault: z.number().optional(),
        issDefault: z.number().optional(),
        margemDefault: z.number().optional(),
        endereco: z.string().optional(),
        cep: z.string().optional(),
        celular: z.string().optional(),
        email: z.string().optional(),
        banco: z.string().optional(),
        agencia: z.string().optional(),
        contaCorrente: z.string().optional(),
        validadePropostadias: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const config = await db.getConfiguracaoByUserId(ctx.user.id);
        if (!config) throw new TRPCError({ code: 'NOT_FOUND' });
        return db.updateConfiguracao(config.id, input);
      }),
  }),

  fornecedores: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getFornecedoresByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        site: z.string().optional(),
        ramo: z.string().optional(),
        contato: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        celular: z.string().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        cnpj: z.string().optional(),
        inscricaoEstadual: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createFornecedor({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        site: z.string().optional(),
        ramo: z.string().optional(),
        contato: z.string().optional(),
        email: z.string().optional(),
        telefone: z.string().optional(),
        celular: z.string().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        cnpj: z.string().optional(),
        inscricaoEstadual: z.string().optional(),
        observacoes: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const fornecedor = await db.getFornecedorById(input.id);
        if (!fornecedor || fornecedor.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        const { id, ...updateData } = input;
        return db.updateFornecedor(id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const fornecedor = await db.getFornecedorById(input.id);
        if (!fornecedor || fornecedor.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return db.deleteFornecedor(input.id);
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.searchFornecedores(ctx.user.id, input.query);
      }),
  }),



  timeline: router({
    getAllByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getTimelineByUserId(ctx.user.id);
    }),
    savePhase: protectedProcedure
      .input(z.object({
        processoId: z.number(),
        etapa: z.string(),
        data: z.string(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se o processo pertence ao usuario
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processoExists = processos.find(p => p.id === input.processoId);
        if (!processoExists) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        // Salvar ou atualizar fase da timeline
        return db.createOrUpdateTimelinePhase({
          userId: ctx.user.id,
          processoId: input.processoId,
          etapa: input.etapa,
          data: input.data,
          descricao: input.descricao,
          status: 'concluido',
        }, input.processoId, input.etapa);
      }),
  }),
  anexos: router({
    create: protectedProcedure
      .input(z.object({
        timelineId: z.number(),
        processoId: z.number(),
        nome: z.string(),
        url: z.string(),
        tipo: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se o processo pertence ao usuario
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processoExists = processos.find(p => p.id === input.processoId);
        if (!processoExists) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        // Criar anexo no banco de dados
        return db.createAnexo({
          userId: ctx.user.id,
          timelineId: input.timelineId,
          processoId: input.processoId,
          nome: input.nome,
          url: input.url,
          tipo: input.tipo,
        });
      }),
    list: protectedProcedure
      .input(z.object({ processoId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verificar se o processo pertence ao usuario
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processoExists = processos.find(p => p.id === input.processoId);
        if (!processoExists) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        // Buscar anexos do processo
        return db.getAnexosByProcessoId(input.processoId);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verificar permissao antes de deletar
        const anexo = await db.getAnexoById(input.id);
        if (!anexo) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        const processos = await db.getProcessosByUserId(ctx.user.id);
        const processoExists = processos.find(p => p.id === anexo.processoId);
        if (!processoExists) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return db.deleteAnexo(input.id);
      }),
  }),
  colaboradores: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const workspaceId = await db.getWorkspaceIdByUserId(ctx.user.id);
      if (!workspaceId) return [];
      return db.getColaboradoresByWorkspaceId(workspaceId);
    }),
    invite: protectedProcedure
      .input(z.object({
        email: z.string().email('E-mail invalido'),
      }))
      .mutation(async ({ ctx, input }) => {
        const workspaceId = await db.getWorkspaceIdByUserId(ctx.user.id);
        if (!workspaceId) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Criar convite
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return db.createConvite({
          workspaceId,
          email: input.email,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }),
    remove: protectedProcedure
      .input(z.object({
        colaboradorId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const workspaceId = await db.getWorkspaceIdByUserId(ctx.user.id);
        if (!workspaceId) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const colaborador = await db.getColaboradorByWorkspaceAndUser(workspaceId, input.colaboradorId);
        if (!colaborador || colaborador.workspaceId !== workspaceId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return db.deleteColaborador(input.colaboradorId);
      }),
  }),
});
