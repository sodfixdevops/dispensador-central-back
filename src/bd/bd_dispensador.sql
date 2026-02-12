
CREATE DATABASE IF NOT EXISTS bd_dispensador;
USE bd_dispensador;

-- tabla de consumo de api al banco bcp
CREATE TABLE adapi (
    adapiseri   INT NOT NULL AUTO_INCREMENT,
    adapicurl   VARCHAR(100) NOT NULL,
    adapiresp   VARCHAR(10),
    adapifreg   DATETIME NOT NULL,
    adapifupt   DATETIME NOT NULL,
    adapiobse   VARCHAR(500),
    adapistat   SMALLINT NOT NULL,
    PRIMARY KEY (adapiseri)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tabla de cuentas bancarias del banco bcp
CREATE TABLE adbank (
  adbankseri    INT NOT NULL AUTO_INCREMENT,
  adbankusrn    VARCHAR(36),
  adbankncta    VARCHAR(20),
  adbanktipo    VARCHAR(20),
  adbankmone    VARCHAR(20),
  adbankfreg    DATETIME NOT NULL,
  adbankmrcb    SMALLINT NOT NULL,
  PRIMARY KEY (adbankseri)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tabla de transacciones del dispensador
CREATE TABLE dptrn (
  dptrnntra INT NOT NULL AUTO_INCREMENT,
  dptrnndes INT DEFAULT NULL,
  dptrncmon INT DEFAULT NULL,
  dptrnftra DATETIME DEFAULT NULL,
  dptrnimpo DECIMAL(14,2) DEFAULT NULL,
  dptrnmrcb SMALLINT NOT NULL,
  dptrnstat SMALLINT NOT NULL,
  dptrnfreg DATETIME NOT NULL,
  dptrnusrn CHAR(36) DEFAULT NULL,
  dptrndisp INT NOT NULL,
  PRIMARY KEY (dptrnntra)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;

-- tabla de detalle de transacciones del dispensador

CREATE TABLE dptrd (
  dptrdseri INT NOT NULL AUTO_INCREMENT,
  dptrdntra INT DEFAULT NULL,
  dptrnitem INT DEFAULT NULL,
  dptrdimpo INT DEFAULT NULL,
  dptrdvlor INT DEFAULT NULL,
  dptrdcant DECIMAL(14,2) DEFAULT NULL,
  PRIMARY KEY (dptrdseri)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4;

-- tabla de dispositivos
CREATE TABLE addisp (
  addispcode INT NOT NULL AUTO_INCREMENT,
  addispnomb VARCHAR(70) NOT NULL,
  addispusrn VARCHAR(36) NOT NULL,
  addipsapis VARCHAR(70) NOT NULL,
  addispsrl1 VARCHAR(70) NOT NULL,
  addispsrl2 VARCHAR(70) NOT NULL,
  addispmrcb SMALLINT NOT NULL,
  addispstat SMALLINT NOT NULL,
  addispfreg DATETIME NOT NULL,
  addispfupt DATETIME DEFAULT NULL,
  addispusra VARCHAR(36) DEFAULT NULL,
  addispusru VARCHAR(36) DEFAULT NULL,
  PRIMARY KEY (addispcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tabla de desembolsos
CREATE TABLE dpdes (
  dpdesndes INT NOT NULL,
  dpdesfsol DATETIME NOT NULL,
  dpdesstat SMALLINT NOT NULL,
  dpdesimpt DECIMAL(14,2) NOT NULL,
  dpdesusrs VARCHAR(36) NOT NULL,
  dpdesdisp INT NOT NULL,
  dpdesmrcb SMALLINT NOT NULL,
  PRIMARY KEY (dpdesndes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tabla gbcon
CREATE TABLE gbcon (
  gbcongnid INT NOT NULL AUTO_INCREMENT,
  gbconpref SMALLINT NOT NULL,
  gbconcorr INT NOT NULL,
  gbcondesc CHAR(200) NOT NULL,
  gbconabre CHAR(20) NOT NULL,
  gbconmrcb SMALLINT NOT NULL,
  PRIMARY KEY (gbcongnid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tabla de autorizaciones
CREATE TABLE dpaut (
  dpautseri INT NOT NULL AUTO_INCREMENT,
  dpautfsol DATETIME DEFAULT NULL,
  dpautndes INT DEFAULT NULL,
  dpautusrs VARCHAR(36) DEFAULT NULL,
  dpautusra VARCHAR(36) DEFAULT NULL,
  dpautfaut DATETIME DEFAULT NULL,
  dpautstat SMALLINT NOT NULL,
  PRIMARY KEY (dpautseri)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- tabla de seriales
CREATE TABLE dpsrl (
  dpsrlcode INT NOT NULL AUTO_INCREMENT,
  dpsrltbla VARCHAR(20) NOT NULL,
  dpsrlseri INT DEFAULT NULL,
  PRIMARY KEY (dpsrlcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- tabla de usuarios aduser
CREATE TABLE aduser (
  adusrusrn VARCHAR(36) NOT NULL,
  adusrnick VARCHAR(50) NOT NULL,
  adusrclav VARCHAR(80) NOT NULL,
  adusrtipo SMALLINT NOT NULL,
  adusrfreg DATETIME NOT NULL,
  adusrusra VARCHAR(36) NOT NULL,
  adusrfupt DATETIME DEFAULT NULL,
  adusrusru VARCHAR(36) DEFAULT NULL,
  adusrmrcb SMALLINT NOT NULL DEFAULT 0,
  adusrstat SMALLINT NOT NULL DEFAULT 1,
  PRIMARY KEY (adusrusrn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

