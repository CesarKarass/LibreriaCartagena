-- Catálogo real de la librería (20 libros con portada).
-- Las imágenes viven en Frontend/public/images/libros/ y se sirven como /images/libros/<archivo>.
-- Ejecutar con:
--   docker exec -i mysql-cartagena mysql -uroot -proot123 tienda_online < backups/catalogo_libros.sql

START TRANSACTION;

-- El catálogo anterior era de prueba (Editorial de prueba / Alicia duplicado).
-- Respaldo previo: backups/libro_catalogo_anterior.sql
DELETE FROM libro;

INSERT INTO libro
  (id_libro, titulo, autor, precio, stock, stock_minimo, stock_maximo, descripcion,
   isbn, editorial, categoria, genero, formato, imagen_portada, descuento_porcentaje)
VALUES
  ('LIB-001', 'Casería', 'Salvador León Beltrán', 250.00, 6, 2, 20,
   'Novela de terror ambientada en el campo mexicano: una casa, un pasado que no termina de irse y una amenaza que acecha entre la niebla.',
   NULL, 'Independiente', 'Ficción', 'Terror', 'Tapa blanda', '/images/libros/caseria.jpg', 0.00),

  ('LIB-002', 'Chico Bestia', 'Kami Garcia y Gabriel Picolo', 329.00, 8, 2, 20,
   'Novela gráfica de DC sobre Garfield Logan, un adolescente que descubre que puede transformarse en animales.',
   NULL, 'DC Comics', 'Juvenil', 'Novela gráfica', 'Tapa blanda', '/images/libros/chico-bestia.jpg', 10.00),

  ('LIB-003', 'Chistes infantiles de Pepito', 'Varios autores', 99.00, 20, 3, 30,
   'Colección de chistes y ocurrencias de Pepito para leer en familia y compartir con amigos.',
   NULL, 'Selector', 'Infantil', 'Humor', 'Tapa blanda', '/images/libros/chistes-de-pepito.jpg', 0.00),

  ('LIB-004', 'Ciencias Naturales', 'Varios autores', 180.00, 15, 3, 30,
   'Libro de texto de ciencias naturales para educación básica, con actividades y ejercicios.',
   NULL, 'SEP', 'Educativo', 'Texto escolar', 'Tapa blanda', '/images/libros/ciencias-naturales.jpg', 0.00),

  ('LIB-005', 'Ciudad de Cristal', 'Cassandra Clare', 449.00, 7, 2, 20,
   'Tercera entrega de Cazadores de Sombras: Clary viaja a la Ciudad de Cristal para salvar a su madre.',
   NULL, 'Destino', 'Juvenil', 'Fantasía', 'Tapa blanda', '/images/libros/ciudad-de-cristal.jpg', 0.00),

  ('LIB-006', 'Comala y otros relatos', 'Carlos René Padilla', 180.00, 10, 2, 20,
   'Relatos ilustrados por Bernardo Fernández «Bef» que retratan el paisaje y la memoria del pueblo mexicano.',
   NULL, 'Fondo de Cultura Económica', 'Ficción', 'Cuento', 'Tapa blanda', '/images/libros/comala-y-otros-relatos.jpg', 0.00),

  ('LIB-007', 'Curso básico de guitarra', 'Rolando Galindo L.', 249.00, 5, 2, 20,
   'Método práctico para aprender guitarra desde cero con acordes, ritmos y canciones conocidas.',
   NULL, 'Independiente', 'Educativo', 'Música', 'Tapa blanda', '/images/libros/curso-de-guitarra.jpg', 0.00),

  ('LIB-008', 'Diálogos', 'Platón', 450.00, 6, 2, 20,
   'Edición íntegra de los diálogos de Platón, pieza central de la filosofía occidental.',
   NULL, 'Porrúa', 'Educativo', 'Filosofía', 'Tapa dura', '/images/libros/dialogos-platon.jpg', 0.00),

  ('LIB-009', 'El chico que quería convertirse en ser humano', 'Jörn Riel', 220.00, 9, 2, 20,
   'Novela juvenil sobre un joven inuit que emprende un viaje para descubrir qué significa ser humano.',
   NULL, 'Espejo de Urania', 'Juvenil', 'Novela', 'Tapa blanda', '/images/libros/el-chico-que-queria-convertirse-en-ser-humano.jpg', 0.00),

  ('LIB-010', 'El curioso caso de Benjamin Button', 'F. Scott Fitzgerald', 149.00, 12, 3, 30,
   'El clásico relato de un hombre que nace anciano y rejuvenece con el paso del tiempo.',
   NULL, 'Alianza', 'Ficción', 'Clásico', 'Tapa blanda', '/images/libros/el-curioso-caso-de-benjamin-button.jpg', 0.00),

  ('LIB-011', 'El Municipio en América', 'Miguel Molina Martínez', 320.00, 4, 1, 15,
   'Aproximación histórica al desarrollo del municipio en América Latina.',
   NULL, 'Instituto Nacional para el Federalismo', 'Académico', 'Historia', 'Tapa blanda', '/images/libros/el-municipio-en-america.jpg', 0.00),

  ('LIB-012', 'La casa en el mar más azul', 'TJ Klune', 449.00, 8, 2, 20,
   'Fantasía contemporánea sobre Linus Baker, un funcionario que descubre una casa llena de niños extraordinarios.',
   NULL, 'VR Ya', 'Juvenil', 'Fantasía', 'Tapa blanda', '/images/libros/la-casa-en-el-mar-mas-azul.jpg', 15.00),

  ('LIB-013', 'La fragata', 'Aramis Franco', 260.00, 6, 2, 20,
   'Novela de aventuras y misterio a bordo de una fragata que guarda secretos del pasado.',
   NULL, 'Serie en Libris', 'Ficción', 'Aventura', 'Tapa blanda', '/images/libros/la-fragata.jpg', 0.00),

  ('LIB-014', 'Las esquinas de la luz', 'Rosa Palau', 240.00, 7, 2, 20,
   'Novela íntima sobre la memoria, la familia y los pequeños instantes que iluminan una vida.',
   NULL, 'Independiente', 'Ficción', 'Novela', 'Tapa blanda', '/images/libros/las-esquinas-de-la-luz.jpg', 0.00),

  ('LIB-015', 'Las neblinas de Almagro', 'Eduardo Monteverde', 230.00, 5, 2, 20,
   'Relato de atmósfera y paisaje donde la niebla cubre un pueblo y sus historias.',
   NULL, 'Fondo Editorial', 'Ficción', 'Novela', 'Tapa blanda', '/images/libros/las-neblinas-de-almagro.jpg', 0.00),

  ('LIB-016', 'Escalofriantes leyendas de Guanajuato', 'Varios autores', 190.00, 10, 3, 30,
   'Antología de leyendas y relatos de terror tradicionales del estado de Guanajuato.',
   NULL, 'Editorial Guanajuato', 'Infantil', 'Leyendas', 'Tapa blanda', '/images/libros/leyendas-de-guanajuato.jpg', 0.00),

  ('LIB-017', 'Los caballeros se quedan a descansar', 'Mariana Orantes', 210.00, 6, 2, 20,
   'Libro de cuentos sobre personajes que llegan al final de sus batallas y encuentran un lugar para descansar.',
   NULL, 'Universidad Autónoma de Nuevo León', 'Ficción', 'Cuento', 'Tapa blanda', '/images/libros/los-caballeros-se-quedan-a-descansar.jpg', 0.00),

  ('LIB-018', 'MisteriBook', 'Anónimo', 180.00, 5, 2, 20,
   'Libro de misterio de tapa negra: un enigma por resolver página a página.',
   NULL, 'Independiente', 'Juvenil', 'Misterio', 'Tapa dura', '/images/libros/misteribook.jpg', 0.00),

  ('LIB-019', 'Steelheart', 'Brandon Sanderson', 379.00, 9, 2, 20,
   'Primera entrega de Los Reckoners: un mundo donde los héroes se volvieron villanos.',
   NULL, 'Ediciones B', 'Juvenil', 'Ciencia ficción', 'Tapa blanda', '/images/libros/steelheart.jpg', 10.00),

  ('LIB-020', 'Una novela de malas costumbres', 'Juan de Dios Guerrero', 270.00, 6, 2, 20,
   'Novela satírica sobre la vida en provincia, sus costumbres y sus personajes inolvidables.',
   NULL, 'Independiente', 'Ficción', 'Novela', 'Tapa blanda', '/images/libros/una-novela-de-malas-costumbres.jpg', 0.00);

COMMIT;
