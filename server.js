const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data.json');

function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ fornecedores: [], produtos: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
    // Configuração de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const urlParts = req.url.split('?');
    const pathname = urlParts[0];

    // ==========================================
    // ROTAS DE FORNECEDORES (/api/fornecedores)
    // ==========================================
    if (pathname.startsWith('/api/fornecedores')) {
        const parts = pathname.split('/').filter(Boolean);
        const id = parts[2];

        if (req.method === 'GET' && !id) {
            const db = readDB();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(db.fornecedores));
            return;
        }

        if (req.method === 'GET' && id) {
            const db = readDB();
            const fornecedor = db.fornecedores.find(f => f.id === id);
            if (!fornecedor) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Fornecedor não encontrado' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(fornecedor));
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const novo = JSON.parse(body);
                    if (!novo.razaoSocial || !novo.cnpj) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Razão social e CNPJ são obrigatórios' }));
                        return;
                    }

                    const db = readDB();
                    // Validação de CNPJ duplicado
                    if (db.fornecedores.some(f => f.cnpj === novo.cnpj)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Já existe um fornecedor cadastrado com este CNPJ' }));
                        return;
                    }

                    novo.id = Date.now().toString();
                    db.fornecedores.push(novo);
                    writeDB(db);

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(novo));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }

        if (req.method === 'PUT' && id) {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const dados = JSON.parse(body);
                    const db = readDB();
                    const index = db.fornecedores.findIndex(f => f.id === id);

                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Fornecedor não encontrado' }));
                        return;
                    }

                    // Validar CNPJ duplicado em outro registro
                    if (dados.cnpj && db.fornecedores.some(f => f.cnpj === dados.cnpj && f.id !== id)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Este CNPJ já está sendo utilizado por outro fornecedor' }));
                        return;
                    }

                    db.fornecedores[index] = { ...db.fornecedores[index], ...dados, id };
                    writeDB(db);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(db.fornecedores[index]));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }

        if (req.method === 'DELETE' && id) {
            const db = readDB();
            const index = db.fornecedores.findIndex(f => f.id === id);

            if (index === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Fornecedor não encontrado' }));
                return;
            }

            // Impedir exclusão se houver produtos vinculados
            const temProdutos = db.produtos.some(p => p.fornecedorId === id);
            if (temProdutos) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Não é possível excluir o fornecedor pois existem produtos vinculados a ele.' }));
                return;
            }

            const removido = db.fornecedores.splice(index, 1)[0];
            writeDB(db);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(removido));
            return;
        }
    }

    // ==========================================
    // ROTAS DE PRODUTOS (/api/produtos)
    // ==========================================
    if (pathname.startsWith('/api/produtos')) {
        const parts = pathname.split('/').filter(Boolean);
        const id = parts[2];

        if (req.method === 'GET' && !id) {
            const db = readDB();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(db.produtos));
            return;
        }

        if (req.method === 'GET' && id) {
            const db = readDB();
            const produto = db.produtos.find(p => p.id === id);
            if (!produto) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Produto não encontrado' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(produto));
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const novo = JSON.parse(body);
                    if (!novo.nome || !novo.codigo || novo.precoUnitario === undefined || novo.quantidade === undefined) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Preencha todos os campos obrigatórios do produto' }));
                        return;
                    }

                    // Validação de preços e quantidades negativos
                    if (Number(novo.precoUnitario) < 0 || Number(novo.quantidade) < 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Preço unitário e quantidade não podem ser negativos' }));
                        return;
                    }

                    const db = readDB();

                    // Validação de código duplicado
                    if (db.produtos.some(p => p.codigo === novo.codigo)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Já existe um produto cadastrado com este código' }));
                        return;
                    }

                    // Validação de fornecedor existente
                    if (novo.fornecedorId) {
                        const fornecedorExiste = db.fornecedores.some(f => f.id === novo.fornecedorId);
                        if (!fornecedorExiste) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'O fornecedor selecionado não existe' }));
                            return;
                        }
                    }

                    novo.id = Date.now().toString();
                    novo.precoUnitario = Number(novo.precoUnitario);
                    novo.quantidade = Number(novo.quantidade);
                    db.produtos.push(novo);
                    writeDB(db);

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(novo));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }

        if (req.method === 'PUT' && id) {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const dados = JSON.parse(body);
                    const db = readDB();
                    const index = db.produtos.findIndex(p => p.id === id);

                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Produto não encontrado' }));
                        return;
                    }

                    if (dados.precoUnitario !== undefined && Number(dados.precoUnitario) < 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'O preço unitário não pode ser negativo' }));
                        return;
                    }

                    if (dados.quantidade !== undefined && Number(dados.quantidade) < 0) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'A quantidade em estoque não pode ser negativa' }));
                        return;
                    }

                    if (dados.codigo && db.produtos.some(p => p.codigo === dados.codigo && p.id !== id)) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Este código já está em uso por outro produto' }));
                        return;
                    }

                    if (dados.fornecedorId) {
                        const fornecedorExiste = db.fornecedores.some(f => f.id === dados.fornecedorId);
                        if (!fornecedorExiste) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'O fornecedor selecionado não existe' }));
                            return;
                        }
                    }

                    db.produtos[index] = { 
                        ...db.produtos[index], 
                        ...dados, 
                        id,
                        precoUnitario: dados.precoUnitario !== undefined ? Number(dados.precoUnitario) : db.produtos[index].precoUnitario,
                        quantidade: dados.quantidade !== undefined ? Number(dados.quantidade) : db.produtos[index].quantidade
                    };
                    writeDB(db);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(db.produtos[index]));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'JSON inválido' }));
                }
            });
            return;
        }

        if (req.method === 'DELETE' && id) {
            const db = readDB();
            const index = db.produtos.findIndex(p => p.id === id);

            if (index === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Produto não encontrado' }));
                return;
            }

            const removido = db.produtos.splice(index, 1)[0];
            writeDB(db);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(removido));
            return;
        }
    }

    // ==========================================
    // SERVIR ARQUIVOS ESTÁTICOS (FRONT-END)
    // ==========================================
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Rota ou recurso inexistente' }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro interno do servidor' }));
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor de Controle de Estoque rodando em http://localhost:${PORT}`);
});