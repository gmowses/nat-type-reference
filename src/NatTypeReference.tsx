import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Shield } from 'lucide-react'

const translations = {
  en: {
    title: 'NAT Type Reference',
    subtitle: 'Interactive reference for NAT types, visual diagrams, comparison table and CGNAT implications.',
    types: 'NAT Types',
    comparison: 'Comparison Table',
    cgnat: 'CGNAT Implications',
    builtBy: 'Built by',
    selectType: 'Select a NAT type to view details and diagram.',
    feature: 'Feature',
    fullCone: 'Full Cone',
    restrictedCone: 'Restricted Cone',
    portRestricted: 'Port Restricted',
    symmetric: 'Symmetric',
    externalPort: 'External port',
    sameForAll: 'Same for all',
    samePerDest: 'Same per dest.',
    differentPerDest: 'Diff. per dest.',
    inboundFilter: 'Inbound filter',
    none: 'None',
    srcIp: 'Source IP',
    srcIpPort: 'Source IP+Port',
    p2pCompat: 'P2P compatible',
    yes: 'Yes',
    partial: 'Partial',
    no: 'No',
    gameCompat: 'Game / VoIP',
    excellent: 'Excellent',
    good: 'Good',
    poor: 'Poor',
    cgnatTitle: 'CGNAT (Carrier-Grade NAT)',
    cgnatDesc: 'CGNAT (RFC 6598, 100.64.0.0/10) places a second NAT in the ISP network before your home router.',
    cgnatPoints: [
      'Ports are shared between multiple subscribers — inbound connections are impossible without port forwarding at the carrier level.',
      'P2P and direct game connections (Open/Full Cone) are effectively broken — most games degrade to Strict/Symmetric.',
      'IPv6 adoption is the long-term solution. Dual-stack or 464XLAT (CLAT) can mitigate some issues.',
      'DS-Lite tunnels customer IPv4 in IPv6, but source port translation still applies.',
      'Some ISPs offer static IPv4 or port-block allocation as a paid add-on to work around CGNAT.',
    ],
  },
  pt: {
    title: 'Referencia de Tipos de NAT',
    subtitle: 'Referencia interativa de tipos de NAT, diagramas visuais, tabela comparativa e implicacoes do CGNAT.',
    types: 'Tipos de NAT',
    comparison: 'Tabela Comparativa',
    cgnat: 'Implicacoes do CGNAT',
    builtBy: 'Criado por',
    selectType: 'Selecione um tipo de NAT para ver detalhes e diagrama.',
    feature: 'Caracteristica',
    fullCone: 'Full Cone',
    restrictedCone: 'Restricted Cone',
    portRestricted: 'Port Restricted',
    symmetric: 'Symmetric',
    externalPort: 'Porta externa',
    sameForAll: 'Mesma p/ todos',
    samePerDest: 'Mesma p/ destino',
    differentPerDest: 'Diferente p/ dest.',
    inboundFilter: 'Filtro de entrada',
    none: 'Nenhum',
    srcIp: 'IP de origem',
    srcIpPort: 'IP+Porta de origem',
    p2pCompat: 'Compativel P2P',
    yes: 'Sim',
    partial: 'Parcial',
    no: 'Nao',
    gameCompat: 'Jogos / VoIP',
    excellent: 'Excelente',
    good: 'Bom',
    poor: 'Ruim',
    cgnatTitle: 'CGNAT (Carrier-Grade NAT)',
    cgnatDesc: 'O CGNAT (RFC 6598, 100.64.0.0/10) coloca um segundo NAT na rede do ISP antes do seu roteador domestico.',
    cgnatPoints: [
      'Portas sao compartilhadas entre varios assinantes — conexoes de entrada sao impossiveis sem encaminhamento de porta no nivel da operadora.',
      'Conexoes P2P e de jogos diretos (Open/Full Cone) sao efetivamente quebradas — a maioria dos jogos degrada para Strict/Symmetric.',
      'A adocao de IPv6 e a solucao de longo prazo. Dual-stack ou 464XLAT (CLAT) podem mitigar alguns problemas.',
      'DS-Lite tunela IPv4 do cliente em IPv6, mas a traducao de porta de origem ainda se aplica.',
      'Alguns ISPs oferecem IPv4 estatico ou alocacao de bloco de portas como complemento pago para contornar o CGNAT.',
    ],
  },
} as const

