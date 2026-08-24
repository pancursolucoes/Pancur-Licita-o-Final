import React, { useState } from "react";

export default function App() {
  const [licitacoes, setLicitacoes] = useState([
    { id: 1, orgao: "Prefeitura Municipal", objeto: "Aquisição de Materiais de Escritório", valor: "R$ 45.000,00", status: "Em Andamento" },
    { id: 2, orgao: "Secretaria de Saúde", objeto: "Fornecimento de Equipamentos Hospitalares", valor: "R$ 120.000,00", status: "Homologada" },
  ]);

  const [novoObjeto, setNovoObjeto] = useState("");
  const [novoOrgao, setNovoOrgao] = useState("");

  const adicionarLicitacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoObjeto || !novoOrgao) return;
    setLicitacoes([
      ...licitacoes,
      { id: Date.now(), orgao: novoOrgao, objeto: novoObjeto, valor: "R$ 30.000,00", status: "Cadastrada" }
    ]);
    setNovoObjeto("");
    setNovoOrgao("");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "900px", margin: "0 auto", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <header style={{ backgroundColor: "#1e3a8a", color: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Licitação Pro - Gestão de Processos</h1>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>Painel de Controle e Acompanhamento</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3>Total de Licitações</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#2563eb", margin: 0 }}>{licitacoes.length}</p>
        </div>
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3>Status do Sistema</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#16a34a", margin: 0 }}>Online 🚀</p>
        </div>
      </div>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <h3>Cadastrar Nova Licitação</h3>
        <form onSubmit={adicionarLicitacao} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input 
            type="text" 
            placeholder="Nome do Órgão" 
            value={novoOrgao} 
            onChange={(e) => setNovoOrgao(e.target.value)}
            style={{ padding: "10px", flex: 1, borderRadius: "4px", border: "1px solid #d1d5db" }}
          />
          <input 
            type="text" 
            placeholder="Objeto da Licitação" 
            value={novoObjeto} 
            onChange={(e) => setNovoObjeto(e.target.value)}
            style={{ padding: "10px", flex: 2, borderRadius: "4px", border: "1px solid #d1d5db" }}
          />
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Adicionar
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3>Processos Ativos</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
              <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Órgão</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Objeto</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Valor Estimado</th>
              <th style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {licitacoes.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>{item.orgao}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>{item.objeto}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>{item.valor}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ padding: "4px 8px", borderRadius: "4px", backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "12px" }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
