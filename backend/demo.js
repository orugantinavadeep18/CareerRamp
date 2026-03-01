// ─────────────────────────────────────────────────────────
//  demo.js — CareerRamp Fallback Data
//  Returns realistic demo responses when Gemini API is unavailable
//  (network block, quota exhausted, etc.)
//  All data is personalized using actual user inputs.
// ─────────────────────────────────────────────────────────

function analyzeFallback({ name, location, education, stream, activities = [], quizScore = 6, financialCondition, age } = {}) {
  const n = name || 'Student'
  const loc = location || 'India'
  const fin = financialCondition || 'middle class'
  const score = parseInt(quizScore) || 6
  const isHighScorer = score >= 7

  const topCareer = isHighScorer ? 'Full-Stack Web Developer' : 'Digital Marketing Analyst'
  const secondCareer = isHighScorer ? 'Data Analyst' : 'Content Creator & Strategist'
  const thirdCareer = 'UI/UX Designer'

  return {
    agentThoughts: [
      `Analyzing personality profile from: ${activities.slice(0, 2).join(', ') || 'varied interests'}...`,
      `Aptitude score ${score}/10 → mapping to ${isHighScorer ? 'technical' : 'analytical'}-track careers...`,
      `Filtering careers by financial situation: ${fin}...`,
      `Identifying localized opportunities in ${loc}...`,
      `Generating 6-month career roadmap and 5-year market forecast...`
    ],
    personalityType: `${isHighScorer ? 'Analytical Problem-Solver with Technical Inclinations' : 'Creative Communicator with Analytical Thinking'} — excels at structured tasks with room for creativity`,
    topMatches: [
      {
        career: topCareer,
        domain: 'Tech',
        matchScore: 88 + (score - 6) * 2,
        whyFit: `Your aptitude score of ${score}/10 and interest in ${activities[0] || 'problem-solving'} align perfectly with ${topCareer}. The ${loc} tech market is growing 35% YoY, making this a high-demand entry point.`,
        avgEntrySalary: '₹4–6 LPA',
        avgMidSalary: '₹10–18 LPA',
        growthRate: 'High',
        risk: 'Low',
        studyDuration: '6–9 months',
        approxCost: '₹5,000–30,000 (mostly free resources)',
        roi: 'High',
        competitionLevel: 'High',
        demandIn5Years: 'Surging',
        localOpportunities: [`${loc} IT park startups`, 'Remote freelance across India', 'Government digital India projects']
      },
      {
        career: secondCareer,
        domain: 'Tech',
        matchScore: 79,
        whyFit: `Your profile shows strong pattern recognition skills ideal for ${secondCareer}. Entry barrier is low and demand from Indian SMEs is exploding.`,
        avgEntrySalary: '₹3–5 LPA',
        avgMidSalary: '₹8–15 LPA',
        growthRate: 'High',
        risk: 'Low',
        studyDuration: '3–6 months',
        approxCost: '₹0–15,000',
        roi: 'High',
        competitionLevel: 'Medium',
        demandIn5Years: 'Surging',
        localOpportunities: [`Local businesses in ${loc}`, 'Indian e-commerce brands', 'EdTech companies']
      },
      {
        career: thirdCareer,
        domain: 'Creative',
        matchScore: 73,
        whyFit: 'UI/UX bridges creativity with logic — a great fit for profiles that enjoy both art and problem-solving. India has 45,000+ unfilled UX roles right now.',
        avgEntrySalary: '₹4–7 LPA',
        avgMidSalary: '₹12–22 LPA',
        growthRate: 'High',
        risk: 'Low',
        studyDuration: '6–12 months',
        approxCost: '₹10,000–40,000',
        roi: 'High',
        competitionLevel: 'Medium',
        demandIn5Years: 'High',
        localOpportunities: ['Product startups in metro cities', 'Remote design agencies', 'SaaS companies across India']
      },
      {
        career: 'Government IT Officer (NIC / DRDO / ISRO)',
        domain: 'Government',
        matchScore: 68,
        whyFit: 'For students who prefer job security, government tech roles offer ₹7–12 LPA + perks. Exams like CDS Computer Science and NIELIT B-level open doors early.',
        avgEntrySalary: '₹6–9 LPA',
        avgMidSalary: '₹11–18 LPA',
        growthRate: 'Stable',
        risk: 'Low',
        studyDuration: '1–2 years (exam prep)',
        approxCost: '₹2,000–20,000',
        roi: 'High',
        competitionLevel: 'High',
        demandIn5Years: 'Stable',
        localOpportunities: ['State IT dept', 'BSNL', 'NIC district offices', 'DRDO lab in nearby cities']
      },
      {
        career: 'Cybersecurity Analyst',
        domain: 'Emerging',
        matchScore: 71,
        whyFit: 'India faces a critical shortage of 3 lakh cybersecurity professionals. Entry via CEH or CompTIA Security+ certification is cheaper than college and pays well fast.',
        avgEntrySalary: '₹5–8 LPA',
        avgMidSalary: '₹14–25 LPA',
        growthRate: 'High',
        risk: 'Low',
        studyDuration: '6–12 months',
        approxCost: '₹15,000–60,000',
        roi: 'High',
        competitionLevel: 'Low',
        demandIn5Years: 'Surging',
        localOpportunities: ['Banking sector CISO roles', 'IT service companies', 'Government cybercell', 'Startups in ${loc}']
      }
    ],
    skillGapAnalysis: {
      forCareer: topCareer,
      required: ['HTML/CSS/JavaScript', 'React or Vue.js', 'Node.js Basics', 'Git & GitHub', 'REST APIs'],
      currentlyHave: activities.length > 0 ? ['Basic computer skills', 'Problem-solving mindset'] : ['Eagerness to learn'],
      needToLearn: ['JavaScript (ES6+)', 'React.js', 'Node.js + Express', 'MongoDB basics', 'Deployment (Vercel/Render)'],
      difficultyToAcquire: 'Moderate'
    },
    roadmap: [
      {
        month: 'Month 1',
        focus: 'HTML, CSS & JavaScript Fundamentals',
        tasks: ['Complete FreeCodeCamp Responsive Web Design (40 hrs)', 'Build 3 static pages (portfolio, form, product landing)', 'Learn Git: init, commit, push to GitHub'],
        milestone: 'Personal portfolio site live on GitHub Pages',
        resources: ['freeCodeCamp.org (free)', 'The Odin Project', 'W3Schools reference']
      },
      {
        month: 'Month 2',
        focus: 'JavaScript Deep Dive + DOM Manipulation',
        tasks: ['FreeCodeCamp JS Algorithms cert', 'Build a To-Do app, weather widget (using free API)', 'Learn array methods, async/await, fetch API'],
        milestone: 'Two interactive JS projects on GitHub',
        resources: ['JavaScript.info (free)', 'Traversy Media YouTube', 'Eloquent JS (free PDF)']
      },
      {
        month: 'Month 3',
        focus: 'React.js – Component-Based Development',
        tasks: ['Meta React course on Coursera (audit free)', 'Build a movie-search app using OMDB API', 'Understand state, props, hooks (useState, useEffect)'],
        milestone: 'React app deployed on Vercel',
        resources: ['Reactjs.org docs', 'Scrimba React course (free tier)', 'Kevin Powell YouTube']
      },
      {
        month: 'Month 4',
        focus: 'Backend – Node.js + Express + MongoDB',
        tasks: ['Build a REST API: users, auth, CRUD', 'Connect MongoDB Atlas (free tier)', 'Deploy on Render free tier'],
        milestone: 'Full-stack CRUD app with login/signup live',
        resources: ['Node.js docs', 'Mongoose docs', 'Traversy MERN crash course']
      },
      {
        month: 'Month 5',
        focus: 'Projects + Portfolio Enhancement',
        tasks: ['Build 1 major project (e-commerce, job board, or clone)', 'Write 2 technical blog posts on Dev.to', 'Optimize GitHub profile with pinned repos'],
        milestone: 'Portfolio with 3 full-stack projects + LinkedIn updated',
        resources: ['Dev.to community', 'Hashnode blogging', 'GitHub profile README guides']
      },
      {
        month: 'Month 6',
        focus: 'Job Applications + Interview Prep',
        tasks: ['Apply to 15 companies via LinkedIn / Naukri / Internshala', 'Practice 50 LeetCode easy problems', 'Attend 2 local tech meetups or virtual hackathons'],
        milestone: 'First technical interview call received',
        resources: ['Naukri.com', 'LinkedIn Jobs', 'LeetCode', 'InterviewBit (free)']
      }
    ],
    salaryComparison: [
      { career: 'Full-Stack Developer', entry: '₹4 LPA', mid: '₹12 LPA', senior: '₹28 LPA', growth: 'High', risk: 'Low', competition: 'High' },
      { career: 'Data Analyst', entry: '₹3.5 LPA', mid: '₹10 LPA', senior: '₹22 LPA', growth: 'High', risk: 'Low', competition: 'Medium' },
      { career: 'UI/UX Designer', entry: '₹4 LPA', mid: '₹13 LPA', senior: '₹25 LPA', growth: 'High', risk: 'Low', competition: 'Medium' },
      { career: 'Government IT Officer', entry: '₹7 LPA', mid: '₹12 LPA', senior: '₹18 LPA', growth: 'Stable', risk: 'Low', competition: 'High' },
      { career: 'Cybersecurity Analyst', entry: '₹6 LPA', mid: '₹16 LPA', senior: '₹35 LPA', growth: 'High', risk: 'Low', competition: 'Low' }
    ],
    careerComparison: [
      { career: 'Full-Stack Developer', studyDuration: '6–9 months', cost: '₹0–30K', roi: 'High', competition: 'High', jobAvailability: 'High', workLifeBalance: 'Average' },
      { career: 'Data Analyst', studyDuration: '3–6 months', cost: '₹0–15K', roi: 'High', competition: 'Medium', jobAvailability: 'High', workLifeBalance: 'Good' },
      { career: 'UI/UX Designer', studyDuration: '6–12 months', cost: '₹10–40K', roi: 'High', competition: 'Medium', jobAvailability: 'High', workLifeBalance: 'Good' },
      { career: 'Government IT', studyDuration: '1–2 years', cost: '₹2–20K', roi: 'High', competition: 'High', jobAvailability: 'Stable', workLifeBalance: 'Good' },
      { career: 'Cybersecurity', studyDuration: '6–12 months', cost: '₹15–60K', roi: 'High', competition: 'Low', jobAvailability: 'High', workLifeBalance: 'Average' }
    ],
    marketDemand: {
      analysis: `India's digital economy is projected to reach $1 trillion by 2030, driving exponential demand for ${topCareer}s. ${loc} is emerging as a tier-2 tech hub with 60+ startups hiring freshers in the next 12 months.`,
      growingFields: ['AI & Machine Learning', 'Cybersecurity', 'Cloud Computing', 'Full-Stack Development', 'Data Science', 'Drone & Robotics Tech'],
      decliningFields: ['Traditional BPO/Call Centers', 'Basic Data Entry', 'Print Media Jobs'],
      prediction: `By 2030, ${topCareer}s with AI tool proficiency will command 3× the salary of those without — upskilling in LLM APIs and automation will be the single most important differentiator.`
    },
    localizedOpportunities: {
      region: loc,
      relevantExams: ['GATE CS (for PSU/research)', 'NIELIT B Level', 'Staff Selection Commission (CGL/CHSL IT Posts)', 'State IT Department Exams'],
      skillPrograms: ['PM Kaushal Vikas Yojana (PMKVY) — IT sector courses', 'NASSCOM FutureSkills Prime (free for students)', 'Digital India Internship Scheme', 'IIT/IIM Online Certificate Programs (SWAYAM — free)'],
      industries: ['IT Services & Product Companies', 'Fintech Startups', 'Edtech Platforms', 'Government Digital India Projects', 'E-Commerce & D2C Brands']
    },
    hiddenCareers: [
      'Prompt Engineer / AI Workflow Designer — ₹8–20 LPA entry, huge demand, No CS degree needed',
      'No-Code/Low-Code Developer (Bubble, FlutterFlow) — Build apps without coding, freelance ₹50K+/month',
      'Technical Content Writer — ₹4–12 LPA, work remotely, combines writing + tech',
      'Cloud Solutions Architect (AWS/Azure certifications) — ₹15–40 LPA, fastest-growing role in India',
      'Drone Technology Specialist — Emerging sector, DGCA licensed pilots earn ₹6–18 LPA'
    ],
    radarData: {
      labels: ['Analytical', 'Creative', 'Communication', 'Technical', 'Leadership', 'Practical'],
      scores: [
        Math.min(95, 55 + score * 4),
        activities.includes('Drawing') || activities.includes('Writing') ? 78 : 58,
        62,
        Math.min(90, 50 + score * 5),
        54,
        68
      ]
    },
    personalizedAdvice: `${n}, based on your ${education} background in ${loc} with a quiz score of ${score}/10, you're perfectly positioned to enter the tech industry within 6 months — completely self-funded using free resources. Start with HTML/CSS today on freeCodeCamp; consistency for 2 hours daily is all you need to land your first ₹4–6 LPA role.`
  }
}

