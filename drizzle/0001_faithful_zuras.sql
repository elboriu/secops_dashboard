CREATE TABLE `recon_findings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`type` enum('subdomain','dns','http') NOT NULL,
	`asset` varchar(253) NOT NULL,
	`source` varchar(64) NOT NULL,
	`severity` enum('info','low','medium','high') NOT NULL DEFAULT 'info',
	`ip` varchar(64),
	`url` varchar(2048),
	`statusCode` int,
	`title` varchar(512),
	`technologies` text,
	`records` text,
	`evidence` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recon_findings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recon_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`target` varchar(253) NOT NULL,
	`mode` enum('passive','active') NOT NULL,
	`status` enum('queued','running','completed','failed') NOT NULL DEFAULT 'queued',
	`findingsCount` int NOT NULL DEFAULT 0,
	`reportMarkdown` text,
	`warnings` text,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recon_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `recon_findings_scan_asset_idx` ON `recon_findings` (`scanId`,`asset`);--> statement-breakpoint
CREATE INDEX `recon_scans_owner_created_idx` ON `recon_scans` (`ownerId`,`createdAt`);