import { Github, ExternalLink, Mail, Linkedin, Twitter, ArrowLeft, Code, Zap, User, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const panels = {
  about: {
    title: 'YOUR FRIENDLY NEIGHBOURHOOD DEV',
    icon: User,
    color: '#00e5ff',
    content: (
      <div className="space-y-6">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950/60 to-black border border-cyan-400/20 p-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiMwMGYzZmYxNSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-cyan-500/40">
              🕷️
            </div>
            <div>
              <h2 className="text-2xl font-heading text-white tracking-widest">REVAN MIDHA</h2>
              <p className="text-cyan-400 text-sm font-bold tracking-wider mt-1">WITH GREAT CODE COMES GREAT RESPONSIBILITY</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-2 py-0.5 rounded border border-cyan-500/30">Full-Stack Development</span>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-2 py-0.5 rounded border border-cyan-500/30">Cybersecurity</span>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-2 py-0.5 rounded border border-cyan-500/30">Interactive Web Experiences</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="text-cyan-400 font-heading text-xs tracking-widest mb-3">🕸️ ORIGIN STORY</h3>
          <p className="text-zinc-300 leading-relaxed text-sm mb-3" style={{ textAlign: 'justify' }}>
            Hey, I'm Revan — a developer who enjoys building interesting things with code.
          </p>
          <p className="text-zinc-300 leading-relaxed text-sm mb-3" style={{ textAlign: 'justify' }}>
            I'm particularly interested in creative frontend development, interactive web experiences, and full-stack applications. 
            I like exploring how modern technologies can turn ideas into real products, whether that's visual interfaces, 
            experimental projects, or systems that solve practical problems.
          </p>
          <p className="text-zinc-300 leading-relaxed text-sm mb-3" style={{ textAlign: 'justify' }}>
            Outside of traditional web development, I'm also interested in areas like cybersecurity, machine learning, 
            and building experimental projects that combine multiple technologies together.
          </p>
          <p className="text-zinc-300 leading-relaxed text-sm" style={{ textAlign: 'justify' }}>
            I enjoy exploring different technologies and applying what I learn by building practical projects and applications.
          </p>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['💻 Languages', 'Python, JavaScript'],
            ['🎨 Frontend', 'React, Next.js, HTML, CSS, Tailwind CSS'],
            ['⚙️ Backend', 'Node.js, Express.js'],
            ['🗄️ Databases', 'MySQL, MongoDB'],
            ['🌐 3D / Graphics', 'Three.js, React Three Fiber, WebGL'],
            ['🛠️ Tools', 'Git, Docker, Linux'],
            ['📝 Other Languages', 'Basic C++, Java'],
          ].map(([title, skills]) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-cyan-400 font-heading text-xs tracking-wider mb-1">{title}</p>
              <p className="text-zinc-400 text-xs">{skills}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  projects: {
    title: 'MISSION LOG',
    icon: Code,
    color: '#ff00cc',
    content: (
      <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-1">

        {/* Intro */}
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-zinc-300 text-xs leading-relaxed" style={{ textAlign: 'justify' }}>
            A selection of projects I've worked on while exploring different technologies and ideas.
            These range from web applications and AI tools to embedded systems and cybersecurity projects.
          </p>
        </div>

        {[
          {
            name: '🚁 DRONEMATE',
            desc: (
              <>
                <p className="mb-2">A web-based drone monitoring system that connects a quadcopter equipped with an ESP32-CAM to a real-time web interface.</p>
                <p>Users can view live video feeds and interact with drone data through a browser-based dashboard, integrating IoT hardware with modern web technologies.</p>
              </>
            ),
            tech: ['React', 'Firebase', 'MySQL', 'ESP32-CAM'],
            color: '#00e5ff',
            live: '#',
            code: '#',
          },
          {
            name: '🛡️ PHISHING DETECTION SYSTEM',
            desc: (
              <>
                <p className="mb-2">A cybersecurity-focused project that detects phishing websites using machine learning.</p>
                <p>The system analyzes both textual features and visual characteristics of webpages to identify patterns commonly used in phishing attacks.</p>
              </>
            ),
            tech: ['Python', 'NLP', 'Computer Vision'],
            color: '#ff0055',
            live: '#',
            code: '#',
          },
          {
            name: '⚡ ML-BASED DDOS MITIGATION SYSTEM',
            desc: (
              <>
                <p className="mb-2">An experimental system for detecting and mitigating DDoS attacks using machine learning.</p>
                <p>It analyzes network traffic patterns to identify abnormal activity and explores how ML models can detect malicious traffic within large datasets.</p>
              </>
            ),
            tech: ['Python', 'Machine Learning', 'Networking'],
            color: '#9d00ff',
            live: '#',
            code: '#',
          },
          {
            name: '🛩️ QUADCOPTER DEVELOPMENT',
            desc: 'A quadcopter drone built using an Arduino-based flight controller and sensor modules. Integrated an MPU6050 IMU sensor for flight stabilization, gaining hands-on experience with embedded systems, sensor data processing, and hardware control.',
            tech: ['Arduino', 'MPU6050 IMU', 'Embedded Systems'],
            color: '#ff9500',
            live: '#',
            code: '#',
          },
          {
            name: '✍️ CREATIVE WRITING ASSISTANT',
            desc: 'A low-code AI-powered web app designed to help users generate creative writing ideas and prompts. Integrates the Hugging Face text generation API to produce story suggestions through a simple web interface built using Bubble.',
            tech: ['Bubble', 'Hugging Face API'],
            color: '#00e5a0',
            live: '#',
            code: '#',
          },
        ].map((p) => (
          <div key={p.name} className="group rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300">
            <div className="p-4">
              <h3 className="text-base font-heading tracking-widest mb-2" style={{ color: p.color, textShadow: `0 0 15px ${p.color}` }}>{p.name}</h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-3" style={{ textAlign: 'justify' }}>{p.desc}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.tech.map(t => (
                  <span key={t} className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}>{t}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <a href={p.live} className="pointer-events-auto flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all" style={{ background: `${p.color}25`, color: p.color, border: `1px solid ${p.color}40` }}>
                  <ExternalLink className="w-3 h-3" /> Live
                </a>
                <a href={p.code} target="_blank" rel="noreferrer" className="pointer-events-auto flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-all">
                  <Github className="w-3 h-3" /> Code
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  contact: {
    title: "LET'S TEAM UP, SPIDER-FRIEND",
    icon: Zap,
    color: '#9d00ff',
    content: (
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-purple-950/60 to-black border border-purple-500/20 rounded-xl p-5">
          <p className="text-white text-sm font-bold mb-3">🕷️ Every Spider-Person needs their team.</p>
          <p className="text-zinc-300 text-sm leading-relaxed" style={{ textAlign: 'justify' }}>
            If you'd like to connect, collaborate on a project, or just talk about technology, feel free to reach out.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mt-3" style={{ textAlign: 'justify' }}>
            I'm always interested in meeting other developers, exploring new ideas, and working on interesting projects.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <a href="https://github.com/RevanMidha" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-white/5 hover:bg-zinc-800/80 border border-white/10 hover:border-zinc-500/50 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-all duration-200 pointer-events-auto hover:shadow-[0_0_20px_rgba(150,150,150,0.3)]">
            <get_resource_uri server="default_api" uri="mcp://default_api/file:///d%3A/Studyy/SpiderVerse-Portfolio/src/components/ContentPanels.jsx#L170" /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/revan-midha-302a542a3" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/30 hover:border-blue-400/60 text-blue-300 text-sm font-bold px-4 py-2.5 rounded-lg transition-all duration-200 pointer-events-auto hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <get_resource_uri server="default_api" uri="mcp://default_api/file:///d%3A/Studyy/SpiderVerse-Portfolio/src/components/ContentPanels.jsx#L174" /> LinkedIn
          </a>
          <div className="flex items-center gap-2 bg-teal-600/20 border border-teal-600/30 text-teal-300 text-sm font-bold px-4 py-2.5 rounded-lg select-all shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            <get_resource_uri server="default_api" uri="mcp://default_api/file:///d%3A/Studyy/SpiderVerse-Portfolio/src/components/ContentPanels.jsx#L177" /> revi.midha@gmail.com
          </div>
        </div>

        {/* Resume Download */}
        <a
          href="/resume.pdf"
          download="Revan_Midha_Resume.pdf"
          className="pointer-events-auto flex items-center justify-center gap-2 w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 hover:border-purple-400/60 text-purple-300 hover:text-white text-sm font-bold px-4 py-3 rounded-lg transition-all duration-200"
        >
          <Download className="w-4 h-4" /> Download Resume
        </a>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-purple-400 text-xs font-bold tracking-wider mb-1">🕸️ STATUS</p>
            <p className="text-green-400 text-sm font-bold">● Ready to Swing</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-purple-400 text-xs font-bold tracking-wider mb-1">⚡ WEB-RANGE</p>
            <p className="text-white text-sm font-bold">IST / UTC+5:30</p>
          </div>
        </div>
      </div>
    ),
  },
};

export default function ContentPanels({ activePanel, onBack }) {
  const panel = panels[activePanel];
  if (!panel) return null;

  const Icon = panel.icon;

  return (
    <AnimatePresence mode="wait">
      {panel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center p-4 z-[300] pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
          onClick={onBack}
        >
          <motion.div
            initial={{ scale: 0.5, y: 80, opacity: 0, rotateX: 15 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.4, y: -60, opacity: 0, rotateX: -20 }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 250, 
              mass: 0.8,
              opacity: { duration: 0.2 }
            }}
            className="relative w-full max-w-xl rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(5,0,20,0.95)',
              border: `1px solid ${panel.color}35`,
              boxShadow: `0 0 60px ${panel.color}20, inset 0 0 60px ${panel.color}05`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 pointer-events-none opacity-5"
              style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />

            <div className="flex items-center gap-3 p-5 border-b border-white/10"
              style={{ background: `linear-gradient(135deg, ${panel.color}15, transparent)` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${panel.color}20`, border: `1px solid ${panel.color}40` }}>
                <Icon className="w-5 h-5" style={{ color: panel.color }} />
              </div>
              <div>
                <h2 className="text-sm font-heading tracking-widest text-white leading-none mb-1">{panel.title}</h2>
                <div className="flex gap-1.5 mt-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? panel.color : '#ffffff30' }} />
                  ))}
                </div>
              </div>
              <button
                onClick={onBack}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> <span className="font-heading tracking-widest">BACK</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[75vh]">
              {panel.content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
