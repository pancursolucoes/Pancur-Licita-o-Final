CREATE TABLE `documentosProcesso` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `userId` int NOT NULL,
  `processoId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `tamanho` int,
  `createdAt` timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updatedAt` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
