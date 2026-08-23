import { describe, it, expect } from 'vitest';

/**
 * Testes para validar o cálculo bidirecional de precificação
 * 
 * Fórmula direta (Margem % → V. Unit. Final):
 * V.Unit.Final = (V.Unit × (1 + Margem%)) / (1 - Impostos% - Frete%)
 * 
 * Fórmula inversa (V. Unit. Final → Margem %):
 * Margem % = ((V.Unit.Final × (1 - Impostos% - Frete%)) / V.Unit.) - 1
 */

// Funções de cálculo (replicadas do frontend para teste)
const calcularValorUnitarioFinal = (
  valorUnitario: number,
  margem: number,
  icms: number,
  pis: number,
  cofins: number,
  ipi: number,
  iss: number,
  fretePercentual: number
): number => {
  const margemPercentual = margem / 100;
  const percentualImpostos = (icms + pis + cofins + ipi + iss) / 100;
  const precoFinal = (valorUnitario * (1 + margemPercentual)) / (1 - percentualImpostos - fretePercentual / 100);
  return precoFinal;
};

const calcularMargemInversa = (
  valorUnitario: number,
  valorFinal: number,
  icms: number,
  pis: number,
  cofins: number,
  ipi: number,
  iss: number,
  fretePercentual: number
): number => {
  const fretePercentualDecimal = fretePercentual / 100;
  const impostosPercentual = (icms + pis + cofins + ipi + iss) / 100;
  
  if (1 - impostosPercentual - fretePercentualDecimal <= 0) {
    return 0;
  }
  
  const margemDecimal = ((valorFinal * (1 - impostosPercentual - fretePercentualDecimal)) / valorUnitario) - 1;
  const margemPercentual = margemDecimal * 100;
  
  return Math.max(0, margemPercentual);
};

describe('Precificação - Cálculo Bidirecional', () => {
  
  it('Deve calcular V. Unit. Final corretamente a partir de Margem %', () => {
    // Dados do teste
    const valorUnitario = 100;
    const margem = 35;
    const icms = 18;
    const pis = 1.65;
    const cofins = 7.6;
    const ipi = 0;
    const iss = 0;
    const fretePercentual = 6;
    
    const resultado = calcularValorUnitarioFinal(
      valorUnitario,
      margem,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // V.Unit.Final = (100 × (1 + 0.35)) / (1 - 0.2725 - 0.06)
    // V.Unit.Final = 135 / 0.6675 = 202.25...
    expect(resultado).toBeCloseTo(202.25, 1);
  });

  it('Deve calcular Margem % inversa corretamente a partir de V. Unit. Final', () => {
    // Dados do teste
    const valorUnitario = 100;
    const valorFinal = 150;
    const icms = 4;
    const pis = 0;
    const cofins = 0;
    const ipi = 0;
    const iss = 0;
    const fretePercentual = 6;
    
    const resultado = calcularMargemInversa(
      valorUnitario,
      valorFinal,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // Margem = ((150 × (1 - 0.04 - 0.06)) / 100) - 1
    // Margem = (150 × 0.90 / 100) - 1 = 1.35 - 1 = 0.35 = 35%
    expect(resultado).toBeCloseTo(35, 0);
  });

  it('Deve ser bidirecional: Margem → V.Final → Margem', () => {
    // Dados do teste
    const valorUnitario = 100;
    const margemOriginal = 25;
    const icms = 18;
    const pis = 1.65;
    const cofins = 7.6;
    const ipi = 0;
    const iss = 0;
    const fretePercentual = 5;
    
    // Passo 1: Calcular V. Unit. Final a partir de Margem
    const valorFinal = calcularValorUnitarioFinal(
      valorUnitario,
      margemOriginal,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // Passo 2: Recalcular Margem a partir do V. Unit. Final
    const margemRecalculada = calcularMargemInversa(
      valorUnitario,
      valorFinal,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // Deve retornar a margem original (com tolerância para arredondamento)
    expect(margemRecalculada).toBeCloseTo(margemOriginal, 1);
  });

  it('Deve evitar divisão por zero quando impostos + frete >= 100%', () => {
    const valorUnitario = 100;
    const valorFinal = 150;
    const icms = 50;
    const pis = 30;
    const cofins = 20;
    const ipi = 0;
    const iss = 0;
    const fretePercentual = 5; // Total: 100% + 5% = 105%
    
    const resultado = calcularMargemInversa(
      valorUnitario,
      valorFinal,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // Deve retornar 0 (não pode calcular margem válida)
    expect(resultado).toBe(0);
  });

  it('Deve retornar 0 quando margem inversa é negativa', () => {
    const valorUnitario = 100;
    const valorFinal = 50; // Valor final menor que o unitário
    const icms = 18;
    const pis = 1.65;
    const cofins = 7.6;
    const ipi = 0;
    const iss = 0;
    const fretePercentual = 5;
    
    const resultado = calcularMargemInversa(
      valorUnitario,
      valorFinal,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // Deve retornar 0 (margem não pode ser negativa)
    expect(resultado).toBe(0);
  });

  it('Deve lidar com valores decimais com precisão', () => {
    const valorUnitario = 123.45;
    const margem = 17.5;
    const icms = 12.5;
    const pis = 2.3;
    const cofins = 8.7;
    const ipi = 0;
    const iss = 0;
    const fretePercentual = 3.2;
    
    // Calcular V. Unit. Final
    const valorFinal = calcularValorUnitarioFinal(
      valorUnitario,
      margem,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // Recalcular Margem
    const margemRecalculada = calcularMargemInversa(
      valorUnitario,
      valorFinal,
      icms,
      pis,
      cofins,
      ipi,
      iss,
      fretePercentual
    );
    
    // Deve ser bidirecional
    expect(margemRecalculada).toBeCloseTo(margem, 1);
  });

  it('Exemplo do usuário: V.Unit. 100, Impostos 4%, Frete 6%, V.Final 150 = Margem 35%', () => {
    const resultado = calcularMargemInversa(
      100,  // V.Unit.
      150,  // V.Unit.Final
      4,    // ICMS
      0,    // PIS
      0,    // COFINS
      0,    // IPI
      0,    // ISS
      6     // Frete %
    );
    
    expect(resultado).toBeCloseTo(35, 0);
  });
});