type Lang = keyof typeof translations

interface NatType {
  id: string
  name: string
  rfc?: string
  color: string
  accentColor: string
  description: string
  externalPort: string
  inboundFilter: string
  p2p: string
  game: string
  whenToUse: string
}

const NAT_TYPES = (t: (typeof translations)[Lang]): NatType[] => [
  {
    id: 'full-cone',
    name: t.fullCone,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    accentColor: '#22c55e',
    description: 'Once an internal host opens a mapping, any external host can send packets to that mapped external port. The most permissive NAT type.',
    externalPort: t.sameForAll,
    inboundFilter: t.none,
    p2p: t.yes,
    game: t.excellent,
    whenToUse: 'Home routers when maximum compatibility is needed. Gaming, VoIP, WebRTC.',
  },
  {
    id: 'restricted-cone',
    name: t.restrictedCone,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    accentColor: '#3b82f6',
    description: 'Like Full Cone, but the NAT only allows inbound packets from external IPs that the internal host has previously sent to. Port is not considered.',
    externalPort: t.samePerDest,
    inboundFilter: t.srcIp,
    p2p: t.partial,
    game: t.good,
    whenToUse: 'Slightly more secure than Full Cone. Common in home routers with basic firewall rules.',
  },
  {
    id: 'port-restricted',
    name: t.portRestricted,
    rfc: 'RFC 3489',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    accentColor: '#f59e0b',
    description: 'Like Restricted Cone, but the filter also checks the source port. Both source IP and source port must match a prior outgoing connection.',
    externalPort: t.samePerDest,
    inboundFilter: t.srcIpPort,
    p2p: t.partial,
    game: t.good,
    whenToUse: 'Most common in enterprise firewalls. Balances security and connectivity.',
  },
  {
    id: 'symmetric',
    name: t.symmetric,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    accentColor: '#ef4444',
    description: 'Each outgoing connection to a different (IP, port) destination gets a different external port. Inbound only allowed from the exact destination that was contacted.',
    externalPort: t.differentPerDest,
    inboundFilter: t.srcIpPort,
    p2p: t.no,
    game: t.poor,
    whenToUse: 'High-security environments, CGNAT, carrier infrastructure. Breaks most P2P and hole-punching.',
  },
]

