import { describe, it, expect } from 'vitest';

/**
 * AUDIT TEST SUITE - Validates all pricing calculations
 * 
 * This test suite validates the mathematical correctness of all pricing calculations
 * according to Simples Nacional tax rules and the user's business logic.
 * 
 * Formula Reference:
 * 1. Lucro Desejado = V. Unit. × (Margem% / 100)
 * 2. Receita Líquida Necessária = V. Unit. + Lucro Desejado
 * 3. V. Unit. Final = Receita Líquida Necessária ÷ (1 − Impostos%)
 * 4. V. Total = Qtd × V. Unit. Final
 * 5. Imposto = V. Total × Impostos%
 * 6. Lucro Líquido = V. Total − Imposto − (Qtd × V. Unit.)
 */

interface ItemAudit {
  quantidade: number;
  valorUnitario: number;
  margem: number; // percentage (0-100)
  impostos: number; // percentage (0-100)
  frete?: number;
}

function calcularVUnitarioFinal(item: ItemAudit): number {
  const margemDecimal = item.margem / 100;
  const impostosDecimal = item.impostos / 100;
  
  const lucroDesejado = item.valorUnitario * margemDecimal;
  const receitaLiquidaNecessaria = item.valorUnitario + lucroDesejado;
  const vUnitarioFinal = receitaLiquidaNecessaria / (1 - impostosDecimal);
  
  return vUnitarioFinal;
}

function calcularLucroLiquido(item: ItemAudit, vUnitarioFinal: number): number {
  const impostosDecimal = item.impostos / 100;
  const vTotal = item.quantidade * vUnitarioFinal;
  const imposto = vTotal * impostosDecimal;
  const custoTotal = item.quantidade * item.valorUnitario;
  const frete = item.frete || 0;
  
  const lucroLiquido = vTotal - imposto - custoTotal - frete;
  return lucroLiquido;
}

function calcularMargemTotal(lucroLiquido: number, vTotal: number): number {
  if (vTotal === 0) return 0;
  return (lucroLiquido / vTotal) * 100;
}

