# Contribuindo para Galaxy Bay

Obrigado por considerar contribuir para o Galaxy Bay! 🎉

## Código de Conduta

Este projeto adere a um Código de Conduta. Ao participar, espera-se que você mantenha este código.

## Como Contribuir

### Reportando Bugs

Antes de criar um bug report, verifique se o problema já não foi reportado. Quando criar um bug report, inclua o máximo de detalhes possível:

- **Título claro e descritivo**
- **Passos para reproduzir** o problema
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** se aplicável
- **Ambiente**: OS, navegador, versão do Node.js

### Sugerindo Melhorias

Enhancement suggestions são bem-vindas! Abra uma issue com:

- **Título claro e descritivo**
- **Descrição detalhada** da melhoria proposta
- **Exemplos** de como a feature funcionaria
- **Justificativa** de por que essa melhoria seria útil

### Pull Requests

1. **Fork** o repositório
2. **Crie um branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: add some AmazingFeature'`)
4. **Push** para o branch (`git push origin feature/AmazingFeature`)
5. **Abra um Pull Request**

#### Padrão de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Manutenção, dependências, etc

**Exemplos:**
```bash
feat: add NFT offer system
fix: resolve image upload bug on Safari
docs: update API documentation
refactor: optimize database queries
```

### Desenvolvimento Local

#### Setup

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/galaxy-bay.git
cd galaxy-bay

# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev

# Frontend (nova janela)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

#### Testes

```bash
# Backend
cd backend
npm test
npm run test:e2e

# Frontend
cd frontend
npm test

# Contracts
cd contracts
npx hardhat test
```

### Guia de Estilo

#### TypeScript/JavaScript

- Use TypeScript sempre que possível
- Siga as regras do ESLint configurado
- Evite `any`, prefira tipos específicos
- Documente funções complexas com JSDoc

#### Código

- Mantenha funções pequenas e focadas
- Use nomes descritivos para variáveis e funções
- Evite comentários genéricos, prefira código auto-explicativo
- Comentários técnicos são bem-vindos quando necessário

#### Commits

- Commits pequenos e focados
- Uma mudança lógica por commit
- Mensagens claras em português ou inglês

### Estrutura de Branches

- `main` - Branch principal, sempre estável
- `develop` - Branch de desenvolvimento
- `feature/*` - Features novas
- `fix/*` - Correções de bugs
- `refactor/*` - Refatorações
- `docs/*` - Documentação

### Checklist do PR

Antes de submeter seu PR, verifique:

- [ ] Código segue o guia de estilo do projeto
- [ ] Testes passando (`npm test`)
- [ ] Lint passando (`npm run lint`)
- [ ] Build passando (`npm run build`)
- [ ] Documentação atualizada se necessário
- [ ] Commit messages seguem o padrão
- [ ] Branch atualizado com a `main`

### Revisão de Código

Todos os PRs passam por revisão de código:

- Seja respeitoso nos comentários
- Aceite feedback construtivo
- Responda às questões levantadas
- Faça as mudanças solicitadas

### Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.

## Dúvidas?

Sinta-se à vontade para abrir uma issue com a tag `question` ou entrar em contato com os mantenedores.

Obrigado por contribuir! 🚀
