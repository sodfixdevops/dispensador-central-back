SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

IF DB_ID(N'bd_dispensador') IS NULL
BEGIN
    CREATE DATABASE bd_dispensador;
END
GO

USE bd_dispensador;
GO

-- tabla de consumo de api al banco bcp
IF OBJECT_ID(N'dbo.adapi', N'U') IS NULL
BEGIN
CREATE TABLE dbo.adapi (
    adapiseri   INT NOT NULL IDENTITY(1,1),
    adapicurl   VARCHAR(100) NOT NULL,
    adapiresp   VARCHAR(10) NULL,
    adapifreg   DATETIME2 NOT NULL,
    adapifupt   DATETIME2 NOT NULL,
    adapiobse   VARCHAR(500) NULL,
    adapistat   SMALLINT NOT NULL,
    CONSTRAINT PK_adapi PRIMARY KEY (adapiseri)
);
END
GO

-- tabla de cuentas bancarias del banco bcp
IF OBJECT_ID(N'dbo.adbank', N'U') IS NULL
BEGIN
CREATE TABLE dbo.adbank (
  adbankseri    INT NOT NULL IDENTITY(1,1),
  adbankusrn    VARCHAR(36) NULL,
  adbankncta    VARCHAR(20) NULL,
  adbanktipo    VARCHAR(20) NULL,
  adbankmone    VARCHAR(20) NULL,
  adbankfreg    DATETIME2 NOT NULL,
  adbankmrcb    SMALLINT NOT NULL,
  CONSTRAINT PK_adbank PRIMARY KEY (adbankseri)
);
END
GO

-- tabla de transacciones del dispensador
IF OBJECT_ID(N'dbo.dptrn', N'U') IS NULL
BEGIN
CREATE TABLE dbo.dptrn (
  dptrnntra INT NOT NULL IDENTITY(1,1),
  dptrnndes INT NULL,
  dptrncmon INT NULL,
  dptrnftra DATETIME2 NULL,
  dptrnimpo DECIMAL(14,2) NULL,
  dptrnmrcb SMALLINT NOT NULL,
  dptrnstat SMALLINT NOT NULL,
  dptrnfreg DATETIME2 NOT NULL,
  dptrnusrn CHAR(36) NULL,
  dptrndisp INT NOT NULL,
  CONSTRAINT PK_dptrn PRIMARY KEY (dptrnntra)
);
END
GO

-- tabla de detalle de transacciones del dispensador
IF OBJECT_ID(N'dbo.dptrd', N'U') IS NULL
BEGIN
CREATE TABLE dbo.dptrd (
  dptrdseri INT NOT NULL IDENTITY(1,1),
  dptrdntra INT NULL,
  dptrnitem INT NULL,
  dptrdimpo INT NULL,
  dptrdvlor INT NULL,
  dptrdcant DECIMAL(14,2) NULL,
  CONSTRAINT PK_dptrd PRIMARY KEY (dptrdseri)
);
END
GO

-- tabla de dispositivos
IF OBJECT_ID(N'dbo.addisp', N'U') IS NULL
BEGIN
CREATE TABLE dbo.addisp (
  addispcode INT NOT NULL IDENTITY(1,1),
  addispnomb VARCHAR(70) NOT NULL,
  addispusrn VARCHAR(36) NOT NULL,
  addipsapis VARCHAR(70) NOT NULL,
  addispsrl1 VARCHAR(70) NOT NULL,
  addispsrl2 VARCHAR(70) NOT NULL,
  addispmrcb SMALLINT NOT NULL,
  addispstat SMALLINT NOT NULL,
  addispfreg DATETIME2 NOT NULL,
  addispfupt DATETIME2 NULL,
  addispusra VARCHAR(36) NULL,
  addispusru VARCHAR(36) NULL,
  CONSTRAINT PK_addisp PRIMARY KEY (addispcode)
);
END
GO

-- tabla de desembolsos
IF OBJECT_ID(N'dbo.dpdes', N'U') IS NULL
BEGIN
CREATE TABLE dbo.dpdes (
  dpdesndes INT NOT NULL,
  dpdesfsol DATETIME2 NOT NULL,
  dpdesstat SMALLINT NOT NULL,
  dpdesimpt DECIMAL(14,2) NOT NULL,
  dpdesusrs VARCHAR(36) NOT NULL,
  dpdesdisp INT NOT NULL,
  dpdesmrcb SMALLINT NOT NULL,
  CONSTRAINT PK_dpdes PRIMARY KEY (dpdesndes)
);
END
GO

