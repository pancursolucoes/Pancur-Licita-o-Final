SELECT 
  p.id as processo_id,
  p.numero as processo_numero,
  p.status,
  i.id as item_id,
  i.quantidade,
  i.valorUnitario,
  i.margem,
  i.icms,
  i.pis,
  i.cofins,
  i.ipi,
  i.iss,
  i.valorFinalCustomizado,
  i.fretePercentual
FROM processos p
LEFT JOIN itens i ON p.id = i.processoId
ORDER BY p.id, i.id
LIMIT 10;
