#!/bin/bash

echo "🚀 Galaxy Bay - GitHub Setup Script"
echo "===================================="
echo ""

# Verificar se já é um repositório git
if [ -d .git ]; then
    echo "⚠️  Este diretório já é um repositório Git."
    read -p "Deseja continuar mesmo assim? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Solicitar username do GitHub
read -p "Digite seu username do GitHub: " github_user

if [ -z "$github_user" ]; then
    echo "❌ Username não pode estar vazio"
    exit 1
fi

# Solicitar nome do repositório
read -p "Digite o nome do repositório (default: galaxy-bay): " repo_name
repo_name=${repo_name:-galaxy-bay}

echo ""
echo "📋 Resumo:"
echo "   GitHub User: $github_user"
echo "   Repositório: $repo_name"
echo "   URL: https://github.com/$github_user/$repo_name"
echo ""

read -p "Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "🔧 Inicializando Git..."

# Inicializar git se necessário
if [ ! -d .git ]; then
    git init
fi

# Adicionar arquivos
echo "📦 Adicionando arquivos..."
git add .

# Verificar se há algo para commitar
if git diff --cached --quiet; then
    echo "⚠️  Nenhuma mudança para commitar"
    exit 0
fi

# Fazer commit
echo "💾 Criando commit inicial..."
if [ -f COMMIT_MESSAGE.md ]; then
    git commit -F COMMIT_MESSAGE.md
else
    git commit -m "chore: initial commit - migrating production-ready NFT platform"
fi

# Configurar remote
echo "🔗 Configurando remote..."
if git remote get-url origin &>/dev/null; then
    git remote remove origin
fi
git remote add origin "https://github.com/$github_user/$repo_name.git"

# Renomear branch para main
echo "📝 Renomeando branch para main..."
git branch -M main

# Push
echo "🚀 Fazendo push para GitHub..."
echo "   (Você precisará autenticar com suas credenciais do GitHub)"
echo ""
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Sucesso! Repositório criado e código enviado."
    echo ""
    echo "🔗 Acesse seu repositório em:"
    echo "   https://github.com/$github_user/$repo_name"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Configure branch protection no GitHub"
    echo "   2. Adicione secrets necessários (Settings → Secrets)"
    echo "   3. Configure CI/CD workflows"
else
    echo ""
    echo "❌ Erro ao fazer push. Verifique:"
    echo "   - Repositório existe no GitHub?"
    echo "   - Credenciais estão corretas?"
    echo "   - Você tem permissão de escrita?"
fi
