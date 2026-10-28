-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: tienda_online
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `libro`
--

LOCK TABLES `libro` WRITE;
/*!40000 ALTER TABLE `libro` DISABLE KEYS */;
INSERT INTO `libro` (`id_libro`, `titulo`, `autor`, `precio`, `stock`, `stock_minimo`, `stock_maximo`, `descripcion`, `isbn`, `editorial`, `categoria`, `genero`, `formato`, `imagen_portada`, `descuento_porcentaje`, `pdf_ruta`) VALUES ('LIB-001','Don Quijote de la Mancha','Miguel de Cervantes',389.00,25,3,50,'Clasico de la literatura espanola.',NULL,'Editorial de prueba','Ficcion','Novela','Fisico',NULL,10.00,NULL),('LIB-002','Cien anos de soledad','Gabriel Garcia Marquez',299.00,8,3,50,'Novela del realismo magico.',NULL,'Editorial de prueba','Ficcion','Novela','Fisico',NULL,0.00,NULL),('LIB-003','El principito','Antoine de Saint-Exupery',149.00,2,3,50,'Cuento clasico para todas las edades.',NULL,'Editorial de prueba','Infantil','Fabula','Fisico',NULL,0.00,NULL),('LIB-004','Pedro Paramo','Juan Rulfo',179.00,14,3,50,'Novela mexicana fundamental.',NULL,'Editorial de prueba','Ficcion','Novela','Fisico',NULL,0.00,NULL),('LIB-005','Introduccion a los algoritmos','Varios autores',899.00,5,3,30,'Libro de texto tecnico.',NULL,'Editorial de prueba','Tecnico','Texto universitario','Fisico',NULL,0.00,NULL),('LIB001','Alicia en el País de las Maravillas','Lewis Carroll',350.00,25,5,100,'Clásico de fantasía','978-84-376-049-2','Minotauro','Ficción','Fantasía','Tapa blanda',NULL,20.00,NULL),('LIB002','A través del espejo y lo que Alicia encontró allí','Lewis Carroll',320.00,15,5,100,'Continuación de Alicia','978-84-206-331-5','Alianza','Ficción','Fantasía','Tapa blanda',NULL,0.00,NULL),('LIB003','A través del espejo y lo que Alicia encontró allí','Lewis Carroll',320.00,12,5,100,'Edición de lujo','978-84-206-331-5','Alianza','Ficción','Fantasía','Tapa dura',NULL,0.00,NULL),('LIB004','A través del espejo y lo que Alicia encontró allí','Lewis Carroll',320.00,30,5,100,'Versión digital','978-84-206-331-5','Alianza','Ficción','Fantasía','Electrónico',NULL,0.00,NULL),('LIB005','El Banquete del Sombrerero','Guillermo Arriaga',400.00,18,5,100,'Novela','978-607-11-234-8','Planeta','Ficción','Novela','Tapa blanda',NULL,15.00,NULL);
/*!40000 ALTER TABLE `libro` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-27 23:05:05
