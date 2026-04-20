import type { Lang } from "./translations";

export type SkillLevel = "beginner" | "intermediate" | "expert";

type GradeBucket = "elementary" | "middle" | "early_high" | "late_high" | "college" | "adult";

interface GradeContext {
  bucket: GradeBucket;
  labelEn: string;
  labelEs: string;
  worldEn: string;
  worldEs: string;
  referencesEn: string;
  referencesEs: string;
  bannedAnaloguesEn: string;
  bannedAnaloguesEs: string;
}

const GRADE_CONTEXTS: Record<GradeBucket, GradeContext> = {
  elementary: {
    bucket: "elementary",
    labelEn: "Elementary (K-5, ages 5-10)",
    labelEs: "Primaria (K-5, edades 5-10)",
    worldEn: "Their world is school, family, and play. They use allowance, school cafeteria, recess, classroom jobs, birthday gifts, lost teeth money, group projects. They play Roblox, Minecraft, Brawl Stars; watch Mr Beast, kid YouTubers; trade Pokemon cards. Money is concrete (coins, bills, allowance), never abstract. They DO NOT have jobs, bank accounts, or know what 'APR' or 'ETF' means.",
    worldEs: "Su mundo es la escuela, la familia y el juego. Usan mesada, cafetería escolar, recreo, trabajos del salón, regalos de cumpleaños, dinero del Ratón Pérez, proyectos de grupo. Juegan Roblox, Minecraft, Brawl Stars; ven Mr Beast, YouTubers infantiles; cambian cartas Pokémon. El dinero es concreto (monedas, billetes, mesada), nunca abstracto. NO tienen trabajos, cuentas bancarias, ni saben qué es 'APR' o 'ETF'.",
    referencesEn: "Roblox economy, Minecraft villager trades, Pokemon card values, Mr Beast giveaways, school store/book fair, lemonade stand, allowance jar, classroom point system, lost-tooth money, birthday cake decisions, group-project free-riders, Brawl Stars gem packs, Stranger Things lunchboxes.",
    referencesEs: "Economía de Roblox, intercambios de aldeanos en Minecraft, valor de cartas Pokémon, regalos de Mr Beast, librería escolar, puesto de limonada, frasco de mesada, sistema de puntos del salón, dinero del diente, decisiones de pastel de cumpleaños, proyectos en grupo con gente que no aporta, gemas de Brawl Stars.",
    bannedAnaloguesEn: "stocks, ETFs, APR, mortgages, credit cards, taxes, salaries, IRAs, 401k, leverage, equity splits.",
    bannedAnaloguesEs: "acciones, ETFs, APR, hipotecas, tarjetas de crédito, impuestos, salarios, IRAs, 401k, apalancamiento, divisiones de equity.",
  },
  middle: {
    bucket: "middle",
    labelEn: "Middle School (6-8, ages 11-13)",
    labelEs: "Secundaria (6-8, edades 11-13)",
    worldEn: "Their world is friend groups, social media, school clubs, sports teams, sneaker drops, BookTok, FIFA/Madden, Fortnite, Valorant. Money still mostly comes from parents/grandparents but they negotiate for more. Some do micro-hustles (reselling, mowing lawns, babysitting). They know what a debit card is; they DO NOT use credit cards, file taxes, or sign leases.",
    worldEs: "Su mundo son los grupos de amigos, redes sociales, clubes escolares, equipos deportivos, drops de tenis, BookTok, FIFA, Fortnite, Valorant. El dinero aún viene de padres/abuelos pero negocian por más. Algunos hacen micro-negocios (reventa, cortar grama, cuidar niños). Conocen la tarjeta de débito; NO usan tarjetas de crédito, ni declaran impuestos, ni firman contratos.",
    referencesEn: "Group chats, sneaker resale (Nike/Jordan/Adidas), TikTok Shop, Discord servers, Champions League/NBA cards, FIFA Ultimate Team, Fortnite battle pass, BookTok must-reads, school dances, first phone plan, class trip fundraiser, Stranger Things merch, lawn-mowing gig.",
    referencesEs: "Chats grupales, reventa de tenis (Nike/Jordan/Adidas), TikTok Shop, servidores de Discord, cartas de Champions/NBA, FIFA Ultimate Team, pase de batalla de Fortnite, lecturas de BookTok, fiestas escolares, primer plan de teléfono, recaudación para viaje escolar, mercancía de Stranger Things.",
    bannedAnaloguesEn: "401k, IRA, mortgage closing costs, leveraged ETFs, options Greeks, equity splits.",
    bannedAnaloguesEs: "401k, IRA, costos de cierre de hipoteca, ETFs apalancados, griegas de opciones, divisiones de equity.",
  },
  early_high: {
    bucket: "early_high",
    labelEn: "Early High School (9-10, ages 14-16)",
    labelEs: "Bachillerato Inicial (9-10, edades 14-16)",
    worldEn: "Their world is identity, peer pressure, weekend jobs, learner's permit, prom planning, college research, gym routines, Spotify Wrapped, gaming PCs, NIL deals for athletes. Real first jobs (Chick-fil-A, lifeguard, tutoring, content creation). Some open first checking account. They DO NOT yet have credit cards or 401k.",
    worldEs: "Su mundo es identidad, presión social, trabajos de fin de semana, permiso de aprendiz, planear prom, investigar universidades, rutinas de gimnasio, Spotify Wrapped, PCs gamer. Primeros trabajos reales (cajero, salvavidas, tutorías, contenido). Algunos abren su primera cuenta corriente. AÚN NO tienen tarjetas de crédito ni 401k.",
    referencesEn: "First W-2 paycheck, Cash App/Zelle/Venmo splits, prom budget, AP test fees, college visit costs, gym membership decisions, NIL deals (college athletes), Twitch/YouTube monetization basics, Spotify vs Apple Music, gaming setup upgrade math.",
    referencesEs: "Primer cheque, divisiones por Yappy/Ath Móvil/Zelle, presupuesto de prom, costos de pruebas, visitas universitarias, decisiones de gimnasio, monetización en Twitch/YouTube básica, decisiones de Spotify vs Apple Music, upgrade de setup gamer.",
    bannedAnaloguesEn: "lemonade stand, lost-tooth money, Pokemon cards (unless context is reselling), allowance.",
    bannedAnaloguesEs: "puesto de limonada, dinero del diente, cartas Pokémon (salvo reventa), mesada.",
  },
  late_high: {
    bucket: "late_high",
    labelEn: "Late High School (11-12, ages 16-18)",
    labelEs: "Bachillerato Final (11-12, edades 16-18)",
    worldEn: "Their world is college applications, FAFSA, scholarships, first car, first credit card option, gap-year debates, first real W-2, summer internships. They are weeks away from being financially semi-independent. Treat them as near-adults. They likely DO NOT yet have a 401k or mortgage but should know what they are.",
    worldEs: "Su mundo es aplicaciones universitarias, FAFSA, becas, primer carro, primera opción de tarjeta de crédito, debates de año sabático, primer W-2 real, pasantías de verano. Están a semanas de ser semi-independientes. Trátalos como casi-adultos. Probablemente AÚN no tienen 401k ni hipoteca pero deberían saber qué son.",
    referencesEn: "Student loan vs scholarship math, first credit card APR shock, used-car decisions, dorm budget, work-study vs summer job, internship stipend negotiation, Roth IRA opening at 17, side hustle to LLC pipeline.",
    referencesEs: "Préstamo estudiantil vs beca, primer choque con APR de tarjeta, decisiones de carro usado, presupuesto de dormitorio, work-study vs trabajo de verano, negociar estipendio de pasantía, abrir Roth IRA a los 17, pipeline de side hustle a LLC.",
    bannedAnaloguesEn: "lemonade stand, lost-tooth money, Pokemon cards (unless reselling), classroom point system.",
    bannedAnaloguesEs: "puesto de limonada, dinero del diente, cartas Pokémon (salvo reventa), sistema de puntos del salón.",
  },
  college: {
    bucket: "college",
    labelEn: "College (ages 18-22)",
    labelEs: "Universidad (edades 18-22)",
    worldEn: "Their world is tuition, rent splits with roommates, first credit card, first 1099/W-2, internship pay, side gigs (Uber, DoorDash, content, freelancing), Roth IRA opening, first real budget. They face actual interest rates, real APRs, real opportunity costs.",
    worldEs: "Su mundo es matrícula, dividir renta con roommates, primera tarjeta de crédito, primer 1099/W-2, paga de pasantía, side gigs (Uber, DoorDash, contenido, freelancing), abrir Roth IRA, primer presupuesto real. Enfrentan tasas reales, APRs reales, costos de oportunidad reales.",
    referencesEn: "Roth IRA at $7k cap, federal vs private student loans, credit utilization under 30%, Robinhood/Fidelity index funds, side hustle to LLC, rent vs buy in early 20s, HSA contribution math, employer 401k match.",
    referencesEs: "Roth IRA con tope de $7k, préstamos federales vs privados, utilización de crédito bajo 30%, fondos índice en Robinhood/Fidelity, side hustle a LLC, rentar vs comprar en los 20s, contribución HSA, match de 401k del empleador.",
    bannedAnaloguesEn: "lemonade stand, lost-tooth money, classroom point system.",
    bannedAnaloguesEs: "puesto de limonada, dinero del diente, sistema de puntos del salón.",
  },
  adult: {
    bucket: "adult",
    labelEn: "Adult (22+)",
    labelEs: "Adulto (22+)",
    worldEn: "Salaries, 401k matches, Roth conversions, mortgages, refinancing, asset allocation, leveraged ETFs, real estate cash-flow, business equity, tax optimization, building enterprise value.",
    worldEs: "Salarios, match de 401k, conversiones Roth, hipotecas, refinanciamiento, asignación de activos, ETFs apalancados, flujo de caja inmobiliario, equity de negocio, optimización fiscal, construir valor empresarial.",
    referencesEn: "401k Roth vs Traditional, mega backdoor Roth, BRRRR real estate strategy, S-corp election, K-1 distributions, leveraged buyouts, options collars, dollar-cost averaging into VOO/QQQ, MEGA backdoor at six-figure income.",
    referencesEs: "401k Roth vs Tradicional, mega backdoor Roth, estrategia BRRRR inmobiliaria, elección S-corp, distribuciones K-1, compras apalancadas, collares de opciones, dollar-cost averaging en VOO/QQQ.",
    bannedAnaloguesEn: "lemonade stand, allowance, lost-tooth money, classroom point system.",
    bannedAnaloguesEs: "puesto de limonada, mesada, dinero del diente, sistema de puntos del salón.",
  },
};