function NatDiagram({ natId, accentColor }: { natId: string; accentColor: string }) {
  const isSymmetric = natId === 'symmetric'
  const isFullCone = natId === 'full-cone'
  const isRestricted = natId === 'restricted-cone'

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 p-4 space-y-3">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Diagram</p>
      <div className="flex items-center justify-between gap-2 text-xs font-mono">
        {/* Internal */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-10 rounded-lg border-2 flex items-center justify-center text-[10px] font-semibold" style={{ borderColor: accentColor, color: accentColor }}>
            10.0.0.1
          </div>
          <span className="text-zinc-400">Client</span>
        </div>
        {/* Arrow out */}
        <div className="flex flex-col items-center flex-1">
          <div className="h-px flex-1 w-full" style={{ backgroundColor: accentColor }} />
          <span className="text-[9px] text-zinc-400">:5000</span>
        </div>
        {/* NAT */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-10 rounded-lg border-2 border-zinc-400 dark:border-zinc-600 flex items-center justify-center text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
            NAT
          </div>
          <span className="text-[9px] text-zinc-400">1.2.3.4</span>
        </div>
        {/* External arrows */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-1">
            <div className="h-px flex-1" style={{ backgroundColor: accentColor }} />
            <span className="text-[9px] text-zinc-400">:4000</span>
            <div className="w-8 h-6 rounded border flex items-center justify-center text-[8px] font-semibold" style={{ borderColor: accentColor, color: accentColor }}>A</div>
          </div>
          {isSymmetric ? (
            <div className="flex items-center gap-1">
              <div className="h-px flex-1 border-t border-dashed border-zinc-400" />
              <span className="text-[9px] text-zinc-400">:4001</span>
              <div className="w-8 h-6 rounded border border-dashed border-zinc-400 flex items-center justify-center text-[8px] text-zinc-400">B</div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="h-px flex-1" style={{ backgroundColor: isFullCone ? accentColor : '#a1a1aa' }} />
              <span className="text-[9px] text-zinc-400">:4000</span>
              <div className="w-8 h-6 rounded border flex items-center justify-center text-[8px]" style={{ borderColor: isFullCone ? accentColor : '#a1a1aa', color: isFullCone ? accentColor : '#a1a1aa' }}>B</div>
            </div>
          )}
          {(isRestricted || natId === 'port-restricted') && (
            <div className="text-[9px] text-amber-500 mt-0.5">* filter by src IP{natId === 'port-restricted' ? '+port' : ''}</div>
          )}
        </div>
      </div>
      {isSymmetric && <p className="text-[10px] text-red-500">Different external port per destination — hole-punching fails</p>}
      {isFullCone && <p className="text-[10px] text-green-500">Any external host can reach :4000 — most permissive</p>}
    </div>
  )
}

export default function NatTypeReference() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState<'types' | 'comparison' | 'cgnat'>('types')

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const natTypes = NAT_TYPES(t)
  const selectedType = natTypes.find(n => n.id === selected)

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-semibold">NAT Type Reference</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/nat-type-reference" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 border-b border-zinc-200 dark:border-zinc-800">
            {([['types', t.types], ['comparison', t.comparison], ['cgnat', t.cgnat]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'types' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                {natTypes.map(n => (
                  <button key={n.id} onClick={() => setSelected(n.id === selected ? null : n.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${selected === n.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{n.name}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${n.color}`}>{n.game}</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{n.description}</p>
                  </button>
                ))}
              </div>
              <div>
                {selectedType ? (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{selectedType.name}</span>
                      {selectedType.rfc && <span className="text-xs text-zinc-400">{selectedType.rfc}</span>}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedType.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: t.externalPort, value: selectedType.externalPort },
                        { label: t.inboundFilter, value: selectedType.inboundFilter },
                        { label: t.p2pCompat, value: selectedType.p2p },
                        { label: t.gameCompat, value: selectedType.game },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">{label}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                    <NatDiagram natId={selectedType.id} accentColor={selectedType.accentColor} />
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/30 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">When to use: </span>{selectedType.whenToUse}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center text-zinc-400 text-sm">{t.selectType}</div>
                )}
              </div>
            </div>
          )}

          {tab === 'comparison' && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">{t.feature}</th>
                      {natTypes.map(n => <th key={n.id} className="px-4 py-3 text-left font-medium text-zinc-500">{n.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: t.externalPort, key: 'externalPort' as const },
                      { label: t.inboundFilter, key: 'inboundFilter' as const },
                      { label: t.p2pCompat, key: 'p2p' as const },
                      { label: t.gameCompat, key: 'game' as const },
                    ].map(({ label, key }) => (
                      <tr key={label} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">{label}</td>
                        {natTypes.map(n => (
                          <td key={n.id} className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${n.color}`}>{n[key]}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'cgnat' && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <h2 className="font-bold text-lg">{t.cgnatTitle}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.cgnatDesc}</p>
              <ul className="space-y-3">
                {t.cgnatPoints.map((pt, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm">
                <span className="font-semibold text-amber-700 dark:text-amber-300">RFC 6598</span>
                <span className="text-zinc-600 dark:text-zinc-400"> — Shared Address Space: 100.64.0.0/10 is reserved for CGNAT. Do not route on the public internet.</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-amber-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
