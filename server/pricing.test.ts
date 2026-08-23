import { describe, it, expect } from 'vitest';

/**
 * Fórmula de cálculo: V. Unit. Final = Custo / (1 - (lucro + frete + imposto))
 * 
 * Onde:
 * - Custo = valor do produto
 * - Lucro = % desejada (margem)
 * - Frete = %
 * - Imposto = ICMS + PIS + COFINS + IPI + ISS (em %)
 */

function calcularValorUnitarioFinal(
  custo: number,
  margem: number,
  fretePercentual: number,
  icms: number,
  pis: number,
  cofins: number,
  ipi: number,
  iss: number
): number {
  // Calcular percentuais em decimal
  const lucroDecimal = margem / 100;
  const freteDecimal = fretePercentual / 100;
  const impostoDecimal = (icms + pis + cofins + ipi + iss) / 100;
  
  // Aplicar fórmula: V. Unit. Final = Custo / (1 - (lucro + frete + imposto))
  const denominador = 1 - (lucroDecimal + freteDecimal + impostoDecimal);
  
  // Validar para evitar divisão por zero
  if (denominador <= 0) {
    throw new Error('Soma de lucro + frete + imposto >= 100%. Ajuste os valores.');
  }
  
  return custo / denominador;
}

describe('Pricing Formula', () => {
  it('should calculate price with basic values', () => {
    // Exemplo: Custo R$ 100, Margem 20%, Frete 5%, Imposto 26.65% (ICMS 18 + PIS 1.65 + COFINS 7.6 + IPI 0 + ISS 0)
    const custo = 100;
    const margem = 20;
    const frete = 5;
    const imposto = 18 + 1.65 + 7.6 + 0 + 0; // 27.25%
    
    const resultado = calcularValorUnitarioFinal(custo, margem, frete, 18, 1.65, 7.6, 0, 0);
    
    // V. Unit. Final = 100 / (1 - (0.20 + 0.05 + 0.2725))
    // V. Unit. Final = 100 / (1 - 0.5225)
    // V. Unit. Final = 100 / 0.4775
    // V. Unit. Final ≈ 209.37
    
    expect(resultado).toBeCloseTo(209.42, 1);
  });

  it('should calculate price with zero frete', () => {
    // Exemplo: Custo R$ 50, Margem 15%, Frete 0%, Imposto 26.65%
    const resultado = calcularValorUnitarioFinal(50, 15, 0, 18, 1.65, 7.6, 0, 0);
    
    // V. Unit. Final = 50 / (1 - (0.15 + 0 + 0.2725))
    // V. Unit. Final = 50 / (1 - 0.4225)
    // V. Unit. Final = 50 / 0.5775
    // V. Unit. Final ≈ 86.58
    
    expect(resultado).toBeCloseTo(86.58, 1);
  });

  it('should calculate price with high margin', () => {
    // Exemplo: Custo R$ 200, Margem 30%, Frete 3%, Imposto 26.65%
    const resultado = calcularValorUnitarioFinal(200, 30, 3, 18, 1.65, 7.6, 0, 0);
    
    // V. Unit. Final = 200 / (1 - (0.30 + 0.03 + 0.2725))
    // V. Unit. Final = 200 / (1 - 0.6025)
    // V. Unit. Final = 200 / 0.3975
    // V. Unit. Final ≈ 503.14
    
    expect(resultado).toBeCloseTo(503.14, 1);
  });

  it('should calculate price with ISS (service tax)', () => {
    // Exemplo: Serviço com ISS - Custo R$ 100, Margem 20%, Frete 0%, ISS 5%
    const resultado = calcularValorUnitarioFinal(100, 20, 0, 0, 0, 0, 0, 5);
    
    // V. Unit. Final = 100 / (1 - (0.20 + 0 + 0.05))
    // V. Unit. Final = 100 / (1 - 0.25)
    // V. Unit. Final = 100 / 0.75
    // V. Unit. Final ≈ 133.33
    
    expect(resultado).toBeCloseTo(133.33, 1);
  });

  it('should throw error when sum exceeds 100%', () => {
    // Exemplo inválido: Margem 50% + Frete 30% + Imposto 25% = 105% (impossível)
    expect(() => {
      calcularValorUnitarioFinal(100, 50, 30, 18, 1.65, 7.6, 0, 0);
    }).toThrow();
  });

  it('should calculate correctly with small values', () => {
    // Exemplo: Custo R$ 10, Margem 10%, Frete 2%, Imposto 18%
    const resultado = calcularValorUnitarioFinal(10, 10, 2, 18, 0, 0, 0, 0);
    
    // V. Unit. Final = 10 / (1 - (0.10 + 0.02 + 0.18))
    // V. Unit. Final = 10 / (1 - 0.30)
    // V. Unit. Final = 10 / 0.70
    // V. Unit. Final ≈ 14.29
    
    expect(resultado).toBeCloseTo(14.29, 1);
  });

  it('should calculate correctly with large values', () => {
    // Exemplo: Custo R$ 10000, Margem 25%, Frete 4%, Imposto 26.65%
    const resultado = calcularValorUnitarioFinal(10000, 25, 4, 18, 1.65, 7.6, 0, 0);
    
    // V. Unit. Final = 10000 / (1 - (0.25 + 0.04 + 0.2725))
    // V. Unit. Final = 10000 / (1 - 0.5625)
    // V. Unit. Final = 10000 / 0.4375
    // V. Unit. Final ≈ 22857.14
    
    expect(resultado).toBeCloseTo(22857.14, 1);
  });

  it('should handle edge case with minimal margin', () => {
    // Exemplo: Custo R$ 100, Margem 1%, Frete 1%, Imposto 18%
    const resultado = calcularValorUnitarioFinal(100, 1, 1, 18, 0, 0, 0, 0);
    
    // V. Unit. Final = 100 / (1 - (0.01 + 0.01 + 0.18))
    // V. Unit. Final = 100 / (1 - 0.20)
    // V. Unit. Final = 100 / 0.80
    // V. Unit. Final = 125
    
    expect(resultado).toBeCloseTo(125, 1);
  });
});
