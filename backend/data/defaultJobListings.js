const defaultJobListings = [
  {
    title: "Full Stack Developer",
    company: "TechNova Solutions",
    description:
      "Seeking a developer to build scalable web apps using the MERN stack. Must be proficient in React, Node.js, and MongoDB. Experience with Vite and Tailwind CSS is a plus.",
    requiredSkills: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS", "Javascript"],
    cgpaThreshold: 7.5,
  },
  {
    title: "Backend Engineer",
    company: "DataStream AI",
    description:
      "Focus on API optimization and database management. Looking for expertise in Python, Django, and PostgreSQL. Knowledge of Redis and Docker is required for microservices.",
    requiredSkills: ["Python", "Django", "PostgreSQL", "Redis", "Docker", "REST API"],
    cgpaThreshold: 8.0,
  },
  {
    title: "Frontend Architect",
    company: "PixelPerfect UI",
    description:
      "Join our design-focused team to craft high-performance user interfaces. Expert knowledge of React, Redux, and Framer Motion needed. Experience with Typescript is mandatory.",
    requiredSkills: ["React", "Typescript", "Redux", "Framer Motion", "Figma", "CSS3"],
    cgpaThreshold: 7.0,
  },
  {
    title: "DevOps Specialist",
    company: "CloudGuard",
    description:
      "Manage our AWS infrastructure and CI/CD pipelines. We use Terraform for IaC and Kubernetes for orchestration. Must have a strong grip on Linux commands.",
    requiredSkills: ["AWS", "Terraform", "Kubernetes", "Docker", "Linux", "Jenkins"],
    cgpaThreshold: 7.5,
  },
  {
    title: "Data Scientist",
    company: "InsightFlow",
    description:
      "Analyze large datasets to drive business decisions. Proficiency in Python, SQL, and Scikit-learn is required. Experience with Tableau for visualization is a bonus.",
    requiredSkills: ["Python", "SQL", "Scikit-learn", "Pandas", "Matplotlib", "Tableau"],
    cgpaThreshold: 8.5,
  },
  {
    title: "Mobile App Developer",
    company: "AppForge",
    description:
      "Building cross-platform mobile applications using React Native. Familiarity with Firebase and mobile-specific performance optimization is key.",
    requiredSkills: ["React Native", "Javascript", "Firebase", "Mobile UI", "Redux", "Xcode"],
    cgpaThreshold: 7.0,
  },
  {
    title: "AI/ML Research Intern",
    company: "DeepMind Lab",
    description:
      "Work on cutting-edge NLP models. Requires strong mathematical foundations and experience with PyTorch or TensorFlow. Background in LLMs is preferred.",
    requiredSkills: ["Python", "PyTorch", "TensorFlow", "NLP", "Linear Algebra", "Keras"],
    cgpaThreshold: 9.0,
  },
  {
    title: "QA Automation Engineer",
    company: "SecureCheck",
    description:
      "Develop automated testing scripts using Selenium and Java. Responsible for regression testing and maintaining high software quality standards.",
    requiredSkills: ["Selenium", "Java", "TestNG", "Jira", "Maven", "Cucumber"],
    cgpaThreshold: 7.0,
  },
  {
    title: "Cybersecurity Analyst",
    company: "NetShield",
    description:
      "Monitor network traffic for security breaches. Knowledge of penetration testing, Wireshark, and ethical hacking protocols is necessary.",
    requiredSkills: ["Networking", "Wireshark", "Penetration Testing", "Security+", "Linux", "Python"],
    cgpaThreshold: 8.0,
  },
  {
    title: "Cloud Engineer (Azure)",
    company: "Skyline Systems",
    description:
      "Migrate on-premise solutions to Microsoft Azure. Handle cloud storage, virtual machines, and Active Directory configurations.",
    requiredSkills: ["Azure", "Powershell", "Active Directory", "Cloud Computing", "SQL", "Networking"],
    cgpaThreshold: 7.5,
  },
  {
    title: "Software Engineer (Java)",
    company: "Enterprise Hub",
    description:
      "Maintain and expand enterprise-level banking software. Strong understanding of Spring Boot, Microservices, and Hibernate is required.",
    requiredSkills: ["Java", "Spring Boot", "Hibernate", "Microservices", "MySQL", "Docker"],
    cgpaThreshold: 7.8,
  },
  {
    title: "UI/UX Designer",
    company: "CreativePulse",
    description:
      "Transform user needs into beautiful digital experiences. Expert in Figma, Adobe XD, and user research methodologies.",
    requiredSkills: ["Figma", "User Research", "Wireframing", "Adobe XD", "Prototyping", "Design Systems"],
    cgpaThreshold: 6.5,
  },
  {
    title: "Blockchain Developer",
    company: "ChainLinker",
    description:
      "Develop smart contracts on Ethereum using Solidity. Knowledge of Web3.js and decentralized application (dApp) architecture.",
    requiredSkills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "Cryptography", "Hardhat"],
    cgpaThreshold: 8.2,
  },
  {
    title: "System Administrator",
    company: "CoreServers",
    description:
      "Manage server uptime, backups, and network infrastructure. Experience with Bash scripting and server security is vital.",
    requiredSkills: ["Linux", "Bash Scripting", "Nginx", "Apache", "Server Security", "DNS"],
    cgpaThreshold: 7.0,
  },
  {
    title: "Technical Product Manager",
    company: "GrowthOps",
    description:
      "Bridge the gap between engineering and business. Lead Agile sprints and define product roadmaps using Jira and Confluence.",
    requiredSkills: ["Agile", "Scrum", "Jira", "Product Roadmap", "Communication", "SDLC"],
    cgpaThreshold: 7.5,
  },
];

module.exports = defaultJobListings;
