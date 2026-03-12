const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { v4: uuidv4 } = require("uuid");

// Configuración de clientes de AWS SDK V3
const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);
const sqsClient = new SQSClient({});

exports.handler = async (event) => {
    try {
        const data = JSON.parse(event.body);
        const userId = uuidv4();

        // 1. Guardar el usuario en DynamoDB
        const userParams = {
            TableName: "user-table",
            Item: {
                uuid: userId,
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                document: data.document,
                password: Buffer.from(data.password).toString('base64'), // Encriptación básica
                createdAt: new Date().toISOString()
            }
        };
        await docClient.send(new PutCommand(userParams));

        // 2. Enviar mensaje a SQS para crear la Tarjeta de Débito automáticamente
        const sqsParams = {
            QueueUrl: process.env.CARD_QUEUE_URL, // Esta URL la pasaremos por Terraform después
            MessageBody: JSON.stringify({
                userId: userId,
                request: "DEBIT"
            })
        };
        await sqsClient.send(new SendMessageCommand(sqsParams));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Usuario registrado y solicitud de tarjeta enviada",
                userId
            })
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error interno del servidor" })
        };
    }
};