-- tabla gbcon
IF OBJECT_ID(N'dbo.gbcon', N'U') IS NULL
BEGIN
CREATE TABLE dbo.gbcon (
  gbcongnid INT NOT NULL IDENTITY(1,1),
  gbconpref SMALLINT NOT NULL,
  gbconcorr INT NOT NULL,
  gbcondesc CHAR(200) NOT NULL,
  gbconabre CHAR(20) NOT NULL,
  gbconmrcb SMALLINT NOT NULL,
  CONSTRAINT PK_gbcon PRIMARY KEY (gbcongnid)
);
END
GO

-- tabla de autorizaciones
IF OBJECT_ID(N'dbo.dpaut', N'U') IS NULL
BEGIN
CREATE TABLE dbo.dpaut (
  dpautseri INT NOT NULL IDENTITY(1,1),
  dpautfsol DATETIME2 NULL,
  dpautndes INT NULL,
  dpautusrs VARCHAR(36) NULL,
  dpautusra VARCHAR(36) NULL,
  dpautfaut DATETIME2 NULL,
  dpautstat SMALLINT NOT NULL,
  CONSTRAINT PK_dpaut PRIMARY KEY (dpautseri)
);
END
GO

-- tabla de seriales
IF OBJECT_ID(N'dbo.dpsrl', N'U') IS NULL
BEGIN
CREATE TABLE dbo.dpsrl (
  dpsrlcode INT NOT NULL IDENTITY(1,1),
  dpsrltbla VARCHAR(20) NOT NULL,
  dpsrlseri INT NULL,
  CONSTRAINT PK_dpsrl PRIMARY KEY (dpsrlcode)
);
END
GO

-- tabla de usuarios aduser
IF OBJECT_ID(N'dbo.aduser', N'U') IS NULL
BEGIN
CREATE TABLE dbo.aduser (
  adusrusrn VARCHAR(36) NOT NULL,
  adusrnick VARCHAR(50) NOT NULL,
  adusrclav VARCHAR(80) NOT NULL,
  adusrtipo SMALLINT NOT NULL,
  adusrfreg DATETIME2 NOT NULL,
  adusrusra VARCHAR(36) NOT NULL,
  adusrfupt DATETIME2 NULL,
  adusrusru VARCHAR(36) NULL,
  adusrmrcb SMALLINT NOT NULL DEFAULT 0,
  adusrstat SMALLINT NOT NULL DEFAULT 1,
  CONSTRAINT PK_aduser PRIMARY KEY (adusrusrn)
);
END
GO

-- tabla para el control de acceso al sistema en sessiones
IF OBJECT_ID(N'dbo.liacs', N'U') IS NULL
BEGIN
CREATE TABLE dbo.liacs (
  liacsseri INT NOT NULL IDENTITY(1,1),    -- codigo de la session
  liacsusrn VARCHAR(36) NOT NULL,           -- codigo del usuario que inicio session
  liacsdisp INT NOT NULL,                   -- codigo del dispositivo desde donde se inicio session
  liacsnrip VARCHAR(20) NOT NULL,           -- direccion de ip de donde se inicio session
  liacsmrcb SMALLINT NOT NULL,              -- marca para control de sessiones activas
  liacsfreg DATETIME2 NOT NULL,              -- fecha y hora de inicio de session
  liacsfult DATETIME2 NULL,          -- fecha y hora de fin de session
  liacsuact DATETIME2 NULL,          -- fecha y hora de ultima actividad en la session
  CONSTRAINT PK_liacs PRIMARY KEY (liacsseri)
);
END
GO

-- tabla de relacion de dispositivos asignados a usuarios
IF OBJECT_ID(N'dbo.adusrd', N'U') IS NULL
BEGIN
CREATE TABLE dbo.adusrd (
  adusrdseri INT NOT NULL IDENTITY(1,1),
  adusrdusrn VARCHAR(36) NOT NULL,
  adusrddisp INT NOT NULL,
  adusrdmrcb SMALLINT NOT NULL,
  CONSTRAINT PK_adusrd PRIMARY KEY (adusrdseri)
);
END
GO