export function gradeBucketFromInputs(grade?: string | null, birthYear?: string, ageGroup?: string): GradeBucket {
  if (grade) {
    if (grade === "K" || ["1","2","3","4","5"].includes(grade)) return "elementary";
    if (["6","7","8"].includes(grade)) return "middle";
    if (["9","10"].includes(grade)) return "early_high";
    if (["11","12"].includes(grade)) return "late_high";
    if (grade === "college") return "college";
    if (grade === "adult") return "adult";
  }
  const year = birthYear ? parseInt(birthYear, 10) : NaN;
  const now = new Date().getFullYear();
  const age = !isNaN(year) && year > 1900 && year <= now ? now - year : null;
  if (age !== null) {
    if (age <= 10) return "elementary";
    if (age <= 13) return "middle";
    if (age <= 16) return "early_high";
    if (age <= 18) return "late_high";
    if (age <= 22) return "college";
    return "adult";
  }
  if (ageGroup === "Kids" || ageGroup === "8-12") return "middle";
  if (ageGroup === "Teens" || ageGroup === "13-15") return "early_high";
  return "late_high";
}

export function getGradeContext(grade?: string | null, birthYear?: string, ageGroup?: string): GradeContext {
  return GRADE_CONTEXTS[gradeBucketFromInputs(grade, birthYear, ageGroup)];
}

