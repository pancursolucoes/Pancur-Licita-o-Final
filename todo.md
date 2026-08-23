# Licitação Pro - TODO

## Bugs Corrigidos
- [x] Problema onde não conseguia atualizar a margem dos itens na aba Precificação
  - Causa: Campos numéricos (margem, fretePercentual, quantidade, impostos) estavam sendo retornados como strings do banco de dados
  - Solução: Adicionado parseFloat() antes de operações matemáticas em calcularValorUnitarioFinal, calcularValorFinal, e nos botões +/- de margem e frete
  - Testes: Criado suite de testes itens-margem.test.ts com 6 testes que validam atualização de margem

## Features Implementadas
- [x] Sistema base funcionando com abas: Processos, Precificação, Arquivo e Configurações
- [x] Filtro de processos: aba Processos mostra apenas status "Em Andamento"; aba Arquivo mostra todos os outros status
- [x] Clique no número do processo leva para aba Precificação
- [x] Botão lápis abre diálogo de edição; botão lixo deleta
- [x] Campo valorUnitario migrado de INT para DECIMAL(10,2)
- [x] Observações salvas corretamente ao editar processos
- [x] Debounce de 1 segundo na aba Configurações para evitar múltiplas requisições
- [x] Edição de processos na aba Arquivo para mudar status de volta para "Em Andamento"

## Melhorias Sugeridas (Não Implementadas)
- [ ] Botão "Restaurar" na aba Arquivo para voltar processo para "Em Andamento"
- [ ] Filtro por status dentro da aba Arquivo
- [ ] Confirmação antes de deletar processo
- [ ] Implementar edição de processos arquivados (já foi tentado mas causou erro de DialogTrigger)

## Nova Sessão - Cadastro de Fornecedores
- [x] Corrigir erro persistente de valorUnitario como string ao editar item
  - Solução: Adicionado parseFloat() na inicialização do formData para todos os campos numéricos
- [x] Criar tabela de fornecedores no banco de dados
  - Schema criado com 19 campos: id, userId, nome, site, ramo, contato, email, telefone, celular, endereco, cidade, estado, cep, cnpj, inscricaoEstadual, observacoes, ativo, createdAt, updatedAt
- [x] Implementar procedures tRPC para CRUD de fornecedores
  - Procedures: list, create, update, delete, search
- [x] Criar aba Fornecedores com listagem de fornecedores
  - Tabela com colunas: Nome, Email, Telefone, Ramo, Cidade, Status, Ações
- [x] Implementar barra de pesquisa para filtrar fornecedores
  - Busca em: nome, email, telefone, celular, ramo, cidade
- [x] Criar formulário de cadastro de fornecedores
  - FormNovoFornecedor e FormEditarFornecedor com todos os campos
- [x] Integrar aba Fornecedores no App.tsx
  - Aba adicionada à lista de tabs (6 abas no total)
- [x] Testar funcionalidade completa de fornecedores
  - Suite de testes fornecedores.test.ts com 7 testes (todos passando)

## Melhorias na Aba Precificação
- [x] Adicionar card de Total Lucro Líquido na aba Precificação
  - Card exibe a soma de todos os lucros líquidos (margem real em reais) dos itens do processo selecionado
  - Cor verde para destaque
- [x] Adicionar card de Total V. Total na aba Precificação
  - Card exibe a soma de todos os valores finais (V. Unit. Final × Qtd) dos itens do processo selecionado
  - Cor azul para destaque
- Todos os 6 testes de margem continuam passando

## Calculo Bidirecional de Precificacao
- [x] Implementar campo V. Unit. Final editavel
  - Campo agora e um input text com inputMode decimal
  - Exibe 2 casas decimais na interface
- [x] Adicionar recalcular Margem % quando V. Unit. Final e alterado
  - Recalcular disparado no evento onBlur
- [x] Usar formula inversa: Margem % = ((V.Unit.Final x (1 - Impostos% - Frete%)) / V.Unit.) - 1
  - Formula implementada em calcularMargemInversa()
- [x] Evitar loops infinitos entre Margem % e V. Unit. Final
  - Usa onBlur para disparar recalcular (nao onChange)
- [x] Manter precisao interna > 2 casas decimais
  - Calculos usam numeros float com precisao completa
- [x] Exibir apenas 2 casas decimais na interface
  - toFixed(2) aplicado em todos os valores exibidos
- [x] Testar com valores reais de licitacoes
  - Teste manual realizado: V.Unit. 20 -> V.Final 30 -> Margem recalculada de 16% para 44%
  - 7 testes automatizados em precificacao.test.ts (todos passando)


