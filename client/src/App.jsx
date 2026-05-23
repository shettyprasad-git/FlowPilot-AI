import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ListChecks,
  LogOut,
  Mail,
  NotebookText,
  PanelLeft,
  Rocket,
  Sparkles,
  Trash2,
  Wand2,
  Menu,
  X,
  Zap,
  LayoutDashboard,
  Target,
  FileText,
  Workflow,
  Calendar,
  Settings as SettingsIcon
} from "lucide-react";
import { apiRequest } from "./lib/api.js";

const views = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "tasks", label: "Task Board", icon: ClipboardList },
  { id: "notes", label: "Smart Notes", icon: NotebookText },
  { id: "email", label: "Email Writer", icon: Mail },
  { id: "workflow", label: "Workflow", icon: Workflow },
  { id: "planner", label: "Daily Planner", icon: Calendar },
  { id: "settings", label: "Settings", icon: SettingsIcon }
];

const starterTasks = [
  { title: "Prepare hackathon demo script", priority: "High", status: "Pending", category: "Hackathon", estimateMinutes: 60 },
  { title: "Polish dashboard screens", priority: "Medium", status: "In Progress", category: "Design", estimateMinutes: 90 },
  { title: "Record walkthrough video", priority: "Medium", status: "Pending", category: "Submission", estimateMinutes: 45 }
];

const aiSuggestions = {
  chat: ["Plan my study week", "How do I prioritize tasks?", "Summarize meeting notes"],
  email: ["Generate internship email", "Write a follow-up email", "Draft a sick leave email"],
  workflow: ["Create sprint workflow", "Plan my exam prep", "Onboarding checklist"]
};

function useAuth() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("flowpilot_token");
    const user = localStorage.getItem("flowpilot_user");
    try {
      return token && user ? { token, user: JSON.parse(user) } : null;
    } catch (_error) {
      localStorage.removeItem("flowpilot_token");
      localStorage.removeItem("flowpilot_user");
      return null;
    }
  });

  function save(data) {
    localStorage.setItem("flowpilot_token", data.token);
    localStorage.setItem("flowpilot_user", JSON.stringify(data.user));
    setAuth(data);
  }

  function logout() {
    localStorage.removeItem("flowpilot_token");
    localStorage.removeItem("flowpilot_user");
    setAuth(null);
  }

  return { auth, save, logout };
}