export function effectiveSkillLevel(computed: SkillLevel, floor?: SkillLevel | null): SkillLevel {
  const order: SkillLevel[] = ["beginner", "intermediate", "expert"];
  const a = order.indexOf(computed);
  const b = floor ? order.indexOf(floor) : -1;
  return order[Math.max(a, b)] || "beginner";
}

const SUBJECT_AGENDAS: Record<string, { en: string[]; es: string[] }> = {
  beg_1: {
    en: [
      "what 'money' actually represents (a shared agreement, not paper)",
      "barter vs currency — why coins were invented",
      "how a bank vault is different from a piggy bank (banks lend out deposits)",
      "what 'deposit' and 'withdrawal' really mean",
      "checking vs savings — why banks pay tiny interest",
      "the role of central banks (printing pressure, inflation hint)",
      "digital money — Cash App, Zelle, Apple Pay are still bank money",
      "why hiding cash under the mattress slowly loses value",
      "the difference between a bank's vault and your account balance (it's a number, not stacks of bills)",
      "FDIC insurance — why $250k of bank money is safer than cash at home",
    ],
    es: [
      "qué representa realmente el 'dinero' (un acuerdo, no papel)",
      "trueque vs moneda — por qué se inventaron las monedas",
      "cómo la bóveda del banco es distinta a una alcancía (los bancos prestan los depósitos)",
      "qué significa realmente 'depositar' y 'retirar'",
      "cuenta corriente vs ahorro — por qué los bancos pagan poco interés",
      "el rol de los bancos centrales (impresión, inflación)",
      "dinero digital — Yappy, Ath Móvil, Apple Pay siguen siendo dinero bancario",
      "por qué esconder efectivo bajo el colchón pierde valor con el tiempo",
      "tu balance es un número, no billetes apilados",
      "seguro FDIC — por qué $250k en banco es más seguro que en casa",
    ],
  },
  beg_2: {
    en: [
      "what a 'business' is (something that turns inputs into something people pay for)",
      "revenue vs profit — money in is NOT what you keep",
      "fixed costs vs variable costs (rent vs ingredients)",
      "the breakeven idea — selling enough to cover costs",
      "why a $5 lemonade costs $1.20 to make and the difference matters",
      "service businesses vs product businesses",
      "scale — selling 10 vs selling 10,000 of the same thing",
      "the role of the customer (no customers = no business)",
      "why the same product can have wildly different profit margins",
      "what 'going viral' does to a small business overnight",
    ],
    es: [
      "qué es un 'negocio' (algo que convierte insumos en algo por lo que pagan)",
      "ingresos vs ganancia — el dinero que entra NO es lo que te queda",
      "costos fijos vs variables (renta vs ingredientes)",
      "el punto de equilibrio — vender lo suficiente para cubrir costos",
      "por qué una limonada de $5 cuesta $1.20 hacer y eso importa",
      "negocios de servicios vs de productos",
      "escala — vender 10 vs vender 10,000",
      "el rol del cliente (sin clientes no hay negocio)",
      "el mismo producto puede tener márgenes muy distintos",
      "qué pasa cuando un negocio pequeño se vuelve viral",
    ],
  },
  beg_3: {
    en: [
      "the difference between a 'brand' and a 'product'",
      "how ads use color, music, and faces to make you feel things",
      "influencer marketing vs traditional ads",
      "comparing two cereals/headphones with the same specs but different prices",
      "store-brand vs name-brand — when each is smarter",
      "reviews and ratings — how to spot fake ones",
      "the price-quality assumption (more expensive ≠ better)",
      "scarcity tactics — 'only 3 left!' tricks",
      "why algorithms show you ads for things you literally just talked about",
      "the cost of 'free' apps (you are the product)",
    ],
    es: [
      "diferencia entre 'marca' y 'producto'",
      "cómo los anuncios usan color, música y caras para hacerte sentir",
      "marketing de influencers vs anuncios tradicionales",
      "comparar dos cereales/audífonos con mismas specs y diferente precio",
      "marca de la tienda vs marca conocida — cuándo es más inteligente cada una",
      "reseñas y ratings — cómo detectar las falsas",
      "el supuesto precio-calidad (más caro ≠ mejor)",
      "tácticas de escasez — '¡solo quedan 3!'",
      "por qué los algoritmos te muestran anuncios de cosas que justo mencionaste",
      "el costo de las apps 'gratis' (tú eres el producto)",
    ],
  },
  beg_4: {
    en: [
      "the science of delayed gratification (the marshmallow test)",
      "saving for a specific goal vs saving 'just to save'",
      "the math of 'small amounts add up' ($1/day = $365/year)",
      "envelope budgeting — why physical limits work",
      "save first, spend second (paying yourself first)",
      "what compound interest looks like even at tiny rates",
      "the danger of 'I'll start saving when I make more'",
      "savings buckets — emergency vs goals vs fun",
      "automating saves so willpower isn't needed",
      "celebrating saving milestones the right way",
    ],
    es: [
      "la ciencia de la gratificación diferida (el test del malvavisco)",
      "ahorrar para una meta específica vs solo por ahorrar",
      "matemática de 'lo pequeño suma' ($1/día = $365/año)",
      "presupuesto por sobres — por qué los límites físicos funcionan",
      "ahorrar primero, gastar después (págate a ti primero)",
      "cómo se ve el interés compuesto incluso con tasas pequeñas",
      "el peligro de 'ahorraré cuando gane más'",
      "cubetas de ahorro — emergencia vs metas vs diversión",
      "automatizar ahorros para no depender de fuerza de voluntad",
      "celebrar los hitos de ahorro de la forma correcta",
    ],
  },
  beg_5: {
    en: [
      "the idea that companies are 'owned' by people (shareholders)",
      "what a 'share' or 'stock' actually is (a tiny slice of ownership)",
      "owners get profits, workers get wages — the difference matters",
      "why owning 1 share of Apple makes you a (very tiny) Apple owner",
      "the difference between 'making something' and 'owning something that makes things'",
      "dividends — when companies pay owners a slice of profit",
      "why founders try to keep ownership and bring in investors carefully",
      "public vs private companies (you can buy shares of public ones)",
      "the supply chain — every product has many owners taking a cut",
      "why buying just 1 share teaches more than reading 10 books",
    ],
    es: [
      "la idea de que las empresas son 'poseídas' por personas (accionistas)",
      "qué es realmente una 'acción' (una porción de propiedad)",
      "los dueños reciben ganancias, los trabajadores reciben salario",
      "por qué tener 1 acción de Apple te hace dueño (muy pequeño) de Apple",
      "la diferencia entre 'hacer algo' y 'poseer algo que hace cosas'",
      "dividendos — cuando las empresas pagan parte de la ganancia",
      "por qué los fundadores cuidan su porcentaje de propiedad",
      "empresas públicas vs privadas (puedes comprar acciones de las públicas)",
      "la cadena de suministro — cada producto tiene muchos dueños cobrando",
      "por qué comprar 1 sola acción enseña más que leer 10 libros",
    ],
  },
  int_1: {
    en: [
      "the real definition of inflation (not a vibe, a measurable %)",
      "why $100 today is worth less than $100 in 1990",
      "the time value of money formula in plain words",
      "why 'high yield' savings (4-5% APY) still loses to 7%+ inflation years",
      "real return vs nominal return",
      "comparing CDs, money market, T-bills, HYSA at today's rates",
      "the cost of holding too much idle cash",
      "the cost of NOT holding any cash (forced bad sales)",
      "how the Fed raising rates affects every product on a shelf",
      "currency comparison — USD vs DOP and why exchange rates move",
    ],
    es: [
      "la definición real de inflación (no un sentimiento, un % medible)",
      "por qué $100 hoy vale menos que $100 en 1990",
      "el valor temporal del dinero en palabras simples",
      "por qué los ahorros 'high yield' (4-5% APY) siguen perdiendo en años con 7%+ inflación",
      "retorno real vs nominal",
      "comparar CDs, money market, T-bills, HYSA a tasas actuales",
      "el costo de tener demasiado efectivo parado",
      "el costo de NO tener efectivo (ventas forzadas malas)",
      "cómo cuando la Fed sube tasas afecta cada producto en la tienda",
      "comparación USD vs DOP y por qué se mueven los tipos de cambio",
    ],
  },
  int_2: {
    en: [
      "good debt vs bad debt — the actual test (does it produce future income?)",
      "APR vs APY — same number, very different meaning",
      "credit utilization ratio (the under-30% rule, the under-10% pro move)",
      "the 5 factors of a FICO score, weighted",
      "minimum payments are a trap — the 21% APR math",
      "the snowball vs avalanche debt-payoff methods",
      "secured vs unsecured credit cards (and why the first card matters)",
      "co-signing risk — your score is the collateral",
      "how a single 30-day late payment crushes a score for years",
      "buy-now-pay-later (Klarna, Afterpay) — the hidden trap",
    ],
    es: [
      "deuda buena vs mala — la prueba real (¿produce ingresos futuros?)",
      "APR vs APY — mismo número, significados muy diferentes",
      "ratio de utilización de crédito (regla del 30%, jugada pro del 10%)",
      "los 5 factores del score FICO, ponderados",
      "los pagos mínimos son una trampa — la matemática del 21% APR",
      "métodos snowball vs avalanche para pagar deuda",
      "tarjetas aseguradas vs no aseguradas (y por qué la primera importa)",
      "riesgo de ser cofirmante — tu score es el colateral",
      "cómo un solo atraso de 30 días destruye el score por años",
      "compra-ahora-paga-después (Klarna, Afterpay) — la trampa escondida",
    ],
  },
  int_3: {
    en: [
      "the active vs passive income distinction",
      "trading time for money has a hard ceiling",
      "ROI per hour vs $/hour — the math that changes life",
      "low-margin (mowing lawns) vs high-margin (tutoring, content, freelance code) hustles",
      "the 4 levers of any side hustle: price, volume, margin, scale",
      "platform risk — what happens when TikTok shadowbans you",
      "the difference between a 'gig' and an actual business",
      "compounding skill stacks (writing + video + design = leverage)",
      "the first $100/month side income vs the first $1000/month",
      "when to quit a side hustle (sunk cost vs honest math)",
    ],
    es: [
      "ingreso activo vs pasivo",
      "intercambiar tiempo por dinero tiene un techo duro",
      "ROI por hora vs $/hora — la matemática que cambia la vida",
      "bajo margen (cortar grama) vs alto margen (tutorías, contenido, código freelance)",
      "las 4 palancas de un side hustle: precio, volumen, margen, escala",
      "riesgo de plataforma — qué pasa cuando TikTok te shadowbanea",
      "diferencia entre 'gig' y un negocio real",
      "stacks de habilidades que se componen (escribir + video + diseño = apalancamiento)",
      "el primer $100/mes vs el primer $1000/mes",
      "cuándo abandonar un side hustle (costo hundido vs matemática honesta)",
    ],
  },
  int_4: {
    en: [
      "what a 'moat' is (network effects, brand, switching costs, scale, regulation)",
      "spotting durable moats — Visa, Costco, ASML examples",
      "founder-mode companies vs manager-mode companies",
      "P/E ratio in plain English (and when it lies)",
      "free cash flow > net income for real evaluation",
      "calculated risk = upside many multiples of the downside",
      "position sizing — never bet the farm",
      "the difference between conviction and stubbornness",
      "why holding through a 50% drawdown is the actual test",
      "the diff between speculating and investing (and being honest about which you do)",
    ],
    es: [
      "qué es un 'foso' (efectos de red, marca, costos de cambio, escala, regulación)",
      "detectar fosos duraderos — Visa, Costco, ASML",
      "empresas modo-fundador vs modo-gerente",
      "ratio P/E en lenguaje simple (y cuándo miente)",
      "flujo de caja libre > ingreso neto para evaluación real",
      "riesgo calculado = upside muchas veces mayor al downside",
      "tamaño de posición — nunca apostar la finca",
      "diferencia entre convicción y testarudez",
      "por qué aguantar una caída del 50% es la prueba real",
      "diferencia entre especular e invertir (y ser honesto)",
    ],
  },
  int_5: {
    en: [
      "depreciating assets (cars, electronics) vs appreciating ones",
      "the true cost of car ownership (depreciation > gas + insurance)",
      "lifestyle inflation — the silent wealth killer",
      "fixed monthly subscriptions audit — the $200/mo that disappears",
      "rent-to-income ratio (the 30% rule and when to break it)",
      "buying vs leasing decisions with actual numbers",
      "geographic arbitrage — same income, half the rent",
      "the 'just one more upgrade' trap",
      "needs vs wants vs status purchases (be honest)",
      "keeping fixed overhead low so you can take risks",
    ],
    es: [
      "activos que se deprecian (carros, electrónicos) vs los que se aprecian",
      "el costo real de tener carro (depreciación > gasolina + seguro)",
      "inflación de estilo de vida — el asesino silencioso de riqueza",
      "auditoría de suscripciones — los $200/mes que desaparecen",
      "ratio renta-ingreso (regla del 30% y cuándo romperla)",
      "comprar vs leasing con números reales",
      "arbitraje geográfico — mismo ingreso, mitad de renta",
      "la trampa del 'solo un upgrade más'",
      "necesidades vs deseos vs compras de estatus (sé honesto)",
      "mantener gastos fijos bajos para poder tomar riesgos",
    ],
  },
  pro_1: {
    en: [
      "modern portfolio theory in 2 lines and its limits",
      "leveraged ETFs (TQQQ, SOXL) — daily reset decay math",
      "options basics — calls, puts, the asymmetry",
      "the volatility drag concept",
      "AI/semis cycle (NVDA, AVGO, TSM, ASML)",
      "concentrated vs diversified — when each wins",
      "tax-loss harvesting at scale",
      "rebalancing with new contributions vs selling",
      "factor investing (value, momentum, quality)",
      "macro regime awareness — risk-on vs risk-off",
    ],
    es: [
      "teoría moderna de portafolio en 2 líneas y sus límites",
      "ETFs apalancados (TQQQ, SOXL) — matemática del decay por reset diario",
      "básicos de opciones — calls, puts, la asimetría",
      "el concepto de volatility drag",
      "ciclo de IA/semiconductores (NVDA, AVGO, TSM, ASML)",
      "concentrado vs diversificado — cuándo gana cada uno",
      "tax-loss harvesting a escala",
      "rebalanceo con contribuciones nuevas vs vendiendo",
      "factor investing (value, momentum, quality)",
      "conciencia de régimen macro — risk-on vs risk-off",
    ],
  },
  pro_2: {
    en: [
      "cap rate, cash-on-cash return, IRR — what each really tells you",
      "the BRRRR method end-to-end",
      "OPM (Other People's Money) and the 4 sources",
      "1031 exchange basics",
      "commercial vs multifamily vs single-family math",
      "Class A vs B vs C neighborhoods",
      "DSCR loans vs conventional loans",
      "the 1% and 2% rules and why both lie sometimes",
      "tenant screening as the real risk control",
      "exiting via refinance vs sale — tax implications",
    ],
    es: [
      "cap rate, cash-on-cash, TIR — qué te dice cada uno",
      "el método BRRRR de principio a fin",
      "OPM (dinero de otros) y las 4 fuentes",
      "básicos del intercambio 1031",
      "comercial vs multifamiliar vs unifamiliar",
      "barrios Clase A vs B vs C",
      "préstamos DSCR vs convencionales",
      "las reglas del 1% y 2% y por qué a veces mienten",
      "screening de inquilinos como el control de riesgo real",
      "salir por refinanciamiento vs venta — implicaciones fiscales",
    ],
  },
  pro_3: {
    en: [
      "founder vs co-founder equity splits (50/50 trap)",
      "vesting cliffs and why every founder needs one",
      "pre-money vs post-money valuation",
      "SAFEs vs convertible notes vs priced rounds",
      "dilution math across rounds",
      "ESOP pool sizing",
      "moats for a startup (distribution, data, regulatory)",
      "the deck — what investors actually skim",
      "burn rate, runway, default-alive vs default-dead",
      "when to take VC vs bootstrap vs revenue-based financing",
    ],
    es: [
      "divisiones de equity entre fundadores (la trampa 50/50)",
      "cliffs de vesting y por qué todo fundador necesita uno",
      "valuación pre-money vs post-money",
      "SAFEs vs notas convertibles vs rondas con precio",
      "matemática de dilución entre rondas",
      "tamaño del pool ESOP",
      "fosos para una startup (distribución, datos, regulación)",
      "el pitch deck — qué realmente leen los inversores",
      "burn rate, runway, default-alive vs default-dead",
      "cuándo tomar VC vs bootstrap vs financiamiento por ingresos",
    ],
  },
  pro_4: {
    en: [
      "good leverage vs bad leverage (the test)",
      "margin loans, HELOCs, securities-based lending",
      "tax-efficient withdrawal sequencing in retirement",
      "Roth conversion ladders in low-income years",
      "QBI deduction for business owners",
      "S-corp election math (when it actually saves)",
      "real estate cost segregation studies",
      "raising capital — friends/family vs angels vs institutional",
      "covenants in debt agreements (what destroys companies)",
      "trust structures for asset protection (basics)",
    ],
    es: [
      "buen apalancamiento vs malo (la prueba)",
      "préstamos margin, HELOCs, securities-based lending",
      "secuencia de retiros eficiente en impuestos al jubilarse",
      "escaleras de conversión Roth en años de bajo ingreso",
      "deducción QBI para dueños de negocio",
      "matemática de elección S-corp (cuándo realmente ahorra)",
      "estudios de cost segregation inmobiliario",
      "levantar capital — friends/family vs angels vs institucional",
      "covenants en contratos de deuda (qué destruye empresas)",
      "estructuras de fideicomiso para protección de activos (básicos)",
    ],
  },
  pro_5: {
    en: [
      "Mr. Market — Buffett's manic-depressive partner",
      "behavioral biases: anchoring, recency, herd, loss aversion",
      "contrarian frameworks (be greedy when others are fearful — done right)",
      "the role of cash during a crash",
      "history of crashes — 1929, 1987, 2000, 2008, 2020",
      "the 'this time is different' lie",
      "circle of competence — knowing what you DON'T know",
      "the disposition effect (selling winners too early, holding losers too long)",
      "playing your own game — ignoring index hugger noise",
      "drawdown psychology — surviving a -50% paper loss",
    ],
    es: [
      "Mr. Market — el socio maníaco-depresivo de Buffett",
      "sesgos conductuales: anchoring, recencia, manada, aversión a la pérdida",
      "marcos contrarian (sé codicioso cuando otros temen — bien hecho)",
      "el rol del efectivo durante un crash",
      "historia de crashes — 1929, 1987, 2000, 2008, 2020",
      "la mentira 'esta vez es diferente'",
      "círculo de competencia — saber lo que NO sabes",
      "el efecto disposición (vender ganadores muy temprano, aguantar perdedores)",
      "jugar tu propio juego — ignorar el ruido",
      "psicología de drawdown — sobrevivir una pérdida en papel del -50%",
    ],
  },
};