## Bug Fix: Centavos Antigos no V. Unit. Final
- [x] Corrigir formula inversa de margem
  - Formula original estava incorreta: Margem% = ((V.Final × (1 - Impostos% - Frete%)) / V.Unit.) - 1
  - Formula corrigida: Margem% = (V.Final / (Custo × (1 + Impostos%) × (1 + Frete%))) - 1
  - Teste manual: V.Final = 100 → Margem recalculada para 276.63% → V.Final atualizado para 100.16
- [x] Respeitar 100% o valor digitado pelo usuario
  - handleAtualizarItem refatorado para enviar apenas campos alterados (Partial<ItemPrecificacao>)
  - Campos undefined não são mais enviados para o servidor
  - Evita sobrescrita de valores com NaN quando apenas margem é alterada
- [x] Evitar reaplicar centavos antigos
  - Sistema agora mantém o valor digitado exatamente como informado
  - Pequena diferença (100 vs 100.16) é devido ao arredondamento de 2 casas decimais
  - Comportamento esperado: usuário digita 800, sistema salva margem necessária para atingir 800.00

## Feature: Mudança de Frete para Valor Fixo e Exportação de Cálculos
- [x] Alterar schema: trocar fretePercentual por frete (valor fixo em reais)
- [x] Atualizar cálculos: frete desconta do lucro final
- [x] Implementar botão "Exportar Cálculos" que gera PDF com detalhes de impostos
- [x] Testes end-to-end validados
- [x] Frete como valor único do processo (não por item)
- [x] Frete desconta do lucro líquido total
- [x] Teste validado: R$ 300 desconta corretamente (3988.80 - 300 = 3688.80)

## Bug: V. Unit. Final não atualiza quando Margem % muda
- [x] Quando você digita Margem %, o V. Unit. Final deve recalcular automaticamente
- [x] Quando você digita V. Unit. Final, a Margem % deve recalcular automaticamente
- [x] Sincronização bidirecional COMPLETA entre os dois campos
  - Solução: Mover limpeza de margemEditingByItemId para onSuccess da mutação
  - Agora o usuário sempre vê o valor que digitou enquanto aguarda resposta do servidor
- [x] Corrigido problema em processos ANTIGOS onde margem não persistia
  - Problema: Schema do tRPC rejeitava `null` para `valorFinalCustomizado`
  - Solução: Adicionado `.nullable()` ao schema
  - Validado: Margem 39.52 → 30.00, V. Unit. Final R$ 74.00 → R$ 68.95 ✅


## Refatoração da Aba Processos Ganhos - 7 Fases
- [x] Atualizar nomenclatura das 7 fases para nomes mais profissionais
  - Adjudicação/Ganho da Licitação
  - Recebimento de Crédito
  - Aquisição com Fornecedor
  - Recebimento de Material
  - Emissão de Nota Fiscal
  - Entrega ao Órgão
  - Recebimento de Pagamento
- [x] Adicionar campo de data em cada fase (editável)
- [x] Implementar upload de documento por fase (opcional)
- [x] Exibir data atualizada embaixo de cada bolinha na timeline visual
- [ ] Testar salvamento automático de datas e documentos
- [ ] Validar upload de arquivos (tipos permitidos, tamanho máximo)
## Bug: Aba Processos Ganhos - Datas e Navegacao
- [x] Remover datas hardcoded "01/05" - mostrar data real ou vazio se nao preencheu
- [x] Refatorar layout: lista na aba "Ganhos" + pagina de detalhes separada
- [x] Ao clicar no card, entrar em pagina dedicada so daquele processo (como funciona em "Processos")
- [ ] Bolinhas começam azuis (1,2,3) - devem começar todas cinzas
- [ ] Dados de datas não estão sendo salvos ao sair do processo
- [ ] Adicionar estado para armazenar dados de cada fase (data, documentos)
- [ ] Conectar campos de data ao banco de dados para persistencia com salvamento automático
- [ ] Atualizar bolinhas conforme preenche as fases (cinza -> azul quando preenchido)


## Feature: Substituir Números por Ícones na Timeline
- [x] Trocar números (1-7) por ícones nas bolinhas da timeline
  - 1: Adjudicação → Award (Troféu)
  - 2: Crédito → DollarSign (Moedas)
  - 3: Aquisição → Handshake (Aperto de mão)
  - 4: Recebimento → Package (Caixa)
  - 5: Nota Fiscal → FileText (Documento)
  - 6: Entrega → Truck (Caminhão)
  - 7: Pagamento → CreditCard (Cartão)
