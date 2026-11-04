const API_PRODUTOS = '/api/produtos';
const API_FORNECEDORES = '/api/fornecedores';

let produtosLista = [];
let fornecedoresLista = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarDadosIniciais();

    document.getElementById('produto-form').addEventListener('submit', salvarProduto);
    document.getElementById('fornecedor-form').addEventListener('submit', salvarFornecedor);
});

async function carregarDadosIniciais() {
    await Promise.all([carregarFornecedores(), carregarProdutos()]);
}

async function carregarFornecedores() {
    try {
        const res = await fetch(API_FORNECEDORES);
        fornecedoresLista = await res.json();
        renderizarFornecedores(fornecedoresLista);
        atualizarSelectFornecedores();
    } catch (err) {
        console.error('Erro ao carregar fornecedores:', err);
    }
}

async function carregarProdutos() {
    try {
        const res = await fetch(API_PRODUTOS);
        produtosLista = await res.json();
        renderizarProdutos(produtosLista);
        calcularMetricasEstoque(produtosLista);
    } catch (err) {
        console.error('Erro ao carregar produtos:', err);
    }
}

function mudarAba(aba) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (aba === 'produtos') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('secao-produtos').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('secao-fornecedores').classList.add('active');
    }
}

function atualizarSelectFornecedores() {
    const select = document.getElementById('prod-fornecedor');
    select.innerHTML = '<option value="">Selecione um fornecedor</option>';
    fornecedoresLista.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = f.razaoSocial;
        select.appendChild(option);
    });
}

function calcularMetricasEstoque(produtos) {
    let valorTotal = 0;
    let qtdBaixa = 0;

    produtos.forEach(p => {
        valorTotal += (Number(p.precoUnitario) || 0) * (Number(p.quantidade) || 0);
        if (Number(p.quantidade) < 5) {
            qtdBaixa++;
        }
    });

    document.getElementById('metric-valor-total').textContent = valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('metric-estoque-baixo').textContent = `${qtdBaixa} produto(s)`;
}

// --- FORNECEDORES ---
async function salvarFornecedor(e) {
    e.preventDefault();
    const id = document.getElementById('forn-id').value;
    const cnpj = document.getElementById('forn-cnpj').value;
    const razaoSocial = document.getElementById('forn-razao').value;
    const nomeFantasia = document.getElementById('forn-fantasia').value;
    const telefone = document.getElementById('forn-tel').value;
    const email = document.getElementById('forn-email').value;
    const endereco = document.getElementById('forn-endereco').value;

    const data = { cnpj, razaoSocial, nomeFantasia, telefone, email, endereco };

    try {
        const url = id ? `${API_FORNECEDORES}/${id}` : API_FORNECEDORES;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (!res.ok) {
            alert(result.error || 'Erro ao salvar fornecedor.');
            return;
        }

        limparFormFornecedor();
        carregarFornecedores();
        carregarProdutos(); // Atualiza caso nomes tenham mudado
    } catch (err) {
        alert('Erro de comunicação com o servidor.');
    }
}

