import { Agent, Quote, Client, Package, InsurancePlan, PACKAGE_TEMPLATES } from './types';

// Types for ultra-compressed quote data
interface UltraCompressedQuote {
  c: [string, string, string, string, string, string?]; // [name, zip, dob, email, phone, additionalInfo?]
  p: number[]; // Package template indices (0=Bronze, 1=Silver, 2=Gold, 3=Healthy Bundle)
  m?: { [key: string]: Partial<InsurancePlan> }; // Modified plan details
  t: number; // Timestamp
}

const STORAGE_KEYS = {
  AGENTS: 'insurance_agents',
  QUOTES: 'insurance_quotes',
  CURRENT_AGENT: 'current_agent',
} as const;

// -------------------- Agent Management --------------------
export const saveAgent = (agent: Agent): void => {
  const agents = getAgents();
  const existingIndex = agents.findIndex(a => a.id === agent.id);
  if (existingIndex >= 0) agents[existingIndex] = agent;
  else agents.push(agent);
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
};

export const getAgents = (): Agent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.AGENTS);
  return stored ? JSON.parse(stored) : [];
};

export const getAgentByEmail = (email: string): Agent | null => {
  const agents = getAgents();
  return agents.find(agent => agent.email === email) || null;
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
  const existingIndex = quotes.findIndex(q => q.id === quote.id);
  if (existingIndex >= 0) quotes[existingIndex] = quote;
  else quotes.push(quote);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
};

export const getQuotes = (agentId?: string): Quote[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.QUOTES);
  const allQuotes: Quote[] = stored ? JSON.parse(stored) : [];
  return agentId ? allQuotes.filter(q => q.agentId === agentId) : allQuotes;
};

export const getQuoteById = (id: string): Quote | null => {
  const quotes = getQuotes();
  return quotes.find(q => q.id === id) || null;
};

export const deleteQuote = (id: string): void => {
  const quotes = getQuotes();
  const filtered = quotes.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filtered));
};

// -------------------- Utility --------------------
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// -------------------- Ultra-Compact Compression --------------------
const ultraCompressAndEncode = (data: { client: Client; packages: Package[]; createdAt: string }): string => {
  try {
    const packageMap: { [key: string]: number } = {
      Bronze: 0,
      Silver: 1,
      Gold: 2,
      'Healthy Bundle': 3,
    };

    const packageIndices = data.packages.map(pkg => packageMap[pkg.name]);
    const modifications: { [key: string]: Partial<InsurancePlan> } = {};

    data.packages.forEach((pkg, pkgIndex) => {
      const template = PACKAGE_TEMPLATES.find(t => t.name === pkg.name);
      if (template) {
        pkg.plans.forEach((plan, planIndex) => {
          const defaultPlan = template.defaultPlans[planIndex];
          if (!defaultPlan) return;

          const modKey = `${pkgIndex}_${planIndex}`;
          const planDiff: Partial<InsurancePlan> = {};

          const fields: (keyof InsurancePlan)[] = [
  'monthlyPremium', 'deductible', 'copay', 'primaryCareCopay',
  'specialistCopay', 'genericDrugCopay', 'outOfPocketMax',
  'coverage', 'details', 'effectiveDate', 'brochureUrl'
];

fields.forEach((key) => {
  const planValue = plan[key];
  const defaultValue = defaultPlan[key];
  if (planValue !== defaultValue) {
    planDiff[key] = planValue;
  }
});

          if (Object.keys(planDiff).length > 0) modifications[modKey] = planDiff;
        });
      }
    });

    const ultraCompressed: UltraCompressedQuote = {
      c: [
        data.client.name,
        data.client.zipCode,
        data.client.dateOfBirth,
        data.client.email,
        data.client.phone,
        data.client.additionalInfo || undefined,
      ].filter(x => x !== undefined) as [string, string, string, string, string, string?],
      p: packageIndices,
      ...(Object.keys(modifications).length > 0 && { m: modifications }),
      t: new Date(data.createdAt).getTime(),
    };

    const jsonString = JSON.stringify(ultraCompressed);
    return btoa(unescape(encodeURIComponent(jsonString))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('Error in ultraCompressAndEncode:', error);
    throw error;
  }
};

const ultraDecodeAndDecompress = (encoded: string): { client: Client; packages: Package[]; createdAt: string } => {
  try {
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
      additionalInfo: compressed.c[5],
    };

    const packageNames = ['Bronze', 'Silver', 'Gold', 'Healthy Bundle'] as const;
    const packages: Package[] = compressed.p.map((index, pkgIndex) => {
      const templateName = packageNames[index];
      const template = PACKAGE_TEMPLATES.find(t => t.name === templateName);
      if (!template) throw new Error(`Template not found for index: ${index}`);

      const plans = template.defaultPlans.map((defaultPlan, planIndex) => {
        const modKey = `${pkgIndex}_${planIndex}`;
        const customData = compressed.m?.[modKey] ?? {};

        let effectiveDate: string;
        if (customData.effectiveDate) {
          effectiveDate = customData.effectiveDate;
        } else {
          const today = new Date();
          if (defaultPlan.type === 'health') {
            const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            effectiveDate = firstOfNextMonth.toISOString();
          } else {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            effectiveDate = tomorrow.toISOString();
          }
        }

        return {
          id: generateId(),
          type: defaultPlan.type,
          name: defaultPlan.name,
          provider: defaultPlan.provider,
          monthlyPremium: customData.monthlyPremium ?? defaultPlan.monthlyPremium,
          deductible: customData.deductible ?? defaultPlan.deductible,
          copay: customData.copay ?? defaultPlan.copay,
          primaryCareCopay: customData.primaryCareCopay ?? defaultPlan.primaryCareCopay,
          specialistCopay: customData.specialistCopay ?? defaultPlan.specialistCopay,
          genericDrugCopay: customData.genericDrugCopay ?? defaultPlan.genericDrugCopay,
          outOfPocketMax: customData.outOfPocketMax ?? defaultPlan.outOfPocketMax,
          coverage: customData.coverage ?? defaultPlan.coverage,
          details: customData.details ?? defaultPlan.details,
          effectiveDate,
          brochureUrl: customData.brochureUrl ?? defaultPlan.brochureUrl,
        };
      });

      const totalMonthlyPremium = plans.reduce((sum, p) => sum + (p.monthlyPremium ?? 0), 0);

      return {
        id: generateId(),
        name: templateName,
        description: template.description,
        plans,
        totalMonthlyPremium,
      };
    });

    return { client, packages, createdAt: new Date(compressed.t).toISOString() };
  } catch (error) {
    console.error('Error in ultraDecodeAndDecompress:', error);
    throw error;
  }
};

