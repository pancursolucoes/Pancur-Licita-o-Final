CREATE TABLE `anexosProcessos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`userId` int NOT NULL,
	`nomeArquivo` text NOT NULL,
	`urlS3` text NOT NULL,
	`tipoMime` varchar(100),
	`tamanho` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anexosProcessos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timelineProcessos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`userId` int NOT NULL,
	`fase` int NOT NULL,
	`descricao` text,
	`data` varchar(10),
	`status` enum('pendente','concluido','cancelado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timelineProcessos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transacoesProcessos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`userId` int NOT NULL,
	`tipo` enum('entrada','saida') NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`valor` decimal(10,2) NOT NULL,
	`descricao` text,
	`data` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transacoesProcessos_id` PRIMARY KEY(`id`)
);