function quizFallback({ skill = 'JavaScript', stepTitle, role = 'developer', level = 'beginner', count = 4 } = {}) {
  const topic = stepTitle || skill
  const allQuestions = [
    {
      id: 1,
      question: `Which of the following best describes the purpose of "${topic}" in modern development?`,
      options: ['A) It handles database connections only', 'B) It is a core building block for learning and applying practical skills', 'C) It replaces the need for any other tool', 'D) It is only used in enterprise-level projects'],
      correctAnswer: 'B',
      explanation: `"${topic}" is a fundamental concept in ${role} learning paths. Understanding its core purpose helps you apply it across many contexts effectively.`,
      difficulty: 'easy'
    },
    {
      id: 2,
      question: `As a ${level} ${role}, which approach is BEST when first learning "${topic}"?`,
      options: ['A) Memorize all documentation before starting', 'B) Build a small project applying the concept directly', 'C) Watch videos without practicing', 'D) Skip to advanced topics immediately'],
      correctAnswer: 'B',
      explanation: 'Project-based learning is the most effective approach — it forces you to apply knowledge, encounter real problems, and build problem-solving skills simultaneously.',
      difficulty: 'medium'
    },
    {
      id: 3,
      question: `What is the MOST common mistake learners make when studying "${topic}"?`,
      options: ['A) Practicing too much', 'B) Building projects too early', 'C) Tutorial hell — watching without building real projects', 'D) Reading documentation carefully'],
      correctAnswer: 'C',
      explanation: '"Tutorial hell" — passively watching tutorials without building — is the #1 reason learners stall. Active practice and project-building are essential for retention.',
      difficulty: 'medium'
    },
    {
      id: 4,
      question: `To truly verify mastery of "${topic}", a ${role} should be able to:`,
      options: ['A) Recite the definition from memory', 'B) Explain it, apply it, debug related issues, and teach it to someone else', 'C) Complete one tutorial successfully', 'D) Pass an online quiz with correct answers'],
      correctAnswer: 'B',
      explanation: 'True mastery — "Feynman technique" — means you can explain, apply, debug, and teach the concept. If you can teach it simply, you truly understand it.',
      difficulty: 'hard'
    }
  ]

  return {
    topic,
    questions: allQuestions.slice(0, Math.min(count, 4)),
    passingScore: Math.ceil(count * 0.75)
  }
}