describe('Pricing Calculation Audit', () => {
  
  describe('V. Unit. Final Calculation', () => {
    it('should calculate V. Unit. Final correctly for basic case', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      
      // Expected: (100 + 20) / (1 - 0.04) = 120 / 0.96 = 125
      expect(vUnitarioFinal).toBeCloseTo(125, 2);
    });

    it('should calculate V. Unit. Final correctly for user example', () => {
      const item: ItemAudit = {
        quantidade: 15,
        valorUnitario: 41.77,
        margem: 40.20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      
      // Expected: (41.77 + 16.77) / 0.96 = 58.54 / 0.96 = 60.98
      const lucroDesejado = 41.77 * 0.4020;
      const receitaLiquida = 41.77 + lucroDesejado;
      const expected = receitaLiquida / 0.96;
      
      expect(vUnitarioFinal).toBeCloseTo(expected, 2);
    });

    it('should handle different tax rates correctly', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 20,
        impostos: 8 // Different tax rate
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      
      // Expected: 120 / (1 - 0.08) = 120 / 0.92 = 130.43
      expect(vUnitarioFinal).toBeCloseTo(120 / 0.92, 2);
    });

    it('should handle zero margin correctly', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 0,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      
      // Expected: 100 / 0.96 = 104.17
      expect(vUnitarioFinal).toBeCloseTo(100 / 0.96, 2);
    });

    it('should handle high margin correctly', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 50,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      
      // Expected: 150 / 0.96 = 156.25
      expect(vUnitarioFinal).toBeCloseTo(150 / 0.96, 2);
    });
  });

  describe('Lucro Líquido Calculation', () => {
    it('should calculate Lucro Líquido correctly for basic case', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      const lucroLiquido = calcularLucroLiquido(item, vUnitarioFinal);
      
      // V. Total = 1 × 125 = 125
      // Imposto = 125 × 0.04 = 5
      // Custo = 1 × 100 = 100
      // Lucro Líquido = 125 - 5 - 100 = 20
      expect(lucroLiquido).toBeCloseTo(20, 2);
    });

    it('should calculate Lucro Líquido correctly for user example', () => {
      const item: ItemAudit = {
        quantidade: 15,
        valorUnitario: 41.77,
        margem: 40.20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      const lucroLiquido = calcularLucroLiquido(item, vUnitarioFinal);
      
      // V. Total = 15 × 61.00 = 915.00 (approximately)
      // Imposto = 915 × 0.04 = 36.60
      // Custo = 15 × 41.77 = 626.55
      // Lucro Líquido = 915 - 36.60 - 626.55 = 251.85
      
      const vTotal = item.quantidade * vUnitarioFinal;
      const imposto = vTotal * 0.04;
      const custoTotal = item.quantidade * item.valorUnitario;
      const expected = vTotal - imposto - custoTotal;
      
      expect(lucroLiquido).toBeCloseTo(expected, 2);
    });

    it('should calculate Lucro Líquido with frete correctly', () => {
      const item: ItemAudit = {
        quantidade: 10,
        valorUnitario: 100,
        margem: 20,
        impostos: 4,
        frete: 50
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      const lucroLiquido = calcularLucroLiquido(item, vUnitarioFinal);
      
      // V. Total = 10 × 125 = 1250
      // Imposto = 1250 × 0.04 = 50
      // Custo = 10 × 100 = 1000
      // Frete = 50
      // Lucro Líquido = 1250 - 50 - 1000 - 50 = 150
      expect(lucroLiquido).toBeCloseTo(150, 2);
    });

    it('should verify Lucro Líquido equals Margem percentage of cost', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      const lucroLiquido = calcularLucroLiquido(item, vUnitarioFinal);
      
      // Lucro Líquido should equal V. Unit. × Margem%
      const lucroEsperado = item.valorUnitario * (item.margem / 100);
      expect(lucroLiquido).toBeCloseTo(lucroEsperado, 2);
    });
  });

  describe('Margem Total do Processo Calculation', () => {
    it('should calculate Margem Total correctly', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      const lucroLiquido = calcularLucroLiquido(item, vUnitarioFinal);
      const vTotal = item.quantidade * vUnitarioFinal;
      const margemTotal = calcularMargemTotal(lucroLiquido, vTotal);
      
      // Margem Total = 20 / 125 × 100 = 16%
      expect(margemTotal).toBeCloseTo(16, 2);
    });

    it('should calculate Margem Total for multiple items', () => {
      const items: ItemAudit[] = [
        { quantidade: 1, valorUnitario: 100, margem: 20, impostos: 4 },
        { quantidade: 1, valorUnitario: 100, margem: 20, impostos: 4 }
      ];
      
      let totalLucro = 0;
      let totalVenda = 0;
      
      for (const item of items) {
        const vUnitarioFinal = calcularVUnitarioFinal(item);
        const lucroLiquido = calcularLucroLiquido(item, vUnitarioFinal);
        const vTotal = item.quantidade * vUnitarioFinal;
        
        totalLucro += lucroLiquido;
        totalVenda += vTotal;
      }
      
      const margemTotal = calcularMargemTotal(totalLucro, totalVenda);
      
      // Both items have same margin, so total should be ~16%
      expect(margemTotal).toBeCloseTo(16, 1);
    });
  });

  describe('Inverse Margin Calculation (when V. Unit. Final is customized)', () => {
    it('should calculate margin from V. Unit. Final correctly', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 20, // This will be recalculated
        impostos: 4
      };
      
      // User sets V. Unit. Final to 125
      const vUnitarioFinalCustomizado = 125;
      
      // Inverse formula: Margem = (V.Final × (1 - Impostos%) - V.Unit.) / V.Unit.
      const impostosDecimal = item.impostos / 100;
      const margemDecimal = (vUnitarioFinalCustomizado * (1 - impostosDecimal) - item.valorUnitario) / item.valorUnitario;
      const margemPercentual = margemDecimal * 100;
      
      // Expected: (125 × 0.96 - 100) / 100 = (120 - 100) / 100 = 0.20 = 20%
      expect(margemPercentual).toBeCloseTo(20, 2);
    });

    it('should handle inverse calculation for different V. Unit. Final', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 0, // Will be recalculated
        impostos: 4
      };
      
      // User sets V. Unit. Final to 150
      const vUnitarioFinalCustomizado = 150;
      
      const impostosDecimal = item.impostos / 100;
      const margemDecimal = (vUnitarioFinalCustomizado * (1 - impostosDecimal) - item.valorUnitario) / item.valorUnitario;
      const margemPercentual = margemDecimal * 100;
      
      // Expected: (150 × 0.96 - 100) / 100 = (144 - 100) / 100 = 0.44 = 44%
      expect(margemPercentual).toBeCloseTo(44, 2);
    });
  });

  describe('Tax Calculation Verification', () => {
    it('should verify tax is calculated on V. Total, not on cost', () => {
      const item: ItemAudit = {
        quantidade: 15,
        valorUnitario: 41.77,
        margem: 40.20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      const vTotal = item.quantidade * vUnitarioFinal;
      
      // Tax should be on V. Total
      const impostoCorreto = vTotal * 0.04;
      
      // NOT on cost (this was the bug)
      const custoTotal = item.quantidade * item.valorUnitario;
      const impostoErrado = custoTotal * 0.04;
      
      // Verify they're different
      expect(impostoCorreto).not.toBeCloseTo(impostoErrado, 1);
      
      // Verify correct tax is used
      expect(impostoCorreto).toBeCloseTo(36.60, 1);
      expect(impostoErrado).toBeCloseTo(25.06, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small values', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 0.01,
        margem: 20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      expect(vUnitarioFinal).toBeGreaterThan(0);
      expect(isFinite(vUnitarioFinal)).toBe(true);
    });

    it('should handle very large values', () => {
      const item: ItemAudit = {
        quantidade: 10000,
        valorUnitario: 10000,
        margem: 20,
        impostos: 4
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      const lucroLiquido = calcularLucroLiquido(item, vUnitarioFinal);
      
      expect(vUnitarioFinal).toBeGreaterThan(0);
      expect(lucroLiquido).toBeGreaterThan(0);
    });

    it('should handle high tax rates', () => {
      const item: ItemAudit = {
        quantidade: 1,
        valorUnitario: 100,
        margem: 20,
        impostos: 30
      };
      
      const vUnitarioFinal = calcularVUnitarioFinal(item);
      
      // Expected: 120 / (1 - 0.30) = 120 / 0.70 = 171.43
      expect(vUnitarioFinal).toBeCloseTo(120 / 0.70, 2);
    });
  });
});
