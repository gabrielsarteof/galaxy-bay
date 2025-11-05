# 📋 Guia Completo: Setup Git e GitHub

## ✅ Checklist Pré-Commit

Antes de fazer o commit, verifique:

- [ ] Arquivos `.env` não estão incluídos (apenas `.env.example`)
- [ ] `node_modules/` não está sendo commitado
- [ ] `storage/` com uploads de usuários não está incluído
- [ ] Chaves privadas e secrets não estão no código
- [ ] `.gitignore` está configurado corretamente

## 🚀 Passo a Passo

### 1. Inicializar Git Local

```bash
cd /c/Dev/Galaxy-Bay

# Inicializar repositório
git init

# Verificar arquivos que serão adicionados
git status

# Conferir se nada sensível está sendo incluído
git add --dry-run .
```

### 2. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `galaxy-bay`
3. Descrição: `Plataforma NFT descentralizada para criadores digitais`
4. **NÃO** inicialize com README, .gitignore ou license (já temos local)
5. Público ou Privado (sua escolha)
6. Clique em "Create repository"

### 3. Adicionar Arquivos e Fazer Commit

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer o commit inicial usando a mensagem preparada
git commit -F COMMIT_MESSAGE.md

# Ou se preferir mensagem mais curta:
# git commit -m "chore: initial commit - migrating production-ready NFT platform"
```

### 4. Conectar com GitHub e Push

```bash
# Adicionar o remote (substitua SEU-USUARIO pelo seu username)
git remote add origin https://github.com/SEU-USUARIO/galaxy-bay.git

# Renomear branch para main
git branch -M main

# Fazer o push inicial
git push -u origin main
```

## 🔐 Configurações Importantes no GitHub

Após o push, configure no GitHub:

### Settings → General
- [ ] Ative "Automatically delete head branches" após merge de PRs

### Settings → Branches
- [ ] Adicione branch protection rule para `main`:
  - Require pull request reviews before merging
  - Require status checks to pass before merging

### Settings → Secrets and Variables → Actions
Adicione os secrets necessários para CI/CD:
- `DATABASE_URL`
- `JWT_SECRET`
- `NFT_STORAGE_API_KEY`
- `SEPOLIA_RPC_URL`

## 📝 Trabalhando Após o Setup

### Criar nova feature

```bash
git checkout -b feature/nome-da-feature
# ... faça suas mudanças
git add .
git commit -m "feat: descrição da feature"
git push origin feature/nome-da-feature
```

### Atualizar com a main

```bash
git checkout main
git pull origin main
git checkout sua-branch
git merge main
```

### Corrigir um bug

```bash
git checkout -b fix/nome-do-bug
# ... faça as correções
git commit -m "fix: descrição da correção"
git push origin fix/nome-do-bug
```

## 🚨 Troubleshooting

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/galaxy-bay.git
```

### Acidentalmente commitou algo sensível
```bash
# ANTES de fazer push
git reset --soft HEAD~1  # desfaz o último commit mantendo as mudanças
# ou
git reset --hard HEAD~1  # desfaz o último commit E as mudanças

# DEPOIS de fazer push (mais complexo, cuidado!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/sensitive/file" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

### Esqueceu de adicionar algo ao .gitignore
```bash
# Adicione ao .gitignore primeiro
echo "arquivo-ou-pasta" >> .gitignore

# Remova do git mas mantenha localmente
git rm --cached arquivo-ou-pasta
git commit -m "chore: update .gitignore"
```

## 📊 Comandos Úteis

```bash
# Ver histórico de commits
git log --oneline --graph --all

# Ver mudanças não commitadas
git diff

# Ver mudanças em stage
git diff --staged

# Ver todos os remotes
git remote -v

# Ver status das branches
git branch -a

# Desfazer mudanças não commitadas em um arquivo
git checkout -- arquivo.txt

# Desfazer git add de um arquivo
git reset HEAD arquivo.txt
```

## 🎯 Próximos Passos

Após o primeiro push:

1. [ ] Configure GitHub Actions para CI/CD
2. [ ] Adicione badges ao README (build status, coverage, etc)
3. [ ] Configure Dependabot para atualizações de dependências
4. [ ] Configure issues templates
5. [ ] Configure pull request template
6. [ ] Adicione CHANGELOG.md

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)