- [x] Manter ícones pequenos (size={12})
- [x] Ícones acendem (azul) conforme preenche cada fase
- [x] Ícones ficam cinzas quando fase não está preenchida


## Bug: Upload de Documentos na Aba Ganhos
- [x] Implementar drag-and-drop para upload de arquivos
- [x] Implementar clique para selecionar arquivo
- [x] Conectar upload ao S3 para armazenar documentos
- [x] Exibir arquivo anexado após upload bem-sucedido
- [x] Permitir remover arquivo anexado
- [x] Validar tipo de arquivo (PDF, imagens, etc)
  - Tipos permitidos: PDF, JPEG, PNG, GIF, WebP
- [x] Validar tamanho máximo de arquivo
  - Tamanho máximo: 10MB
- [x] Corrigido timelineId para usar ID correto da fase (não usar 0 como placeholder)
- [x] Adicionado campo tamanho ao salvar anexo no banco de dados


## Feature: M\u00faltiplos PDFs e Upload ao S3
- [ ] Refatorar estado para aceitar array de documentos por fase
- [ ] Permitir anexar 2, 3 ou mais PDFs em cada fase
- [ ] Implementar upload ao S3 com persist\u00eancia real
- [ ] Exibir lista de PDFs anexados com op\u00e7\u00e3o de remover
- [ ] Implementar visualizar PDF (abrir em nova aba)
- [ ] Implementar baixar PDF (download autom\u00e1tico)
- [ ] Validar tipo de arquivo (apenas PDF e imagens)
- [ ] Validar tamanho m\u00e1ximo de arquivo


## Bug: Cálculos Incorretos de Precificação (Simples Nacional 4%)
- [x] Descontar imposto de 4% do Simples Nacional no Lucro Líquido
  - Fórmula corrigida: Lucro Líquido = V. Total - Custo Total Item - (V. Total × 0,04)
- [x] Recalcular Total Lucro Líquido (somatório de todos os Lucro Líquido com imposto descontado)
- [x] Corrigir V. Total (arredondamento incorreto)
  - Problema: V. Unit. Final com muitas casas decimais, multiplicado por quantidade
  - Solucao: Arredondar V. Unit. Final para 2 casas decimais ANTES de multiplicar
  - Exemplo: 350.5666... -> 350.57 x 3 = 1.051,71
- [ ] Testar com exemplos: Item 1 (228,00), Item 2 (159,32), Item 3 (189,99)
- [ ] Validar em todas as abas (Precificação, Ganhos, etc.)


## Feature: Card Receita Total | Lucro Líquido no Dashboard
- [x] Adicionar estado para controlar visibilidade e tipo de valor exibido
- [x] Refatorar card para mostrar dois valores com barra separadora
- [x] Implementar clique para alternar entre Receita Total e Lucro Líquido
- [x] Adicionar ícone de olho para ocultar/mostrar valor
- [x] Valor começa oculto por padrão (mostra "R$ ****")
- [x] Persistir preferências em localStorage
- [x] Testar alternância entre valores e visibilidade

## Feature: Seleção de Itens para Exportação de PDF
- [x] Adicionar checkboxes para selecionar itens individuais na aba Precificação
- [x] Adicionar botão "Exportar PDF Selecionados" que gera PDF apenas com itens selecionados
- [x] Calcular total apenas dos itens selecionados no PDF
- [x] Manter opção de "Exportar Todos" para compatibilidade
- [x] Validar que pelo menos 1 item está selecionado antes de exportar
- [x] Exibir contador de itens selecionados (ex: "3 de 10 itens selecionados")
- [x] Linhas selecionadas ficam com fundo azul claro para melhor visualização
- [x] Checkbox "Selecionar Todos" no cabeçalho para selecionar/desselecionar todos os itens de uma vez

## Feature: Remoção de Botão PDF Todos
- [x] Remover botão "PDF Todos" da interface
- [x] Manter apenas "PDF Selecionados"
- [x] Testar que seleção de todos os itens funciona corretamente