// -------------------- Legacy Decoding --------------------
interface CompressedClient { n: string; z: string; d: string; e: string; p: string; a: string; }
interface CompressedPlan { t: string; n: string; pr: string; mp: number; de: number; co: number; cv: string; dt: string; ed?: string; br?: string; }
interface CompressedPackage { n: string; d: string; t: number; pl: CompressedPlan[]; }
interface CompressedQuote { c: CompressedClient; p: CompressedPackage[]; t: string; }

const decodeAndDecompress = (encoded: string): { client: Client; packages: Package[]; createdAt: string } => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonString = decodeURIComponent(escape(atob(base64)));
    const compressed: CompressedQuote = JSON.parse(jsonString);

    const client: Client = {
      name: compressed.c.n,
      zipCode: compressed.c.z,
      dateOfBirth: compressed.c.d,
      email: compressed.c.e,
      phone: compressed.c.p,
      additionalInfo: compressed.c.a || undefined,
    };

    const validPackageNames: Package['name'][] = ['Bronze', 'Silver', 'Gold', 'Healthy Bundle'];

    const packages: Package[] = compressed.p.map(compPkg => {
      const pkgName: Package['name'] = validPackageNames.includes(compPkg.n as Package['name'])
        ? (compPkg.n as Package['name'])
        : 'Bronze';

      const plans = compPkg.pl.map(compPlan => ({
        id: generateId(),
        type: compPlan.t as InsurancePlan['type'],
        name: compPlan.n,
        provider: compPlan.pr,
        monthlyPremium: compPlan.mp,
        deductible: compPlan.de || undefined,
        copay: compPlan.co || undefined,
        coverage: compPlan.cv || undefined,
        details: compPlan.dt || undefined,
        effectiveDate: compPlan.ed || undefined,
        brochureUrl: compPlan.br || undefined,
      }));

      return {
        id: generateId(),
        name: pkgName,
        description: compPkg.d,
        plans,
        totalMonthlyPremium: compPkg.t,
      };
    });

    return { client, packages, createdAt: compressed.t };
  } catch (error) {
    console.error('Error in decodeAndDecompress:', error);
    throw error;
  }
};

// -------------------- Exports --------------------
export const decodeQuoteFromUrl = (encodedData: string): { client: Client; packages: Package[]; createdAt: string } | null => {
  if (encodedData === 'error') return null;
  try { return ultraDecodeAndDecompress(encodedData); }
  catch { 
    try { return decodeAndDecompress(encodedData); } 
    catch { return null; }
  }
};

export const getQuoteDataByShortId = decodeQuoteFromUrl;

export const generateShareableLink = (quote: Quote): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  try {
    const quoteData = { client: quote.client, packages: quote.packages, createdAt: quote.createdAt };
    const encoded = ultraCompressAndEncode(quoteData);
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

  const emailBody = encodeURIComponent(`Dear ${quote.client.name},

Thank you for your interest in our insurance services. I've prepared a personalized quote for you with ${quote.packages.length} coverage option${quote.packages.length > 1 ? 's' : ''}.

Quote Summary:
${quote.packages.map((pkg, index) => `
Package ${index + 1}: ${pkg.name}
Monthly Premium: $${pkg.totalMonthlyPremium.toLocaleString()}
Plans Included: ${pkg.plans.map(plan => plan.name).join(', ')}
`).join('')}

Total Monthly Premium: $${totalMonthly.toLocaleString()}
Total Annual Premium: $${totalAnnual.toLocaleString()}

To view your complete quote with detailed plan information, please click the link below:
${shareableLink}

This link contains your personalized quote and can be accessed from any device. If you have any questions or would like to discuss your coverage options, please don't hesitate to contact me.

Best regards,
Your Insurance Agent
Phone: (555) 123-INSURANCE
Email: quotes@insurance.com

This quote is valid for 30 days from the date generated.`);

  return `mailto:${quote.client.email}?subject=${subject}&body=${emailBody}`;
};

export const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.AGENTS)) localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify([]));
  if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
};
