import type { BilingualText, Lesson, QuizItem, ScriptLine } from '@/lib'

const LESSONS_KEY = 'langleap_lessons_v2'

export function scriptEnglish(script: ScriptLine[]): string[] {
  return script.map((l) => l.en)
}

export function targetFor(script: ScriptLine[]): number {
  const words = scriptEnglish(script).join(' ').split(/\s+/).filter(Boolean).length
  return Math.max(10, Math.round(words * 1.2))
}

function q(prompt: string, options: string[], correctIndex: number): QuizItem {
  return { id: `qi-${prompt.length}-${correctIndex}`, prompt, options, correctIndex }
}

/** One script line with its हिंदी and मराठी glosses (FR-01 localisation). */
function line(en: string, hi: string, mr: string): ScriptLine {
  return { en, hi, mr }
}

function hint(en: string, hi: string, mr: string): BilingualText {
  return { en, hi, mr }
}

type SeedRow = Omit<Lesson, 'scriptTargetSec' | 'audioDurationSec'>

// L1..L8 published with valid audio, L9 in_review with out-of-tolerance audio
// (+31%, see LL-Test-Plan DF-06) so the review gate rejects it, L10 draft (no audio).
function seed(): Lesson[] {
  const lessons: SeedRow[] = [
    {
      id: 'l-01', code: 'LL-01', title: 'Greetings', level: 'A1', position: 1, state: 'published', version: 2,
      script: [
        line('Hello! Good morning.', 'नमस्ते! सुप्रभात।', 'नमस्कार! शुभ सकाळ.'),
        line('My name is Priya.', 'मेरा नाम प्रिया है।', 'माझे नाव प्रिया आहे.'),
        line('Nice to meet you.', 'आपसे मिलकर अच्छा लगा।', 'तुम्हाला भेटून आनंद झाला.'),
      ],
      hint: hint('A friendly phrase for a first meeting.', 'पहला अभिवादन — सुबह के लिए।', 'पहिला अभिवादन — सकाळचा.'),
      audioUrl: 'mock-audio/ll-01', quiz: [
        q('What do you say in the morning?', ['Good night', 'Good morning', 'Goodbye'], 1),
        q('How do you introduce yourself?', ['My name is…', 'I am fine', 'Thank you'], 0),
        q('"Nice to meet you" means:', ['विदाई (farewell)', 'A friendly greeting (मैत्रीपूर्ण अभिवादन)', 'Excuse me (माफ़ कीजिए)'], 1),
      ],
    },
    {
      id: 'l-02', code: 'LL-02', title: 'Numbers 1–20', level: 'A1', position: 2, state: 'published', version: 2,
      script: [
        line('One, two, three.', 'एक, दो, तीन।', 'एक, दोन, तीन.'),
        line('Fourteen is a teen.', 'चौदह एक teen अंक है।', 'चौदा ही teen संख्या आहे.'),
        line('I have twenty rupees.', 'मेरे पास बीस रुपए हैं।', 'माझ्याकडे वीस रुपये आहेत.'),
      ],
      hint: hint('Count from one to twenty.', 'एक से बीस तक गिनती।', 'एक ते वीस मोजायला शिका.'),
      audioUrl: 'mock-audio/ll-02', quiz: [
        q('How many is "three"?', ['3 (तीन)', '13', '30'], 0),
        q('Which number follows fourteen?', ['Fifteen', 'Twelve', 'Forty'], 0),
        q('A "teen" number ends with:', ['-teen', '-ty', '-one'], 0),
      ],
    },
    {
      id: 'l-03', code: 'LL-03', title: 'My Family', level: 'A1', position: 3, state: 'published', version: 1,
      script: [
        line('This is my mother.', 'यह मेरी माँ हैं।', 'ही माझी आई आहे.'),
        line('He is my father.', 'वे मेरे पिता हैं।', 'ते माझे वडील आहेत.'),
        line('We are a family of four.', 'हम चार लोगों का परिवार हैं।', 'आम्ही चौघांचे कुटुंब आहोत.'),
      ],
      hint: hint('Talk about your family members.', 'अपने परिवार के बारे में बात करें।', 'तुमच्या कुटुंबाबद्दल बोला.'),
      audioUrl: 'mock-audio/ll-03', quiz: [
        q('"Mother" means…', ['आई (Aai)', 'वडील (Vadil)', 'भावंड (Bhavand)'], 0),
        q('My father is a…', ['Man', 'Woman', 'Child'], 0),
        q('How many people in the family?', ['Two', 'Three', 'Four'], 2),
      ],
    },
    {
      id: 'l-04', code: 'LL-04', title: 'Food & Drinks', level: 'A1', position: 4, state: 'published', version: 1,
      script: [
        line('I like rice and dal.', 'मुझे चावल और दाल पसंद है।', 'मला भात आणि डाळ आवडते.'),
        line('May I have some water?', 'क्या मुझे थोड़ा पानी मिल सकता है?', 'मला थोडे पाणी मिळेल का?'),
        line('The food is tasty.', 'खाना स्वादिष्ट है।', 'जेवण चविष्ट आहे.'),
      ],
      hint: hint('Useful sentences when eating out.', 'खाने-पीने के उपयोगी वाक्य।', 'जेवताना उपयोगी वाक्य.'),
      audioUrl: 'mock-audio/ll-04', quiz: [
        q('Which is a drink?', ['Water', 'Rice', 'Dal'], 0),
        q('"Tasty" (चविष्ट) means:', ['Good to eat', 'Too hot', 'Not ready'], 0),
        q('You ask for water politely with:', ['May I', 'I am', 'You are'], 0),
      ],
    },
    {
      id: 'l-05', code: 'LL-05', title: 'Shopping', level: 'A1', position: 5, state: 'published', version: 1,
      script: [
        line('How much is this?', 'यह कितने का है?', 'हे कितीचे आहे?'),
        line('It costs fifty rupees.', 'इसकी कीमत पचास रुपए है।', 'त्याची किंमत पन्नास रुपये आहे.'),
        line('I will take it.', 'मैं इसे ले लूँगा।', 'मी हे घेईन.'),
      ],
      hint: hint('Ask the price politely while shopping.', 'खरीदारी में दाम पूछें।', 'खरेदी करताना किंमत विचारा.'),
      audioUrl: 'mock-audio/ll-05', quiz: [
        q('You ask the price with:', ['How much?', 'What time?', 'Where is?'], 0),
        q('Fifty rupees is…', ['₹50 (पन्नास)', '₹15', '₹5'], 0),
        q('"I will take it" means:', ['I am buying it', 'I am leaving', 'It is free'], 0),
      ],
    },
    {
      id: 'l-06', code: 'LL-06', title: 'Telling Time', level: 'A1', position: 6, state: 'published', version: 1,
      script: [
        line('What time is it?', 'समय क्या है?', 'किती वाजले आहेत?'),
        line('It is half past nine.', 'साढ़े नौ बजे हैं।', 'साडे नऊ वाजले आहेत.'),
        line('The train is at noon.', 'ट्रेन दोपहर में है।', 'ट्रेन मध्याह्नाला आहे.'),
      ],
      hint: hint('Learn to ask and say the time.', 'समय पूछना और बताना सीखें।', 'वेळ विचारायला आणि सांगायला शिका.'),
      audioUrl: 'mock-audio/ll-06', quiz: [
        q('9:30 in words is:', ['Half past nine', 'Nine past half', 'Thirty to nine'], 0),
        q('"Noon" is:', ['12 PM (दोपहर)', '6 AM', '9 PM'], 0),
        q('You ask the time with:', ['What time is it?', 'How much is it?', 'Who is it?'], 0),
      ],
    },
    {
      id: 'l-07', code: 'LL-07', title: 'Weather', level: 'A1', position: 7, state: 'published', version: 1,
      script: [
        line('Today it is hot.', 'आज गर्मी है।', 'आज गरम आहे.'),
        line('It is raining outside.', 'बाहर बारिश हो रही है।', 'बाहेर पाऊस पडत आहे.'),
        line('Take an umbrella.', 'छाता ले लीजिए।', 'छत्री घ्या.'),
      ],
      hint: hint('Describe today’s weather.', 'आज का मौसम बताएँ।', 'आजचे हवामान सांगा.'),
      audioUrl: 'mock-audio/ll-07', quiz: [
        q('When it rains you use a:', ['Umbrella (छाता)', 'Fan', 'Sweater'], 0),
        q('"Hot" is the opposite of:', ['Cold', 'Wet', 'Open'], 0),
        q('Sound for rain weather:', ['It is raining', 'It is sunny', 'It is cloudy'], 0),
      ],
    },
    {
      id: 'l-08', code: 'LL-08', title: 'Directions', level: 'A1', position: 8, state: 'published', version: 1,
      script: [
        line('Turn left at the corner.', 'कोने पर बाएँ मुड़िए।', 'कोपऱ्यात डावीकडे वळा.'),
        line('The bank is straight ahead.', 'बैंक सीधे आगे है।', 'बँक सरळ पुढे आहे.'),
        line('It is on your right.', 'यह आपके दाईं ओर है।', 'ते तुमच्या उजवीकडे आहे.'),
      ],
      hint: hint('Ask for and follow directions.', 'रास्ता पूछना और समझना सीखें।', 'रस्ता विचारायला आणि समजून घ्यायला शिका.'),
      audioUrl: 'mock-audio/ll-08', quiz: [
        q('Opposite of "left" (डावा) is:', ['Right', 'Up', 'Back'], 0),
        q('"Straight ahead" means:', ['Keep going forward', 'Turn around', 'Stop here'], 0),
        q('The bank is on your:', ['Right', 'Left', 'Both'], 0),
      ],
    },
    {
      id: 'l-09', code: 'LL-09', title: 'At Work', level: 'A1', position: 9, state: 'in_review', version: 2,
      script: [
        line('I work at an office.', 'मैं एक कार्यालय में काम करता हूँ।', 'मी कार्यालयात काम करतो.'),
        line('My manager is kind.', 'मेरा मैनेजर दयालु है।', 'माझा व्यवस्थापक दयाळू आहे.'),
        line('We have a meeting at three.', 'हमारी मीटिंग तीन बजे है।', 'आमची बैठक तीन वाजता आहे.'),
      ],
      hint: hint('Everyday English at the office.', 'ऑफिस में रोज़ की अंग्रेज़ी।', 'ऑफिसमधील रोजची इंग्रजी.'),
      audioUrl: 'mock-audio/ll-09', quiz: [
        q('Where do I work?', ['Office (कार्यालय)', 'Market', 'School'], 0),
        q('A "manager" is a:', ['Boss', 'Friend', 'Client'], 0),
        q('The meeting is at:', ['Three o’clock', 'Nine o’clock', 'Noon'], 0),
      ],
    },
    {
      id: 'l-10', code: 'LL-10', title: 'Health & Body', level: 'A1', position: 10, state: 'draft', version: 1,
      script: [
        line('I have a headache.', 'मुझे सिरदर्द है।', 'मला डोकेदुखी आहे.'),
        line('Take this medicine.', 'यह दवा लीजिए।', 'हे औषध घ्या.'),
        line('See a doctor today.', 'आज डॉक्टर को दिखाइए।', 'आज डॉक्टरांना भेटा.'),
      ],
      hint: hint('Tell someone how you feel.', 'अपनी तबीयत बताना सीखें।', 'तब्येतीबद्दल सांगायला शिका.'),
      audioUrl: null, quiz: [
        q('A "headache" hurts the:', ['Head (सिर)', 'Hand', 'Heart'], 0),
        q('You take ___ for sickness.', ['Medicine (दवा)', 'Food', 'Money'], 0),
        q('You should see a:', ['Doctor (डॉक्टर)', 'Driver', 'Tailor'], 0),
      ],
    },
  ]

  return lessons.map((lesson) => {
    const scriptTargetSec = targetFor(lesson.script)
    // Valid audio sits within ±10% of target; the +31% case re-creates LL-Test-Plan DF-06.
    let duration: number | null = null
    if (lesson.audioUrl) {
      duration = Math.round(scriptTargetSec * 1.06)
    }
    if (lesson.id === 'l-09') {
      duration = Math.round(scriptTargetSec * 1.31)
    }
    return { ...lesson, scriptTargetSec, audioDurationSec: duration }
  })
}

