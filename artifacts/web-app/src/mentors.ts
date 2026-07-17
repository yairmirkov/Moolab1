
// ─── Types ────────────────────────────────────────────────────────────────────

export type MentorCategory = "core" | "honorable" | "motivational";

export interface MentorQuote {
  text: string;
  source: string;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  emoji: string;
  category: MentorCategory;
  tagline: string;
  tags: string[];
  bio: string;
  whyLegendary: string;
  quotes: MentorQuote[];
  keyIdeas: string[];
  lessonTitle: string;
  lessonPrinciples: string[];
}

// ─── Roster ───────────────────────────────────────────────────────────────────

export const MENTORS: Mentor[] = [
  {
    id: "buffett",
    name: "Warren Buffett",
    title: "The Oracle of Omaha",
    emoji: "🏦",
    category: "core",
    tagline: "Value Investing",
    tags: ["Compound Interest", "Economic Moats", "Patience"],
    bio: "Starting with $114 at age 11, Warren Buffett became one of history's greatest investors by sticking to one idea: buy wonderful businesses at fair prices, then wait.",
    whyLegendary: "Buffett turned disciplined, long-term thinking into one of history's greatest fortunes — not by chasing trends, but by understanding businesses deeply and letting compounding do the heavy lifting.",
    quotes: [
      { text: "The stock market is a device for transferring money from the impatient to the patient.", source: "Warren Buffett, various interviews" },
      { text: "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.", source: "The Essays of Warren Buffett" },
      { text: "Someone is sitting in the shade today because someone planted a tree a long time ago.", source: "Warren Buffett, shareholder letters" },
    ],
    keyIdeas: ["Economic moats", "Intrinsic value", "Margin of safety", "Circle of competence", "The power of compounding"],
    lessonTitle: "Think Like Buffett",
    lessonPrinciples: ["economic moats protect businesses from competition", "only invest in what you understand", "compound interest grows wealth exponentially over time", "patience is an investor's biggest advantage", "price and value are different things"],
  },
  {
    id: "munger",
    name: "Charlie Munger",
    title: "The Architect of Wisdom",
    emoji: "🧠",
    category: "core",
    tagline: "Mental Models",
    tags: ["First Principles", "Multidisciplinary", "Inversion"],
    bio: "Warren Buffett's lifelong partner, Charlie Munger believed the secret to smart decisions is building a 'latticework' of mental models drawn from every field — math, psychology, history, science.",
    whyLegendary: "Munger showed that investing is really just clear thinking applied to business. His concept of inversion — 'invert, always invert' — is used by problem-solvers everywhere.",
    quotes: [
      { text: "Invert, always invert: turn a situation or problem upside down. Look at it backwards.", source: "Poor Charlie's Almanack" },
      { text: "All I want to know is where I'm going to die, so I'll never go there.", source: "Poor Charlie's Almanack" },
      { text: "It's not supposed to be easy. Anyone who finds it easy is stupid.", source: "Various interviews" },
    ],
    keyIdeas: ["Mental models", "Inversion thinking", "First-principles reasoning", "Avoiding cognitive biases", "Multidisciplinary learning"],
    lessonTitle: "Think Backwards",
    lessonPrinciples: ["inversion: figure out what to avoid, not just what to pursue", "mental models are thinking tools from different fields", "understanding human psychology helps you make better decisions", "avoiding big mistakes matters as much as finding big wins"],
  },
  {
    id: "oleary",
    name: "Kevin O'Leary",
    title: "Mr. Wonderful",
    emoji: "💰",
    category: "core",
    tagline: "Cash Flow",
    tags: ["Cash Flow", "Business Metrics", "Discipline"],
    bio: "Kevin O'Leary built a software empire from nothing and became famous for one relentless question: 'How does this business make money?' He invests only in cash-flowing businesses.",
    whyLegendary: "O'Leary cuts through hype to the core of any business: does it generate cash? His blunt approach teaches you to evaluate investments with cold logic, not emotion.",
    quotes: [
      { text: "Money has no emotions. It doesn't care if you're sad. It's a tool you have to learn to use.", source: "Shark Tank, various episodes" },
      { text: "Every dollar you spend is a soldier fighting for your financial freedom or against it.", source: "Cold Hard Truth (book)" },
      { text: "No sales, no company. It's that simple.", source: "Various interviews" },
    ],
    keyIdeas: ["Cash flow over revenue", "Business unit economics", "Emotional discipline with money", "Dividends and passive income", "Every dollar as a soldier"],
    lessonTitle: "Make Your Money Work",
    lessonPrinciples: ["cash flow is the lifeblood of any business", "revenue without profit is just noise", "money is a tool — treat it with discipline", "passive income means money working while you sleep", "understand unit economics before investing"],
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    title: "Bridgewater Founder",
    emoji: "⚖️",
    category: "core",
    tagline: "Risk Balance",
    tags: ["Diversification", "Economic Cycles", "Radical Honesty"],
    bio: "Ray Dalio built Bridgewater Associates into the world's largest hedge fund by obsessing over two things: understanding economic cycles deeply and balancing risk systematically.",
    whyLegendary: "Dalio's 'All Weather Portfolio' concept — owning different assets that perform in different economic conditions — changed how millions of people think about managing risk.",
    quotes: [
      { text: "Diversifying well is the most important thing you need to do in order to invest well.", source: "Principles (book)" },
      { text: "Pain plus reflection equals progress.", source: "Principles (book)" },
      { text: "He who lives by the crystal ball will eat shattered glass.", source: "Various interviews" },
    ],
    keyIdeas: ["All-Weather diversification", "Economic machine cycles", "Risk parity", "Radical transparency", "Debt cycles"],
    lessonTitle: "Balance Your Risk",
    lessonPrinciples: ["diversification reduces risk without reducing returns much", "economies move in predictable cycles", "spreading investments across asset types smooths out volatility", "understanding debt cycles predicts economic booms and busts", "reflect on mistakes to avoid repeating them"],
  },
  {
    id: "musk",
    name: "Elon Musk",
    title: "Serial Entrepreneur",
    emoji: "🚀",
    category: "core",
    tagline: "First Principles",
    tags: ["First Principles", "Moonshots", "Iteration"],
    bio: "Elon Musk co-founded PayPal, then built Tesla and SpaceX from scratch by refusing to accept 'that's how it's done' as an answer. He reasons from first principles.",
    whyLegendary: "Musk's approach of breaking problems down to their fundamental physics — not industry convention — unlocked breakthroughs in electric cars, rockets, and solar energy that experts said were impossible.",
    quotes: [
      { text: "When something is important enough, you do it even if the odds are not in your favor.", source: "60 Minutes interview, 2014" },
      { text: "I think it's possible for ordinary people to choose to be extraordinary.", source: "Various interviews" },
      { text: "Physics is the law; everything else is a recommendation.", source: "Various interviews" },
    ],
    keyIdeas: ["First-principles thinking", "Cost physics vs. convention", "Iteration and rapid testing", "Vertical integration", "Thinking at scale"],
    lessonTitle: "Build From First Principles",
    lessonPrinciples: ["first principles: break problems to their fundamental truths", "question the cost and logic behind 'how things are done'", "fast iteration beats perfect planning", "mission-driven companies attract better talent and loyalty", "think about what's physically possible, not what's conventional"],
  },
  {
    id: "wood",
    name: "Cathie Wood",
    title: "ARK Invest CEO",
    emoji: "🔬",
    category: "core",
    tagline: "Disruptive Innovation",
    tags: ["Innovation", "Long-term Trends", "AI & Tech"],
    bio: "Cathie Wood founded ARK Invest to focus exclusively on disruptive innovation — betting on technologies like AI, genomics, and blockchain before the mainstream caught on.",
    whyLegendary: "Wood pioneered the idea of building concentrated, high-conviction portfolios around transformative technologies, and made her research process transparent to the public.",
    quotes: [
      { text: "Innovation is not a risk. Ignoring innovation is the risk.", source: "Various ARK Invest research notes" },
      { text: "We focus on the biggest investment opportunities in the history of the world.", source: "Various interviews" },
    ],
    keyIdeas: ["Disruptive innovation cycles", "Exponential growth curves", "High-conviction concentration", "Wright's Law (learning curves)", "Open research"],
    lessonTitle: "Bet on the Future",
    lessonPrinciples: ["disruptive technologies follow S-curves of adoption", "innovation lowers costs exponentially over time", "the biggest risks are ignoring change", "high conviction investing means fewer but stronger bets", "learning curves make new technologies cheaper every year"],
  },
  {
    id: "jobs",
    name: "Steve Jobs",
    title: "Apple Co-founder",
    emoji: "🍎",
    category: "core",
    tagline: "Design & Vision",
    tags: ["Product Thinking", "Simplicity", "User Experience"],
    bio: "Steve Jobs co-founded Apple, was fired, came back, and turned it into the world's most valuable company — by obsessing over the intersection of technology and the liberal arts.",
    whyLegendary: "Jobs understood that great products are about the human experience, not just specs. He taught the world that design, simplicity, and storytelling are competitive advantages.",
    quotes: [
      { text: "Simple can be harder than complex. You have to work hard to get your thinking clean to make it simple.", source: "BusinessWeek interview, 1998" },
      { text: "The people who are crazy enough to think they can change the world are the ones who do.", source: "Apple 'Think Different' campaign" },
      { text: "Stay hungry, stay foolish.", source: "Stanford Commencement Address, 2005" },
    ],
    keyIdeas: ["Intersection of tech and humanities", "Simplicity as a design principle", "Saying no to 1000 things", "Building products users love", "Vision-led leadership"],
    lessonTitle: "Think Different About Business",
    lessonPrinciples: ["simplicity is the ultimate sophistication", "great design solves problems users didn't know they had", "focus means saying no to almost everything", "the best businesses sit at the intersection of technology and humanity", "storytelling is a core business skill"],
  },
  {
    id: "ackman",
    name: "Bill Ackman",
    title: "Pershing Square CEO",
    emoji: "📊",
    category: "core",
    tagline: "Activist Investing",
    tags: ["Deep Research", "Conviction", "Activist Value"],
    bio: "Bill Ackman runs Pershing Square Capital with a concentrated, high-conviction style — taking large stakes in companies he believes are mispriced, then working to unlock their value.",
    whyLegendary: "Ackman's public presentations on his investment theses are legendary for their depth and clarity. He turned research into storytelling, making complex investment cases accessible.",
    quotes: [
      { text: "The key to successful investing is finding great businesses at reasonable prices.", source: "Various investor letters" },
      { text: "We look for simple, predictable, free cash flow generative businesses.", source: "Various investor presentations" },
    ],
    keyIdeas: ["Concentrated high-conviction bets", "Activist catalysts", "Free cash flow analysis", "Margin of safety", "Public research as a tool"],
    lessonTitle: "The Art of the Investment Thesis",
    lessonPrinciples: ["a thesis is a clear argument for why an investment will pay off", "free cash flow is the truest measure of a business's health", "concentration amplifies both gains and losses", "activism can unlock value that management misses", "the best investments are boring and predictable"],
  },
  {
    id: "bezos",
    name: "Jeff Bezos",
    title: "Amazon Founder",
    emoji: "📦",
    category: "honorable",
    tagline: "Long-term Thinking",
    tags: ["Long-term", "Customer Obsession", "Flywheel"],
    bio: "Jeff Bezos built Amazon into one of Earth's most valuable companies by obsessing over the customer and reinvesting every dollar into the future — for decades.",
    whyLegendary: "Bezos introduced the world to the concept of the 'flywheel' — a self-reinforcing cycle where growth begets more growth. His willingness to sacrifice short-term profits for long-term dominance is studied in every business school.",
    quotes: [
      { text: "We are willing to be misunderstood for long periods of time.", source: "Amazon shareholder letter, 1997" },
      { text: "If you never want to be criticized, for goodness' sake don't do anything new.", source: "Various interviews" },
      { text: "Your margin is my opportunity.", source: "Various business discussions" },
    ],
    keyIdeas: ["Flywheel business models", "Day 1 culture", "Customer obsession over competitor obsession", "Working backwards from the customer", "Long-term over short-term"],
    lessonTitle: "Build a Flywheel",
    lessonPrinciples: ["flywheels are self-reinforcing business cycles", "obsess over the customer, not the competition", "sacrifice short-term margins to win long-term markets", "start with the customer experience and work backwards", "Day 1 culture means acting like a startup even as you scale"],
  },
  {
    id: "naval",
    name: "Naval Ravikant",
    title: "AngelList Co-founder",
    emoji: "🧘",
    category: "honorable",
    tagline: "Wealth Wisdom",
    tags: ["Leverage", "Specific Knowledge", "Equity"],
    bio: "Naval Ravikant co-founded AngelList and has become one of the most influential thinkers on wealth creation, writing a viral tweetstorm called 'How to Get Rich (without getting lucky)'.",
    whyLegendary: "Naval distilled wealth creation into clear, timeless principles: seek equity not salary, build specific knowledge that can't be taught, and use leverage — code, media, and capital — to multiply your impact without multiplying your hours.",
    quotes: [
      { text: "You're not going to get rich renting out your time. You must own equity.", source: "How to Get Rich (podcast/tweetstorm)" },
      { text: "Specific knowledge is knowledge you cannot be trained for. It's found by pursuing your genuine curiosity.", source: "How to Get Rich" },
      { text: "Play long-term games with long-term people.", source: "How to Get Rich" },
    ],
    keyIdeas: ["Equity over salary", "Specific knowledge and unfair advantages", "Leverage: code, media, and capital", "Building a personal monopoly", "Compounding relationships"],
    lessonTitle: "Build Leverage",
    lessonPrinciples: ["equity ownership multiplies wealth in a way salary never can", "specific knowledge is hard to replicate and very valuable", "code and content are leverage — they work while you sleep", "seek to own a piece of what you build", "long-term thinking with trustworthy people compounds wealth"],
  },
  {
    id: "lynch",
    name: "Peter Lynch",
    title: "Fidelity Magellan Manager",
    emoji: "📈",
    category: "honorable",
    tagline: "Invest What You Know",
    tags: ["Common Sense", "Growth Investing", "Research"],
    bio: "Peter Lynch ran Fidelity Magellan Fund to a 29% annual return for 13 years by following one simple rule: invest in businesses you understand from everyday life.",
    whyLegendary: "Lynch democratized investing by showing ordinary people have an edge over Wall Street — they see great companies before analysts do, simply by paying attention to the world around them.",
    quotes: [
      { text: "Invest in what you know.", source: "One Up on Wall Street (book)" },
      { text: "The person that turns over the most rocks wins the game.", source: "One Up on Wall Street" },
      { text: "Know what you own, and know why you own it.", source: "One Up on Wall Street" },
    ],
    keyIdeas: ["Invest in what you understand", "Tenbaggers: stocks that grow 10x", "GARP: growth at a reasonable price", "PEG ratio", "Research from everyday observations"],
    lessonTitle: "Invest in What You Know",
    lessonPrinciples: ["ordinary people spot great companies in daily life before Wall Street does", "understand every business you invest in", "growth at a reasonable price beats chasing hype", "the more research you do, the better your odds", "hold winners and cut losers, not the other way around"],
  },
];

export const CORE_MENTORS = MENTORS.filter(m => m.category === "core");
export const HONORABLE_MENTORS = MENTORS.filter(m => m.category === "honorable");