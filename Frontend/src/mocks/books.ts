import type { Book } from '../types/book';

/**
 * Catálogo de prueba basado en el catálogo real (backups/catalogo_libros.sql).
 * Las portadas viven en Frontend/public/images/libros y se sirven como
 * /images/libros/<archivo>. Solo se usa cuando VITE_USE_MOCKS=true.
 */
const libros: Array<Omit<Book, 'id' | 'portadaUrl'>> = [
  {
    titulo: 'Casería', autor: 'Salvador León Beltrán',
    isbn: 'Sin ISBN', editorial: 'Independiente', precio: 250,
    stock: 6, categoria: 'Ficción', genero: 'Terror', formato: 'Tapa blanda',
  },
  {
    titulo: 'Chico Bestia', autor: 'Kami Garcia y Gabriel Picolo',
    isbn: 'Sin ISBN', editorial: 'DC Comics', precio: 329, precioOferta: 296.1,
    stock: 8, categoria: 'Juvenil', genero: 'Novela gráfica', formato: 'Tapa blanda',
  },
  {
    titulo: 'Chistes infantiles de Pepito', autor: 'Varios autores',
    isbn: 'Sin ISBN', editorial: 'Selector', precio: 99,
    stock: 20, categoria: 'Infantil', genero: 'Humor', formato: 'Tapa blanda',
  },
  {
    titulo: 'Ciencias Naturales', autor: 'Varios autores',
    isbn: 'Sin ISBN', editorial: 'SEP', precio: 180,
    stock: 15, categoria: 'Educativo', genero: 'Texto escolar', formato: 'Tapa blanda',
  },
  {
    titulo: 'Ciudad de Cristal', autor: 'Cassandra Clare',
    isbn: 'Sin ISBN', editorial: 'Destino', precio: 449,
    stock: 7, categoria: 'Juvenil', genero: 'Fantasía', formato: 'Tapa blanda',
  },
  {
    titulo: 'Comala y otros relatos', autor: 'Carlos René Padilla',
    isbn: 'Sin ISBN', editorial: 'Fondo de Cultura Económica', precio: 180,
    stock: 10, categoria: 'Ficción', genero: 'Cuento', formato: 'Tapa blanda',
  },
  {
    titulo: 'Curso básico de guitarra', autor: 'Rolando Galindo L.',
    isbn: 'Sin ISBN', editorial: 'Independiente', precio: 249,
    stock: 5, categoria: 'Educativo', genero: 'Música', formato: 'Tapa blanda',
  },
  {
    titulo: 'Diálogos', autor: 'Platón',
    isbn: 'Sin ISBN', editorial: 'Porrúa', precio: 450,
    stock: 6, categoria: 'Educativo', genero: 'Filosofía', formato: 'Tapa dura',
  },
  {
    titulo: 'El chico que quería convertirse en ser humano', autor: 'Jörn Riel',
    isbn: 'Sin ISBN', editorial: 'Espejo de Urania', precio: 220,
    stock: 9, categoria: 'Juvenil', genero: 'Novela', formato: 'Tapa blanda',
  },
  {
    titulo: 'El curioso caso de Benjamin Button', autor: 'F. Scott Fitzgerald',
    isbn: 'Sin ISBN', editorial: 'Alianza', precio: 149,
    stock: 12, categoria: 'Ficción', genero: 'Clásico', formato: 'Tapa blanda',
  },
  {
    titulo: 'El Municipio en América', autor: 'Miguel Molina Martínez',
    isbn: 'Sin ISBN', editorial: 'Instituto Nacional para el Federalismo', precio: 320,
    stock: 4, categoria: 'Académico', genero: 'Historia', formato: 'Tapa blanda',
  },
  {
    titulo: 'La casa en el mar más azul', autor: 'TJ Klune',
    isbn: 'Sin ISBN', editorial: 'VR Ya', precio: 449, precioOferta: 381.65,
    stock: 8, categoria: 'Juvenil', genero: 'Fantasía', formato: 'Tapa blanda',
  },
  {
    titulo: 'La fragata', autor: 'Aramis Franco',
    isbn: 'Sin ISBN', editorial: 'Serie en Libris', precio: 260,
    stock: 6, categoria: 'Ficción', genero: 'Aventura', formato: 'Tapa blanda',
  },
  {
    titulo: 'Las esquinas de la luz', autor: 'Rosa Palau',
    isbn: 'Sin ISBN', editorial: 'Independiente', precio: 240,
    stock: 7, categoria: 'Ficción', genero: 'Novela', formato: 'Tapa blanda',
  },
  {
    titulo: 'Las neblinas de Almagro', autor: 'Eduardo Monteverde',
    isbn: 'Sin ISBN', editorial: 'Fondo Editorial', precio: 230,
    stock: 5, categoria: 'Ficción', genero: 'Novela', formato: 'Tapa blanda',
  },
  {
    titulo: 'Escalofriantes leyendas de Guanajuato', autor: 'Varios autores',
    isbn: 'Sin ISBN', editorial: 'Editorial Guanajuato', precio: 190,
    stock: 10, categoria: 'Infantil', genero: 'Leyendas', formato: 'Tapa blanda',
  },
  {
    titulo: 'Los caballeros se quedan a descansar', autor: 'Mariana Orantes',
    isbn: 'Sin ISBN', editorial: 'Universidad Autónoma de Nuevo León', precio: 210,
    stock: 6, categoria: 'Ficción', genero: 'Cuento', formato: 'Tapa blanda',
  },
  {
    titulo: 'MisteriBook', autor: 'Anónimo',
    isbn: 'Sin ISBN', editorial: 'Independiente', precio: 180,
    stock: 5, categoria: 'Juvenil', genero: 'Misterio', formato: 'Tapa dura',
  },
  {
    titulo: 'Steelheart', autor: 'Brandon Sanderson',
    isbn: 'Sin ISBN', editorial: 'Ediciones B', precio: 379, precioOferta: 341.1,
    stock: 9, categoria: 'Juvenil', genero: 'Ciencia ficción', formato: 'Tapa blanda',
  },
  {
    titulo: 'Una novela de malas costumbres', autor: 'Juan de Dios Guerrero',
    isbn: 'Sin ISBN', editorial: 'Independiente', precio: 270,
    stock: 6, categoria: 'Ficción', genero: 'Novela', formato: 'Tapa blanda',
  },
];

const portadas = [
  'caseria.jpg',
  'chico-bestia.jpg',
  'chistes-de-pepito.jpg',
  'ciencias-naturales.jpg',
  'ciudad-de-cristal.jpg',
  'comala-y-otros-relatos.jpg',
  'curso-de-guitarra.jpg',
  'dialogos-platon.jpg',
  'el-chico-que-queria-convertirse-en-ser-humano.jpg',
  'el-curioso-caso-de-benjamin-button.jpg',
  'el-municipio-en-america.jpg',
  'la-casa-en-el-mar-mas-azul.jpg',
  'la-fragata.jpg',
  'las-esquinas-de-la-luz.jpg',
  'las-neblinas-de-almagro.jpg',
  'leyendas-de-guanajuato.jpg',
  'los-caballeros-se-quedan-a-descansar.jpg',
  'misteribook.jpg',
  'steelheart.jpg',
  'una-novela-de-malas-costumbres.jpg',
];

export const mockBooks: Book[] = libros.map((libro, indice) => ({
  ...libro,
  id: `LIB-${String(indice + 1).padStart(3, '0')}`,
  portadaUrl: `/images/libros/${portadas[indice]}`,
}));