function chatFallback({ message = '', context = {} } = {}) {
  const name = context.name || 'friend'
  const career = context.topCareer || 'your chosen career'
  const loc = context.location || 'India'
  const msg = message.toLowerCase()

  // keyword-based smart responses
  if (msg.includes('salary') || msg.includes('earn') || msg.includes('pay') || msg.includes('lpa')) {
    return `Great question! In ${loc}, entry-level roles in **${career}** typically pay **₹3–6 LPA**. Within 2–3 years of consistent upskilling, you can reach **₹10–18 LPA**. The key is to build a strong GitHub portfolio and certifications — these matter more than your college brand for your first 3 jobs. Which specific salary range are you targeting?`
  }
  if (msg.includes('exam') || msg.includes('gate') || msg.includes('upsc') || msg.includes('ssc') || msg.includes('government')) {
    return `For government tech roles, **GATE CS** opens doors to PSUs like BSNL, BHEL, and research labs like DRDO/ISRO. **NIELIT B Level** is excellent for government IT officer roles without an engineering degree. **Staff Selection Commission (SSC)** has IT cadre posts too. These exams have 1–2 year prep timelines but offer **₹6–12 LPA + DA + HRA** with strong job security. Want a specific study plan for any of these?`
  }
  if (msg.includes('course') || msg.includes('learn') || msg.includes('study') || msg.includes('certificate')) {
    return `For ${career}, the best **free resources** are: **freeCodeCamp** (web dev), **Google's Data Analytics Certificate** on Coursera (audit free), **SWAYAM/NPTEL** (IIT professors, government-recognized), and **YouTube channels** like Traversy Media or Corey Schafer. Paid but affordable: Udemy courses go for **₹499** in sales. Avoid spending ₹50,000+ on bootcamps until you've validated your interest with free resources first!`
  }
  if (msg.includes('job') || msg.includes('hire') || msg.includes('placement') || msg.includes('apply')) {
    return `For job hunting in ${loc}: **LinkedIn + Naukri.com + Internshala** are your top 3 platforms. Build your GitHub with 3 strong projects first — recruiters check it. For freshers, **Internshala internships** (paid, ₹5–15K/month) are golden stepping stones to PPOs. Also try direct applications on company career pages — less competition. Target **tier-2 product startups** first — they hire faster and give more ownership. Your first job doesn't need to be perfect, just real experience!`
  }
  if (msg.includes('roadmap') || msg.includes('plan') || msg.includes('path') || msg.includes('start')) {
    return `For ${name} targeting ${career}: Start with **Month 1 — foundations** (HTML/CSS/JS or Python — 2 hrs/day). Month 2–3: **core frameworks** (React, Node, or relevant stack). Month 4: **build 2 real projects** solving actual problems. Month 5: **deploy everything live** (Vercel/Render are free). Month 6: **apply actively** (15+ applications/week with a polished portfolio). The magic formula — consistency > intensity. 2 hours every day beats 14 hours on weekends!`
  }
  if (msg.includes('financial') || msg.includes('money') || msg.includes('afford') || msg.includes('expensive') || msg.includes('fee')) {
    return `${name}, here's the truth — you don't need to spend ₹2 lakh to break into tech. **freeCodeCamp, The Odin Project, CS50 (Harvard — free), SWAYAM** give world-class education at ₹0. Budget ₹5,000–10,000 total for: domain name (₹800/year), a Udemy course or two (₹499 each in sale), and certifications when ready. Indian government also offers **PMKVY** skill development stipends and **National Scholarship Portal** benefits. What's your current monthly budget for learning?`
  }

  // Default thoughtful response
  return `${name}, that's a really thoughtful question about ${career}! The Indian job market in 2026 is changing fast — companies now value **demonstrable skills** over degrees for most tech and creative roles. My #1 advice: build something real this week, even a simple project using what you've learned so far. Consistency and visible output (GitHub, portfolio, LinkedIn posts) are what separate people who get hired from those who don't. What specific challenge are you facing right now — I can give you a more targeted answer!`
}

