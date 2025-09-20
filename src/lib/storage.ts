import { Agent, Quote, Client, Package, InsurancePlan, PACKAGE_TEMPLATES } from './types';

// Add optional out-of-pocket fields to InsurancePlan
export interface InsurancePlanWithExtras extends InsurancePlan {
  primaryCareOutOfPocket?: number;
  specialistOutOfPocket?: number;
  genericDrugOutOfPocket?: number;
}

// Ultra-compressed quote data
interface UltraCompressedQuote {
  c: [string, string, string, string, string, string?]; // [name, zip, dob, email, phone, additionalInfo?]
  p: number[]; // Package template indices
  m?: { [key: string]: number }; // modified premiums
  t: number; // timestamp
}

const STORAGE_KEYS = {
  AGENTS: 'insurance_agents',
  QUOTES: 'insurance_quotes',
  CURRENT_AGENT: 'current_agent',
} as const;

// Agent Management
export const saveAgent = (agent: Agent): void => {
  const agents = getAgents();
  const index = agents.findIndex(a => a.id === agent.id);
  if (index >= 0) agents[index] = agent;
  else agents.push(agent);
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
};

export const getAgents = (): Agent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.AGENTS);
  return stored ? JSON.parse(stored) : [];
};

export const getAgentByEmail = (email: string): Agent | null => {
  return getAgents().find(agent => agent.email === email) || null;
};

export const setCurrentAgent = (agent: Agent): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_AGENT, JSON.stringify(agent));
};

export const getCurrentAgent = (): Agent | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_AGENT);
  return stored ? JSON.parse(stored) : null;
};

export const clearCurrentAgent = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_AGENT);
};

// Quote Management
export const saveQuote = (quote: Quote): void => {
  const quotes = getQuotes();
  const index = quotes.findIndex(q => q.id === quote.id);
  if (index >= 0) quotes[index] = quote;
  else quotes.push(quote);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
};

export const getQuotes = (agentId?: string): Quote[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.QUOTES);
  const allQuotes: Quote[] = stored ? JSON.parse(stored) : [];
  return agentId ? allQuotes.filter(q => q.agentId === agentId) : allQuotes;
};

export const getQuoteById = (id: string): Quote | null => {
  return getQuotes().find(q => q.id === id) || null;
};

export const deleteQuote = (id: string): void => {
  const filtered = getQuotes().filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filtered));
};

// Utility
export const generateId = (): string => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// Ultra-compression
const ultraCompressAndEncode = (data: { client: Client; packages: Package[]; createdAt: string }): string => {
  const packageMap: { [key: string]: number } = {
    Bronze: 0, Silver: 1, Gold: 2, 'Healthy Bundle': 3
  };
  const packageIndices = data.packages.map(p => packageMap[p.name]);
  const modifications: { [key: string]: number } = {};

  data.packages.forEach((pkg, pkgIndex) => {
    const template = PACKAGE_TEMPLATES.find(t => t.name === pkg.name);
    if (!template) return;
    pkg.plans.forEach((plan, planIndex) => {
      const defaultPlan = template.defaultPlans[planIndex];
      if (defaultPlan && plan.monthlyPremium !== defaultPlan.monthlyPremium) {
        modifications[`${pkgIndex}_${planIndex}`] = plan.monthlyPremium;
      }
    });
  });

  const ultraCompressed: UltraCompressedQuote = {
    c: [
      data.client.name,
      data.client.zipCode,
      data.client.dateOfBirth,
      data.client.email,
      data.client.phone,
      data.client.additionalInfo || undefined
    ].filter(x => x !== undefined) as [string, string, string, string, string, string?],
    p: packageIndices,
    ...(Object.keys(modifications).length ? { m: modifications } : {}),
    t: new Date(data.createdAt).getTime()
  };

  const jsonString = JSON.stringify(ultraCompressed);
  return btoa(unescape(encodeURIComponent(jsonString))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const ultraDecodeAndDecompress = (encoded: string): { client: Client; packages: Package[]; createdAt: string } => {
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const jsonString = decodeURIComponent(escape(atob(base64)));
  const compressed: UltraCompressedQuote = JSON.parse(jsonString);

  const client: Client = {
    name: compressed.c[0],
    zipCode: compressed.c[1],
    dateOfBirth: compressed.c[2],
    email: compressed.c[3],
    phone: compressed.c[4],
    additionalInfo: compressed.c[5]
  };

  const packageNames: Package['name'][] = ['Bronze', 'Silver', 'Gold', 'Healthy Bundle'];
  const packages: Package[] = compressed.p.map((index, pkgIndex) => {
    const templateName = packageNames[index];
    const template = PACKAGE_TEMPLATES.find(t => t.name === templateName);
    if (!template) throw new Error(`Template not found: ${templateName}`);

    const plans: InsurancePlanWithExtras[] = template.defaultPlans.map((defaultPlan, planIndex) => {
      const modKey = `${pkgIndex}_${planIndex}`;
      const customPremium = compressed.m?.[modKey];
      return {
        id: generateId(),
        type: defaultPlan.type,
        name: defaultPlan.name,
        provider: defaultPlan.provider,
        monthlyPremium: customPremium ?? defaultPlan.monthlyPremium,
        deductible: defaultPlan.deductible,
        copay: defaultPlan.copay,
        coverage: defaultPlan.coverage,
        details: defaultPlan.details,
        primaryCareOutOfPocket: defaultPlan.primaryCareOutOfPocket,
        specialistOutOfPocket: defaultPlan.specialistOutOfPocket,
        genericDrugOutOfPocket: defaultPlan.genericDrugOutOfPocket
      };
    });

    const totalMonthlyPremium = plans.reduce((sum, p) => sum + p.monthlyPremium, 0);
    return { id: generateId(), name: templateName, description: template.description, plans, totalMonthlyPremium };
  });

  return { client, packages, createdAt: new Date(compressed.t).toISOString() };
};

// Shareable link
export const generateShareableLink = (quote: Quote) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  try {
    const data = { client: quote.client, packages: quote.packages, createdAt: quote.createdAt };
    const encoded = ultraCompressAndEncode(data);
    return `${baseUrl}/quote/${encoded}`;
  } catch {
    return `${baseUrl}/quote/error`;
  }
};

export const decodeQuoteFromUrl = (encoded: string) => {
  if (encoded === 'error') return null;
  try { return ultraDecodeAndDecompress(encoded); } catch { return null; }
};

// Initialize storage
export const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.AGENTS)) localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
};