function normalize(lesson: Lesson): Lesson {
  // Guard against any legacy/partial shapes: coerce script lines and hints
  // into the bilingual form so the UI can always render hi/mr.
  const script: ScriptLine[] = lesson.script.map((s) =>
    typeof s === 'string'
      ? line(s, '', '')
      : line(s.en ?? '', s.hi ?? '', s.mr ?? ''),
  )
  const hintText: BilingualText =
    typeof lesson.hint === 'string'
      ? { en: lesson.hint, hi: '', mr: '' }
      : { en: lesson.hint?.en ?? '', hi: lesson.hint?.hi ?? '', mr: lesson.hint?.mr ?? '' }
  return { ...lesson, script, hint: hintText }
}

export function getLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY)
    if (raw) {
      const parsed = (JSON.parse(raw) as Lesson[]).map(normalize)
      return parsed
    }
  } catch {
    /* ignore */
  }
  const fresh = seed()
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(fresh))
  } catch {
    /* ignore */
  }
  return fresh
}

export function saveLessons(lessons: Lesson[]) {
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons.map(normalize)))
}

export function updateLesson(id: string, patch: Partial<Lesson>): Lesson[] {
  const lessons = getLessons()
  const next = lessons.map((l) => (l.id === id ? { ...l, ...patch, version: l.version + 1 } : l))
  saveLessons(next)
  return next
}

