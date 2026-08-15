const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações e Middlewares
app.use(cors()); // Permite requisições de outros domínios/arquivos locais
app.use(express.json()); // Permite que a API receba dados em JSON

// Servir arquivos estáticos (HTML, CSS, JS, Imagens)
app.use(express.static(__dirname));

// Configuração do Banco de Dados SQLite
const dbPath = path.resolve(__dirname, 'banco.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite.');
        
        // Cria a tabela de usuários se ela não existir
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                assessoria TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL,
                tipo TEXT DEFAULT 'treinador',
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});

// ==========================================
// ROTA PRINCIPAL (Servir SPA)
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de verificação do status da API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// ROTA 1: CADASTRAR NOVO USUÁRIO
// ==========================================
app.post('/api/cadastro', async (req, res) => {
    const { nome, assessoria, email, senha, tipo } = req.body;

    // Validação de campos obrigatórios
    if (!nome || !assessoria || !email || !senha) {
        return res.status(400).json({ erro: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    // Validação básica de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ erro: 'Informe um endereço de e-mail válido.' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    try {
        // Criptografar a senha com salt
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Inserir no banco de dados
        const sql = `INSERT INTO usuarios (nome, assessoria, email, senha, tipo) VALUES (?, ?, ?, ?, ?)`;
        const emailFormatado = email.trim().toLowerCase();
        const tipoUsuario = tipo || 'treinador';
        if (!['treinador', 'atleta'].includes(tipoUsuario)) {
            return res.status(400).json({ erro: 'Tipo de usuário inválido.' });
        }

        db.run(sql, [nome.trim(), assessoria.trim(), emailFormatado, senhaCriptografada, tipoUsuario], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ erro: 'Este e-mail já está cadastrado.' });
                }
                console.error('Erro ao inserir no banco:', err);
                return res.status(500).json({ erro: 'Erro ao criar usuário no banco de dados.' });
            }
            
            res.status(201).json({ 
                mensagem: 'Assessoria criada com sucesso!',
                id: this.lastID 
            });
        });
    } catch (erro) {
        console.error('Erro interno:', erro);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
});

// ==========================================
// ROTA 2: FAZER LOGIN
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const emailFormatado = email.trim().toLowerCase();
    const sql = `SELECT * FROM usuarios WHERE email = ?`;
    
    db.get(sql, [emailFormatado], async (err, usuario) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ erro: 'Erro no servidor ao buscar usuário.' });
        }

        if (!usuario) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        try {
            // Comparar a senha digitada com o hash salvo
            const senhaValida = await bcrypt.compare(senha, usuario.senha);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
            }

            // Login bem-sucedido
            res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    assessoria: usuario.assessoria,
                    email: usuario.email,
                    tipo: usuario.tipo
                }
            });
        } catch (bcryptErr) {
            console.error('Erro na verificação de senha:', bcryptErr);
            res.status(500).json({ erro: 'Erro interno na validação de credenciais.' });
        }
    });
});

// Inicia o servidor
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor FLERNK rodando em: http://localhost:${PORT}`);
});

// Encerramento gracioso
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error('Erro ao fechar banco SQLite:', err.message);
        else console.log('Banco de dados SQLite fechado.');
        server.close(() => {
            console.log('Servidor encerrado.');
            process.exit(0);
        });
    });
});