const VIBE_SEEDS = [
  "the after-school group chat",
  "halftime at a Champions League final",
  "a chaotic FIFA Ultimate Team draft",
  "a TikTok Live going viral",
  "a Mr Beast challenge gone wrong",
  "a sneaker drop at midnight",
  "lunch table at school",
  "a Brawl Stars team chat",
  "a roommate move-in day",
  "the moment a paycheck hits Cash App",
  "a Roblox game lobby waiting",
  "the line outside a Trader Joe's on payday",
  "an Uber ride home after a win",
  "a study session at 2am during finals",
  "the gym at 6am when nobody's there",
];

export function pickVibeSeed(): string {
  return VIBE_SEEDS[Math.floor(Math.random() * VIBE_SEEDS.length)];
}

interface BuildPromptArgs {
  lang: Lang;
  grade?: string | null;
  birthYear?: string;
  ageGroup: string;
  skillLevel: SkillLevel;
  subjectId?: string | null;
  subjectTitle: string;
  subjectDescription: string;
  country?: string;
  requestedTypes: string[];
  vibeSeed: string;
  recentTitles?: string[];
}

const SKILL_RULES: Record<SkillLevel, { en: string; es: string }> = {
  beginner: {
    en: "BEGINNER (0-2 wins on this subject). Assume zero prior knowledge. Define every term the first time it appears. Lead with the most concrete, single-step idea. miniGames test ONE recognition-level idea each. Avoid jargon, ratios, or multi-step calculations. Tooltips reinforce basics; do not introduce new vocabulary.",
    es: "PRINCIPIANTE (0-2 victorias en esta materia). Asume cero conocimiento previo. Define cada término la primera vez. Lidera con la idea más concreta y de un paso. Los miniGames evalúan UNA idea de reconocimiento. Evita jerga, ratios o cálculos multi-paso. Los tooltips refuerzan lo básico; no introduzcas vocabulario nuevo.",
  },
  intermediate: {
    en: "INTERMEDIATE (3-6 wins). They know foundational vocabulary — DO NOT redefine basics. Push into mechanics: real numbers, simple comparisons (e.g., 5% APY savings vs 18% APR debt). miniGames require a small calculation OR a 2-step trade-off. Introduce 1-2 next-level terms per batch with quick context. Tone is peer-to-peer.",
    es: "INTERMEDIO (3-6 victorias). Conocen el vocabulario base — NO redefinas básicos. Profundiza en mecánicas: números reales, comparaciones simples (ej: 5% APY ahorro vs 18% APR deuda). Los miniGames requieren un cálculo pequeño O un trade-off de 2 pasos. Introduce 1-2 términos del siguiente nivel por lote con contexto rápido. Tono de igual a igual.",
  },
  expert: {
    en: "EXPERT (7+ wins). They mastered basics AND mechanics — treat them as a serious operator. Concept definitions stay ULTRA-BRIEF; spend the rest on nuance, edge cases, advanced strategy, counterintuitive insights. miniGames are scenario-based with multi-variable trade-offs (3+ step reasoning). Reference real institutions, instruments, percentages. Sharp, fast, no fluff. CRITICAL: Stay inside the user's grade-context world — deliver advanced ideas using examples that fit THEIR life, not Wall Street boardrooms unless the grade is college/adult.",
    es: "EXPERTO (7+ victorias). Dominan básicos Y mecánicas — trátalos como operador serio. Las definiciones concept se quedan ULTRA-BREVES; el resto se dedica a matices, casos límite, estrategia avanzada, insights contraintuitivos. Los miniGames son escenarios con trade-offs multi-variables (3+ pasos). Referencia instituciones, instrumentos y porcentajes reales. Agudo, rápido, sin relleno. CRÍTICO: Quédate dentro del mundo del grado del usuario — entrega ideas avanzadas con ejemplos de SU vida, no salas de Wall Street salvo que el grado sea universidad/adulto.",
  },
};

