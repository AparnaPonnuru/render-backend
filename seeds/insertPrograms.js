const mongoose = require('mongoose');
const Program = require('../models/program.model');

// MongoDB connection string
const DATABASE_URL = 'mongodb+srv://adi:AGmChskREizfDNlc@cluster0.o9lpe.mongodb.net/naavi-mock';

// Define all programs with countries + full steps
const programs = [
  {
    school: "Massachusetts Institute of Technology (MIT)",
    country: "United States",
    program: "Bachelor of Architecture",
    description:
      "MIT's School of Architecture and Planning offers a rigorous Bachelor of Architecture program that combines design, technology, and art to prepare students for a career in architecture.",
    grade: "Grade 10",
    curriculum: "IB",
    stream: "MPC",
    performance: "86%",
    financialSituation: "50 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build a Strong Academic and Creative Foundation",
        description:
          "Focus on excelling in key Grade 12 subjects, preparing for standardized tests, and compiling a creative portfolio that showcases your design projects and achievements.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Master the University Application Process",
        description:
          "Research MIT’s program requirements, develop a compelling personal statement and portfolio, and prepare for interviews to communicate your passion clearly.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Opportunities Toward Your Dream Job",
        description:
          "Engage in hands-on projects, research, and internships; network with mentors and professionals in the architecture field.",
      },
    ],
  },
  {
    school: "California Institute of Technology (Caltech)",
    country: "United States",
    program: "PhD in Astronomy and Astrophysics",
    description:
      "Caltech's PhD program emphasizes observational and theoretical astronomy, offering students opportunities to work on cutting-edge research.",
    grade: "Grade 11",
    curriculum: "CBSE",
    stream: "Science",
    performance: "90%",
    financialSituation: "50 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build a Strong Academic and Research Foundation",
        description:
          "Excel in physics and mathematics, and participate in astronomy or research projects to strengthen your academic profile.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Master the PhD Application Process",
        description:
          "Prepare a strong research proposal and statement of purpose, backed by academic references and previous research experience.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Opportunities Toward a Research Career",
        description:
          "Engage in research collaborations, publish papers, and attend global astronomy conferences.",
      },
    ],
  },
  {
    school: "Stanford University",
    country: "United States",
    program: "PhD in Earth System Science - Atmospheric Sciences",
    description:
      "Stanford’s doctoral program explores the physical, chemical, and biological processes that govern the atmosphere and climate.",
    grade: "Grade 12",
    curriculum: "IGCSE",
    stream: "Science",
    performance: "95%",
    financialSituation: "40 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Develop a Strong Academic and Research Foundation",
        description:
          "Excel in math and science, undertake climate or environmental research projects, and build analytical skills.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Master the Application Process",
        description:
          "Prepare a compelling PhD application with research interests aligned to Stanford’s faculty and labs.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Research and Networking Opportunities",
        description:
          "Collaborate on atmospheric research and connect with global sustainability networks.",
      },
    ],
  },
  {
    school: "University of Cambridge",
    country: "United Kingdom",
    program: "Master of Engineering in Advanced Manufacturing and Management",
    description:
      "Cambridge’s MEng program integrates engineering design, manufacturing, and management to create future industry leaders.",
    grade: "Grade 11",
    curriculum: "CBSE",
    stream: "MPC",
    performance: "80%",
    financialSituation: "60 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build Academic and Technical Strength",
        description:
          "Excel in math and physics, and explore mechanical and manufacturing principles.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Prepare a Competitive Application",
        description:
          "Write a strong statement of purpose that demonstrates leadership and technical innovation.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage University Research and Internships",
        description:
          "Participate in research labs and internships in advanced manufacturing sectors.",
      },
    ],
  },
  {
    school: "ETH Zurich",
    country: "Switzerland",
    program: "Master's in Environmental Science and Sustainability",
    description:
      "ETH Zurich trains students to address environmental challenges through engineering, sustainability, and innovation.",
    grade: "Grade 11",
    curriculum: "IB",
    stream: "Environmental Science",
    performance: "88%",
    financialSituation: "50 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Strengthen Your Scientific Foundation",
        description:
          "Focus on IB environmental science and sustainability projects.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Prepare a Research-Driven Application",
        description:
          "Showcase academic passion through environmental research or sustainable initiatives.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Apply Knowledge to Real-World Projects",
        description:
          "Participate in sustainability projects, internships, or NGOs.",
      },
    ],
  },
  {
    school: "University of Tokyo",
    country: "Japan",
    program: "PhD in Robotics and Mechatronics",
    description:
      "Tokyo’s program blends robotics, AI, and control systems for cutting-edge innovation and research.",
    grade: "Grade 12",
    curriculum: "CBSE",
    stream: "Engineering",
    performance: "90%",
    financialSituation: "55 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Master Technical and Analytical Skills",
        description:
          "Focus on math, coding, and robotics projects at the undergraduate level.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Prepare for a Competitive PhD Application",
        description:
          "Develop a strong proposal, secure academic references, and demonstrate hands-on project experience.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Contribute to Research in Robotics",
        description:
          "Join robotics labs or internships and publish innovative work.",
      },
    ],
  },
  {
    school: "University of Oxford",
    country: "United Kingdom",
    program: "MSc in Global Health Sciences",
    description:
      "Oxford’s MSc program prepares students to tackle global health issues through interdisciplinary research and practical experience.",
    grade: "Grade 12",
    curriculum: "IB",
    stream: "Biology",
    performance: "92%",
    financialSituation: "60 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build Research and Health Science Foundation",
        description:
          "Excel in biology and related subjects; volunteer in public health projects.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Master the MSc Application Process",
        description:
          "Prepare a strong personal statement showcasing passion for global health.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Research for Global Health Impact",
        description:
          "Collaborate with NGOs or institutions on real-world health initiatives.",
      },
    ],
  },
  {
    school: "National University of Singapore",
    country: "Singapore",
    program: "Bachelor of Data Analytics and Business Intelligence",
    description:
      "NUS’s program integrates data science and business insights to prepare graduates for leadership in data-driven industries.",
    grade: "Grade 12",
    curriculum: "IB",
    stream: "MPC",
    performance: "76%-85%",
    financialSituation: "25%-75% Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build a Strong Foundation in Math and Coding",
        description:
          "Focus on computer science and mathematics; learn Python and SQL.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Develop Analytical and Problem-Solving Skills",
        description:
          "Participate in data analysis competitions or internships.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Opportunities for Global Business Roles",
        description:
          "Engage in data-driven projects with real business impact.",
      },
    ],
  },
  {
    school: "University of British Columbia",
    country: "Canada",
    program: "Master of Forestry in Urban Forest Management",
    description:
      "UBC’s program emphasizes urban sustainability, biodiversity, and forest management strategies.",
    grade: "Grade 12",
    curriculum: "CBSE",
    stream: "Environmental Science",
    performance: "96%-100%",
    financialSituation: "50 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build Academic Strength in Environmental Studies",
        description:
          "Excel in biology and environmental science; participate in sustainability projects.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Apply to UBC’s Forestry Program",
        description:
          "Prepare a strong statement of purpose and recommendation letters.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Gain Practical Experience in Urban Sustainability",
        description:
          "Join research or NGOs focused on forest conservation and city planning.",
      },
    ],
  },
  {
    school: "Technische Universität Berlin",
    country: "Germany",
    program: "Master of Science in Mechanical Engineering",
    description:
      "TU Berlin offers advanced mechanical engineering education with focus on materials science, thermodynamics, and control systems.",
    grade: "Grade 12",
    curriculum: "ICSE",
    stream: "MPC",
    performance: "86%-95%",
    financialSituation: "75 Lakhs-3CR",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Develop a Strong Technical Base",
        description:
          "Excel in physics and engineering fundamentals; participate in robotics competitions.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Craft a Competitive Application",
        description:
          "Prepare a compelling personal statement showcasing your mechanical expertise.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Internships and Research",
        description:
          "Work with professors and companies on mechanical systems projects.",
      },
    ],
  },
  {
    school: "Harvard University",
    country: "United States",
    program: "Bachelor of Arts in Liberal Arts",
    description:
      "Harvard’s Liberal Arts program nurtures creativity, critical thinking, and leadership across disciplines.",
    grade: "Grade 12",
    curriculum: "IB",
    stream: "Humanities",
    performance: "76%-85%",
    financialSituation: "25 Lakhs - 75 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build Strong Humanities Skills",
        description:
          "Excel in social sciences, writing, and extracurricular activities.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Master the Harvard Application Process",
        description:
          "Write a standout personal statement and collect strong recommendations.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Harvard’s Global Opportunities",
        description:
          "Engage in internships and research to prepare for leadership roles.",
      },
    ],
  },
  {
    school: "University of Cape Town",
    country: "South Africa",
    program: "Master of Science in Marine Biology",
    description:
      "UCT’s Marine Biology program enables students to explore marine ecosystems and sustainability research.",
    grade: "Grade 12",
    curriculum: "CBSE",
    stream: "BIPC",
    performance: "76%-85%",
    financialSituation: "25 Lakhs - 75 Lakhs",
    personality: "realistic",
    steps: [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Build a Solid Foundation in Biology",
        description:
          "Excel in biology and chemistry; participate in marine conservation work.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Prepare for MSc Applications",
        description:
          "Research UCT’s program and prepare academic and personal references.",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Leverage Opportunities in Marine Research",
        description:
          "Join conservation programs or oceanography research initiatives.",
      },
    ],
  },
];

// Connect, clear, and insert
mongoose
  .connect(DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await Program.deleteMany({});
    console.log('🗑️ Old programs cleared');
    await Program.insertMany(programs);
    console.log('✅ Data successfully inserted');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB or inserting data:', err);
  });
