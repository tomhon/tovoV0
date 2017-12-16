USE [playertracking]
GO

/****** Object: Table [dbo].[trackingTable] Script Date: 12/16/2017 10:10:01 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[trackingTable] (
    [id]         TIMESTAMP     NOT NULL,
[assistCount] SMALLINT Null,
[attemptedDribbleCount] SMALLINT NULL,
[attemptedPassCount] SMALLINT NULL,
[attemptedTackleCount] SMALLINT NULL,
[committedFoulCount] SMALLINT NULL,
[completedPassCount] SMALLINT NULL,
[cornerCount] SMALLINT NULL,
[finalWhistleCount] SMALLINT NULL,
[fouledCount] SMALLINT NULL,
[freeKickCount] SMALLINT NULL,
[gameField] NVARCHAR (255) NULL,
[gameId] NVARCHAR (255) NULL,
[gameLocation] NVARCHAR (255) NULL,
[goalCount] SMALLINT NULL,
[inSpaceCount] SMALLINT NULL,
[kickOffCount] SMALLINT NULL,
[matchState] NVARCHAR (50) NULL,
[mostRecentGameStartTime] BIGINT NULL,
[mostRecentPlayerStartTime] BIGINT NULL,
[mostRecentStartTime] BIGINT NULL,
[opponentClub] NVARCHAR (255) NULL,
[opponentTeam] NVARCHAR (255) NULL,
[penaltyKickCount] SMALLINT NULL,
[playerClub] NVARCHAR (255) NULL,
[playerInOut] NVARCHAR (50) NULL,
[playerName] NVARCHAR (255) NULL,
[playerNumber] SMALLINT NULL,
[playerTeam] NVARCHAR (255) NULL,
[playerTeamAwayHome] NVARCHAR (50) NULL,
[scanningCount] SMALLINT NULL,
[shotCount] SMALLINT NULL,
[shotOffFrameCount] SMALLINT NULL,
[shotOnFrameCount] SMALLINT NULL,
[status] NVARCHAR (50) NULL,
[substitutedInCount] SMALLINT NULL,
[substitutedOutCount] SMALLINT NULL,
[successfulDribbleCount] SMALLINT NULL,
[successfulTackleCount] SMALLINT NULL,
[totalElapsedTime] BIGINT NULL,
[totalGameElapsedTime] BIGINT NULL,
[totalPlayerElapsedTime] BIGINT NULL,
[userName] NVARCHAR (50)  NULL
);


