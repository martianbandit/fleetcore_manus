CREATE TABLE `checklistItems` (
	`id` varchar(36) NOT NULL,
	`inspectionId` varchar(36) NOT NULL,
	`sectionId` varchar(50) NOT NULL,
	`sectionName` varchar(200) NOT NULL,
	`itemNumber` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`vmrsCode` varchar(50),
	`saaqCode` varchar(50),
	`status` enum('pending','ok','minor_defect','major_defect') NOT NULL DEFAULT 'pending',
	`notes` text,
	`isRequired` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` varchar(36) NOT NULL,
	`vehicleId` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`technicianId` varchar(100) NOT NULL,
	`technicianName` varchar(200) NOT NULL,
	`type` enum('periodic','pre_trip','post_trip','incident') NOT NULL,
	`status` enum('DRAFT','IN_PROGRESS','COMPLETED','BLOCKED') NOT NULL DEFAULT 'DRAFT',
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`totalItems` int NOT NULL DEFAULT 0,
	`completedItems` int NOT NULL DEFAULT 0,
	`okCount` int NOT NULL DEFAULT 0,
	`minorDefectCount` int NOT NULL DEFAULT 0,
	`majorDefectCount` int NOT NULL DEFAULT 0,
	`notes` text,
	`pdfReportUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proofs` (
	`id` varchar(36) NOT NULL,
	`checklistItemId` varchar(36) NOT NULL,
	`type` enum('photo','video') NOT NULL,
	`uri` text NOT NULL,
	`localUri` text,
	`thumbnail` text,
	`timestamp` timestamp NOT NULL,
	`location` varchar(10),
	`notes` text,
	`uploadedToS3` int NOT NULL DEFAULT 0,
	`s3Key` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `proofs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`vin` varchar(17) NOT NULL,
	`plate` varchar(20) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`vehicleClass` enum('A','B','C','D','E') NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`companyId` varchar(100),
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`lastInspectionDate` timestamp,
	`lastInspectionStatus` enum('DRAFT','IN_PROGRESS','COMPLETED','BLOCKED'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_vin_unique` UNIQUE(`vin`)
);