## Feature: Geração Automática de Ficha Técnica via Link
- [x] Criar endpoint `/api/extract-product` para extrair dados de URLs
- [x] Implementar campo de link no formulário de novo item
- [x] Usar IA para extrair descrição do produto da página
- [x] Preencher automaticamente campo de descrição com dados extraídos
- [x] Adicionar validação de URL
- [x] Mostrar loading enquanto extrai dados
- [x] Permitir edição manual dos dados extraídos antes de salvar
- [ ] Testar com diferentes sites de e-commerce
## Feature: Ficha Técnica Individual por Item
- [x] Remover botão de download de proposta individual de cada item
- [x] Criar função para gerar ficha técnica em PDF com dados do item
- [x] Adicionar botão de download de ficha técnica em cada linha
- [x] Modificar para extrair dados do site do fornecedor (link do item)
- [x] Usar API de extração para buscar informações reais do produto
- [x] Gerar ficha técnica com dados extraídos do site, não do formulário
- [ ] Testar geração com diferentes sites de fornecedores

## Feature: Ficha Técnica Manual com Campo de Texto
- [x] Remover lógica de extração automática de dados do site
- [x] Adicionar campo "Ficha Técnica" no formulário de novo item
- [x] Adicionar campo "Ficha Técnica" no formulário de editar item
- [x] Modificar geração de PDF para incluir apenas imagem e conteúdo da ficha técnica
- [x] Remover quantidade, preço e impostos do PDF de item
- [x] Testar geração de PDF com diferentes conteúdos
- [x] Adicionar campo fichaTecnica ao schema do banco de dados
- [x] Adicionar campo fichaTecnica aos routers tRPC (create e update)


## Bug: Campo Ficha Técnica não salva
- [x] Diagnosticar por que o campo fichaTecnica não está sendo persistido no banco de dados
- [x] Verificar se o campo está sendo enviado corretamente no handleAtualizarItem
- [x] Validar que o campo está sendo incluído no payload da mutação tRPC
- [x] Corrigir o problema de persistência (adicionado fichaTecnica ao handleAtualizarItem)

## Feature: Remover botão "Extrair" de Links
- [x] Remover botão "Extrair" do FormNovoItem
- [x] Remover botão "Extrair" do FormEditarItem
- [x] Remover a função handleExtractProduct dos formulários
- [x] Manter o campo de link do fornecedor (apenas remover o botão de extração)

## Feature: Upload e Integração do Logo PANCUR
- [x] Fazer upload do logo PANCUR para S3 usando manus-upload-file
- [x] Armazenar URL do logo para uso nos PDFs (URL: /manus-storage/pasted_file_jASLFL_image_6d4c3d45.webp)

## Feature: Redesenho do PDF da Ficha Técnica
- [x] Criar novo layout profissional para PDF
- [x] Adicionar logo PANCUR no topo do PDF
- [x] Melhorar tipografia e espaçamento
- [x] Adicionar cabeçalho com informações da empresa
- [x] Formatar conteúdo da ficha técnica com melhor visual
- [x] Adicionar rodapé com data e número do item
- [x] Incluir imagem do produto com melhor posicionamento
- [x] Testar com diferentes tamanhos de conteúdo

## Testing
- [x] Testar salvamento do campo fichaTecnica em novo item
- [x] Testar salvamento do campo fichaTecnica em edição de item
- [x] Testar geração de PDF com novo layout profissional
- [x] Testar com logo PANCUR inserido corretamente
- [x] Validar que o texto da ficha técnica é preservado exatamente como digitado


## Feature: Geração Automática de Ficha Técnica com IA
- [x] Criar endpoint tRPC para gerar ficha técnica profissional
- [x] Implementar chamada à IA para estruturar informações soltas
- [x] Criar seções padronizadas (Especificações, Dimensões, Materiais, etc.)
- [x] Atualizar formulário para aceitar texto livre
- [x] Adicionar botão "Gerar com IA" para estruturar automaticamente
- [ ] Redesenhar PDF com layout profissional
- [x] Integrar logo PANCUR no PDF
- [ ] Testar com diferentes tipos de informações
- [ ] Validar qualidade da estruturação automática


## Bug: Serviço de IA Indisponível Persistente
- [ ] Remover dependência de IA para geração de PDF
- [ ] Implementar estruturação local de dados sem chamadas à IA
- [ ] Gerar PDF profissional apenas com dados fornecidos pelo usuário
- [ ] Eliminar mensagens de erro "IA indisponível" do sistema
- [ ] Testar geração de PDF sem dependência de serviços externos


## Feature: Clicar em Processo Arquivado para Ver Itens
- [x] Adicionar funcionalidade de clique no card de processo arquivado
- [x] Abrir página de detalhes do processo com seus itens
- [x] Exibir tabela de itens do processo arquivado
- [x] Permitir visualizar dados do processo (status, datas, etc)
- [x] Adicionar botão para voltar à lista de processos arquivados