const PERSONA_EN = "SYSTEM PERSONA: You are the Master Curriculum Engine for Moolab, an elite financial literacy app. Your goal is to teach users the mindset of an investor, founder, and wealth builder. TONE: Sharp, respectful, real. Never patronize. Treat every user like a future CEO — even a 7-year-old. Punchy mobile-readable sentences. CURRENCY RULE: When discussing real money, prices or investments, use US Dollars (USD) or Dominican Pesos (DOP). Gaming currencies (Robux, V-Bucks) ONLY as analogies, NEVER as a money substitute.";
const PERSONA_ES = "PERSONA DEL SISTEMA: Eres el Motor Maestro de Currículo de Moolab, una app de educación financiera élite. Tu meta es enseñar la mentalidad de inversor, fundador y constructor de riqueza. TONO: Agudo, respetuoso, real. Nunca subestimes. Trata a cada usuario como un futuro CEO — incluso un niño de 7 años. Oraciones contundentes y legibles en móvil. REGLA DE MONEDA: Cuando hables de dinero real, precios o inversiones, usa Dólares (USD) o Pesos Dominicanos (DOP). Las monedas de videojuegos (Robux, V-Bucks) SOLO como analogías, NUNCA como sustituto. GENERA TODO EL CONTENIDO EN ESPAÑOL.";

