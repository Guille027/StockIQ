import type { Company } from "@stockiq/shared-types";

/**
 * The entire investable universe of the app: large-cap, liquid, publicly
 * traded EQUITIES only. No ETFs, crypto, forex, commodities, options, CFDs,
 * futures, or small/illiquid names. Every market-data, scanner, and AI query
 * in the backend MUST filter against this list -- it is the single source
 * of truth for "what this app is allowed to talk about."
 *
 * Composition: S&P 100 + Nasdaq-100 overlap + Dow Jones Industrial Average +
 * a curated set of the largest, most liquid European blue chips.
 */
export const UNIVERSE: Company[] = [
  // --- US: Technology ---
  co("AAPL", "Apple Inc.", "Technology", "Consumer Electronics", ["SP100", "NASDAQ100", "DOWJONES"]),
  co("MSFT", "Microsoft Corporation", "Technology", "Software - Infrastructure", ["SP100", "NASDAQ100", "DOWJONES"]),
  co("NVDA", "NVIDIA Corporation", "Technology", "Semiconductors", ["SP100", "NASDAQ100"]),
  co("GOOGL", "Alphabet Inc. (Class A)", "Technology", "Internet Content & Information", ["SP100", "NASDAQ100"]),
  co("GOOG", "Alphabet Inc. (Class C)", "Technology", "Internet Content & Information", ["SP100", "NASDAQ100"]),
  co("META", "Meta Platforms, Inc.", "Technology", "Internet Content & Information", ["SP100", "NASDAQ100"]),
  co("AVGO", "Broadcom Inc.", "Technology", "Semiconductors", ["SP100", "NASDAQ100"]),
  co("ORCL", "Oracle Corporation", "Technology", "Software - Infrastructure", ["SP100"]),
  co("CRM", "Salesforce, Inc.", "Technology", "Software - Application", ["SP100", "DOWJONES"]),
  co("ADBE", "Adobe Inc.", "Technology", "Software - Application", ["SP100", "NASDAQ100"]),
  co("CSCO", "Cisco Systems, Inc.", "Technology", "Communication Equipment", ["SP100", "NASDAQ100"]),
  co("ACN", "Accenture plc", "Technology", "Information Technology Services", ["SP100"]),
  co("AMD", "Advanced Micro Devices, Inc.", "Technology", "Semiconductors", ["SP100", "NASDAQ100"]),
  co("INTC", "Intel Corporation", "Technology", "Semiconductors", ["SP100", "NASDAQ100"]),
  co("IBM", "International Business Machines", "Technology", "Information Technology Services", ["SP100", "DOWJONES"]),
  co("TXN", "Texas Instruments Incorporated", "Technology", "Semiconductors", ["SP100", "NASDAQ100"]),
  co("QCOM", "QUALCOMM Incorporated", "Technology", "Semiconductors", ["SP100", "NASDAQ100"]),
  co("INTU", "Intuit Inc.", "Technology", "Software - Application", ["SP100", "NASDAQ100"]),
  co("NOW", "ServiceNow, Inc.", "Technology", "Software - Application", ["SP100", "NASDAQ100"]),
  co("AMAT", "Applied Materials, Inc.", "Technology", "Semiconductor Equipment", ["NASDAQ100"]),
  co("MU", "Micron Technology, Inc.", "Technology", "Semiconductors", ["NASDAQ100"]),
  co("ADI", "Analog Devices, Inc.", "Technology", "Semiconductors", ["NASDAQ100"]),
  co("LRCX", "Lam Research Corporation", "Technology", "Semiconductor Equipment", ["NASDAQ100"]),
  co("KLAC", "KLA Corporation", "Technology", "Semiconductor Equipment", ["NASDAQ100"]),
  co("PANW", "Palo Alto Networks, Inc.", "Technology", "Software - Infrastructure", ["NASDAQ100"]),
  co("SNPS", "Synopsys, Inc.", "Technology", "Software - Application", ["NASDAQ100"]),
  co("CDNS", "Cadence Design Systems, Inc.", "Technology", "Software - Application", ["NASDAQ100"]),
  co("ANET", "Arista Networks, Inc.", "Technology", "Communication Equipment", ["NASDAQ100"]),
  co("APH", "Amphenol Corporation", "Technology", "Electronic Components", ["SP100"]),

  // --- US: Communication Services ---
  co("NFLX", "Netflix, Inc.", "Communication Services", "Entertainment", ["SP100", "NASDAQ100"]),
  co("DIS", "The Walt Disney Company", "Communication Services", "Entertainment", ["SP100", "DOWJONES"]),
  co("CMCSA", "Comcast Corporation", "Communication Services", "Telecom Services", ["SP100", "NASDAQ100"]),
  co("T", "AT&T Inc.", "Communication Services", "Telecom Services", ["SP100"]),
  co("VZ", "Verizon Communications Inc.", "Communication Services", "Telecom Services", ["SP100", "DOWJONES"]),
  co("TMUS", "T-Mobile US, Inc.", "Communication Services", "Telecom Services", ["NASDAQ100"]),
  co("CHTR", "Charter Communications, Inc.", "Communication Services", "Telecom Services", ["NASDAQ100"]),

  // --- US: Consumer Discretionary ---
  co("TSLA", "Tesla, Inc.", "Consumer Discretionary", "Auto Manufacturers", ["SP100", "NASDAQ100"]),
  co("HD", "The Home Depot, Inc.", "Consumer Discretionary", "Home Improvement Retail", ["SP100", "DOWJONES"]),
  co("MCD", "McDonald's Corporation", "Consumer Discretionary", "Restaurants", ["SP100", "DOWJONES"]),
  co("NKE", "NIKE, Inc.", "Consumer Discretionary", "Footwear & Accessories", ["SP100", "DOWJONES"]),
  co("LOW", "Lowe's Companies, Inc.", "Consumer Discretionary", "Home Improvement Retail", ["SP100"]),
  co("SBUX", "Starbucks Corporation", "Consumer Discretionary", "Restaurants", ["SP100", "NASDAQ100"]),
  co("BKNG", "Booking Holdings Inc.", "Consumer Discretionary", "Travel Services", ["SP100", "NASDAQ100"]),
  co("TJX", "The TJX Companies, Inc.", "Consumer Discretionary", "Apparel Retail", ["SP100"]),
  co("MAR", "Marriott International, Inc.", "Consumer Discretionary", "Lodging", ["NASDAQ100"]),
  co("GM", "General Motors Company", "Consumer Discretionary", "Auto Manufacturers", ["SP100"]),
  co("F", "Ford Motor Company", "Consumer Discretionary", "Auto Manufacturers", ["SP100"]),

  // --- US: Consumer Staples ---
  co("PG", "The Procter & Gamble Company", "Consumer Staples", "Household Products", ["SP100", "DOWJONES"]),
  co("KO", "The Coca-Cola Company", "Consumer Staples", "Beverages", ["SP100", "DOWJONES"]),
  co("PEP", "PepsiCo, Inc.", "Consumer Staples", "Beverages", ["SP100", "NASDAQ100"]),
  co("WMT", "Walmart Inc.", "Consumer Staples", "Discount Stores", ["SP100", "DOWJONES"]),
  co("COST", "Costco Wholesale Corporation", "Consumer Staples", "Discount Stores", ["SP100", "NASDAQ100"]),
  co("PM", "Philip Morris International Inc.", "Consumer Staples", "Tobacco", ["SP100"]),
  co("MO", "Altria Group, Inc.", "Consumer Staples", "Tobacco", ["SP100"]),
  co("MDLZ", "Mondelez International, Inc.", "Consumer Staples", "Confectioners", ["SP100", "NASDAQ100"]),
  co("CL", "Colgate-Palmolive Company", "Consumer Staples", "Household Products", ["SP100"]),
  co("KMB", "Kimberly-Clark Corporation", "Consumer Staples", "Household Products", ["SP100"]),
  co("TGT", "Target Corporation", "Consumer Staples", "Discount Stores", ["SP100"]),

  // --- US: Healthcare ---
  co("UNH", "UnitedHealth Group Incorporated", "Healthcare", "Healthcare Plans", ["SP100", "DOWJONES"]),
  co("JNJ", "Johnson & Johnson", "Healthcare", "Drug Manufacturers", ["SP100", "DOWJONES"]),
  co("LLY", "Eli Lilly and Company", "Healthcare", "Drug Manufacturers", ["SP100"]),
  co("ABBV", "AbbVie Inc.", "Healthcare", "Drug Manufacturers", ["SP100"]),
  co("MRK", "Merck & Co., Inc.", "Healthcare", "Drug Manufacturers", ["SP100", "DOWJONES"]),
  co("PFE", "Pfizer Inc.", "Healthcare", "Drug Manufacturers", ["SP100"]),
  co("TMO", "Thermo Fisher Scientific Inc.", "Healthcare", "Diagnostics & Research", ["SP100"]),
  co("ABT", "Abbott Laboratories", "Healthcare", "Medical Devices", ["SP100"]),
  co("DHR", "Danaher Corporation", "Healthcare", "Diagnostics & Research", ["SP100"]),
  co("BMY", "Bristol-Myers Squibb Company", "Healthcare", "Drug Manufacturers", ["SP100"]),
  co("AMGN", "Amgen Inc.", "Healthcare", "Drug Manufacturers", ["SP100", "NASDAQ100", "DOWJONES"]),
  co("GILD", "Gilead Sciences, Inc.", "Healthcare", "Drug Manufacturers", ["SP100", "NASDAQ100"]),
  co("ISRG", "Intuitive Surgical, Inc.", "Healthcare", "Medical Instruments", ["SP100", "NASDAQ100"]),
  co("VRTX", "Vertex Pharmaceuticals Incorporated", "Healthcare", "Biotechnology", ["SP100", "NASDAQ100"]),
  co("CVS", "CVS Health Corporation", "Healthcare", "Healthcare Plans", ["SP100"]),
  co("MDT", "Medtronic plc", "Healthcare", "Medical Devices", ["SP100"]),
  co("CI", "The Cigna Group", "Healthcare", "Healthcare Plans", ["SP100"]),
  co("ELV", "Elevance Health, Inc.", "Healthcare", "Healthcare Plans", ["SP100"]),
  co("REGN", "Regeneron Pharmaceuticals, Inc.", "Healthcare", "Biotechnology", ["SP100", "NASDAQ100"]),

  // --- US: Financials ---
  co("BRK.B", "Berkshire Hathaway Inc.", "Financials", "Insurance - Diversified", ["SP100"]),
  co("JPM", "JPMorgan Chase & Co.", "Financials", "Banks - Diversified", ["SP100", "DOWJONES"]),
  co("V", "Visa Inc.", "Financials", "Credit Services", ["SP100", "DOWJONES"]),
  co("MA", "Mastercard Incorporated", "Financials", "Credit Services", ["SP100"]),
  co("BAC", "Bank of America Corporation", "Financials", "Banks - Diversified", ["SP100"]),
  co("WFC", "Wells Fargo & Company", "Financials", "Banks - Diversified", ["SP100"]),
  co("GS", "The Goldman Sachs Group, Inc.", "Financials", "Capital Markets", ["SP100", "DOWJONES"]),
  co("MS", "Morgan Stanley", "Financials", "Capital Markets", ["SP100"]),
  co("AXP", "American Express Company", "Financials", "Credit Services", ["SP100", "DOWJONES"]),
  co("BLK", "BlackRock, Inc.", "Financials", "Asset Management", ["SP100"]),
  co("SPGI", "S&P Global Inc.", "Financials", "Financial Data & Exchanges", ["SP100"]),
  co("SCHW", "The Charles Schwab Corporation", "Financials", "Capital Markets", ["SP100"]),
  co("C", "Citigroup Inc.", "Financials", "Banks - Diversified", ["SP100"]),
  co("PGR", "The Progressive Corporation", "Financials", "Insurance - Property & Casualty", ["SP100"]),
  co("CB", "Chubb Limited", "Financials", "Insurance - Property & Casualty", ["SP100"]),
  co("USB", "U.S. Bancorp", "Financials", "Banks - Regional", ["SP100"]),
  co("PNC", "The PNC Financial Services Group", "Financials", "Banks - Regional", ["SP100"]),

  // --- US: Industrials ---
  co("GE", "GE Aerospace", "Industrials", "Aerospace & Defense", ["SP100", "DOWJONES"]),
  co("HON", "Honeywell International Inc.", "Industrials", "Conglomerates", ["SP100", "NASDAQ100", "DOWJONES"]),
  co("UNP", "Union Pacific Corporation", "Industrials", "Railroads", ["SP100"]),
  co("CAT", "Caterpillar Inc.", "Industrials", "Farm & Heavy Machinery", ["SP100", "DOWJONES"]),
  co("RTX", "RTX Corporation", "Industrials", "Aerospace & Defense", ["SP100"]),
  co("BA", "The Boeing Company", "Industrials", "Aerospace & Defense", ["SP100", "DOWJONES"]),
  co("LMT", "Lockheed Martin Corporation", "Industrials", "Aerospace & Defense", ["SP100"]),
  co("DE", "Deere & Company", "Industrials", "Farm & Heavy Machinery", ["SP100"]),
  co("ADP", "Automatic Data Processing, Inc.", "Industrials", "Staffing & Employment Services", ["SP100", "NASDAQ100"]),
  co("UPS", "United Parcel Service, Inc.", "Industrials", "Integrated Freight & Logistics", ["SP100"]),
  co("MMM", "3M Company", "Industrials", "Conglomerates", ["SP100", "DOWJONES"]),
  co("GD", "General Dynamics Corporation", "Industrials", "Aerospace & Defense", ["SP100"]),
  co("NOC", "Northrop Grumman Corporation", "Industrials", "Aerospace & Defense", ["SP100"]),
  co("ETN", "Eaton Corporation plc", "Industrials", "Electrical Equipment", ["SP100"]),

  // --- US: Energy ---
  co("XOM", "Exxon Mobil Corporation", "Energy", "Oil & Gas Integrated", ["SP100", "DOWJONES"]),
  co("CVX", "Chevron Corporation", "Energy", "Oil & Gas Integrated", ["SP100", "DOWJONES"]),
  co("COP", "ConocoPhillips", "Energy", "Oil & Gas E&P", ["SP100"]),
  co("SLB", "SLB", "Energy", "Oil & Gas Equipment & Services", ["SP100"]),
  co("EOG", "EOG Resources, Inc.", "Energy", "Oil & Gas E&P", ["SP100"]),

  // --- US: Utilities ---
  co("NEE", "NextEra Energy, Inc.", "Utilities", "Utilities - Regulated Electric", ["SP100", "NASDAQ100"]),
  co("DUK", "Duke Energy Corporation", "Utilities", "Utilities - Regulated Electric", ["SP100"]),
  co("SO", "The Southern Company", "Utilities", "Utilities - Regulated Electric", ["SP100"]),

  // --- US: Materials ---
  co("LIN", "Linde plc", "Materials", "Specialty Chemicals", ["SP100", "NASDAQ100"]),
  co("SHW", "The Sherwin-Williams Company", "Materials", "Specialty Chemicals", ["SP100"]),
  co("ECL", "Ecolab Inc.", "Materials", "Specialty Chemicals", ["SP100"]),

  // --- US: Real Estate ---
  co("AMT", "American Tower Corporation", "Real Estate", "REIT - Specialty", ["SP100"]),
  co("PLD", "Prologis, Inc.", "Real Estate", "REIT - Industrial", ["SP100"]),
  co("EQIX", "Equinix, Inc.", "Real Estate", "REIT - Specialty", ["SP100", "NASDAQ100"]),

  // --- Europe: large caps ---
  eu("ASML", "ASML Holding N.V.", "Netherlands", "Technology", "Semiconductor Equipment", "EUR"),
  eu("SAP", "SAP SE", "Germany", "Technology", "Software - Application", "EUR"),
  eu("MC.PA", "LVMH Moet Hennessy Louis Vuitton", "France", "Consumer Discretionary", "Luxury Goods", "EUR"),
  eu("NOVO-B.CO", "Novo Nordisk A/S", "Denmark", "Healthcare", "Drug Manufacturers", "DKK"),
  eu("NESN.SW", "Nestle S.A.", "Switzerland", "Consumer Staples", "Packaged Foods", "CHF"),
  eu("ROG.SW", "Roche Holding AG", "Switzerland", "Healthcare", "Drug Manufacturers", "CHF"),
  eu("NOVN.SW", "Novartis AG", "Switzerland", "Healthcare", "Drug Manufacturers", "CHF"),
  eu("TTE.PA", "TotalEnergies SE", "France", "Energy", "Oil & Gas Integrated", "EUR"),
  eu("SIE.DE", "Siemens AG", "Germany", "Industrials", "Conglomerates", "EUR"),
  eu("OR.PA", "L'Oreal S.A.", "France", "Consumer Staples", "Household & Personal Products", "EUR"),
  eu("SHEL.L", "Shell plc", "United Kingdom", "Energy", "Oil & Gas Integrated", "GBP"),
  eu("AZN.L", "AstraZeneca PLC", "United Kingdom", "Healthcare", "Drug Manufacturers", "GBP"),
  eu("HSBA.L", "HSBC Holdings plc", "United Kingdom", "Financials", "Banks - Diversified", "GBP"),
  eu("ULVR.L", "Unilever PLC", "United Kingdom", "Consumer Staples", "Household & Personal Products", "GBP"),
  eu("SAN.PA", "Sanofi S.A.", "France", "Healthcare", "Drug Manufacturers", "EUR"),
  eu("ALV.DE", "Allianz SE", "Germany", "Financials", "Insurance - Diversified", "EUR"),
  eu("IBE.MC", "Iberdrola, S.A.", "Spain", "Utilities", "Utilities - Regulated Electric", "EUR"),
  eu("ITX.MC", "Industria de Diseno Textil, S.A.", "Spain", "Consumer Discretionary", "Apparel Retail", "EUR"),
  eu("AIR.PA", "Airbus SE", "France", "Industrials", "Aerospace & Defense", "EUR"),
  eu("SU.PA", "Schneider Electric SE", "France", "Industrials", "Electrical Equipment", "EUR"),
  eu("BAS.DE", "BASF SE", "Germany", "Materials", "Specialty Chemicals", "EUR"),
  eu("DTE.DE", "Deutsche Telekom AG", "Germany", "Communication Services", "Telecom Services", "EUR"),
  eu("DGE.L", "Diageo plc", "United Kingdom", "Consumer Staples", "Beverages - Wineries & Distilleries", "GBP"),
  eu("BP.L", "BP p.l.c.", "United Kingdom", "Energy", "Oil & Gas Integrated", "GBP"),
  eu("MUV2.DE", "Munich Re", "Germany", "Financials", "Insurance - Reinsurance", "EUR"),
];

function co(
  ticker: string,
  name: string,
  sector: string,
  industry: string,
  indices: Company["indices"],
): Company {
  return {
    ticker,
    name,
    exchange: "NASDAQ/NYSE",
    currency: "USD",
    sector,
    industry,
    country: "United States",
    indices,
  };
}

function eu(
  ticker: string,
  name: string,
  country: string,
  sector: string,
  industry: string,
  currency: string,
): Company {
  return {
    ticker,
    name,
    exchange: "EU",
    currency,
    sector,
    industry,
    country,
    indices: ["EU_LARGE_CAP"],
  };
}

const UNIVERSE_TICKERS = new Set(UNIVERSE.map((c) => c.ticker));

export function isInUniverse(ticker: string): boolean {
  return UNIVERSE_TICKERS.has(ticker.toUpperCase());
}

export function getCompany(ticker: string): Company | undefined {
  return UNIVERSE.find((c) => c.ticker === ticker.toUpperCase());
}

export function getSectors(): string[] {
  return [...new Set(UNIVERSE.map((c) => c.sector))].sort();
}
