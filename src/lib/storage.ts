import { Agent, Quote, Client, Package, InsurancePlan, PACKAGE_TEMPLATES } from './types';
import pako from 'pako';

interface UltraCompressedQuote {
  c: [string, string, string, string, string, string?];
  p: number[];
  m?: { [key: string]: Partial<InsurancePlan> };
  t: number;
}

const STORAGE_KEYS = {
  AGENTS: 'insurance_agents',
  QUOTES: 'insurance_quotes',
  CURRENT_AGENT: 'current_agent',
} as const;

// -------------------- Agent Management --------------------
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

// -------------------- Quote Management --------------------
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
  const quotes = getQuotes().filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
};

// -------------------- Utility --------------------
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// -------------------- Ultra-Compact Compression --------------------
const ultraCompressAndEncode = (data: { client: Client; packages: Package[]; createdAt: string }): string => {
  try {
    const packageMap: Record<string, number> = {
      Bronze: 0,
      Silver: 1,
      Gold: 2,
      'Healthy Bundle': 3,
      HealthShare: 4,
    };

    const packageIndices = data.packages.map(pkg => packageMap[pkg.name] ?? -1).filter(i => i >= 0);
    const modifications: { [key: string]: Partial<InsurancePlan> } = {};

    data.packages.forEach((pkg, pkgIndex) => {
      const template = PACKAGE_TEMPLATES.find(t => t.name === pkg.name);
      if (!template) return;

      pkg.plans.forEach((plan, planIndex) => {
        const defaultPlan = template.defaultPlans[planIndex];
        if (!defaultPlan) return;

        const modKey = `${pkgIndex}_${planIndex}`;
        // FIX: Ensured planDiff is typed as Partial<InsurancePlan>
        const planDiff: Partial<InsurancePlan> = {}; 

        const fields: (keyof Omit<InsurancePlan, 'id'>)[] = [
          'monthlyPremium', 'deductible', 'coinsurance',
          'primaryCareCopay', 'specialistCopay', 'genericDrugCopay', 'outOfPocketMax',
          'coverage', 'details', 'effectiveDate', 'brochureUrl'
        ];

        fields.forEach(key => {
          if (plan[key] !== defaultPlan[key]) {
            // FIX: Applied a final, more explicit type assertion on the assigned value.
            // This forces TypeScript to accept the assignment, resolving the "assignable to undefined" error.
            (planDiff[key as keyof Partial<InsurancePlan>] as any) = plan[key];
          }
        });

        if (Object.keys(planDiff).length > 0) modifications[modKey] = planDiff;
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
      ],
      p: packageIndices,
      ...(Object.keys(modifications).length > 0 ? { m: modifications } : {}),
      t: new Date(data.createdAt).getTime()
    };

    const compressed = pako.gzip(JSON.stringify(ultraCompressed));
    return btoa(String.fromCharCode(...compressed))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (err) {
    console.error('Compression Error:', err);
    throw err;
  }
};

// -------------------- Ultra-Compact Decompression --------------------
const ultraDecodeAndDecompress = (encoded: string): { client: Client; packages: Package[]; createdAt: string } => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Ensure padding is correct for base64 decoding
    while (base64.length % 4) base64 += '='; 

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const decompressed = pako.ungzip(bytes, { to: 'string' });
    const compressed: UltraCompressedQuote = JSON.parse(decompressed);

    // Optional: Add a check for minimal data integrity before proceeding
    if (compressed.c.length < 5 || compressed.p.length === 0) {
        throw new Error('Incomplete quote data.');
    }

    const client: Client = {
      name: compressed.c[0],
      zipCode: compressed.c[1],
      dateOfBirth: compressed.c[2],
      email: compressed.c[3],
      phone: compressed.c[4],
      additionalInfo: compressed.c[5]
    };

    const packageNames = ['Bronze', 'Silver', 'Gold', 'Healthy Bundle', 'HealthShare'] as const;

    const packages: Package[] = compressed.p.map((pkgIndex, idx) => {
      const templateName = packageNames[pkgIndex];
      const template = PACKAGE_TEMPLATES.find(t => t.name === templateName);
      if (!template) throw new Error(`Template not found for index ${pkgIndex}`);

      const plans = template.defaultPlans.map((plan, planIndex) => {
        const key = `${idx}_${planIndex}`;
        const customData = compressed.m?.[key] ?? {};
        const today = new Date();
        const effectiveDate = customData.effectiveDate || new Date(today.getFullYear(), today.getMonth() + (plan.type === 'health' ? 1 : 0), plan.type === 'health' ? 1 : today.getDate() + 1).toISOString();

        return { ...plan, ...customData, effectiveDate, id: generateId() };
      });

      const totalMonthlyPremium = plans.reduce((sum, p) => sum + (p.monthlyPremium || 0), 0);

      return {
        id: generateId(),
        name: templateName,
        description: template.description,
        plans,
        totalMonthlyPremium
      };
    });

    return { client, packages, createdAt: new Date(compressed.t).toISOString() };
  } catch (err) {
    console.error('Decompression Error:', err);
    throw err;
  }
};

// -------------------- Exports --------------------
export const decodeQuoteFromUrl = (encoded: string): { client: Client; packages: Package[]; createdAt: string } | null => {
  if (encoded === 'error') return null;
  try { return ultraDecodeAndDecompress(encoded); }
  catch (err) { console.error('Decoding failed:', err); return null; }
};

export const getQuoteDataByShortId = decodeQuoteFromUrl;

export const generateShareableLink = (quote: Quote): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  try {
    const encoded = ultraCompressAndEncode({ client: quote.client, packages: quote.packages, createdAt: quote.createdAt });
    return `${baseUrl}/quote/${encoded}`; 
  } catch {
    return `${baseUrl}/quote/error`;
  }
};

export const generateEmailToClient = (quote: Quote): string => {
  const subject = encodeURIComponent(`Your Insurance Quote - ${quote.client.name}`);
  const shareableLink = generateShareableLink(quote);
  const totalMonthly = quote.packages.reduce((sum, pkg) => sum + pkg.totalMonthlyPremium, 0);
  const totalAnnual = totalMonthly * 12;

  const body = encodeURIComponent(`Dear ${quote.client.name},

Thank you for your interest. I've prepared a personalized quote with ${quote.packages.length} coverage option${quote.packages.length > 1 ? 's' : ''}.

Quote Summary:
${quote.packages.map((pkg, i) => `Package ${i + 1}: ${pkg.name}
Monthly Premium: $${pkg.totalMonthlyPremium.toLocaleString()}
Plans Included: ${pkg.plans.map(p => p.name).join(', ')}`).join('\n\n')}

Total Monthly Premium: $${totalMonthly.toLocaleString()}
Total Annual Premium: $${totalAnnual.toLocaleString()}

View your complete quote:
${shareableLink}

This quote is valid for 30 days.

Best regards,
Your Insurance Agent
Phone: (555) 123-INSURANCE
Email: quotes@insurance.com`);

  return `mailto:${quote.client.email}?subject=${subject}&body=${body}`;
};

export const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.AGENTS)) localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
};