const DOCTRINE_EN = "CORE DOCTRINE — TITANS & TACTICS: Blend Buffett/Munger long-term fundamentals with modern active strategies. Foundations: patience, compound interest, avoiding bad debt, identifying wonderful businesses with moats. Advanced (when grade allows): leverage used safely, asymmetric upside, ownership over wages, speed of execution.";
const DOCTRINE_ES = "DOCTRINA CENTRAL — TITANES Y TÁCTICAS: Combina los fundamentos a largo plazo de Buffett/Munger con estrategias modernas activas. Fundamentos: paciencia, interés compuesto, evitar deuda mala, identificar negocios maravillosos con fosos. Avanzado (si el grado lo permite): apalancamiento seguro, ventaja asimétrica, propiedad sobre salarios, velocidad de ejecución.";

const SCHEMA_EN = "OUTPUT FORMAT (RAW JSON ONLY, no markdown fences). Top-level: { lessons: [...], bossQuiz: { question, options, correctIndex, explanation } }. Each lesson MUST have: id (omit, will be added), type (one of 'journey' | 'concept' | 'podcast'), tooltip_explanation (2-3 sentences, 30-45 words, plain elaboration of the card's core idea), video_search_keyword (1-2 word ENGLISH search term for stock video). 'journey' type: title (2-4 words), desc (1 punchy sentence), miniGame { contextSetup (1-2 short sentences anchoring a real scenario from the grade-context world), actionQuestion (1 sentence question), options (3-4 strings), correctIndex (number), explanation (2-3 sentence charismatic explanation) }. 'concept' type: term, definition (1 sentence for expert, 1-2 sentences otherwise), analogy (1 short relatable analogy), tooltip_explanation, video_search_keyword. 'podcast' type: title (2-4 words), dialogue (array of {speaker: 'Host'|'Expert', text: string}, MAX 4 exchanges, each line under 25 words), tooltip_explanation, video_search_keyword. ON-SCREEN TEXT (title/desc/options/dialogue) MUST be UNDER 120 chars per element. tooltip_explanation is the EXCEPTION (30-45 words). Think TikTok caption brevity for everything else.";
const SCHEMA_ES = "FORMATO DE SALIDA (JSON CRUDO solamente, sin fences markdown). Top-level: { lessons: [...], bossQuiz: { question, options, correctIndex, explanation } }. Cada lección DEBE tener: type ('journey' | 'concept' | 'podcast'), tooltip_explanation (2-3 oraciones, 30-45 palabras), video_search_keyword (término de búsqueda 1-2 palabras EN INGLÉS). 'journey': title (2-4 palabras), desc (1 oración contundente), miniGame { contextSetup (1-2 oraciones cortas anclando un escenario real del mundo del grado), actionQuestion (1 oración pregunta), options (3-4 strings), correctIndex (número), explanation (2-3 oraciones explicación carismática) }. 'concept': term, definition (1 oración para experto, 1-2 si no), analogy (1 analogía relatable), tooltip_explanation, video_search_keyword. 'podcast': title (2-4 palabras), dialogue (array {speaker: 'Host'|'Expert', text}, MÁX 4 intercambios, cada línea bajo 25 palabras), tooltip_explanation, video_search_keyword. EL TEXTO EN PANTALLA (title/desc/options/dialogue) DEBE ser MENOR a 120 caracteres por elemento. tooltip_explanation es la EXCEPCIÓN (30-45 palabras). Brevedad estilo subtítulo de TikTok para todo lo demás.";

