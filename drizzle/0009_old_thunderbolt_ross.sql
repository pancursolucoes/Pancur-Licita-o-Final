ALTER TABLE `timelineProcessos` MODIFY COLUMN `data` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `anexosProcessos` ADD `processoId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `anexosProcessos` ADD `nome` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `anexosProcessos` ADD `tipo` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `anexosProcessos` ADD `url` text NOT NULL;--> statement-breakpoint
ALTER TABLE `itensPrecificacao` ADD `fichaTecnica` text;--> statement-breakpoint
ALTER TABLE `timelineProcessos` ADD `etapa` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `anexosProcessos` DROP COLUMN `nomeArquivo`;--> statement-breakpoint
ALTER TABLE `anexosProcessos` DROP COLUMN `urlS3`;--> statement-breakpoint
ALTER TABLE `anexosProcessos` DROP COLUMN `tipoMime`;--> statement-breakpoint
ALTER TABLE `timelineProcessos` DROP COLUMN `fase`;