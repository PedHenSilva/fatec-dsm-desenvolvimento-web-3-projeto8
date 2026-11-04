# 📦 Sistema de Controle de Estoque (CRUD + API)

Este é um sistema completo para gerenciamento de estoque de uma pequena empresa comercial. Ele fornece uma interface para controle de produtos, quantidades disponíveis, preços e fornecedores, utilizando um relacionamento dinâmico entre cadastros.

O projeto foi construído em **Node.js puro** (sem frameworks como Express) no back-end, utilizando persistência de dados local em formato JSON e arquitetura assíncrona baseada em `fetch()` com HTML5, CSS3 e JavaScript Vanilla no front-end.

---

## 🛠️ Tecnologias e Funcionalidades

- **Back-end:** Node.js (Módulos nativos `http`, `fs`, `path`)
- **Banco de Dados:** Arquivo de persistência local (`data.json`)
- **Front-end:** Interface de aba única (SPA) com Grid/Flexbox e JavaScript utilitário
- **Integração Externa:** Consulta automatizada de CNPJ via **BrasilAPI**
- **Métricas em Tempo Real:** 
  - Cálculo automático do Valor Total do Estoque: \(\sum (\text{Preço Unitário} \times \text{Quantidade})\).
  - Alerta visual e contagem de produtos com estoque baixo (menos de 5 unidades).

---

## 🚀 Instalação e Execução

### Pré-requisitos
Antes de começar, certifique-se de ter o [Node.js](https://nodejs.org) instalado em sua máquina.

### Passo a Passo

1. **Clone o repositório** na sua máquina local:
   ```bash
   git clone https://github.com
   ```
2. Abra o terminal na pasta raiz do projeto.
3. Como o projeto utiliza apenas módulos nativos do Node.js, **não é necessário executar `npm install`**.
4. Inicie o servidor executando o seguinte comando:
   ```bash
   npm start
   ```
5. O terminal exibirá a mensagem de sucesso:
   ```text
   Servidor de Controle de Estoque rodando em http://localhost:3000
   ```
6. Abra o seu navegador e acesse: **`http://localhost:3000`**

---

## 🌐 Documentação da API REST

Todas as requisições utilizam dados estruturados em formato **JSON** com codificação `UTF-8`.

### 1. Endpoints de Fornecedores

| Método | Endpoint | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/fornecedores` | Lista todos os fornecedores cadastrados. | `200 OK` |
| **GET** | `/api/fornecedores/:id` | Consulta os detalhes de um fornecedor específico por ID. | `200 OK` |
| **POST** | `/api/fornecedores` | Cadastra um novo fornecedor. | `201 Created` |
| **PUT** | `/api/fornecedores/:id` | Atualiza as informações de um fornecedor existente. | `200 OK` |
| **DELETE**| `/api/fornecedores/:id` | Remove um fornecedor do sistema. | `200 OK` |

### 2. Endpoints de Produtos

| Método | Endpoint | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/produtos` | Lista todos os produtos em estoque. | `200 OK` |
| **GET** | `/api/produtos/:id` | Consulta os detalhes de um produto específico por ID. | `200 OK` |
| **POST** | `/api/produtos` | Cadastra um novo produto (vinculado a um Fornecedor). | `201 Created` |
| **PUT** | `/api/produtos/:id` | Atualiza as informações de um produto em estoque. | `200 OK` |
| **DELETE**| `/api/produtos/:id` | Remove um produto do sistema. | `200 OK` |

---

## 🛡️ Regras de Negócio e Tratamento de Erros

A API possui validações rígidas no back-end para garantir a integridade dos dados:
- **Campos Obrigatórios:** Bloqueia a inserção de fornecedores sem `razaoSocial`/`cnpj` ou produtos sem `nome`/`codigo`/`precoUnitario`/`quantidade`. Retorna `400 Bad Request`.
- **Valores Negativos:** O sistema impede a entrada de preços unitários ou quantidades negativas no estoque.
- **Evita Duplicidade:** Impede o cadastro de CNPJs duplicados para fornecedores e códigos identificadores duplicados para produtos.
- **Integridade de Relacionamento:** É estritamente **proibido excluir um fornecedor que possua produtos vinculados** a ele no estoque.
- **Fallback da API Externa:** Caso a BrasilAPI retorne erro, esteja offline ou não encontre o CNPJ, o sistema emite um alerta informativo na tela e permite o preenchimento manual de todos os campos.
- **Tratamento de Rotas e Recursos:** Requisições para IDs ou arquivos inexistentes retornam o status `404 Not Found`.

---

## 📁 Estrutura de Pastas do Projeto

```text
├── package.json         # Configuração do projeto e script de inicialização do NPM
├── data.json            # Arquivo JSON responsável pela persistência do banco de dados
├── server.js            # Servidor HTTP nativo, roteador CORS e lógica da API REST
└── public/              # Diretório dos arquivos estáticos acessíveis pelo cliente
    ├── index.html       # Interface SPA (Controle de Estoque e Formulários)
    ├── app.js           # Lógica do Front-end, consumo da BrasilAPI e fetch()
    └── style.css        # Estilização visual (Destaque para Estoque Baixo)
```

- [Nome do Aluno 1] - [RA/FATEC]
- [Nome do Aluno 2] - [RA/FATEC]
