# Melhorias no Cadastro de Contatos

## Novos Campos a Serem Adicionados
- CPF
- CNPJ
- Data de Nascimento
- Sexo
- Automação (Sim/Não)
- Fila (Select)

## Passo a Passo para Implementação

### 1. Atualização do Banco de Dados
1. Criar uma nova migration para adicionar os campos na tabela de contatos:
   ```sql
   ALTER TABLE contacts
   ADD COLUMN cpf VARCHAR(14),
   ADD COLUMN cnpj VARCHAR(18),
   ADD COLUMN birth_date DATE,
   ADD COLUMN gender VARCHAR(1),
   ADD COLUMN automation BOOLEAN DEFAULT false,
   ADD COLUMN queue_id INTEGER REFERENCES queues(id);
   ```

### 2. Atualização do Backend
1. Atualizar o modelo de Contato (Contact) para incluir os novos campos
2. Atualizar o controller de contatos para:
   - Incluir validação dos novos campos
   - Adicionar os campos nas operações de CRUD
   - Implementar validação de CPF/CNPJ
3. Atualizar as rotas da API para suportar os novos campos
4. Atualizar a documentação da API (se existir)

### 3. Atualização do Frontend
1. Atualizar o formulário de contato para incluir os novos campos:
   - Adicionar campo de CPF com máscara
   - Adicionar campo de CNPJ com máscara
   - Adicionar campo de data de nascimento com datepicker
   - Adicionar select para sexo (M/F)
   - Adicionar checkbox para automação
   - Adicionar select para fila
2. Atualizar a interface de listagem para mostrar os novos campos
3. Atualizar a interface de detalhes do contato
4. Implementar validações no frontend:
   - Validação de CPF/CNPJ
   - Validação de data de nascimento
   - Validação de campos obrigatórios

### 4. Testes
1. Criar testes unitários para:
   - Validação de CPF/CNPJ
   - Validação de data de nascimento
   - Validação de campos obrigatórios
2. Testar o fluxo completo de:
   - Criação de contato com novos campos
   - Edição de contato com novos campos
   - Listagem de contatos com novos campos
   - Filtros e busca considerando os novos campos

### 5. Documentação
1. Atualizar a documentação do sistema
2. Atualizar o manual do usuário
3. Documentar as novas funcionalidades

### 6. Deploy
1. Executar a migration no ambiente de produção
2. Fazer backup do banco de dados antes do deploy
3. Deploy das alterações no backend
4. Deploy das alterações no frontend
5. Testar em produção

## Observações Importantes
- Garantir que os campos CPF e CNPJ sejam mutuamente exclusivos (ou um ou outro)
- Implementar máscaras adequadas para CPF e CNPJ
- Considerar a privacidade dos dados de CPF/CNPJ
- Implementar validações de segurança para os novos campos
- Considerar a necessidade de indexação para campos de busca 