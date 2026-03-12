const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const s3Client = new S3Client({});
const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);

exports.handler = async (event) => {
    try {
        const { user_id } = event.pathParameters;
        const { image, fileType } = JSON.parse(event.body); // image es el string base64

        // 1. Limpiar el string base64 y convertir a Buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // 2. Generar nombre único para evitar duplicados
        const fileName = `${uuidv4()}.${fileType.split('/')[1]}`;
        const bucketName = process.env.AVATAR_BUCKET;

        // 3. Subir a S3
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: `avatars/${fileName}`,
            Body: buffer,
            ContentType: fileType
        }));

        const imageUrl = `https://${bucketName}.s3.amazonaws.com/avatars/${fileName}`;

        // 4. Actualizar DynamoDB con la nueva URL de la imagen
        await docClient.send(new UpdateCommand({
            TableName: "user-table",
            Key: { uuid: user_id }, // Ajusta si tu Sort Key es necesaria aquí
            UpdateExpression: "set #img = :url",
            ExpressionAttributeNames: { "#img": "image" },
            ExpressionAttributeValues: { ":url": imageUrl }
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Avatar actualizado", url: imageUrl })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};