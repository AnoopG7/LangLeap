import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Languages,
  ArrowRight,
  BookOpen,
  Mic2,
  Flame,
  TrendingUp,
  CloudOff,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  Activity,
  LogIn,
} from 'lucide-react'
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { ModeToggle } from '@/components/theme'
import { useAuthStore } from '@/stores'

const MODULES = [
  {
    title: 'Daily Lesson',
    desc: 'Short, practical lessons built from real-life sentences with native-language hints.',
    icon: BookOpen,
    features: [
      'A1/A2 curriculum for Hindi & Marathi speakers',
      'Native-language (हिंदी / मराठी) gloss for every lesson',
      'Voice-recorded audio for every script line',
    ],
  },
  {
    title: 'Speaking Practice',
    desc: 'Repeat after the recording and get instant feedback on your pronunciation attempt.',
    icon: Mic2,
    features: [
      'Listen → repeat loop for each line',
      'Simulated pronunciation scoring',
      'Retry as many times as you need',
    ],
  },
  {
    title: 'Quizzes & Unlocks',
    desc: 'A quiz after every lesson. Score 70 or more to pass and unlock the next lesson.',
    icon: TrendingUp,
    features: [
      'Pass threshold rule: score ≥ 70 unlocks next (FR-06/07)',
      'Retry allowed on failure',
      'Results saved to your progress ledger',
    ],
  },
  {
    title: 'Streaks & Reminders',
    desc: 'Stay consistent. Complete a lesson daily to keep your streak alive, with one weekly freeze.',
    icon: Flame,
    features: [
      'Daily streak with 1 free-use freeze per week (FR-08)',
      'Reminders in the notifications centre (FR-10)',
      'Best-streak tracking',
    ],
  },
  {
    title: 'Offline First',
    desc: 'Finish a lesson on the bus. Results are held locally and synced when you reconnect.',
    icon: CloudOff,
    features: [
      'Cached lesson packages',
      'Local result queue with safe flush',
      'No data loss on disconnect (FR-09)',
    ],
  },
  {
    title: 'Content Studio',
    desc: 'A QA-gated pipeline: writers script, artists record, reviewers publish. Only passing lessons reach learners.',
    icon: ShieldCheck,
    features: [
      'Script → voice → review → publish workflow',
      'Publish gate: audio within 10% of script duration',
      'Role-scoped access for writers, artists, reviewers',
    ],
  },
]

const FAQ_ITEMS = [
  {
    q: 'Who is LangLeap for?',
    a: 'Hindi and Marathi speakers at A1/A2 level who want to learn spoken English through short, practical lessons. Every lesson is glossed in your native language.',
  },
  {
    q: 'How does lesson unlocking work?',
    a: 'Each lesson ends with a short quiz. Score 70 or more to pass and unlock the next published lesson. If you score below 70, you can review your feedback and retry.',
  },
  {
    q: 'What is the streak rule?',
    a: 'Complete any lesson once per calendar day to advance your streak. Miss a day and a weekly freeze keeps your streak safe once per week; a second consecutive miss resets it.',
  },
  {
    q: 'Can I study without internet?',
    a: 'Yes. Lesson packages are cached on your device. If you complete a lesson offline, the result is queued locally and synced automatically once connectivity returns, with no duplicate marks.',
  },
  {
    q: 'Who can author content?',
    a: 'Content Studio is role-scoped: content writers script lessons, voice artists record audio, and reviewers run a quality gate (audio must be within 10% of the script target duration) before publishing.',
  },
  {
    q: 'How do I access the learner app?',
    a: 'Sign in with a learner account (demo accounts are listed on the sign-in page) or create a new learner account. Studio roles are granted by an administrator.',
  },
]

