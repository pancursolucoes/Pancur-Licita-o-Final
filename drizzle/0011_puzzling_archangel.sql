CREATE TABLE `documentosProcesso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`processoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`tamanho` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentosProcesso_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `itensPrecificacao` ADD `frete` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `processos` ADD `observacoesPrecificacao` text;--> statement-breakpoint
ALTER TABLE `processos` ADD `imageUrl` text;--> statement-breakpoint
ALTER TABLE `processos` ADD `freteProcesso` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `processos` ADD `destacado` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `itensPrecificacao` DROP COLUMN `fretePercentual`;