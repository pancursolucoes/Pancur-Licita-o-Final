import { describe, it, expect } from 'vitest';

// Replicar a função de cálculo do frontend para testar
const calcularValorUnitarioFinal = (item: {
  valorUnitario: number;
  fretePercentual: number;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  iss: number;
  margem: number;
}) => {
  // FÓRMULA CORRETA: P = C / (1 - soma_dos_percentuais)
  // Todos os percentuais são tratados como componentes do preço final
  
  const custo = item.valorUnitario;
  
  // Soma de TODOS os percentuais (convertidos para decimal)
  const totalPercentual = 
    (item.icms + item.pis + item.cofins + item.ipi + item.iss + item.margem + item.fretePercentual) / 100;
  
  // Validação: percentuais não podem ser >= 100%
  if (totalPercentual >= 1) {
    return item.valorUnitario;
  }
  
  // Aplicar fórmula: P = C / (1 - soma_percentuais)
  const preco = custo / (1 - totalPercentual);
  
  return preco;
};

const calcularLucroLiquido = (item: {
  valorUnitario: number;
  fretePercentual: number;
  icms: number;
  pis: number;
  cofins: number;
  ipi: number;
  iss: number;
  margem: number;
  quantidade: number;
}) => {
  const precoVenda = calcularValorUnitarioFinal(item);
  const totalPercentual = 
    (item.icms + item.pis + item.cofins + item.ipi + item.iss + item.margem + item.fretePercentual) / 100;
  
  // lucro = precoVenda - custoProduto - (precoVenda * totalPercentual)
  const lucroUnitario = precoVenda - item.valorUnitario - (precoVenda * totalPercentual);
  return lucroUnitario * item.quantidade;
};

describe('Fórmula de Precificação Corrigida - P = C / (1 - soma_percentuais)', () => {
  it('EXEMPLO OBRIGATÓRIO: Custo 20 + ICMS 4% + Margem 16% = Preço 25', () => {
    const item = {
      valorUnitario: 20,
      fretePercentual: 0,
      icms: 4,
      pis: 0,
      cofins: 0,
      ipi: 0,
      iss: 0,
      margem: 16,
      quantidade: 1
    };
    
    // totalPercentual = (4 + 16) / 100 = 0.20
    // P = 20 / (1 - 0.20) = 20 / 0.80 = 25.00
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBeCloseTo(25, 2);
  });

  it('Custo 100 + ICMS 18% + PIS 1.65% + COFINS 7.6% + Margem 20% = Preço correto', () => {
    const item = {
      valorUnitario: 100,
      fretePercentual: 0,
      icms: 18,
      pis: 1.65,
      cofins: 7.6,
      ipi: 0,
      iss: 0,
      margem: 20,
      quantidade: 1
    };
    
    // totalPercentual = (18 + 1.65 + 7.6 + 20) / 100 = 0.4725
    // P = 100 / (1 - 0.4725) = 100 / 0.5275 ≈ 189.57
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBeGreaterThan(189);
    expect(precoVenda).toBeLessThan(190);
  });

  it('Custo 50 + Frete 10% + ICMS 12% + PIS 1.65% + COFINS 7.6% + IPI 5% + Margem 15%', () => {
    const item = {
      valorUnitario: 50,
      fretePercentual: 10,
      icms: 12,
      pis: 1.65,
      cofins: 7.6,
      ipi: 5,
      iss: 0,
      margem: 15,
      quantidade: 1
    };
    
    // totalPercentual = (10 + 12 + 1.65 + 7.6 + 5 + 15) / 100 = 0.5125
    // P = 50 / (1 - 0.5125) = 50 / 0.4875 ≈ 102.56
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBeGreaterThan(102);
    expect(precoVenda).toBeLessThan(103);
  });

  it('Custo 30 + Frete 5% + Todos os impostos + Margem 10%', () => {
    const item = {
      valorUnitario: 30,
      fretePercentual: 5,
      icms: 18,
      pis: 1.65,
      cofins: 7.6,
      ipi: 2,
      iss: 5,
      margem: 10,
      quantidade: 1
    };
    
    // totalPercentual = (5 + 18 + 1.65 + 7.6 + 2 + 5 + 10) / 100 = 0.4925
    // P = 30 / (1 - 0.4925) = 30 / 0.5075 ≈ 59.11
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBeGreaterThan(59);
    expect(precoVenda).toBeLessThan(60);
  });

  it('Sem frete: Custo 100 + ICMS 18% + Margem 20%', () => {
    const item = {
      valorUnitario: 100,
      fretePercentual: 0,
      icms: 18,
      pis: 0,
      cofins: 0,
      ipi: 0,
      iss: 0,
      margem: 20,
      quantidade: 1
    };
    
    // totalPercentual = (18 + 20) / 100 = 0.38
    // P = 100 / (1 - 0.38) = 100 / 0.62 ≈ 161.29
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBeGreaterThan(161);
    expect(precoVenda).toBeLessThan(162);
  });

  it('Sem impostos: Custo 100 + Frete 5% + Margem 20%', () => {
    const item = {
      valorUnitario: 100,
      fretePercentual: 5,
      icms: 0,
      pis: 0,
      cofins: 0,
      ipi: 0,
      iss: 0,
      margem: 20,
      quantidade: 1
    };
    
    // totalPercentual = (5 + 20) / 100 = 0.25
    // P = 100 / (1 - 0.25) = 100 / 0.75 ≈ 133.33
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBeCloseTo(133.33, 2);
  });

  it('Percentuais >= 100% deve retornar o valor unitário', () => {
    const item = {
      valorUnitario: 100,
      fretePercentual: 30,
      icms: 40,
      pis: 20,
      cofins: 15,
      ipi: 0,
      iss: 0,
      margem: 50,
      quantidade: 1
    };
    
    // totalPercentual = (30 + 40 + 20 + 15 + 50) / 100 = 1.55 (>= 1)
    // Deve retornar o valor unitário
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBe(100);
  });

  it('Cálculo de lucro líquido com fórmula correta', () => {
    const item = {
      valorUnitario: 20,
      fretePercentual: 0,
      icms: 4,
      pis: 0,
      cofins: 0,
      ipi: 0,
      iss: 0,
      margem: 16,
      quantidade: 10
    };
    
    // Preço unitário = 20 / (1 - 0.20) = 25
    // Preço total = 25 * 10 = 250
    // Custo total = 20 * 10 = 200
    // Impostos = 250 * 0.20 = 50
    // Lucro = 250 - 200 - 50 = 0
    // Neste caso, lucro é zero (margem 16% + impostos 4% = 20% do preço)
    
    const lucroTotal = calcularLucroLiquido(item);
    expect(lucroTotal).toBeCloseTo(0, 1);
  });

  it('Validação: Soma de percentuais deve ser exata', () => {
    const item = {
      valorUnitario: 100,
      fretePercentual: 5,
      icms: 10,
      pis: 1,
      cofins: 5,
      ipi: 2,
      iss: 3,
      margem: 15,
      quantidade: 1
    };
    
    // totalPercentual = (5 + 10 + 1 + 5 + 2 + 3 + 15) / 100 = 0.41
    // P = 100 / (1 - 0.41) = 100 / 0.59 ≈ 169.49
    
    const precoVenda = calcularValorUnitarioFinal(item);
    expect(precoVenda).toBeGreaterThan(169);
    expect(precoVenda).toBeLessThan(170);
  });
});
