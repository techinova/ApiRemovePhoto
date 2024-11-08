const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { removeBackgroundFromImageFile } = require('rembg');
const app = express();

// Configuração de upload de arquivos
const upload = multer({ dest: 'uploads/' });

const PORT = process.env.PORT || 3000;

// Endpoint para upload e manipulação de imagem
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const outputDir = 'output/';
        
        // Criação do diretório de saída, se não existir
        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir);
        }

        // Processamento da imagem para remoção de fundo
        const outputImagePath = path.join(outputDir, 'no-background.png');

        // Remover fundo da imagem
        await removeBackgroundFromImageFile(imagePath, outputImagePath);

        // Manipulação adicional com sharp (exemplo de redimensionamento)
        const resizedImagePath = path.join(outputDir, 'resized-image.png');
        await sharp(outputImagePath)
            .resize(800) // Redimensionando a imagem
            .toFile(resizedImagePath);

        // Respondendo com o caminho da imagem processada
        res.json({ message: 'Imagem processada com sucesso!', image: resizedImagePath });
    } catch (error) {
        console.error('Erro ao processar a imagem:', error);
        res.status(500).json({ message: 'Erro ao processar a imagem' });
    }
});

// Endpoint de status
app.get('/', (req, res) => {
    res.send('API de manipulação de imagens rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
