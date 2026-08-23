ALTER TABLE `configuracoes` DROP INDEX `configuracoes_userId_unique`;--> statement-breakpoint
ALTER TABLE `convites` DROP INDEX `convites_token_unique`;--> statement-breakpoint
ALTER TABLE `oportunidadesPncp` DROP INDEX `oportunidadesPncp_numeroControlePncp_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `anexosProcessos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `colaboradores` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `configuracoes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `convites` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `documentosProcesso` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `fornecedores` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `itensPrecificacao` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `oportunidadesPncp` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `processos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `timelineProcessos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `transacoesProcessos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `workspaces` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `anexosProcessos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `colaboradores` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `configuracoes` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `convites` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `documentosProcesso` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `fornecedores` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `itensPrecificacao` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `oportunidadesPncp` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `processos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `timelineProcessos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `transacoesProcessos` MODIFY COLUMN `categoria` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `transacoesProcessos` MODIFY COLUMN `valor` decimal(12,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `transacoesProcessos` MODIFY COLUMN `data` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `transacoesProcessos` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `workspaces` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `processos` ADD `workspaceId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `transacoesProcessos` ADD `mes` varchar(7) NOT NULL;--> statement-breakpoint
CREATE INDEX `configuracoes_userId_unique` ON `configuracoes` (`userId`);--> statement-breakpoint
CREATE INDEX `convites_token_unique` ON `convites` (`token`);--> statement-breakpoint
CREATE INDEX `oportunidadesPncp_numeroControlePncp_unique` ON `oportunidadesPncp` (`numeroControlePncp`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);