function renderizarFornecedores(fornecedores) {
    const tbody = document.querySelector('#tabela-fornecedores tbody');
    tbody.innerHTML = '';

    if (fornecedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">Nenhum fornecedor cadastrado.</td></tr>';
        return;
    }

    fornecedores.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${f.cnpj}</td>
            <td><strong>${f.razaoSocial}</strong></td>
            <td>${f.nomeFantasia || '-'}</td>
            <td>${f.telefone || '-'}<br><small>${f.email || ''}</small></td>
            <td>${f.endereco || '-'}</td>
            <td>
                <button class="btn-editar" onclick="preencherEdicaoFornecedor('${f.id}')">Editar</button>
                <button class="btn-excluir" onclick="excluirFornecedor('${f.id}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function preencherEdicaoFornecedor(id) {
    const f = fornecedoresLista.find(item => item.id === id);
    if (!f) return;

    document.getElementById('forn-id').value = f.id;
    document.getElementById('forn-cnpj').value = f.cnpj;
    document.getElementById('forn-razao').value = f.razaoSocial;
    document.getElementById('forn-fantasia').value = f.nomeFantasia || '';
    document.getElementById('forn-tel').value = f.telefone || '';
    document.getElementById('forn-email').value = f.email || '';
    document.getElementById('forn-endereco').value = f.endereco || '';

    document.getElementById('forn-form-titulo').textContent = 'Editar Fornecedor';
    document.getElementById('btn-cancelar-forn').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormFornecedor() {
    document.getElementById('fornecedor-form').reset();
    document.getElementById('forn-id').value = '';
    document.getElementById('forn-form-titulo').textContent = 'Cadastrar Novo Fornecedor';
    document.getElementById('btn-cancelar-forn').style.display = 'none';
}

async function excluirFornecedor(id) {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;

    try {
        const res = await fetch(`${API_FORNECEDORES}/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) {
            alert(result.error || 'Erro ao excluir fornecedor.');
            return;
        }
        carregarFornecedores();
    } catch (err) {
        alert('Erro de comunicação com o servidor.');
    }
}

// --- INTEGRAÇÃO BRASILAPI ---
async function consultarBrasilAPI() {
    let cnpj = document.getElementById('forn-cnpj').value.replace(/\D/g, '');
    if (cnpj.length !== 14) {
        alert('Por favor, digite um CNPJ válido com 14 dígitos.');
        return;
    }

    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if (!res.ok) {
            alert('CNPJ não encontrado na BrasilAPI. Prossiga com o preenchimento manual.');
            return;
        }
        const data = await res.json();

        document.getElementById('forn-razao').value = data.razao_social || '';
        document.getElementById('forn-fantasia').value = data.nome_fantasia || '';
        document.getElementById('forn-tel').value = data.ddd_telefone_1 ? `(${data.ddd_telefone_1.slice(0,2)}) ${data.ddd_telefone_1.slice(2)}` : '';
        document.getElementById('forn-email').value = data.email || '';
        
        const enderecoCompleto = `${data.logradouro || ''}, ${data.numero || ''} - ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''} (CEP: ${data.cep || ''})`;
        document.getElementById('forn-endereco').value = enderecoCompleto;

        alert('Dados do CNPJ carregados com sucesso via BrasilAPI!');
    } catch (err) {
        console.error(err);
        alert('Erro ao consultar a BrasilAPI. Verifique sua conexão ou preencha manualmente.');
    }
}

// --- PRODUTOS ---
async function salvarProduto(e) {
    e.preventDefault();
    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('prod-nome').value;
    const codigo = document.getElementById('prod-codigo').value;
    const categoria = document.getElementById('prod-categoria').value;
    const fornecedorId = document.getElementById('prod-fornecedor').value;
    const precoUnitario = document.getElementById('prod-preco').value;
    const quantidade = document.getElementById('prod-qtd').value;
    const descricao = document.getElementById('prod-desc').value;

    const data = { nome, codigo, categoria, fornecedorId, precoUnitario, quantidade, descricao };

    try {
        const url = id ? `${API_PRODUTOS}/${id}` : API_PRODUTOS;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (!res.ok) {
            alert(result.error || 'Erro ao salvar produto.');
            return;
        }

        limparFormProduto();
        carregarProdutos();
    } catch (err) {
        alert('Erro de comunicação com o servidor.');
    }
}

function renderizarProdutos(produtos) {
    const tbody = document.querySelector('#tabela-produtos tbody');
    tbody.innerHTML = '';

    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #7f8c8d;">Nenhum produto cadastrado.</td></tr>';
        return;
    }

    produtos.forEach(p => {
        const fornecedor = fornecedoresLista.find(f => f.id === p.fornecedorId);
        const subtotal = (Number(p.precoUnitario) || 0) * (Number(p.quantidade) || 0);
        const estoqueBaixo = Number(p.quantidade) < 5;

        const tr = document.createElement('tr');
        if (estoqueBaixo) tr.classList.add('estoque-baixo');

        tr.innerHTML = `
            <td>${p.codigo}</td>
            <td><strong>${p.nome}</strong></td>
            <td>${p.categoria || '-'}</td>
            <td>${Number(p.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${p.quantidade} ${estoqueBaixo ? '<span class="badge-estoque-baixo">(Baixo!)</span>' : ''}</td>
            <td>${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${fornecedor ? fornecedor.razaoSocial : 'Desconhecido'}</td>
            <td>
                <button class="btn-editar" onclick="preencherEdicaoProduto('${p.id}')">Editar</button>
                <button class="btn-excluir" onclick="excluirProduto('${p.id}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function preencherEdicaoProduto(id) {
    const p = produtosLista.find(item => item.id === id);
    if (!p) return;

    document.getElementById('produto-id').value = p.id;
    document.getElementById('prod-nome').value = p.nome;
    document.getElementById('prod-codigo').value = p.codigo;
    document.getElementById('prod-categoria').value = p.categoria || '';
    document.getElementById('prod-fornecedor').value = p.fornecedorId || '';
    document.getElementById('prod-preco').value = p.precoUnitario;
    document.getElementById('prod-qtd').value = p.quantidade;
    document.getElementById('prod-desc').value = p.descricao || '';

    document.getElementById('produto-form-titulo').textContent = 'Editar Produto';
    document.getElementById('btn-cancelar-prod').style.display = 'block';
    mudarAba('produtos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormProduto() {
    document.getElementById('produto-form').reset();
    document.getElementById('produto-id').value = '';
    document.getElementById('produto-form-titulo').textContent = 'Cadastrar Novo Produto';
    document.getElementById('btn-cancelar-prod').style.display = 'none';
}

async function excluirProduto(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
        const res = await fetch(`${API_PRODUTOS}/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) {
            alert(result.error || 'Erro ao excluir produto.');
            return;
        }
        carregarProdutos();
    } catch (err) {
        alert('Erro de comunicação com o servidor.');
    }
}

function filtrarProdutos() {
    const termoNome = document.getElementById('filtro-pesquisa-prod').value.toLowerCase();
    const termoCat = document.getElementById('filtro-categoria-prod').value.toLowerCase();

    const filtrados = produtosLista.filter(p => {
        const matchNome = p.nome.toLowerCase().includes(termoNome);
        const matchCat = (p.categoria || '').toLowerCase().includes(termoCat);
        return matchNome && matchCat;
    });

    renderizarProdutos(filtrados);
}