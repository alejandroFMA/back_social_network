# Social Network API

### Descripción

Este proyecto es la API de backend para una red social básica. Permite a los usuarios registrarse, iniciar sesión, seguir a otros usuarios, publicar, comentar, y más. Esta API está construida con Node.js y utiliza MongoDB como base de datos.

### Características

- Autenticación y autorización de usuarios
- Operaciones CRUD para usuarios, publicaciones y seguimientos
- Sistema de seguimiento entre usuarios
- Búsqueda de publicaciones
- Conteo de seguidores, seguidos, y publicaciones

### Tecnologías Utilizadas

- <b>Node.js</b>
- <b>Express</b>
- <b>MongoDB</b> + <b>Mongoose</b>
- <b>JWT</b> para autenticación
- <b>Bcrypt</b> para hashing de contraseñas
- <b>Validator</b>
- <b>Multer</b> para gestionar la subida de archivos

### Instalación

Clona este repositorio y navega a la carpeta del proyecto:

``git clone https://github.com/alejandroFMA/back_social_network.git``


Instala las dependencias:

``npm install``

Configura las variables de entorno creando un archivo .env en la raíz del proyecto. Deberás incluir:


``DB_URI=mongodb+srv://tuMongoDBUri``
``SECRET_KEY=tuClaveSecretaParaJWT``

Inicia el servidor:

``npm start``

Puedes utilizar herramientas como Postman para interactuar con la API. A continuación, algunos ejemplos de solicitudes:

Registrarse

<code>POST /api/user/register
{
  "name": "Jane Doe",
  "email": "janedoe@example.com",
  "password": "password123",
  "nick": "janedoe"
}</code>

Iniciar Sesión

<code>POST /api/user/login

{
  "email": "janedoe@example.com",
  "password": "password123"
}</code>

Publicar

<code>POST /api/publication/create
Authorization: Bearer tokenJWT
{
  "publication": "¡Hola, mundo!"
}</code>