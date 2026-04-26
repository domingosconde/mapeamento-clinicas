CREATE TABLE `clinicResponses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`clinicId` int NOT NULL,
	`text` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinicResponses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinicSpecialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`specialtyId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clinicSpecialties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`address` varchar(500) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(50) NOT NULL,
	`zipCode` varchar(20),
	`latitude` decimal(10,8) NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`website` varchar(500),
	`openingHours` text,
	`photoUrl` varchar(500),
	`adminUserId` int NOT NULL,
	`averageRating` float DEFAULT 0,
	`totalRatings` int DEFAULT 0,
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`userId` int NOT NULL,
	`text` text NOT NULL,
	`isApproved` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `specialties_name_unique` UNIQUE(`name`)
);
