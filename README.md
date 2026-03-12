# Pig Bank – Sistema Bancario Distribuido

parte de user service

---

# Arquitectura del sistema

La aplicación utiliza diferentes servicios de AWS para implementar un sistema distribuido basado en microservicios.

Servicios utilizados:

* AWS Lambda – ejecución de microservicios
* Amazon API Gateway – exposición de endpoints REST
* Amazon DynamoDB – almacenamiento de datos
* Amazon SQS – comunicación asincrónica entre servicios
* Amazon S3 – almacenamiento de imágenes y reportes
* AWS Secrets Manager – almacenamiento seguro de credenciales
* Terraform – infraestructura como código

---

# Flujo general del sistema

El flujo de funcionamiento es el siguiente:

Cliente → API Gateway → Lambda → DynamoDB
↓
SQS → Worker Lambda → Notification Service

1. El cliente realiza peticiones a la API.
2. API Gateway redirige las peticiones a funciones Lambda.
3. Las Lambdas procesan la lógica del negocio.
4. Los datos se almacenan en DynamoDB o S3.
5. Algunos eventos generan mensajes en SQS.
6. Otros servicios consumen esos mensajes para ejecutar procesos adicionales.

---

# Microservicios

## 1. User Service

Este servicio se encarga de la gestión de usuarios.

### Funcionalidades

* Registro de usuarios
* Inicio de sesión
* Actualización de perfil
* Subida de imagen de perfil
* Consulta de información del usuario

### Endpoints

POST /register
POST /login
PUT /profile/{user_id}
POST /profile/{user_id}/avatar
GET /profile/{user_id}

### Almacenamiento

* Tabla **user-table** en DynamoDB
* Bucket S3 para imágenes de perfil

---

## 2. Card / Transaction Service

Este servicio gestiona las tarjetas bancarias y las transacciones.

### Funcionalidades

* Creación de tarjetas débito y crédito
* Activación de tarjetas
* Registro de compras
* Gestión de balance
* Generación de reportes de transacciones

### Endpoints

POST /card/activate
POST /transactions/purchase
POST /transactions/save/{card_id}
POST /card/paid/{card_id}
GET /card/{card_id}

### Almacenamiento

* Tabla **card-table** en DynamoDB
* Tabla **transaction-table** en DynamoDB
* Bucket S3 para reportes de transacciones

### Procesamiento de eventos

Las solicitudes de creación de tarjetas se procesan de manera asincrónica utilizando **SQS** y workers en Lambda.

---

## 3. Notification Service

Este servicio se encarga de enviar notificaciones por correo electrónico a los usuarios.

### Eventos soportados

WELCOME
USER.LOGIN
USER.UPDATE
CARD.CREATE
CARD.ACTIVATE
TRANSACTION.PURCHASE
TRANSACTION.SAVE
TRANSACTION.PAID
REPORT.ACTIVITY

### Componentes

* Cola SQS para notificaciones
* Lambda para enviar correos
* Bucket S3 para plantillas de correo
* DynamoDB para almacenar historial de notificaciones

---

# Tecnologías utilizadas

Lenguaje de programación

JavaScript (Node.js)

Librerías

AWS SDK v3

Infraestructura

Terraform

Servicios cloud

AWS Lambda
Amazon DynamoDB
Amazon SQS
Amazon S3
AWS Secrets Manager
API Gateway

---

# Estructura del proyecto

```
services
 ├ user-service
 │   ├ register.js
 │   ├ login.js
 │   ├ update-user.js
 │   ├ upload-avatar.js
 │   └ get-profile.js
 │
 ├ card-service
 │   ├ create-request-card.js
 │   ├ card-approval-worker.js
 │   ├ card-activate.js
 │   ├ purchase.js
 │   ├ card-transaction-save.js
 │   ├ card-paid-credit-card.js
 │   └ get-report.js
 │
 └ notification-service
     ├ send-notification.js
     └ send-notification-error.js
```

---

# Despliegue del proyecto

1. Configurar credenciales de AWS

```
aws configure
```

2. Inicializar Terraform

```
terraform init
```

3. Crear infraestructura

```
terraform apply
```


Integrantes del grupo:

* Anderson Castilla Audivet
* Angely Ortega Ospino
* Jesus Ramos Blanco
* Leiwis Antonio Ospino Ortiz
* Luis garavito

SOBRE EL VIDEO Y FALTAS DEL TRABAJO:
Nuestro grupo entrego asi debido a que la persona que tiene la cuenta de AWS perdio la contraseña y no pudimos hacer las pruebas del video, tenia todo en la computadora y no puedo recuperarla ahora porque el portatil lo tengo en mantenimiento desde el sabado, apenas lo tenga podre hacer los cambios y el video.


Proyecto desarrollado únicamente con fines educativos.