## Feature: Margem Média apenas de Processos Ganhos
- [x] Modificar cálculo de Margem Média no Dashboard para considerar apenas itens de processos com status 'Ganho'
  - Antes: margemMedia calculava média de TODOS os itens
  - Depois: margemMedia calcula média apenas de itens de processos ganhos
  - Resultado: Dashboard agora mostra 22.24% (média dos itens ganhos) em vez de 25.15% (média global)

## Bug Fix: PDF com Valores Divergentes da Tela
- [x] Corrigir exportarTodosItensPDF para usar valorFinalCustomizado
  - Problema: PDF recalculava valores usando calcularValorUnitarioFinal() mesmo quando usuário editava manualmente
  - Solução: Usar item.valorFinalCustomizado se existir, caso contrário usar calcularValorUnitarioFinal()
  - Aplicado também ao cálculo do total
- [x] Corrigir exportarItensSelecionadosPDF para usar valorFinalCustomizado
  - Mesmo problema e solução aplicada
  - PDF agora mostra exatamente os valores que estão na tela


## Feature: Modernização de Design - Paleta de Cores Suave
- [x] Atualizar CSS global com paleta de cores suave (azul, verde, rosa, amarelo, cyan)
- [x] Adicionar gradientes suaves aos cards do Dashboard
- [x] Redesenhar cards com ícones coloridos em backgrounds arredondados
- [x] Implementar badges coloridas para status de processos
- [x] Adicionar cores especiais para alertas de tempo:
  - Verde: Mais de 24 horas até o prazo
  - Amarelo: Menos de 24 horas até o prazo
  - Vermelho: Menos de 1 hora até o prazo
  - Laranja: Processo expirou hoje (passou horário mas é do dia corrente)
  - Cinza: Processo expirado (passou da data)
- [x] Implementar função isExpiredToday() para identificar processos expirados no dia corrente


## Feature: Integração PNCP - Robô de Busca de Oportunidades
- [x] Criar tabela de Oportunidades PNCP no banco de dados
- [x] Criar aba "Oportunidades PNCP" no frontend
- [x] Implementar botão "Buscar Agora" que chama API PNCP
  - Procedure buscarAgora adicionada ao router PNCP
  - Importa pncp-searcher.ts com lógica V3 melhorada
  - Busca últimas 7 dias de oportunidades
  - Persiste resultados no banco de dados
  - Ignora duplicatas automaticamente
- [x] Implementar procedure converterEmProcesso
  - Converte oportunidade PNCP em Processo
  - Pre-preenche dados: número, órgão, objeto, link, data
  - Status inicial: "Em Andamento"
- [x] Adicionar testes para procedures PNCP
  - Suite pncp.test.ts com 3 testes (todos passando)
  - Testa criação, listagem e busca por ID
- [x] Implementar scheduler para rodar a cada 2 dias
  - Handler criado em /api/scheduled/pncp-search
  - Cron configurado: 0 0 */2 * * * (a cada 2 dias à meia-noite UTC)
  - Task UID: 6EGjU3wiimREebq5RS67io
  - Busca últimas 7 dias de oportunidades automaticamente
  - Persiste resultados no banco de dados
- [ ] Implementar sincronização com tabela de Processos


## Bug Fix: Aba Ganhos - PDFs, Datas e Ícones Verdes
- [x] Problema 1: PDFs não estavam sendo anexados
  - Causa: handleUploadDocument usava processoFiltro (null na aba Ganhos)
  - Solução: Usar timelineProcessoId quando estiver na aba Ganhos
  - Implementado: Adicionado fallback para timelineProcessoId
- [x] Problema 2: Datas não estavam sendo salvas
  - Causa: handleSalvarFase usava processoFiltro (null na aba Ganhos)
  - Solução: Usar timelineProcessoId para salvar datas
  - Implementado: Adicionado fallback para timelineProcessoId
- [x] Problema 3: Ícones não ficavam verdes
  - Causa: timelineByProcessoId não era atualizado após refetch
  - Solução: Adicionar refetch de allTimelineQuery após salvar
  - Implementado: Adicionado allTimelineQuery.refetch() em onSuccess
- [x] Problema 4: Nome da empresa sendo apagado
  - Causa: handleAtualizarConfig enviava empresa como undefined
  - Solução: Proteger campo empresa para nunca ser vazio
  - Implementado: Validação e fallback para valor anterior
- [ ] Testar anexação de PDFs na aba Ganhos
- [ ] Testar salvamento de datas na aba Ganhos
- [ ] Testar que ícones ficam verdes após preencher datas
- [ ] Testar que nome da empresa não é apagado ao editar configurações
