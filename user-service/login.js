const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// En un proyecto real, esto debe estar en AWS Secrets Manager
const JWT_SECRET = "mi_clave_secreta_pig_bank";

exports.handler = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);

        // 1. Buscar al usuario por email (usamos Scan para el ejemplo)
        const params = {
            TableName: "user-table",
            FilterExpression: "email = :e",
            ExpressionAttributeValues: { ":e": { S: email } }
        };

        const result = await client.send(new ScanCommand(params));

        if (result.Items.length === 0) {
            return { statusCode: 401, body: JSON.stringify({ error: "Usuario no encontrado" }) };
        }

        const user = result.Items[0];
        // Desencriptamos la base64 (muy básico) para comparar
        const storedPassword = Buffer.from(user.password.S, 'base64').toString();

        // 2. Validar contraseña
        if (password !== storedPassword) {
            return { statusCode: 401, body: JSON.stringify({ error: "Contraseña incorrecta" }) };
        }

        // 3. Generar el JWT
        const token = jwt.sign(
            { userId: user.uuid.S, email: user.email.S },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Login exitoso", token })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};