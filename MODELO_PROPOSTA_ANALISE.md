# Análise do Modelo de Proposta

## Estrutura do Documento

### Cabeçalho
- Logo da empresa (PANCUR - Soluções Integradas LTDA)
- Título: "PROPOSTA DE PREÇOS"

### Seção 1: Destinatário
```
AO
NOME DO ÓRGÃO [número] - [DESCRIÇÃO DO ÓRGÃO]
EDITAL DO PREGÃO ELETRÔNICO Nº [número/ano]
```

### Seção 2: Saudação
```
Senhor Pregoeiro,
```

### Seção 3: Introdução
```
Seguindo os ditames do Edital apresento a V.Sa. a nossa proposta de preços para o(s) Item(ens) do PREGÃO ELETRÔNICO Nº [número/ano], conforme a seguir relacionados, discriminados de acordo com ANEXO I, deste Edital.
```

### Seção 4: Tabela de Itens
| Item | Especificação | Und. | QDT | Preço Unitário R$ | Preço Global R$ |
|------|---------------|------|-----|-------------------|-----------------|
| 1    | [descrição]   | [un] | [q] | [preço]           | [total]         |

**Linha de Total:**
```
TOTAL MÁXIMO ESTIMADO | R$ [valor total]
```

### Seção 5: Declarações
Texto padrão com 4 declarações:
1. Custos indiretos inclusos (impostos, taxas, fretes, seguros, etc.)
2. Compromisso de entrega dentro do prazo
3. Preços de acordo com mercado, incluindo todos os insumos
4. Acordo com demais condições do Edital

### Seção 6: Dados da Empresa
```
Dados da empresa:
Empresa/Razão Social: [nome]
CNPJ: [cnpj]
Endereço: [endereço completo]
CEP: [cep]
Celular: [celular]

Banco: [número] [nome]  Agência: [agência]  Conta-Corrente: [conta]
E-mail: [email]
```

### Seção 7: Fechamento
```
Finalizando, declaramos que estamos de pleno acordo com todas as condições estabelecidas no Edital e seus anexos.
```

## Campos Dinâmicos Necessários

### Do Processo (preenchidos manualmente):
- Nome do órgão
- Número do órgão
- Descrição do órgão
- Número do pregão eletrônico
- Ano do pregão

### Dos Itens (vêm da precificação):
- Item (número)
- Especificação (descrição do produto)
- Unidade
- Quantidade
- Preço Unitário
- Preço Global (Quantidade × Preço Unitário)
- Total Máximo Estimado (soma de todos os preços globais)

### Da Empresa (vêm das configurações):
- Razão Social
- CNPJ
- Endereço completo
- CEP
- Celular
- Banco
- Agência
- Conta-Corrente
- E-mail

## Melhorias Sugeridas

1. **Campo de Imagem do Produto** - Na tabela, adicionar espaço para imagem do produto (como no modelo original)
2. **Número do Processo no Cabeçalho** - Adicionar um campo no topo para número do processo/edital
3. **Assinatura Digital** - Adicionar espaço para assinatura ou QR code de autenticação
4. **Data de Emissão** - Adicionar data de quando a proposta foi gerada
5. **Validade da Proposta** - Campo para indicar por quanto tempo a proposta é válida

## Implementação

Será necessário:
1. Adicionar campos nas Configurações para dados bancários completos
2. Adicionar campos no Processo para informações do órgão e edital
3. Reescrever a função `exportarPropostaPDF` para seguir este modelo
4. Adicionar suporte a imagens dos produtos (opcional)