export function resetLessons() {
  localStorage.removeItem(LESSONS_KEY)
  return getLessons()
}

// ── FR-11 Review & publish gate (LL-Test-Plan §7, DF-06, bilingual gloss) ────

export interface GateResult {
  ok: boolean
  checks: { label: string; pass: boolean; detail: string }[]
}

export function gateLesson(lesson: Lesson): GateResult {
  const checks: GateResult['checks'] = []
  const wordCount = scriptEnglish(lesson.script).join(' ').split(/\s+/).filter(Boolean).length
  const hasAudio = Boolean(lesson.audioUrl && lesson.audioDurationSec != null)

  checks.push({
    label: 'Script present',
    pass: wordCount >= 6,
    detail: wordCount >= 6 ? `${wordCount} words` : 'Script is too short',
  })
  checks.push({
    label: 'Native-language glosses (हिंदी / मराठी)',
    pass:
      lesson.script.every((l) => l.hi.trim().length > 0 && l.mr.trim().length > 0) &&
      lesson.hint.en.trim().length > 0 &&
      lesson.hint.hi.trim().length > 0 &&
      lesson.hint.mr.trim().length > 0,
    detail: lesson.script.every((l) => l.hi && l.mr)
      ? 'Every line + hint glossed in Hindi & Marathi'
      : 'Missing Hindi or Marathi translation on some lines/hints',
  })
  checks.push({
    label: 'Quiz complete',
    pass: lesson.quiz.length >= 3,
    detail: lesson.quiz.length >= 3 ? `${lesson.quiz.length} questions` : 'Add at least 3 questions',
  })
  checks.push({
    label: 'Audio recorded',
    pass: hasAudio,
    detail: hasAudio ? 'Audio present' : 'No audio recorded yet',
  })
  if (hasAudio) {
    const ratio = (lesson.audioDurationSec as number) / lesson.scriptTargetSec
    const within = ratio >= 0.9 && ratio <= 1.1
    checks.push({
      label: 'Audio duration within 10% of script target',
      pass: within,
      detail: within
        ? `Duration is ${ratio.toFixed(2)}× target (OK)`
        : `Duration is ${ratio.toFixed(2)}× target — over the 10% tolerance (LL-Test-Plan DF-06)`,
    })
  }

  return { ok: checks.every((c) => c.pass), checks }
}