export function buildCardPrompt(args: BuildPromptArgs): string {
  const ctx = getGradeContext(args.grade, args.birthYear, args.ageGroup);
  const skillRules = SKILL_RULES[args.skillLevel];
  const isEs = args.lang === "es";
  const persona = isEs ? PERSONA_ES : PERSONA_EN;
  const doctrine = isEs ? DOCTRINE_ES : DOCTRINE_EN;
  const schema = isEs ? SCHEMA_ES : SCHEMA_EN;
  const skillRule = isEs ? skillRules.es : skillRules.en;
  const gradeLabel = isEs ? ctx.labelEs : ctx.labelEn;
  const world = isEs ? ctx.worldEs : ctx.worldEn;
  const refs = isEs ? ctx.referencesEs : ctx.referencesEn;
  const banned = isEs ? ctx.bannedAnaloguesEs : ctx.bannedAnaloguesEn;

  const agendaList = args.subjectId && SUBJECT_AGENDAS[args.subjectId]
    ? (isEs ? SUBJECT_AGENDAS[args.subjectId].es : SUBJECT_AGENDAS[args.subjectId].en)
    : null;
  const agendaBlock = agendaList
    ? (isEs
        ? `\n\nMISIÓN DE ENSEÑANZA — Esta materia cubre EXACTAMENTE estos sub-temas (no inventes otros):\n${agendaList.map((a, i) => `  ${i + 1}. ${a}`).join("\n")}\nCada tarjeta DEBE atacar al menos un sub-tema. Distribuye los sub-temas a lo largo del lote — no repitas el mismo en 2 tarjetas seguidas.`
        : `\n\nTEACHING MISSION — This subject covers EXACTLY these sub-topics (do not invent others):\n${agendaList.map((a, i) => `  ${i + 1}. ${a}`).join("\n")}\nEvery card MUST attack at least one sub-topic. Spread sub-topics across the batch — do not repeat the same one in 2 back-to-back cards.`)
    : "";

  const recentBlock = args.recentTitles && args.recentTitles.length
    ? (isEs
        ? `\n\nANTI-REPETICIÓN — El usuario ya vio estas tarjetas recientemente. NO REPITAS sus títulos, ángulos o ejemplos:\n  ${args.recentTitles.slice(-12).map((t) => `• ${t}`).join("\n  ")}`
        : `\n\nANTI-REPETITION — The user has already seen these recent cards. DO NOT repeat their titles, angles, or examples:\n  ${args.recentTitles.slice(-12).map((t) => `• ${t}`).join("\n  ")}`)
    : "";

  const countryBlock = args.country
    ? (isEs
        ? ` LOCALIZACIÓN: Usuario en ${args.country}. División 70/30: 70% conceptos globales, 30% ejemplos hiper-locales del país.`
        : ` LOCALIZATION: User in ${args.country}. 70/30 split: 70% global concepts, 30% hyper-local examples from the country.`)
    : "";

  const langLine = isEs
    ? " IMPORTANTE: TODA tu respuesta DEBE estar en ESPAÑOL. No mezcles idiomas."
    : " IMPORTANT: Your ENTIRE response MUST be in ENGLISH. Do not mix languages.";

  const typesLine = isEs
    ? ` requestedTypes: [${args.requestedTypes.map((t) => `"${t}"`).join(", ")}]. GENERA EXACTAMENTE ${args.requestedTypes.length} lecciones en "lessons" con estos tipos en este ORDEN EXACTO. También genera UN bossQuiz al final.`
    : ` requestedTypes: [${args.requestedTypes.map((t) => `"${t}"`).join(", ")}]. Generate EXACTLY ${args.requestedTypes.length} lessons in "lessons" with these types in this EXACT order. Also generate ONE bossQuiz at the end.`;

  const inputBlock = isEs
    ? `\n\nDATOS DE ENTRADA:\n- Materia: ${args.subjectTitle}\n- Descripción: ${args.subjectDescription}\n- Nivel Escolar: ${gradeLabel}\n- Mundo del Usuario: ${world}\n- Pool de Referencias Frescas (úsalas): ${refs}\n- Analogías PROHIBIDAS para este grado: ${banned}\n- Nivel de Habilidad en esta Materia: ${args.skillLevel.toUpperCase()}\n- Vibe del Lote: ${args.vibeSeed} (úsalo como tono/escenario para al menos UNA tarjeta journey)\n\nREGLAS DURAS:\n1. Cada tarjeta DEBE conectarse explícitamente con la Materia de arriba.\n2. Cada analogía/escenario DEBE encajar en el Mundo del Usuario. NUNCA uses las analogías prohibidas.\n3. CALIBRACIÓN POR HABILIDAD: ${skillRule}`
    : `\n\nINPUT DATA:\n- Subject: ${args.subjectTitle}\n- Description: ${args.subjectDescription}\n- Grade Level: ${gradeLabel}\n- User's World: ${world}\n- Fresh Reference Pool (use these): ${refs}\n- BANNED analogies for this grade: ${banned}\n- Skill Level on this Subject: ${args.skillLevel.toUpperCase()}\n- Batch Vibe: ${args.vibeSeed} (use it as tone/scenario for at least ONE journey card)\n\nHARD RULES:\n1. Every card MUST explicitly connect to the Subject above.\n2. Every analogy/scenario MUST fit the User's World. NEVER use the banned analogies.\n3. SKILL CALIBRATION: ${skillRule}`;

  return `${persona} ${doctrine}${inputBlock}${agendaBlock}${recentBlock}${countryBlock}${langLine}${typesLine}\n\n${schema}`;
}