export default function LandingPage() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. STICKY GLASSMORPHIC NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Languages className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text">
                LangLeap
              </span>
              <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                English for Hindi &amp; Marathi Speakers
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#overview" className="hover:text-foreground transition-colors">Overview</a>
            <a href="#modules" className="hover:text-foreground transition-colors">Learning Path</a>
            <a href="#studio" className="hover:text-foreground transition-colors">Content Studio</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <ModeToggle />
            {isAuthenticated && user ? (
              <Button asChild size="sm" className="gap-2 shadow-sm">
                <Link to="/dashboard">
                  <Activity className="size-4" />
                  <span>Enter App</span>
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="gap-1.5 shadow-sm shadow-primary/20">
                <Link to="/login">
                  <LogIn className="size-3.5" />
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO */}
      <section id="overview" className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-border/40">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-inner mb-6">
              <Languages className="size-3.5" />
              <span>Spoken English · A1/A2 · Guided by streaks</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Learn English.{' '}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                One lesson a day.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Short voice-recorded lessons, native-language hints, speaking practice, and quizzes with a
              clear pass rule — built for Hindi and Marathi speakers.
            </p>
            <p className="mt-3 text-sm font-medium text-foreground/80">
              हिंदी: रोज़ एक पाठ, अपनी भाषा के नोट्स के साथ। · मराठी: दररोज एक धडा, तुमच्या भाषेतील नोट्ससह.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              {isAuthenticated ? (
                <Button asChild size="lg" className="gap-2.5 px-7 shadow-lg shadow-primary/25 text-base">
                  <Link to="/dashboard">
                    <Activity className="size-5" />
                    <span>Open Dashboard</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="gap-2 px-7 shadow-lg shadow-primary/25 text-base">
                    <Link to="/login">
                      <LogIn className="size-4.5" />
                      <span>Sign In to Start Learning</span>
                      <ArrowRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="text-base">
                    <a href="#modules">
                      <span>Explore the Learning Path</span>
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. LEARNING MODULES */}
      <section id="modules" className="py-20 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
              Learning Path
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything in the Daily Lesson Loop
            </h2>
            <p className="mt-3 text-muted-foreground">
              Content → speaking → quiz → unlock — with streaks and offline support on top.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod, idx) => (
              <Card key={idx} className="border-border/70 hover:border-primary/50 transition-all hover:shadow-lg bg-card/60 flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <mod.icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{mod.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-1">
                  <ul className="space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                    {mod.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTENT STUDIO */}
      <section id="studio" className="py-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
              Content Studio
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A QA-Gated Production Pipeline
            </h2>
            <p className="mt-3 text-muted-foreground">
              Writers script, voice artists record, reviewers run the quality gate. Only published lessons
              reach learners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Script', desc: 'Content writers author script lines, hint translations, and quiz questions.' },
              { step: '02', title: 'Voice', desc: 'Voice artists record audio; duration must land within 10% of the script target.' },
              { step: '03', title: 'Publish', desc: 'Reviewers run the gate. Passing lessons are published and unlock on the learner path.' },
            ].map((s, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border/70 bg-card/60 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">Stage {s.step}</Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{s.step}</span>
                </div>
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="py-20 border-b border-border/40">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={idx} className="rounded-xl border border-border/70 bg-card overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-semibold text-sm sm:text-base hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. CTA + FOOTER */}
      <section className="py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Start your daily streak today</h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Sign in with a demo learner account or create a new account. Your 120-lesson A1 path is waiting.
          </p>
          <div className="mt-8 flex justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="px-8 shadow-lg shadow-primary/20 text-base">
                <Link to="/dashboard">
                  <span>Enter Dashboard</span>
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="px-8 shadow-lg shadow-primary/20 text-base">
                <Link to="/login">
                  <LogIn className="size-4.5 mr-2" />
                  <span>Sign In to Start Learning</span>
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Languages className="size-4" />
                </div>
                <span className="font-bold text-base">LangLeap</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                English language learning app for Hindi and Marathi speakers. Voice-first, streak-driven,
                offline-friendly lessons for confident everyday English.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>A1 learner path live · 120 lessons planned</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider">Learning</span>
              <ul className="space-y-2 text-muted-foreground">
                <li>Daily Lessons</li>
                <li>Speaking Practice</li>
                <li>Quizzes &amp; Unlocks</li>
                <li>Streaks &amp; Reminders</li>
                <li>Offline Mode</li>
              </ul>
            </div>
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider">Portal Access</span>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground">Learner Sign In</Link></li>
                <li><Link to="/forgot-password" className="hover:text-foreground">Password Recovery</Link></li>
                <li><a href="#overview" className="hover:text-foreground">Return to Top</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <span>© {new Date().getFullYear()} LangLeap. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-foreground cursor-pointer">Hindi · मराठी · English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}