function replanFallback({ career, completedSteps = [], totalSteps = 6, feedback = '' } = {}) {
  const c = career || 'Full-Stack Developer'
  const done = parseInt(completedSteps) || 1
  const remaining = Math.max(totalSteps - done, 2)

  const steps = []
  const stepTemplates = [
    { focus: `Advanced ${c} Concepts`, task: `Deep dive into advanced patterns and best practices for ${c}`, milestone: `Complete an advanced project applying ${c} skills`, resources: ['YouTube deep-dive courses', 'Official documentation', 'Dev.to articles'] },
    { focus: 'Real Project Development', task: `Build a production-quality project for your ${c} portfolio`, milestone: 'Project live on the internet with README and demo video', resources: ['GitHub Pages', 'Vercel', 'Render free tier'] },
    { focus: 'Open Source Contribution', task: 'Find a beginner-friendly GitHub issue and submit a PR', milestone: 'First open-source contribution merged', resources: ['goodfirstissue.dev', 'GitHub Explore', 'Up For Grabs'] },
    { focus: 'Interview Preparation', task: 'Practice 30 coding problems + 10 system design concepts', milestone: 'Complete 2 mock interviews on Pramp.com', resources: ['LeetCode Easy/Medium', 'Pramp.com (free)', 'Interviewing.io'] },
    { focus: 'Professional Networking', task: 'Optimize LinkedIn, connect with 20 professionals in target field', milestone: 'Profile with 500+ connections and 2 recommendations', resources: ['LinkedIn', 'Twitter/X Tech community', 'Local tech meetups'] },
    { focus: 'Job Applications & Negotiation', task: 'Apply to 20 companies, follow up professionally, prep for offers', milestone: 'At least 3 interview calls and 1 offer letter', resources: ['Naukri.com', 'LinkedIn Jobs', 'Glassdoor salary data'] }
  ]

  for (let i = 0; i < Math.min(remaining, 4); i++) {
    const t = stepTemplates[i % stepTemplates.length]
    steps.push({
      stepNumber: done + i + 1,
      focus: t.focus,
      tasks: [t.task, 'Review and document your learnings', 'Share progress on LinkedIn'],
      milestone: t.milestone,
      estimatedDays: 15,
      resources: t.resources,
      verificationQuiz: true
    })
  }

  return {
    career: c,
    updatedRoadmap: steps,
    message: `Great progress, ${done} step${done > 1 ? 's' : ''} completed! ${feedback ? `I've adjusted based on your feedback: "${feedback}". ` : ''}You're on track — keep the momentum going. The next ${steps.length} steps are focused on ${steps[0]?.focus || 'advancing your skills'} and getting you closer to your first ${c} opportunity. You've got this! 🚀`
  }
}

module.exports = { analyzeFallback, quizFallback, chatFallback, replanFallback }
