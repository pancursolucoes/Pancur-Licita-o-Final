import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, timestamp, mysqlEnum, index, decimal } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const anexosProcessos = mysqlTable("anexosProcessos", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	timelineId: int().notNull(),
	processoId: int().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	tipo: varchar({ length: 50 }).notNull(),
	url: text().notNull(),
	tamanho: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const colaboradores = mysqlTable("colaboradores", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull(),
	userId: int().notNull(),
	role: mysqlEnum(['owner','collaborator']).default('collaborator').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const configuracoes = mysqlTable("configuracoes", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	empresa: text(),
	cnpj: varchar({ length: 20 }),
	regimeTributario: varchar({ length: 50 }),
	icmsDefault: int().default(18).notNull(),
	pisDefault: int().default(165).notNull(),
	cofinsDefault: int().default(760).notNull(),
	ipiDefault: int().default(0).notNull(),
	issDefault: int().default(0).notNull(),
	margemDefault: int().default(20).notNull(),
	endereco: text(),
	cep: varchar({ length: 10 }),
	celular: varchar({ length: 20 }),
	email: varchar({ length: 320 }),
	banco: varchar({ length: 10 }),
	agencia: varchar({ length: 10 }),
	contaCorrente: varchar({ length: 30 }),
	validadePropostadias: int().default(30).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("configuracoes_userId_unique").on(table.userId),
]);

export const convites = mysqlTable("convites", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull(),
	token: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	usedAt: timestamp({ mode: 'string' }),
	usedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("convites_token_unique").on(table.token),
]);

export const documentosProcesso = mysqlTable("documentosProcesso", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	processoId: int().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	url: text().notNull(),
	tipo: varchar({ length: 50 }).notNull(),
	tamanho: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const fornecedores = mysqlTable("fornecedores", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	nome: text().notNull(),
	site: text(),
	ramo: varchar({ length: 100 }),
	contato: varchar({ length: 100 }),
	email: varchar({ length: 320 }),
	telefone: varchar({ length: 20 }),
	celular: varchar({ length: 20 }),
	endereco: text(),
	cidade: varchar({ length: 100 }),
	estado: varchar({ length: 2 }),
	cep: varchar({ length: 10 }),
	cnpj: varchar({ length: 20 }),
	inscricaoEstadual: varchar({ length: 20 }),
	observacoes: text(),
	ativo: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const itensPrecificacao = mysqlTable("itensPrecificacao", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	processoId: int().notNull(),
	item: varchar({ length: 10 }).notNull(),
	descricao: text().notNull(),
	quantidade: int().notNull(),
	valorUnitario: decimal({ precision: 10, scale: 2 }).notNull(),
	icms: int().notNull(),
	pis: int().notNull(),
	cofins: int().notNull(),
	ipi: int().notNull(),
	iss: int().notNull(),
	margem: decimal({ precision: 10, scale: 2 }).notNull(),
	frete: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	linkFornecedor: text(),
	observacoes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	imagemUrl: text(),
	valorFinalCustomizado: decimal({ precision: 10, scale: 2 }),
	fichaTecnica: text(),
});

export const oportunidadesPncp = mysqlTable("oportunidadesPncp", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	numeroControlePncp: varchar({ length: 100 }).notNull(),
	orgao: text(),
	cidade: varchar({ length: 100 }),
	uf: varchar({ length: 2 }),
	objeto: text().notNull(),
	dataPublicacao: varchar({ length: 50 }),
	dataFimPropostas: varchar({ length: 50 }),
	valorEstimado: decimal({ precision: 15, scale: 2 }),
	fontePortal: varchar({ length: 100 }),
	linkPncp: text(),
	linkOrigem: text(),
	sincronizado: int().default(0).notNull(),
	processoId: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("oportunidadesPncp_numeroControlePncp_unique").on(table.numeroControlePncp),
]);

export const processos = mysqlTable("processos", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull(),
	userId: int().notNull(),
	data: varchar({ length: 10 }).notNull(),
	numero: varchar({ length: 50 }).notNull(),
	status: mysqlEnum(['Em Andamento','Ganho','Perdido','Finalizado']).default('Em Andamento').notNull(),
	link: text(),
	dataLimite: varchar({ length: 10 }),
	horarioLimite: varchar({ length: 5 }),
	resultado: text(),
	observacoes: text(),
	nomeOrgao: text(),
	numeroOrgao: varchar({ length: 50 }),
	numeroPregao: varchar({ length: 50 }),
	anoPregao: varchar({ length: 4 }),
	freteProcesso: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	arquivado: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	observacoesPrecificacao: text(),
	imageUrl: text(),
	destacado: int().default(0).notNull(),
});

export const timelineProcessos = mysqlTable("timelineProcessos", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	processoId: int().notNull(),
	etapa: varchar({ length: 50 }).notNull(),
	data: timestamp({ mode: 'string' }).notNull(),
	descricao: text(),
	status: mysqlEnum(['pendente','concluido','cancelado']).default('pendente').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const transacoesProcessos = mysqlTable("transacoesProcessos", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	processoId: int().notNull(),
	tipo: mysqlEnum(['entrada','saida']).notNull(),
	categoria: varchar({ length: 50 }).notNull(),
	descricao: text(),
	valor: decimal({ precision: 12, scale: 2 }).notNull(),
	data: timestamp({ mode: 'string' }).notNull(),
	mes: varchar({ length: 7 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const workspaces = mysqlTable("workspaces", {
	id: int().autoincrement().notNull(),
	ownerId: int().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});