export function buildShortTextPrompt(type: "intro" | "summary", opts: {
  name: string;
  lang: Lang;
  grade?: string | null;
  birthYear?: string;
  ageGroup: string;
  skillLevel: SkillLevel;
  subject: string;
}): string {
  const ctx = getGradeContext(opts.grade, opts.birthYear, opts.ageGroup);
  const isEs = opts.lang === "es";
  const gradeLabel = isEs ? ctx.labelEs : ctx.labelEn;
  const world = isEs ? ctx.worldEs : ctx.worldEn;
  const skill = opts.skillLevel.toUpperCase();
  if (type === "intro") {
    return isEs
      ? `Eres el Motor Maestro de Currículo de Moolab. Genera un saludo ÚNICO, carismático y personalizado para ${opts.name}. Grado: ${gradeLabel}. Habilidad: ${skill}. Materia de hoy: ${opts.subject}. Mundo del usuario: ${world}. MÁX 25 palabras. Trátalo como un futuro CEO. Varía energía y vocabulario cada vez. Solo el texto, sin comillas ni formato.`
      : `You are the Moolab Master Curriculum Engine. Generate a UNIQUE, charismatic personalized greeting for ${opts.name}. Grade: ${gradeLabel}. Skill: ${skill}. Today's subject: ${opts.subject}. User's world: ${world}. MAX 25 words. Treat them like a future CEO. Vary your energy and vocabulary every time. Respond with ONLY the text, no quotes or formatting.`;
  }
  return isEs
    ? `Eres el Motor Maestro de Currículo de Moolab. Genera una felicitación ÚNICA y alentadora para ${opts.name} (${gradeLabel}, habilidad ${skill}) que acaba de completar una lección sobre ${opts.subject}. Mundo: ${world}. MÁX 25 palabras. Trátalo como un futuro CEO. Varía el tono cada vez. Solo texto, sin comillas.`
    : `You are the Moolab Master Curriculum Engine. Generate a UNIQUE encouraging note for ${opts.name} (${gradeLabel}, ${skill} skill) who just finished a lesson on ${opts.subject}. World: ${world}. MAX 25 words. Treat them like a future CEO. Vary tone every time. Only the text, no quotes.`;
}