function LandingPage({ onAuth }) {
  const [mode, setMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event, isDemo = false) {
    if (event) event.preventDefault();
    setLoading(true);
    try {
      let payload = mode === "register" ? form : { email: form.email, password: form.password };
      let endpoint = `/auth/${mode}`;
      
      if (isDemo) {
        endpoint = "/auth/login";
        payload = { email: "demo@flowpilot.ai", password: "password123" };
      }
      
      try {
        const data = await apiRequest(endpoint, { method: "POST", body: JSON.stringify(payload) });
        toast.success(isDemo ? "Logged in as Demo User" : "Welcome to FlowPilot!");
        onAuth(data);
      } catch (err) {
        if (isDemo && (err.message.toLowerCase().includes("invalid") || err.message.toLowerCase().includes("not found"))) {
          // If login fails for demo user, register them on the fly
          const registerData = await apiRequest("/auth/register", { 
            method: "POST", 
            body: JSON.stringify({ name: "Demo User", email: "demo@flowpilot.ai", password: "password123" }) 
          });
          toast.success("Demo User created & logged in!");
          onAuth(registerData);
        } else {
          throw err;
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white selection:bg-cyan-500/30">
      <div className="hero-grid absolute inset-0" />
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 opacity-50 blur-[120px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />

      <nav className="relative z-20 flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-lg shadow-cyan-500/20">
            <Rocket size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">FlowPilot</span>
        </div>
        <button onClick={() => submit(null, true)} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          Try Demo Mode
        </button>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-cyan-200 backdrop-blur-md">
            <Sparkles size={16} className="text-cyan-400" /> Free-tier AI productivity OS
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
            Command your <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">workflow</span> with AI.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            A unified workspace for students and teams. Replace disjointed tools with an all-in-one dashboard featuring AI chat, smart tasks, automated notes, and email generation.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Zap, text: "Instant AI Summaries" },
              { icon: Target, text: "Smart Task Prioritization" },
              { icon: Mail, text: "Professional Email Drafting" },
              { icon: Workflow, text: "Sprint & Exam Planning" }
            ].map((item, i) => (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm transition hover:bg-white/[0.04]">
                <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
                  <item.icon size={18} />
                </div>
                <span className="font-medium text-slate-200">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Future Scope</h3>
            <div className="flex flex-wrap gap-2">
              {["Calendar Sync", "Slack Integration", "Voice Assistant", "Team Collaboration"].map(tag => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">{tag}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl" />
          <form onSubmit={(e) => submit(e)} className="glass-panel glow-hover relative p-8">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-sm font-medium text-cyan-400">{mode === "register" ? "Start your journey" : "Welcome back"}</p>
                <h2 className="mt-1 text-2xl font-bold">{mode === "register" ? "Create workspace" : "Log in to workspace"}</h2>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/5 text-cyan-300">
                <LayoutDashboard size={24} />
              </div>
            </div>

            <div className="grid gap-5">
              {mode === "register" && (
                <label className="field-label mb-0">
                  Full Name
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="mt-1 bg-black/20 focus:bg-black/40" />
                </label>
              )}
              <label className="field-label mb-0">
                Email Address
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="mt-1 bg-black/20 focus:bg-black/40" />
              </label>
              <label className="field-label mb-0">
                Password
                <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="mt-1 bg-black/20 focus:bg-black/40" />
              </label>
            </div>

            <button className="primary-button mt-8 w-full shadow-[0_0_20px_rgba(103,232,249,0.3)]" disabled={loading}>
              {loading ? "Working..." : mode === "register" ? "Create account" : "Log in"}
            </button>
            <button type="button" className="mt-5 w-full text-sm font-medium text-slate-400 transition hover:text-white" onClick={() => setMode(mode === "register" ? "login" : "register")}>
              {mode === "register" ? "Already have an account? Log in" : "Need an account? Register"}
            </button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}

function Skeleton({ className = "", type = "text" }) {
  if (type === "card") {
    return <div className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />;
  }
  return <div className={`animate-pulse rounded bg-white/[0.08] ${className}`} />;
}

function Counter({ from, to }) {
  const [count, setCount] = useState(from);
  useEffect(() => {
    const controls = animate(from, to, {
      duration: 1,
      onUpdate(value) {
        setCount(Math.round(value));
      }
    });
    return () => controls.stop();
  }, [from, to]);
  return <>{count}</>;
}

// Simple animation helper for Counter
function animate(from, to, options) {
  let start = performance.now();
  let frame;
  function update(time) {
    let progress = Math.min((time - start) / (options.duration * 1000), 1);
    options.onUpdate(from + (to - from) * progress);
    if (progress < 1) frame = requestAnimationFrame(update);
  }
  frame = requestAnimationFrame(update);
  return { stop: () => cancelAnimationFrame(frame) };
}

function parseTasksFromText(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const parsed = [];
  
  for (let line of lines) {
    line = line.trim();
    
    // Match bullet points: - [ ] Task, - Task, * Task, 1. Task, etc.
    const bulletMatch = line.match(/^[-*+•]\s*(?:\[\s*\])?\s*(.+)/);
    const numberMatch = line.match(/^\d+\.\s*(?:\[\s*\])?\s*(.+)/);
    // Match daily schedule time blocks or section tasks
    const timeBlockMatch = line.match(/^(?:\d{1,2}:\d{2}\s*(?:AM|PM)?\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)?|Focus Block|Midday|Wrap-up|Morning|Evening|Afternoon)[:\s-]+\s*(.+)/i);
    
    let taskTitle = "";
    if (bulletMatch) {
      taskTitle = bulletMatch[1].trim();
    } else if (numberMatch) {
      taskTitle = numberMatch[1].trim();
    } else if (timeBlockMatch) {
      taskTitle = timeBlockMatch[1].trim();
    }
    
    if (taskTitle) {
      taskTitle = taskTitle.replace(/[*_`#]/g, "").trim();
      
      if (
        taskTitle.length > 3 &&
        taskTitle.length < 150 &&
        !taskTitle.toLowerCase().includes("workflow") &&
        !taskTitle.toLowerCase().includes("schedule") &&
        !taskTitle.toLowerCase().includes("daily planner") &&
        !taskTitle.toLowerCase().startsWith("focus block") &&
        !taskTitle.toLowerCase().startsWith("wrap-up") &&
        !taskTitle.toLowerCase().includes("productivity tip")
      ) {
        parsed.push({
          title: taskTitle,
          priority: "Medium",
          status: "Pending",
          category: "AI Generated",
          estimateMinutes: 45
        });
      }
    }
  }
  
  const unique = [];
  const seen = new Set();
  for (const t of parsed) {
    const key = t.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(t);
    }
  }
  return unique;
}

function DetectedTasksWidget({ text, setTasks }) {
  const [parsedTasks, setParsedTasks] = useState([]);
  const [addedTasks, setAddedTasks] = useState(new Set());
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  
  useEffect(() => {
    setParsedTasks(parseTasksFromText(text));
    setAddedTasks(new Set());
  }, [text]);
  
  if (!parsedTasks.length) return null;
  
  async function handleAddTask(task, index) {
    try {
      const created = await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(task)
      });
      setTasks((prev) => [created, ...prev]);
      setAddedTasks((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
      toast.success("Task added to Task Board!");
    } catch (err) {
      toast.error(`Failed to add task: ${err.message}`);
    }
  }
  
  async function handleAddAll() {
    setIsAddingBulk(true);
    const toastId = toast.loading("Adding all tasks to Task Board...");
    try {
      let count = 0;
      const newTasks = [];
      for (let i = 0; i < parsedTasks.length; i++) {
        if (!addedTasks.has(i)) {
          const created = await apiRequest("/tasks", {
            method: "POST",
            body: JSON.stringify(parsedTasks[i])
          });
          newTasks.push(created);
          addedTasks.add(i);
          count++;
        }
      }
      if (count > 0) {
        setTasks((prev) => [...newTasks, ...prev]);
        setAddedTasks(new Set(addedTasks));
        toast.success(`Added ${count} tasks to board!`, { id: toastId });
      } else {
        toast.info("All tasks were already added.", { id: toastId });
      }
    } catch (err) {
      toast.error(`Failed to add all tasks: ${err.message}`, { id: toastId });
    } finally {
      setIsAddingBulk(false);
    }
  }
  
  return (
    <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <ClipboardList size={16} /> Detected Tasks ({parsedTasks.length})
        </h4>
        <button 
          onClick={handleAddAll} 
          disabled={isAddingBulk || addedTasks.size === parsedTasks.length}
          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
        >
          Add All to Board
        </button>
      </div>
      <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
        {parsedTasks.map((task, index) => {
          const isAdded = addedTasks.has(index);
          return (
            <div key={index} className="flex items-center justify-between gap-3 rounded-lg bg-black/20 p-2.5 text-xs border border-white/5 hover:border-white/10 transition">
              <span className="truncate text-slate-200">{task.title}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <select 
                  value={task.priority} 
                  onChange={(e) => {
                    const updated = [...parsedTasks];
                    updated[index].priority = e.target.value;
                    setParsedTasks(updated);
                  }}
                  className="bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-slate-300 outline-none"
                  disabled={isAdded}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <button 
                  onClick={() => handleAddTask(task, index)} 
                  disabled={isAdded}
                  className={`rounded px-2.5 py-1 font-semibold transition ${isAdded ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30"}`}
                >
                  {isAdded ? "Added" : "+ Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressRing({ radius, stroke, progress }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative grid place-items-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <motion.circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white"><Counter from={0} to={progress} />%</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">Score</span>
      </div>
    </div>
  );
}

function Shell({ user, onLogout, onUpdateUser }) {
  const [view, setView] = useState("dashboard");
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [taskData, noteData] = await Promise.all([apiRequest("/tasks"), apiRequest("/notes")]);
      setTasks(taskData);
      setNotes(noteData);
    } catch (err) {
      toast.error("Failed to load workspace data: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    const score = tasks.length ? Math.min(98, 55 + Math.round(rate * 0.25) + Math.min(tasks.length * 2, 18)) : 0;
    return { completed, rate, score, total: tasks.length };
  }, [tasks]);

  const SidebarContent = () => (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-white shadow-lg shadow-cyan-500/20">
            <PanelLeft size={20} />
          </div>
          <div>
            <p className="font-bold tracking-tight">FlowPilot AI</p>
            <p className="text-xs font-medium text-cyan-400">Workspace</p>
          </div>
        </div>
        <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>
      <nav className="grid gap-1">
        {views.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;
          return (
            <button key={item.id} className={`nav-button group ${isActive ? "active relative overflow-hidden" : ""}`} onClick={() => { setView(item.id); setMobileMenuOpen(false); }}>
              {isActive && <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent" />}
              <Icon size={18} className={isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-300"} /> 
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-8">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={() => {
            onLogout();
            toast.success("Logged out successfully");
          }}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-ink text-white selection:bg-cyan-500/30">
      <div className="app-bg fixed inset-0" />
      <div className="relative flex min-h-screen flex-col lg:grid lg:grid-cols-[280px_1fr]">
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-white/10 bg-black/40 p-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3">
             <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-white">
                <PanelLeft size={16} />
              </div>
              <p className="font-bold">FlowPilot</p>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-300"><Menu size={24} /></button>
        </header>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-[#0a0d1a]/95 p-6 backdrop-blur-2xl transition-transform duration-300 lg:static lg:w-auto lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent />
        </aside>

        {/* Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main Content */}
        <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="mx-auto max-w-6xl">
            {view === "dashboard" && <Dashboard stats={stats} tasks={tasks} notes={notes} loading={loading} setView={setView} />}
            {view === "assistant" && <AIComposer feature="chat" title="AI Workspace Assistant" placeholder="Ask FlowPilot to plan, summarize, prioritize, or brainstorm..." suggestions={aiSuggestions.chat} setTasks={setTasks} />}
            {view === "tasks" && <Tasks tasks={tasks} setTasks={setTasks} loading={loading} />}
            {view === "notes" && <Notes notes={notes} setNotes={setNotes} loading={loading} />}
            {view === "email" && <AIComposer feature="email" title="AI Email Generator" placeholder="Example: Write an internship application email for a frontend role..." suggestions={aiSuggestions.email} setTasks={setTasks} />}
            {view === "workflow" && <AIComposer feature="workflow" title="AI Workflow Suggestions" placeholder="Example: I am preparing for exams and internship applications..." suggestions={aiSuggestions.workflow} setTasks={setTasks} />}
            {view === "planner" && <Planner setTasks={setTasks} />}
            {view === "settings" && <Settings user={user} onUpdateUser={onUpdateUser} />}
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard({ stats, tasks, notes, loading, setView }) {
  const cards = [
    { label: "Completion rate", value: stats.rate, suffix: "%", icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Active tasks", value: stats.total, suffix: "", icon: ClipboardList, color: "text-cyan-400" },
    { label: "Completed", value: stats.completed, suffix: "", icon: Clock3, color: "text-purple-400" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Header eyebrow="Command center" title="Today's workflow cockpit" />
      
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <div className="glass-panel glow-hover flex flex-col items-center justify-center p-6 text-center">
          <ProgressRing radius={70} stroke={12} progress={stats.score} />
          <p className="mt-4 font-medium text-slate-200">AI Productivity Index</p>
          <p className="mt-1 text-xs text-slate-400">Based on task completion & focus</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }} className="glass-panel glow-hover flex flex-col justify-between p-6" key={card.label}>
                <div className="flex items-center justify-between">
                  <Icon className={card.color} size={24} />
                  <div className={`h-8 w-8 rounded-full bg-white/5 grid place-items-center ${card.color}`}><Sparkles size={14}/></div>
                </div>
                <div className="mt-4">
                  <p className="text-4xl font-bold tracking-tight"><Counter from={0} to={card.value} />{card.suffix}</p>
                  <p className="mt-1 text-sm font-medium text-slate-400">{card.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Quick actions" icon={<Zap size={18} className="text-yellow-400" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {views.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <button className="action-tile group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] border-white/5" key={item.id} onClick={() => setView(item.id)}>
                  <div className="rounded-lg bg-black/30 p-2 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Latest intelligence" icon={<Bot size={18} className="text-cyan-400" />}>
          {loading ? (
             <div className="grid gap-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
          ) : notes[0] ? (
            <div className="group rounded-xl bg-white/[0.02] p-4 border border-white/5 transition hover:bg-white/[0.04]">
              <p className="font-semibold text-cyan-50">{notes[0].title}</p>
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-400">{notes[0].summary}</p>
            </div>
          ) : (
            <EmptyState icon={FileText} text="No notes analyzed yet. Paste lecture or meeting notes to generate AI summaries." />
          )}
        </Panel>
      </div>

      <Panel title="Priority lane" className="mt-8" icon={<Target size={18} className="text-rose-400" />}>
        {loading ? (
           <div className="grid gap-4 lg:grid-cols-3">
             <Skeleton type="card" className="h-32 w-full" />
             <Skeleton type="card" className="h-32 w-full" />
             <Skeleton type="card" className="h-32 w-full" />
           </div>
        ) : tasks.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {tasks.slice(0, 6).map((task) => <TaskCard key={task.id} task={task} compact />)}
          </div>
        ) : (
          <EmptyState icon={ClipboardList} text="No tasks yet. Add starter tasks from the Task Board to prepare your workflow." />
        )}
      </Panel>
    </motion.div>
  );
}

function Tasks({ tasks, setTasks, loading }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", status: "Pending", category: "General", estimateMinutes: 45 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const columns = ["Pending", "In Progress", "Completed"];

  async function addTask(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    try {
      const task = await apiRequest("/tasks", { method: "POST", body: JSON.stringify(form) });
      setTasks([task, ...tasks]);
      setForm({ ...form, title: "", description: "" });
      toast.success("Task added successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateTask(id, patch) {
    try {
      const updated = await apiRequest(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setTasks(tasks.map((task) => (task.id === id ? updated : task)));
      if (patch.status === "Completed") toast.success("Task completed! 🎉");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteTask(id) {
    try {
      await apiRequest(`/tasks/${id}`, { method: "DELETE" });
      setTasks(tasks.filter((task) => task.id !== id));
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function addStarterTasks() {
    setIsSubmitting(true);
    try {
      const created = [];
      for (const task of starterTasks) {
        created.push(await apiRequest("/tasks", { method: "POST", body: JSON.stringify(task) }));
      }
      setTasks([...created, ...tasks]);
      toast.success("Starter tasks added");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div className="p-8"><Skeleton className="h-10 w-48 mb-8" /><Skeleton type="card" className="h-32 w-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Header eyebrow="Task automation" title="Smart task board" />
      <Panel title="Create task">
        <form onSubmit={addTask} className="grid gap-4 lg:grid-cols-[1.2fr_1fr_120px_120px_100px_120px]">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="bg-black/20" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="bg-black/20" />
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="bg-black/20">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="bg-black/20" />
          <input type="number" min="5" step="5" value={form.estimateMinutes} onChange={(e) => setForm({ ...form, estimateMinutes: e.target.value })} aria-label="Minutes" className="bg-black/20" />
          <button className="primary-button" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Task"}</button>
        </form>
        {!tasks.length && !isSubmitting && <button className="secondary-button mt-4" onClick={addStarterTasks}><Sparkles size={16} className="inline mr-2 text-cyan-400" /> Auto-fill starter tasks</button>}
      </Panel>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {columns.map((column) => (
          <div key={column} className="rounded-2xl border border-white/5 bg-white/[0.01] p-4">
            <h3 className="mb-4 flex items-center justify-between font-semibold text-slate-200">
              {column}
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs">{tasks.filter(t => t.status === column).length}</span>
            </h3>
            <div className="grid min-h-64 gap-3">
              <AnimatePresence>
                {tasks.filter((task) => task.status === column).map((task) => (
                  <motion.div key={task.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                    <TaskCard task={task} onStatus={(status) => updateTask(task.id, { status })} onDelete={() => deleteTask(task.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {!tasks.filter(t => t.status === column).length && (
                <div className="grid place-items-center rounded-xl border border-dashed border-white/10 bg-transparent p-6 text-sm text-slate-500">
                  Drop here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TaskCard({ task, onStatus, onDelete, compact }) {
  return (
    <div className="glow-hover rounded-xl border border-white/10 bg-[#12182b] p-4 shadow-lg transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-slate-100">{task.title}</p>
        <div className="flex items-center gap-2">
          <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
          {!compact && onDelete && (
            <button className="icon-button h-7 w-7 opacity-50 hover:opacity-100" type="button" onClick={onDelete} aria-label={`Delete ${task.title}`}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      {task.description && <p className="mt-2 text-sm leading-relaxed text-slate-400">{task.description}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
        <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1"><Target size={12} className="text-indigo-400"/> {task.category}</span>
        <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1"><Clock3 size={12} className="text-cyan-400"/> {task.estimateMinutes} min</span>
      </div>
      {!compact && onStatus && (
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
          {["Pending", "In Progress", "Completed"].map((status) => (
            <button key={status} className={`mini-button text-[11px] font-semibold uppercase tracking-wider ${task.status === status ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" : ""}`} onClick={() => onStatus(status)}>
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Notes({ notes, setNotes, loading }) {
  const [form, setForm] = useState({ title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsParsing(true);
    const toastId = toast.loading(`Parsing "${file.name}"...`);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const data = await apiRequest("/notes/parse", {
        method: "POST",
        body: formData
      });
      
      setForm({
        title: data.title || file.name.split(".")[0],
        content: data.text || ""
      });
      toast.success("File parsed successfully! You can now edit and generate insights.", { id: toastId });
    } catch (err) {
      toast.error(`Parsing failed: ${err.message}`, { id: toastId });
    } finally {
      setIsParsing(false);
      e.target.value = null; // Clear file input
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Analyzing notes with AI...");
    try {
      const note = await apiRequest("/notes", { method: "POST", body: JSON.stringify(form) });
      setNotes([note, ...notes]);
      setForm({ title: "", content: "" });
      toast.success("Notes summarized successfully", { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteNote(id) {
    try {
      await apiRequest(`/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter((note) => note.id !== id));
      toast.success("Note deleted");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <div className="p-8"><Skeleton className="h-10 w-48 mb-8" /><Skeleton type="card" className="h-64 w-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Header eyebrow="Smart learning" title="AI Note Summarizer" />
      <Panel title="Notes content">
        <form onSubmit={submit} className="grid gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lecture or meeting title" className="bg-black/20 flex-grow" />
            
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:border-cyan-500/30">
              <FileText size={16} className="text-cyan-400" />
              <span>{isParsing ? "Parsing..." : "Upload File (PDF/Word/Image)"}</span>
              <input 
                type="file" 
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={isParsing} 
              />
            </label>
          </div>
          <textarea required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Paste raw notes, transcripts, or meeting logs here, or upload a PDF/Word/Image file..." className="bg-black/20" />
          <button className="primary-button justify-self-start shadow-[0_0_15px_rgba(103,232,249,0.2)]" disabled={isSubmitting || isParsing}>
            {isSubmitting ? <><Bot className="mr-2 animate-pulse" size={18} /> Analyzing...</> : <><Sparkles className="mr-2" size={18} /> Generate Insights</>}
          </button>
        </form>
      </Panel>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div key={note.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <NoteCard note={note} onDelete={() => deleteNote(note.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
        {!notes.length && <div className="col-span-full"><EmptyState icon={NotebookText} text="Your generated summaries, action items, and flashcards will appear here." /></div>}
      </div>
    </motion.div>
  );
}

function NoteCard({ note, onDelete }) {
  return (
    <div className="glass-panel glow-hover relative overflow-hidden p-6">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-500" />
      <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 mb-4">
        <h3 className="text-xl font-semibold text-slate-100">{note.title}</h3>
        <button className="icon-button flex-shrink-0" type="button" onClick={onDelete} aria-label="Delete note">
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="mb-6 rounded-lg bg-[#070912]/50 p-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <Bot size={16} /> AI Summary
        </h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{note.summary}</p>
      </div>

      <StructuredList title="Key Points" items={note.keyPoints} icon={Target} color="text-indigo-300" />
      <StructuredList title="Action Items" items={note.actionItems} icon={CheckCircle2} color="text-emerald-300" />
      
      {note.flashcards?.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-purple-300">
            <Zap size={16} /> Study Flashcards
          </h4>
          <div className="grid gap-3">
            {note.flashcards.map((card, index) => (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]" key={index}>
                <p className="font-medium text-slate-200">Q: {card.question}</p>
                <div className="mt-2 border-t border-white/5 pt-2">
                  <p className="text-sm leading-relaxed text-slate-400">A: {card.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StructuredList({ title, items = [], icon: Icon, color }) {
  if (!items.length) return null;
  return (
    <div className="mb-6 last:mb-0">
      <h4 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${color}`}>
        <Icon size={16} /> {title}
      </h4>
      <ul className="grid gap-2 text-sm text-slate-300">
        {items.map((item, index) => (
          <li className="flex items-start gap-2 rounded-lg bg-white/[0.02] px-3 py-2.5 leading-relaxed" key={index}>
             <div className={`mt-1 h-1.5 w-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
             {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AIComposer({ feature, title, placeholder, suggestions, setTasks }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("Auto");
  const [isGenerating, setIsGenerating] = useState(false);

  function handleSendEmail() {
    if (!result) return;
    let subject = "Generated Email from FlowPilot AI";
    let body = result;
    
    // Attempt to extract Subject line if present in output
    const lines = result.split("\n");
    const subjectLineIndex = lines.findIndex(line => /^subject:/i.test(line));
    if (subjectLineIndex !== -1) {
      subject = lines[subjectLineIndex].replace(/^subject:\s*/i, "").trim();
      body = lines.filter((_, idx) => idx !== subjectLineIndex).join("\n").trim();
    } else if (lines[0] && lines[0].length < 60) {
      subject = lines[0].replace(/[*_#]/g, "").trim();
      body = lines.slice(1).join("\n").trim();
    }
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank");
  }

  async function submit(event, presetPrompt) {
    if (event) event.preventDefault();
    const finalPrompt = presetPrompt || prompt;
    if (!finalPrompt.trim()) return;
    
    if (presetPrompt) setPrompt(presetPrompt);
    
    setIsGenerating(true);
    setResult("");
    const toastId = toast.loading(`AI (${model}) is generating response...`);
    
    try {
      const data = await apiRequest(`/ai/${feature}`, {
        method: "POST",
        body: JSON.stringify({ prompt: finalPrompt, model })
      });
      setResult(data.response || data.summary || "");
      setProvider(data.provider);
      toast.success("Generation complete", { id: toastId });
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Header eyebrow="AI workspace" title={title} />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <Panel title="Command prompt">
            <form onSubmit={submit} className="grid gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Bot size={16} className="text-cyan-400" /> Model:
                </label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-cyan-500/50">
                  {["Auto", "Zephyr", "Mistral", "Llama", "Gemma", "Qwen"].map(m => (
                    <option key={m} value={m}>{m === "Auto" ? "Auto (Best for task)" : m}</option>
                  ))}
                </select>
              </div>
              <textarea 
                className="w-full resize-y bg-black/20 text-base" 
                rows={8} 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder={placeholder} 
              />
              <button className="primary-button w-full shadow-[0_0_15px_rgba(103,232,249,0.2)]" disabled={isGenerating}>
                {isGenerating ? <><Bot className="mr-2 animate-pulse" size={18} /> Processing...</> : <><Sparkles className="mr-2" size={18} /> Generate Response</>}
              </button>
            </form>
          </Panel>
          {suggestions && (
            <div className="glass-panel p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => submit(null, s)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-500/20 hover:text-cyan-300"
                    disabled={isGenerating}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Panel title={provider ? `Result (via ${provider})` : "AI Output"} className="relative min-h-[400px]">
          {feature === "email" && result && (
            <button 
              onClick={handleSendEmail} 
              className="absolute top-4 right-4 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <Mail size={14} /> Send via Gmail
            </button>
          )}
          {result ? (
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200">{result}</p>
              {setTasks && (feature === "workflow" || feature === "chat") && (
                <DetectedTasksWidget text={result} setTasks={setTasks} />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 grid place-items-center p-6">
               <EmptyState icon={Bot} text="Enter a prompt on the left and let AI do the heavy lifting." />
            </div>
          )}
        </Panel>
      </div>
    </motion.div>
  );
}

function Header({ eyebrow, title }) {
  return (
    <header className="mb-8">
      <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-cyan-400">{eyebrow}</p>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
    </header>
  );
}

function Panel({ title, children, className = "", icon }) {
  return (
    <section className={`glass-panel p-6 ${className}`}>
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold tracking-tight text-white">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState({ text, icon: Icon = Inbox }) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
      <div className="mb-4 rounded-full bg-white/5 p-3 text-slate-500">
        <Icon size={24} />
      </div>
      <p className="max-w-xs text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Settings({ user, onUpdateUser }) {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState(user.preferences || {
    goals: "", workStyle: "Focused", tone: "Professional", focusArea: "General", activeHours: "9 AM - 5 PM"
  });

  async function savePreferences(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await apiRequest("/auth/preferences", { method: "PUT", body: JSON.stringify(preferences) });
      onUpdateUser(updatedUser);
      toast.success("Preferences saved securely.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Header eyebrow="Personalization" title="AI Settings & Profile" />
      <Panel title="How AI should interact with you" icon={<SettingsIcon size={18} className="text-cyan-400" />}>
        <form onSubmit={savePreferences} className="grid gap-6 sm:grid-cols-2">
          <label className="field-label col-span-full">
            Productivity Goals
            <input value={preferences.goals} onChange={(e) => setPreferences({...preferences, goals: e.target.value})} placeholder="e.g. Master React, Finish hackathon, Write thesis..." className="mt-1 bg-black/20" />
          </label>
          <label className="field-label">
            Preferred Work Style
            <select value={preferences.workStyle} onChange={(e) => setPreferences({...preferences, workStyle: e.target.value})} className="mt-1 bg-black/20">
              <option>Focused (Pomodoro)</option>
              <option>Flexible</option>
              <option>Deep Work (Long blocks)</option>
              <option>Collaborative</option>
            </select>
          </label>
          <label className="field-label">
            AI Response Tone
            <select value={preferences.tone} onChange={(e) => setPreferences({...preferences, tone: e.target.value})} className="mt-1 bg-black/20">
              <option>Professional</option>
              <option>Casual & Friendly</option>
              <option>Strict & Direct</option>
              <option>Pirate (Fun)</option>
            </select>
          </label>
          <label className="field-label">
            Primary Focus Area
            <select value={preferences.focusArea} onChange={(e) => setPreferences({...preferences, focusArea: e.target.value})} className="mt-1 bg-black/20">
              <option>General</option>
              <option>Engineering / Coding</option>
              <option>Design</option>
              <option>Academics</option>
              <option>Business</option>
            </select>
          </label>
          <label className="field-label">
            Active Hours
            <input value={preferences.activeHours} onChange={(e) => setPreferences({...preferences, activeHours: e.target.value})} placeholder="e.g. 9 AM - 5 PM" className="mt-1 bg-black/20" />
          </label>
          <button className="primary-button col-span-full mt-2" disabled={loading}>{loading ? "Saving..." : "Save Preferences"}</button>
        </form>
      </Panel>
    </motion.div>
  );
}

function Planner({ setTasks }) {
  const [form, setForm] = useState({ deadline: "End of week", goal: "Complete the landing page frontend" });
  const [result, setResult] = useState("");
  const [provider, setProvider] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate(e) {
    e.preventDefault();
    if (!form.goal.trim()) return;
    setIsGenerating(true);
    setResult("");
    
    try {
      const data = await apiRequest("/ai/planner", {
        method: "POST",
        body: JSON.stringify({ prompt: `Goal: ${form.goal}\nDeadline: ${form.deadline}` })
      });
      setResult(data.response);
      setProvider(data.provider);
      toast.success("Schedule generated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Header eyebrow="Time Management" title="AI Daily Planner" />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Plan Parameters">
          <form onSubmit={generate} className="grid gap-5">
            <label className="field-label">
              What is your main goal today?
              <input required value={form.goal} onChange={(e) => setForm({...form, goal: e.target.value})} className="mt-1 bg-black/20" />
            </label>
            <label className="field-label">
              Key Deadlines
              <input required value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} className="mt-1 bg-black/20" />
            </label>
            <button className="primary-button w-full shadow-[0_0_15px_rgba(103,232,249,0.2)]" disabled={isGenerating}>
              {isGenerating ? <><Bot className="mr-2 animate-pulse" size={18} /> Routing to best AI...</> : <><Calendar className="mr-2" size={18} /> Generate Schedule</>}
            </button>
          </form>
        </Panel>

        <Panel title={provider ? `Your AI Schedule (${provider})` : "Your Schedule"} className="relative min-h-[400px]">
          {result ? (
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200">{result}</p>
              {setTasks && (
                <DetectedTasksWidget text={result} setTasks={setTasks} />
              )}
            </div>
          ) : (
             <div className="absolute inset-0 grid place-items-center p-6">
                <EmptyState icon={Calendar} text="Enter your daily goals and let AI carve out your perfect schedule based on your preferences." />
             </div>
          )}
        </Panel>
      </div>
    </motion.div>
  );
}

export default function App() {
  const { auth, save, logout } = useAuth();
  return (
    <>
      <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: '#0a0d1a', border: '1px solid rgba(255,255,255,0.1)' } }} />
      {auth ? <Shell user={auth.user} onLogout={logout} onUpdateUser={(u) => save({ token: auth.token, user: u })} /> : <LandingPage onAuth={save} />}
    </>
  );
}
