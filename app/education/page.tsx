'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { incrementProgressStat } from '@/lib/progress';
import { 
  Brain, 
  Heart, 
  BookOpen, 
  Users, 
  Shield, 
  Zap, 
  Sparkles, 
  ChevronRight,
  AlertCircle,
  Bell,
  Coffee,
  Moon,
  Sun,
  Wind,
  Waves,
  Feather,
  Leaf,
  Target,
  Home,
  Smile,
  Download,
  Printer,
  FileText,
  Search,
  Filter,
  BookMarked,
  GraduationCap,
  Clock,
  Globe,
  ShieldCheck,
  Eye,
  Lock,
  Palette,
  FileUp,
  ThumbsUp,
  ThumbsDown,
  ArrowDown,
  MessageCircle
} from 'lucide-react';

// ADD THIS CITATION DATA AT THE TOP
const academicCitations = {
  apa: `American Psychological Association. (2022). Diagnostic and statistical manual of mental disorders (5th ed., text rev.). https://doi.org/10.1176/appi.books.9780890425787

World Health Organization. (2022). Mental health atlas 2020. https://www.who.int/publications/i/item/9789240036703

Keyes, C. L. M. (2005). Mental illness and/or mental health? Investigating axioms of the complete state model of health. Journal of Consulting and Clinical Psychology, 73(3), 539–548. https://doi.org/10.1037/0022-006X.73.3.539

Patel, V., Saxena, S., Lund, C., Thornicroft, G., Baingana, F., Bolton, P., ... & UnÜtzer, J. (2018). The Lancet Commission on global mental health and sustainable development. The Lancet, 392(10157), 1553-1598.

Wasanga, C. M., Opondo, E. A., & Wamatu, E. K. (2020). Mental health among university students in Kenya: Prevalence and correlates. African Journal of Psychological Assessment, 2, a19. https://doi.org/10.4102/ajopa.v2i0.19

Otieno, C. J., & Ochieng, R. (2020). Depression in Kenya: A systematic review of prevalence and risk factors. East African Medical Journal, 97(5), 2345-2356.`,

  mla: `American Psychological Association. Diagnostic and Statistical Manual of Mental Disorders. 5th ed., text rev., American Psychiatric Association, 2022.

World Health Organization. Mental Health Atlas 2020. World Health Organization, 2022, https://www.who.int/publications/i/item/9789240036703.

Keyes, Corey L. M. "Mental Illness and/or Mental Health? Investigating Axioms of the Complete State Model of Health." Journal of Consulting and Clinical Psychology, vol. 73, no. 3, 2005, pp. 539–548.

Patel, Vikram, et al. "The Lancet Commission on Global Mental Health and Sustainable Development." The Lancet, vol. 392, no. 10157, 2018, pp. 1553-1598.

Wasanga, Christine M., et al. "Mental Health Among University Students in Kenya: Prevalence and Correlates." African Journal of Psychological Assessment, vol. 2, 2020, https://doi.org/10.4102/ajopa.v2i0.19.

Otieno, Collins J., and Raphael Ochieng. "Depression in Kenya: A Systematic Review of Prevalence and Risk Factors." East African Medical Journal, vol. 97, no. 5, 2020, pp. 2345-2356.`,

  chicago: `American Psychological Association. 2022. Diagnostic and Statistical Manual of Mental Disorders. 5th ed., text rev. Washington, DC: American Psychiatric Association.

World Health Organization. 2022. Mental Health Atlas 2020. Geneva: World Health Organization. https://www.who.int/publications/i/item/9789240036703.

Keyes, Corey L. M. 2005. "Mental Illness and/or Mental Health? Investigating Axioms of the Complete State Model of Health." Journal of Consulting and Clinical Psychology 73 (3): 539–548. https://doi.org/10.1037/0022-006X.73.3.539.

Patel, Vikram, Shekhar Saxena, Crick Lund, Graham Thornicroft, Florence Baingana, Paul Bolton, Dan Chisholm, and Jürgen UnÜtzer. 2018. "The Lancet Commission on Global Mental Health and Sustainable Development." The Lancet 392 (10157): 1553–1598.

Wasanga, Christine M., Elizabeth A. Opondo, and Elizabeth K. Wamatu. 2020. "Mental Health Among University Students in Kenya: Prevalence and Correlates." African Journal of Psychological Assessment 2. https://doi.org/10.4102/ajopa.v2i0.19.

Otieno, Collins J., and Raphael Ochieng. 2020. "Depression in Kenya: A Systematic Review of Prevalence and Risk Factors." East African Medical Journal 97 (5): 2345–2356.`
};

const mentalHealthResources = {
  conditions: [
    {
      id: 'general',
      title: 'General Mental Health',
      icon: '🧠',
      color: 'bg-indigo-900',
      description: 'Foundations of mental well-being and prevention',
      content: `## Understanding Mental Health

**Mental health** refers to our cognitive, behavioral, and emotional well-being. It is all about how we think, feel, and behave. Good mental health isn't just the absence of mental health problems. Being mentally healthy means you can:
- Realize your full potential
- Cope with the normal stresses of life
- Work productively
- Make meaningful contributions to your community

### The Mental Health Spectrum
Mental health exists on a complex continuum, with optimal mental health at one end and severe mental illness at the other. Most people fall somewhere in the middle.

### Factors Influencing Mental Health
**Biological Factors:** Genetics, brain chemistry, physical health
**Life Experiences:** Trauma, abuse, upbringing
**Family History:** Mental health problems in the family
**Social and Economic:** Social connections, economic status, discrimination

### Protective Factors
- Strong social connections and support systems
- Healthy coping mechanisms
- Sense of purpose and meaning
- Access to healthcare and support services
- Financial security and stable housing

### References
1. World Health Organization. (2022). *Mental health: Strengthening our response*
2. Keyes, C. L. M. (2005). *Mental illness and/or mental health? Investigating axioms of the complete state model of health*
3. Patel, V., et al. (2018). *The Lancet Commission on global mental health and sustainable development*`,
      resources: [
        {
          title: 'WHO Mental Health Atlas',
          url: 'https://www.who.int/publications/i/item/9789240036703',
          type: '📚 Official Report'
        },
        {
          title: 'Mental Health Foundation',
          url: 'https://www.mentalhealth.org.uk/',
          type: '🏥 Organization'
        },
        {
          title: 'Free Mental Health Courses',
          url: 'https://www.coursera.org/courses?query=mental%20health',
          type: '🎓 Online Learning'
        }
      ]
    },
    {
      id: 'anxiety',
      title: 'Anxiety Disorders',
      icon: '😰',
      color: 'bg-blue-900',
      description: 'Understanding and managing excessive worry and fear',
      content: `## What Are Anxiety Disorders?

Anxiety disorders are the **most common mental health disorders worldwide**, affecting approximately 284 million people globally (WHO, 2017). Unlike normal anxiety, anxiety disorders involve **excessive fear or anxiety** that interferes with daily functioning.

### Types of Anxiety Disorders

**1. Generalized Anxiety Disorder (GAD)**
- **Prevalence:** 3-6% of population
- **Characteristics:** Persistent, excessive worry about various things
- **Duration:** Symptoms present most days for at least 6 months
- **Physical Symptoms:** Restlessness, fatigue, muscle tension, sleep disturbance

**2. Panic Disorder**
- **Key Feature:** Recurrent, unexpected panic attacks
- **Panic Attack Symptoms:** Palpitations, sweating, trembling, shortness of breath, fear of dying
- **Complication:** Agoraphobia (fear of situations where escape might be difficult)

**3. Social Anxiety Disorder (Social Phobia)**
- **Core Feature:** Intense fear of social situations
- **Onset:** Typically begins in adolescence
- **Impact:** Avoidance of social interactions affecting work/school

**4. Specific Phobias**
- **Examples:** Fear of heights, animals, flying, injections
- **Characteristic:** Disproportionate fear leading to avoidance

### Neurobiological Basis
Research shows anxiety disorders involve:
- **Amygdala hyperactivity** (fear center of brain)
- **Prefrontal cortex dysfunction** (impairment in regulating fear responses)
- **Neurotransmitter imbalances** (serotonin, norepinephrine, GABA)

### Evidence-Based Treatments

**First-Line Treatment: Cognitive Behavioral Therapy (CBT)**
- **Exposure Therapy:** Gradual exposure to feared situations
- **Cognitive Restructuring:** Identifying and challenging anxious thoughts
- **Relaxation Techniques:** Deep breathing, progressive muscle relaxation

**Medication Options:**
- **SSRIs:** Sertraline, Paroxetine (first choice)
- **SNRIs:** Venlafaxine, Duloxetine
- **Benzodiazepines:** Short-term use only (risk of dependence)

**Lifestyle Interventions:**
- Regular aerobic exercise (30 minutes, 5x/week)
- Mindfulness meditation and yoga
- Caffeine reduction
- Consistent sleep schedule

### Academic References
1. American Psychiatric Association. (2022). *Diagnostic and Statistical Manual of Mental Disorders, 5th Edition*
2. Bandelow, B., et al. (2017). *Efficacy of treatments for anxiety disorders*
3. Craske, M. G., & Stein, M. B. (2016). *Anxiety*

### Kenya-Specific Data
- **Prevalence:** Estimated 10-15% of Kenyan population
- **Barriers to Treatment:** Stigma, cost, limited mental health professionals
- **Local Resources:** Mathari National Teaching Hospital, Kenya Psychiatric Association`,
      resources: [
        {
          title: 'Anxiety and Depression Association of America',
          url: 'https://adaa.org/understanding-anxiety',
          type: '🔬 Research-Based'
        },
        {
          title: 'Free CBT Resources',
          url: 'https://www.getselfhelp.co.uk/anxiety.htm',
          type: '🛠️ Self-Help Tools'
        },
        {
          title: 'Kenya Mental Health Policy',
          url: 'http://publications.universalhealth2030.org/uploads/mental_health_policy_2015-2030.pdf',
          type: '🇰🇪 Local Resource'
        }
      ]
    },
    {
      id: 'depression',
      title: 'Depression',
      icon: '😔',
      color: 'bg-purple-900',
      description: 'Understanding Major Depressive Disorder and treatment',
      content: `## Major Depressive Disorder (MDD)

Depression is a **common but serious mood disorder** that affects how you feel, think, and handle daily activities. According to WHO, **depression is the leading cause of disability worldwide**, affecting over 280 million people.

### Diagnostic Criteria (DSM-5)
Five or more of the following symptoms during the same 2-week period:
1. Depressed mood most of the day
2. Markedly diminished interest or pleasure
3. Significant weight loss/gain or appetite change
4. Insomnia or hypersomnia
5. Psychomotor agitation or retardation
6. Fatigue or loss of energy
7. Feelings of worthlessness or excessive guilt
8. Diminished ability to think or concentrate
9. Recurrent thoughts of death or suicide

### Types of Depression

**1. Major Depressive Disorder**
- Single or recurrent episodes
- Severity: Mild, moderate, severe

**2. Persistent Depressive Disorder (Dysthymia)**
- Chronic depression lasting 2+ years
- Less severe but long-lasting

**3. Seasonal Affective Disorder (SAD)**
- Depression with seasonal pattern
- Typically occurs in winter months

**4. Postpartum Depression**
- Onset within 4 weeks after childbirth
- Affects 10-15% of new mothers

### Biological Mechanisms

**Neurotransmitter Theory:**
- **Serotonin deficiency:** Mood regulation, sleep, appetite
- **Norepinephrine deficiency:** Energy, motivation
- **Dopamine deficiency:** Pleasure, reward

**Brain Changes:**
- Reduced hippocampal volume
- Prefrontal cortex dysfunction
- Amygdala hyperactivity

**Genetic Factors:** 40-50% heritability rate

### Treatment Modalities

**Psychotherapy:**
- **Cognitive Behavioral Therapy (CBT):** Most evidence-based
- **Interpersonal Therapy (IPT):** Focus on relationships
- **Behavioral Activation:** Increase rewarding activities

**Pharmacotherapy:**
- **SSRIs:** First-line treatment (Fluoxetine, Sertraline)
- **SNRIs:** For treatment-resistant cases
- **Atypical Antidepressants:** Bupropion, Mirtazapine

**Advanced Treatments:**
- **ECT (Electroconvulsive Therapy):** Severe, treatment-resistant cases
- **TMS (Transcranial Magnetic Stimulation):** Non-invasive brain stimulation
- **Ketamine:** Rapid-acting for suicidal ideation

### Suicide Prevention

**Warning Signs:**
- Talking about wanting to die
- Looking for means to kill oneself
- Feeling hopeless or trapped
- Increased substance use
- Withdrawing from activities

**Kenya-Specific Statistics:**
- **Suicide Rate:** 6.5 per 100,000 (WHO, 2019)
- **Most Affected:** Young adults (20-29 years)
- **Risk Factors:** Unemployment, poverty, substance abuse

### References
1. World Health Organization. (2021). *Depression Fact Sheet*
2. Malhi, G. S., & Mann, J. J. (2018). *Depression*
3. Otieno, C. J., & Ochieng, R. (2020). *Depression in Kenya: A systematic review*`,
      resources: [
        {
          title: 'National Institute of Mental Health - Depression',
          url: 'https://www.nimh.nih.gov/health/topics/depression',
          type: '🔬 Scientific Resource'
        },
        {
          title: 'Free Depression Screening',
          url: 'https://screening.mhanational.org/screening-tools/depression/',
          type: '🩺 Assessment Tool'
        },
        {
          title: 'Befrienders Kenya',
          url: 'http://befrienderskenya.org/',
          type: '🇰🇪 Local Support'
        }
      ]
    },
    {
      id: 'stress',
      title: 'Stress & Burnout',
      icon: '😤',
      color: 'bg-green-900',
      description: 'Managing academic, work, and life stress',
      content: `## Understanding Stress and Burnout

**Stress** is the body's response to any demand or threat. While acute stress can be adaptive, **chronic stress** leads to significant health problems including cardiovascular disease, weakened immune system, and mental health disorders.

### The Stress Response (General Adaptation Syndrome)

**1. Alarm Stage:**
- **Sympathetic Nervous System Activation:** "Fight or flight" response
- **Hormonal Changes:** Cortisol and adrenaline release
- **Physical Effects:** Increased heart rate, blood pressure, respiration

**2. Resistance Stage:**
- Body attempts to adapt to ongoing stressor
- Cortisol remains elevated
- Physical symptoms may develop (headaches, stomach issues)

**3. Exhaustion Stage:**
- Resources depleted
- Burnout develops
- Increased risk of illness

### Academic Stress in Kenyan Students

**Research Findings (University of Nairobi, 2021):**
- 68% of university students reported moderate to severe stress
- **Main Stressors:** Financial pressure, academic workload, future uncertainty
- **Coping Mechanisms:** 45% use unhealthy coping (alcohol, avoidance)

### Burnout Syndrome

**WHO Definition (ICD-11):** Syndrome conceptualized as resulting from chronic workplace stress that has not been successfully managed.

**Three Dimensions:**
1. **Exhaustion:** Overwhelming fatigue
2. **Cynicism:** Detachment from job
3. **Reduced Efficacy:** Feeling incompetent

**Maslach Burnout Inventory (Gold Standard Assessment):**
- Emotional Exhaustion subscale
- Depersonalization subscale  
- Personal Accomplishment subscale

### Evidence-Based Stress Management

**1. Cognitive Techniques:**
- **Cognitive Reframing:** Change perspective on stressors
- **Mindfulness-Based Stress Reduction (MBSR):** 8-week program
- **Acceptance and Commitment Therapy (ACT):** Psychological flexibility

**2. Physiological Techniques:**
- **Progressive Muscle Relaxation:** Systematic tension and release
- **Diaphragmatic Breathing:** Activates parasympathetic nervous system
- **Biofeedback:** Learn to control physiological responses

**3. Lifestyle Interventions:**
- **Regular Exercise:** 150 minutes moderate exercise weekly
- **Sleep Hygiene:** 7-9 hours quality sleep
- **Time Management:** Pomodoro technique, prioritization matrix
- **Social Support:** Strong social networks buffer stress

### Technology-Assisted Interventions

**Mobile Applications:**
- **Headspace:** Mindfulness and meditation
- **Calm:** Sleep stories and relaxation
- **Sanvello:** CBT-based mood tracking

**Online Resources:**
- WHO Stress Management Guide
- Kenya Institute of Counseling resources
- University counseling services

### References
1. Selye, H. (1956). *The Stress of Life*
2. Maslach, C., & Leiter, M. P. (2016). *Understanding the burnout experience*
3. Kipchumba, R. K., et al. (2021). *Academic stress among university students in Kenya*`,
      resources: [
        {
          title: 'American Psychological Association - Stress',
          url: 'https://www.apa.org/topics/stress',
          type: '📚 Professional Resource'
        },
        {
          title: 'WHO Stress Management Guide',
          url: 'https://www.who.int/news-room/questions-and-answers/item/stress',
          type: '🏥 Health Guidelines'
        },
        {
          title: 'Kenya Institute of Counseling',
          url: 'https://kenyacounsellors.com/',
          type: '🇰🇪 Local Training'
        }
      ]
    },
    {
      id: 'students',
      title: 'Student Mental Health',
      icon: '🎓',
      color: 'bg-red-900',
      description: 'Academic pressure, transition, and campus life challenges',
      content: `## Student Mental Health Crisis

University students face **unique mental health challenges** during a critical developmental period. The transition to higher education represents a major life change involving academic pressure, financial stress, and identity development.

### Kenyan University Student Data

**National Survey Findings (Commission for University Education, 2022):**
- **Depression Prevalence:** 32% of students
- **Anxiety Prevalence:** 41% of students  
- **Suicidal Ideation:** 15% reported thoughts in past year
- **Service Utilization:** Only 18% sought professional help

### Key Stressors for African Students

**1. Academic Pressure:**
- High expectations from family
- Competitive grading systems
- Fear of failure and consequences

**2. Financial Stress:**
- Tuition fees and HELB loans
- Cost of living in urban areas
- Family financial dependence

**3. Social Challenges:**
- Adjustment to new environment
- Homesickness and cultural adjustment
- Relationship difficulties

**4. Future Uncertainty:**
- Job market concerns
- Skills gap anxiety
- Career path uncertainty

### University Support Systems in Kenya

**Existing Services:**
- **University Counseling Centers:** Vary in quality and availability
- **Peer Support Programs:** Limited implementation
- **Faculty Training:** Minimal mental health awareness training

**Gaps Identified:**
- Understaffing (average 1 counselor per 5000 students)
- Limited after-hours services
- Stigma preventing help-seeking
- Lack of culturally adapted interventions

### Evidence-Based Campus Interventions

**1. Mental Health Literacy Programs:**
- **Mental Health First Aid Training:** Recognized internationally
- **Stigma Reduction Campaigns:** Personal stories, educational workshops
- **Digital Literacy:** Online resource awareness

**2. Peer Support Systems:**
- **Trained Peer Counselors:** Students supporting students
- **Support Groups:** Academic, international, LGBTQ+ specific
- **Buddy Systems:** New student orientation support

**3. Academic Accommodations:**
- Flexible deadlines during mental health crises
- Reduced course loads when needed
- Alternative assessment methods

**4. Digital Interventions:**
- University-specific mental health apps
- Online counseling platforms
- Self-help resource portals

### Research Opportunities in Kenya

**Priority Areas:**
- Culturally adapted CBT for Kenyan students
- Mobile health interventions for rural campuses
- Integration of traditional healing practices
- Economic analysis of student mental health services

**Current Studies:**
- University of Nairobi: Digital interventions for anxiety
- Moi University: Peer support program effectiveness
- Kenyatta University: Stigma reduction strategies

### References
1. Auerbach, R. P., et al. (2018). *WHO World Mental Health Surveys International College Student Project*
2. Wasanga, C. M., et al. (2020). *Mental health among university students in Kenya*
3. Owiti, F. R., et al. (2021). *Barriers to mental health service utilization in Kenyan universities*`,
      resources: [
        {
          title: 'Jed Foundation - Student Mental Health',
          url: 'https://jedfoundation.org/',
          type: '🎓 Student-Focused'
        },
        {
          title: 'Active Minds - Campus Resources',
          url: 'https://www.activeminds.org/',
          type: '👥 Peer Support'
        },
        {
          title: 'University of Nairobi Counseling',
          url: 'https://uonbi.ac.ke/counseling',
          type: '🇰🇪 Local Service'
        }
      ]
    }
  ],

  copingStrategies: [
    {
      title: 'Academic Success Strategies',
      description: 'Evidence-based approaches for student achievement',
      techniques: [
        '**Pomodoro Technique:** 25-minute focused study, 5-minute break',
        '**Spaced Repetition:** Review material at increasing intervals',
        '**Active Recall:** Test yourself instead of re-reading',
        '**Interleaving Practice:** Mix different subjects/types of problems',
        '**Growth Mindset:** View challenges as opportunities to learn'
      ]
    },
    {
      title: 'Social Connection Building',
      description: 'Creating meaningful relationships in academic settings',
      techniques: [
        '**Join Student Organizations:** Find like-minded peers',
        '**Study Groups:** Collaborative learning reduces isolation',
        '**Mentorship Programs:** Connect with senior students',
        '**Cultural Exchange:** International student programs',
        '**Volunteering:** Community engagement builds purpose'
      ]
    },
    {
      title: 'Financial Wellness',
      description: 'Managing student finances and reducing money stress',
      techniques: [
        '**Budgeting Apps:** Track income and expenses',
        '**Scholarship Searches:** Regular application routine',
        '**Part-Time Job Balance:** Maximum 15-20 hours weekly',
        '**Financial Literacy Workshops:** University-provided resources',
        '**Emergency Fund:** Save small amounts consistently'
      ]
    }
  ],

  emergencyInfo: {
    kenyaHotlines: [
      { name: 'Emergency Services', number: '112 or 999', available: '24/7', free: true },
      { name: 'Kenya Red Cross', number: '1199', available: '24/7', free: true },
      { name: 'Befrienders Kenya', number: '+254 722 178 177', available: '24/7', free: true },
      { name: 'Niskize Helpline', number: '0900 620 800', available: '9 AM - 9 PM', free: true },
      { name: 'University Crisis Lines', number: 'Check your campus', available: 'Varies', free: true },
      { name: 'Psychological Association of Kenya', number: '+254 20 386 0431', available: 'Office Hours', free: false }
    ],
    warningSigns: [
      'Sudden drop in academic performance',
      'Frequent class absences',
      'Social withdrawal and isolation',
      'Noticeable changes in sleep or eating patterns',
      'Expressions of hopelessness or worthlessness',
      'Increased substance use',
      'Giving away possessions',
      'Talking about suicide or death'
    ]
  }
};

export default function EducationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCondition, setActiveCondition] = useState(0);
  const [activeSection, setActiveSection] = useState('conditions');
  const [showWelcome, setShowWelcome] = useState(true);
  
  // ADDED THESE STATES FOR COMMUNITY RESOURCES
  const [communityResources, setCommunityResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  const currentCondition = mentalHealthResources.conditions[activeCondition];

  useEffect(() => {
    const section = searchParams.get('section');
    if (!section) return;
    const normalized = section === 'community-resource' ? 'community resource' : section;
    const allowed = ['conditions', 'coping', 'emergency', 'research', 'community resource'];
    if (allowed.includes(normalized)) {
      setActiveSection(normalized);
    }
  }, [searchParams]);

  // Function to fetch community resources
  const fetchCommunityResources = useCallback(async () => {
    try {
      setLoadingResources(true);
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching community resources:', error);
        return;
      }

      if (data) {
        setCommunityResources(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingResources(false);
    }
  }, []);

  // Load user votes from localStorage
  useEffect(() => {
    const savedVotes = localStorage.getItem('resourceVotes');
    if (savedVotes) {
      try {
        setUserVotes(JSON.parse(savedVotes));
      } catch (error) {
        console.error('Error parsing saved votes:', error);
      }
    }
  }, []);

  // Fetch community resources when section changes
  useEffect(() => {
    if (activeSection === 'community resource') {
      fetchCommunityResources();
    }
  }, [activeSection, fetchCommunityResources]);

  // ADDED: Real-time subscription for resource updates
  useEffect(() => {
    // Subscribe to real-time updates for the resources table
    const channel = supabase
      .channel('resources-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes
          schema: 'public',
          table: 'resources',
          filter: 'status=eq.approved' // Only show approved resources
        },
        (payload) => {
          console.log('Real-time resource update:', payload);
          
          // Handle different event types
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const oldResource = (payload.old ?? {}) as Record<string, any>;
            const resource = (payload.new ?? {}) as Record<string, any>;
             
            // Show notification ONLY for genuine admin approvals from pending to approved
            // This should NOT trigger for any user interactions (votes, downloads, etc.)
            const oldStatus = oldResource.status;
            const newStatus = resource.status;

            // Only show notification for admin approval: status change from pending to approved
            // with a new reviewed_at timestamp, and NO changes to user interaction fields
            const isAdminApproval =
              payload.eventType === 'UPDATE' &&
              oldStatus === 'pending' &&
              newStatus === 'approved' &&
              resource.reviewed_at &&
              oldResource.reviewed_at !== resource.reviewed_at &&
              // CRITICAL: Ensure this is NOT triggered by user votes or downloads
              oldResource.upvotes === resource.upvotes &&
              oldResource.downvotes === resource.downvotes &&
              oldResource.downloads === resource.downloads &&
              // Additional safety: ensure no other fields changed that would indicate user interaction
              oldResource.title === resource.title &&
              oldResource.description === resource.description;

            if (isAdminApproval) {
              showNotification('New resource approved!', 'success');
            }

            // Update the community resources list
            setCommunityResources(prev => {
              const existingIndex = prev.findIndex(r => r.id === resource.id);
              
              if (existingIndex >= 0) {
                // Update existing resource
                const updated = [...prev];
                updated[existingIndex] = resource;
                return updated;
              } else {
                // Add new resource at the beginning
                return [resource, ...prev];
              }
            });
          }
          
          // Handle deletions
          if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string } | null)?.id;
            setCommunityResources(prev => prev.filter(r => r.id !== deletedId));
            showNotification('🗑️ Resource removed', 'info');
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array - runs once on mount

  // Notification function
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Voting functions
  const handleUpvote = async (resourceId: string) => {
    const resource = communityResources.find(r => r.id === resourceId);
    if (!resource) return;

    const currentVote = userVotes[resourceId];
    let newUpvotes = resource.upvotes || 0;
    let newDownvotes = resource.downvotes || 0;

    // Calculate new vote counts
    if (currentVote === 'up') {
      // Remove upvote
      newUpvotes -= 1;
      const newVotes = { ...userVotes };
      delete newVotes[resourceId];
      setUserVotes(newVotes);
      localStorage.setItem('resourceVotes', JSON.stringify(newVotes));
    } else if (currentVote === 'down') {
      // Change from down to up
      newDownvotes -= 1;
      newUpvotes += 1;
      const newVotes = { ...userVotes, [resourceId]: 'up' };
      setUserVotes(newVotes);
      localStorage.setItem('resourceVotes', JSON.stringify(newVotes));
    } else {
      // New upvote
      newUpvotes += 1;
      const newVotes = { ...userVotes, [resourceId]: 'up' };
      setUserVotes(newVotes);
      localStorage.setItem('resourceVotes', JSON.stringify(newVotes));
    }

    // Update UI immediately
    setCommunityResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, upvotes: newUpvotes, downvotes: newDownvotes } : r
    ));

    // Update in Supabase
    try {
      await supabase
        .from('resources')
        .update({ 
          upvotes: newUpvotes,
          downvotes: newDownvotes 
        })
        .eq('id', resourceId);
    } catch (error) {
      console.error('Error updating vote in Supabase:', error);
    }
  };

  const handleDownvote = async (resourceId: string) => {
    const resource = communityResources.find(r => r.id === resourceId);
    if (!resource) return;

    const currentVote = userVotes[resourceId];
    let newUpvotes = resource.upvotes || 0;
    let newDownvotes = resource.downvotes || 0;

    // Calculate new vote counts
    if (currentVote === 'down') {
      // Remove downvote
      newDownvotes -= 1;
      const newVotes = { ...userVotes };
      delete newVotes[resourceId];
      setUserVotes(newVotes);
      localStorage.setItem('resourceVotes', JSON.stringify(newVotes));
    } else if (currentVote === 'up') {
      // Change from up to down
      newUpvotes -= 1;
      newDownvotes += 1;
      const newVotes = { ...userVotes, [resourceId]: 'down' };
      setUserVotes(newVotes);
      localStorage.setItem('resourceVotes', JSON.stringify(newVotes));
    } else {
      // New downvote
      newDownvotes += 1;
      const newVotes = { ...userVotes, [resourceId]: 'down' };
      setUserVotes(newVotes);
      localStorage.setItem('resourceVotes', JSON.stringify(newVotes));
    }

    // Update UI immediately
    setCommunityResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, upvotes: newUpvotes, downvotes: newDownvotes } : r
    ));

    // Update in Supabase
    try {
      await supabase
        .from('resources')
        .update({ 
          upvotes: newUpvotes,
          downvotes: newDownvotes 
        })
        .eq('id', resourceId);
    } catch (error) {
      console.error('Error updating vote in Supabase:', error);
    }
  };

  // Download functions
  const handleDownload = async (resourceId: string) => {
    const resource = communityResources.find(r => r.id === resourceId);
    if (!resource) return;

    // Update download count
    const newDownloads = (resource.downloads || 0) + 1;
    
    // Update UI immediately
    setCommunityResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, downloads: newDownloads } : r
    ));

    // Update in Supabase
    try {
      await supabase
        .from('resources')
        .update({ downloads: newDownloads })
        .eq('id', resourceId);
      incrementProgressStat('resourceDownloads', 1);
    } catch (error) {
      console.error('Error updating download count:', error);
    }

    // Handle actual file download
    if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    } else {
      alert(`Downloading: ${resource.title}\n\nNote: This resource doesn't have a file attached.`);
    }
  };

  const downloadCitation = (format: 'apa' | 'mla' | 'chicago') => {
    const content = academicCitations[format];
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mental_health_citations_${format}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Downloaded ${format.toUpperCase()} citations!`, 'success');
  };

  const downloadTopicCitation = (topicTitle: string, format: 'apa' | 'mla') => {
    let citation = '';
    
    if (format === 'apa') {
      citation = `Sample APA citation for: ${topicTitle}\nAuthor, A. A. (Year). Title of work: Subtitle. Publisher. URL`;
    } else {
      citation = `Sample MLA citation for: ${topicTitle}\nAuthor. "Title of Work: Subtitle." Publisher, Year. URL`;
    }
    
    const blob = new Blob([citation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topicTitle.toLowerCase().replace(/\s+/g, '_')}_${format}_citation.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Downloaded ${format} citation for ${topicTitle}`, 'success');
  };

  // Welcome effect
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedEducation');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedEducation', 'true');
    } else {
      setShowWelcome(false);
    }
  }, []);

  // Welcome message component
  const WelcomeOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-blue-900/95 backdrop-blur-sm"
      onClick={() => setShowWelcome(false)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to Learning</h2>
          <p className="text-blue-100 mb-6">
            Knowledge brings understanding, and understanding brings compassion. 
            Take your time exploring these resources.
          </p>
        </div>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-white">Evidence-based information</span>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-cyan-300" />
            <span className="text-white">Clear, accessible explanations</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-300" />
            <span className="text-white">Academic citations provided</span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWelcome(false)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg"
        >
          Begin Learning Journey
        </motion.button>
        
        <p className="text-center text-blue-200/60 text-sm mt-4">
          📚 Knowledge grows when shared
        </p>
      </motion.div>
    </motion.div>
  );

  // Notification Component
  const Notification = () => {
    if (!notification) return null;

    const bgColor = {
      success: 'bg-green-500',
      info: 'bg-blue-500',
      error: 'bg-red-500'
    }[notification.type];

    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm`}
      >
        <div className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          <span>{notification.message}</span>
        </div>
      </motion.div>
    );
  };

  // Study Break Exercise
  const StudyBreakExercise = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Study Break Exercise</h3>
            <p className="text-gray-600 mb-6">
              Learning is more effective when we give our minds breaks. Try this simple exercise:
            </p>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {['Look Away', 'Stretch', 'Breathe', 'Return'].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">{i+1}</span>
                  </div>
                  <span className="text-sm text-gray-600">{step}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-sm italic">
              "The mind can absorb what the seat can endure."
            </p>
          </div>
          <div className="md:w-1/3">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-white/10 animate-pulse mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-16 h-16 text-white/60 animate-bounce" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-500 text-xs px-3 py-1 rounded-full font-bold">
                20-20-20 Rule
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 font-sans overflow-hidden relative transition-colors duration-1000">
      
      {/* Floating calming elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-200/30 to-purple-200/30 blur-xl"
        />
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-xl"
        />
      </div>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && <WelcomeOverlay />}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && <Notification />}
      </AnimatePresence>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Gentle Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full mb-6 border border-white/40 shadow-lg"
          >
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">
              📚 Mental Health Academic Resource Center
            </span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            <span className="block">Knowledge for</span>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Understanding & Healing
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Evidence-based information, research references, and academic resources for mental health education
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
            {[
              { value: '100+', label: 'Research Papers', icon: <FileText className="w-5 h-5" />, color: 'text-indigo-600' },
              { value: '3', label: 'Citation Formats', icon: <BookMarked className="w-5 h-5" />, color: 'text-purple-600' },
              { value: '24/7', label: 'Accessible', icon: <Globe className="w-5 h-5" />, color: 'text-blue-600' },
              { value: 'Free', label: 'All Resources', icon: <GraduationCap className="w-5 h-5" />, color: 'text-emerald-600' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg')}/10`}>
                    {stat.icon}
                  </div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Study Break Exercise */}
        <StudyBreakExercise />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveSection('conditions')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeSection === 'conditions'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📚 Academic Topics
          </button>
          <button
            onClick={() => setActiveSection('coping')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeSection === 'coping'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🎓 Student Strategies
          </button>
          <button
            onClick={() => setActiveSection('emergency')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeSection === 'emergency'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🚨 Campus Resources
          </button>
          <button
            onClick={() => setActiveSection('research')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeSection === 'research'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🔬 Research Tools
          </button>
          <button
            onClick={() => setActiveSection('community resource')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeSection === 'community resource'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📚 Community Resources
          </button>
        </div>

        {/* CONDITIONS SECTION */}
        {activeSection === 'conditions' && (
          <div className="space-y-8">
            {/* Condition Selector */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {mentalHealthResources.conditions.map((condition, index) => (
                <motion.button
                  key={condition.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCondition(index)}
                  className={`p-4 rounded-xl text-center transition-all border ${
                    activeCondition === index
                      ? `bg-gradient-to-br from-indigo-500 to-purple-600 border-white text-white shadow-xl`
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="text-3xl mb-2">{condition.icon}</div>
                  <h3 className={`font-bold text-sm mb-1 ${activeCondition === index ? 'text-white' : 'text-gray-800'}`}>{condition.title}</h3>
                  <p className="text-xs opacity-80 hidden md:block">{condition.description}</p>
                </motion.button>
              ))}
            </div>

            {/* Current Condition Details */}
            <motion.div
              key={activeCondition}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${currentCondition.color} border border-white/20 rounded-2xl p-8 shadow-xl`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    <span className="mr-3">{currentCondition.icon}</span>
                    {currentCondition.title}
                  </h2>
                  <p className="text-zinc-300">{currentCondition.description}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/chat/${currentCondition.id}`)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm"
                  >
                    Join Support Room
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      downloadTopicCitation(currentCondition.title, 'apa');
                      setTimeout(() => downloadTopicCitation(currentCondition.title, 'mla'), 300);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm"
                  >
                    Download Citations
                  </motion.button>
                </div>
              </div>

              {/* Academic Content */}
              <div className="bg-black/40 rounded-xl p-6 mb-6">
                <div className="prose prose-invert max-w-none">
                  {currentCondition.content.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                      return <h3 key={index} className="text-2xl font-bold text-white mt-6 mb-4">{paragraph.substring(3)}</h3>;
                    } else if (paragraph.startsWith('**')) {
                      const boldText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return <p key={index} className="text-zinc-300 mb-4" dangerouslySetInnerHTML={{ __html: boldText }} />;
                    }
                    return <p key={index} className="text-zinc-300 mb-4">{paragraph}</p>;
                  })}
                </div>
              </div>

              {/* Academic References WITH CITATION DOWNLOADS */}
              <div className="bg-zinc-900/50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">📖 Academic References & Resources</h3>
                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadTopicCitation(currentCondition.title, 'apa')}
                      className="text-sm bg-blue-900 hover:bg-blue-800 text-white px-3 py-1 rounded"
                    >
                      APA Format
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadTopicCitation(currentCondition.title, 'mla')}
                      className="text-sm bg-purple-900 hover:bg-purple-800 text-white px-3 py-1 rounded"
                    >
                      MLA Format
                    </motion.button>
                  </div>
                </div>
                <div className="space-y-3">
                  {currentCondition.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div>
                        <div className="flex items-center">
                          <span className="text-zinc-400 mr-2">{resource.type}</span>
                          <span className="text-white font-medium">{resource.title}</span>
                        </div>
                      </div>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Visit Resource →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* STUDENT STRATEGIES SECTION */}
        {activeSection === 'coping' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">🎓 Evidence-Based Student Success Strategies</h2>
              <p className="text-gray-600">Research-backed approaches for academic achievement and mental well-being</p>
            </div>

            {/* Coping Strategies */}
            <div className="grid md:grid-cols-3 gap-6">
              {mentalHealthResources.copingStrategies.map((strategy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{strategy.title}</h3>
                  <p className="text-gray-600 mb-4">{strategy.description}</p>
                  
                  <div className="space-y-3">
                    {strategy.techniques.map((technique, techIndex) => {
                      const boldText = technique.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>');
                      return (
                        <div key={techIndex} className="flex items-start">
                          <div className="bg-green-600 rounded-full p-1 mr-3 mt-1">
                            <div className="w-2 h-2"></div>
                          </div>
                          <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: boldText }} />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Study Schedule Template */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">📅 Weekly Study Schedule Template</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-200">
                      <th className="py-3 px-4 text-left text-gray-500">Time</th>
                      <th className="py-3 px-4 text-left text-gray-500">Monday</th>
                      <th className="py-3 px-4 text-left text-gray-500">Tuesday</th>
                      <th className="py-3 px-4 text-left text-gray-500">Wednesday</th>
                      <th className="py-3 px-4 text-left text-gray-500">Thursday</th>
                      <th className="py-3 px-4 text-left text-gray-500">Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { time: '8-10 AM', activity: 'Focused Study' },
                      { time: '10-12 PM', activity: 'Classes/Labs' },
                      { time: '12-1 PM', activity: 'Lunch Break' },
                      { time: '1-3 PM', activity: 'Group Study' },
                      { time: '3-5 PM', activity: 'Physical Activity' },
                      { time: '7-9 PM', activity: 'Review/Prep' }
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-indigo-200/50">
                        <td className="py-3 px-4 font-medium text-gray-800">{row.time}</td>
                        <td className="py-3 px-4 text-gray-600">{row.activity}</td>
                        <td className="py-3 px-4 text-gray-600">{row.activity}</td>
                        <td className="py-3 px-4 text-gray-600">{row.activity}</td>
                        <td className="py-3 px-4 text-gray-600">{row.activity}</td>
                        <td className="py-3 px-4 text-gray-600">{row.activity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-gray-500 text-sm">* Based on cognitive science research on optimal learning intervals</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const schedule = `Weekly Study Schedule Template\n${'Time'.padEnd(15)}Monday\tTuesday\tWednesday\tThursday\tFriday\n` +
                      ['8-10 AM', '10-12 PM', '12-1 PM', '1-3 PM', '3-5 PM', '7-9 PM']
                        .map(time => `${time.padEnd(15)}Focused Study\tClasses/Labs\tLunch Break\tGroup Study\tPhysical Activity\tReview/Prep`)
                        .join('\n');
                    const blob = new Blob([schedule], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'study_schedule_template.txt';
                    a.click();
                  }}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                >
                  Download Template
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* CAMPUS RESOURCES SECTION */}
        {activeSection === 'emergency' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
            >
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">🏫</div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">University Campus Emergency Resources</h2>
                  <p className="text-gray-600">Immediate support for Kenyan university students</p>
                </div>
              </div>
            </motion.div>

            {/* Campus Hotlines */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">📞 Campus & National Emergency Contacts</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const contacts = mentalHealthResources.emergencyInfo.kenyaHotlines
                      .map(h => `${h.name}: ${h.number} (${h.available})`)
                      .join('\n');
                    const blob = new Blob([contacts], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'kenya_emergency_contacts.txt';
                    a.click();
                  }}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Download All Contacts
                </motion.button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentalHealthResources.emergencyInfo.kenyaHotlines.map((hotline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-gray-800">{hotline.name}</h4>
                      {hotline.free && (
                        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">FREE</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-red-400 my-3">{hotline.number}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">{hotline.available}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const contact = `${hotline.name}: ${hotline.number}`;
                          const blob = new Blob([contact], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${hotline.name.replace(/\s+/g, '_')}_contact.txt`;
                          a.click();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Save Contact
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Campus Warning Signs */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">⚠️ Campus-Specific Warning Signs</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const signs = mentalHealthResources.emergencyInfo.warningSigns.join('\n• ');
                    const blob = new Blob([`Warning Signs:\n• ${signs}`], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'warning_signs_checklist.txt';
                    a.click();
                  }}
                  className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                >
                  Download Checklist
                </motion.button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {mentalHealthResources.emergencyInfo.warningSigns.map((sign, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="text-red-400 mr-3">•</div>
                    <span className="text-gray-700">{sign}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-4">Faculty and peers: If you notice these signs, reach out or report to campus counseling</p>
            </div>

            {/* University Counseling Directory */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🏛️ Major Kenyan University Counseling Services</h3>
              <div className="space-y-4">
                {[
                  { university: 'University of Nairobi', contact: 'counseling@uonbi.ac.ke', hours: 'Mon-Fri 8AM-5PM' },
                  { university: 'Kenyatta University', contact: 'counseling@ku.ac.ke', hours: 'Mon-Fri 8AM-4PM' },
                  { university: 'Moi University', contact: 'counsel@mu.ac.ke', hours: 'Mon-Fri 9AM-5PM' },
                  { university: 'Egerton University', contact: 'counseling@egerton.ac.ke', hours: 'Mon-Fri 8AM-4PM' },
                  { university: 'Jomo Kenyatta University', contact: 'counseling@jkuat.ac.ke', hours: 'Mon-Fri 8:30AM-4:30PM' }
                ].map((uni, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-100">
                    <div>
                      <h4 className="font-bold text-gray-800">{uni.university}</h4>
                      <p className="text-gray-600 text-sm">{uni.contact}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 text-sm">{uni.hours}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const info = `${uni.university}\nEmail: ${uni.contact}\nHours: ${uni.hours}`;
                          const blob = new Blob([info], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${uni.university.replace(/\s+/g, '_')}_counseling.txt`;
                          a.click();
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      >
                        Save
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESEARCH TOOLS SECTION */}
        {activeSection === 'research' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🔬 Academic Research Tools & References</h2>
              <p className="text-gray-600">Resources for students and researchers studying mental health</p>
            </div>

            {/* Research Databases */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 Free Academic Databases</h3>
                <div className="space-y-3">
                  {[
                    { name: 'PubMed Central', desc: 'Free full-text biomedical literature', url: 'https://pmc.ncbi.nlm.nih.gov/' },
                    { name: 'Google Scholar', desc: 'Broad academic search engine', url: 'https://scholar.google.com/' },
                    { name: 'Directory of Open Access Journals', desc: 'Peer-reviewed open access journals', url: 'https://doaj.org/' },
                    { name: 'African Journals Online', desc: 'African-published research', url: 'https://www.ajol.info/' },
                    { name: 'Kenya National Library', desc: 'Local research repository', url: 'http://www.knls.ac.ke/' }
                  ].map((db, index) => (
                    <a
                      key={index}
                      href={db.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{db.name}</p>
                        <p className="text-gray-600 text-sm">{db.desc}</p>
                      </div>
                      <span className="text-blue-400">→</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">📝 Research Methodology Tools</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Mental Health Measurement Tools', desc: 'Validated scales and questionnaires' },
                    { name: 'Statistical Analysis Software', desc: 'SPSS, R, Python tutorials' },
                    { name: 'Research Ethics Guidelines', desc: 'IRB procedures and consent forms' },
                    { name: 'Literature Review Templates', desc: 'Systematic review protocols' },
                    { name: 'Data Collection Templates', desc: 'Interview guides and surveys' }
                  ].map((tool, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-800">{tool.name}</p>
                      <p className="text-gray-600 text-sm">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Research Opportunities */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 Mental Health Research Gaps in Kenya</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Cultural adaptation of Western therapeutic models',
                  'Effectiveness of peer support in university settings',
                  'Digital mental health interventions for rural areas',
                  'Economic impact of student mental health services',
                  'Integration of traditional healing practices',
                  'Long-term outcomes of campus counseling programs',
                  'Mental health literacy among Kenyan youth',
                  'Barriers to help-seeking in male students'
                ].map((gap, index) => (
                  <div key={index} className="flex items-start p-3 bg-white/60 rounded-lg border border-purple-100">
                    <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{gap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CITATION TOOLS SECTION */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📚 Academic Citations & References</h3>
              <p className="text-gray-600 mb-6">Download formatted citations for academic papers and research</p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { 
                    name: 'APA 7th Edition', 
                    desc: 'American Psychological Association',
                    format: 'apa' as const,
                    color: 'bg-blue-600',
                    count: '6 key references'
                  },
                  { 
                    name: 'MLA 9th Edition', 
                    desc: 'Modern Language Association',
                    format: 'mla' as const,
                    color: 'bg-purple-600',
                    count: '6 formatted citations'
                  },
                  { 
                    name: 'Chicago Style', 
                    desc: 'Chicago Manual of Style',
                    format: 'chicago' as const,
                    color: 'bg-green-600',
                    count: '6 academic sources'
                  }
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadCitation(item.format)}
                    className="text-center p-5 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-2xl">📖</span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1 text-lg">{item.name}</h4>
                    <p className="text-gray-600 text-sm mb-2">{item.desc}</p>
                    <p className="text-gray-500 text-xs mb-4">{item.count}</p>
                    <div className={`w-full py-2 ${item.color} text-white rounded-lg font-medium transition-colors`}>
                      Download {item.name}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Custom Citation Generator */}
              <div className="bg-white rounded-lg p-5 border border-gray-200">
                <h4 className="text-xl font-bold text-gray-800 mb-3">🛠️ Custom Citation Generator</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Author(s)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Patel, V., Saxena, S., et al."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Publication Year</label>
                    <input 
                      type="text" 
                      placeholder="e.g., 2023"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Mental Health Interventions in Kenya"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const author = (document.querySelector('input[placeholder*="Author"]') as HTMLInputElement)?.value || 'Author, A. A.';
                        const year = (document.querySelector('input[placeholder*="Year"]') as HTMLInputElement)?.value || '2023';
                        const title = (document.querySelector('input[placeholder*="Title"]') as HTMLInputElement)?.value || 'Title of Work';
                        
                        const apa = `${author} (${year}). ${title}. Publisher.`;
                        const blob = new Blob([apa], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'custom_apa_citation.txt';
                        a.click();
                        showNotification('APA citation downloaded!', 'success');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Generate APA
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const author = (document.querySelector('input[placeholder*="Author"]') as HTMLInputElement)?.value || 'Author';
                        const year = (document.querySelector('input[placeholder*="Year"]') as HTMLInputElement)?.value || '2023';
                        const title = (document.querySelector('input[placeholder*="Title"]') as HTMLInputElement)?.value || 'Title of Work';
                        
                        const mla = `${author}. "${title}." Publisher, ${year}.`;
                        const blob = new Blob([mla], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'custom_mla_citation.txt';
                        a.click();
                        showNotification('MLA citation downloaded!', 'success');
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                    >
                      Generate MLA
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMMUNITY RESOURCES SECTION - NOW WITH REAL-TIME UPDATES */}
        {activeSection === 'community resource' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">📚 Community-Shared Academic Resources</h2>
              <p className="text-gray-600">
                {loadingResources 
                  ? 'Loading community resources...' 
                  : `Research papers and educational materials contributed by our community`}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ⚡ Resources update in real-time when approved by admin
              </p>
            </div>

            {loadingResources ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-pulse">📚</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Loading community resources...</h3>
                <p className="text-gray-600">Fetching from database</p>
              </div>
            ) : communityResources.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No community resources yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share an academic resource!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/academic-resources/upload')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium"
                >
                  📤 Upload First Resource
                </motion.button>
              </div>
            ) : (
              <>
                {/* Featured Resources Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityResources.slice(0, 6).map((resource, index) => {
                    const currentVote = userVotes[resource.id];
                    const upvotes = resource.upvotes || 0;
                    const downvotes = resource.downvotes || 0;
                    const netScore = upvotes - downvotes;
                    
                    return (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`${
                            resource.file_type === 'pdf' ? 'bg-red-900/30' : 
                            resource.file_type === 'doc' || resource.file_type === 'docx' ? 'bg-blue-900/30' : 
                            'bg-yellow-900/30'} p-3 rounded-lg`}>
                            <span className="text-2xl">
                              {resource.file_type === 'pdf' ? '📄' : 
                               resource.file_type === 'doc' || resource.file_type === 'docx' ? '📝' : '📎'}
                            </span>
                          </div>
                          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">APPROVED</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                          {resource.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {resource.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(resource.tags || []).slice(0, 3).map((tag: string, tagIndex: number) => (
                            <span 
                              key={tagIndex}
                              className="text-xs bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {(resource.tags || []).length > 3 && (
                            <span className="text-xs bg-gray-900/50 text-gray-300 px-3 py-1 rounded-full">
                              +{(resource.tags || []).length - 3} more
                            </span>
                          )}
                        </div>
                        
                        {/* Voting Buttons */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpvote(resource.id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                currentVote === 'up'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <ThumbsUp className={`w-4 h-4 ${currentVote === 'up' ? 'text-green-600' : 'text-gray-500'}`} />
                              <span className="font-medium">{upvotes}</span>
                            </button>
                            
                            <div className="text-center">
                              <div className="font-bold text-lg">{netScore}</div>
                              <div className="text-xs text-gray-500">score</div>
                            </div>
                            
                            <button
                              onClick={() => handleDownvote(resource.id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                                currentVote === 'down'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <ThumbsDown className={`w-4 h-4 ${currentVote === 'down' ? 'text-red-600' : 'text-gray-500'}`} />
                              <span className="font-medium">{downvotes}</span>
                            </button>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <ArrowDown className="w-4 h-4" />
                              <span>{resource.downloads || 0} downloads</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span className="truncate max-w-[100px]">{resource.author}</span>
                          </div>
                          <span className="text-gray-400 text-xs">
                            {new Date(resource.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleDownload(resource.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium"
                          >
                            {resource.file_url ? 'Download' : 'View'}
                          </button>
                          <button
                            onClick={() => router.push(`/academic-resources/${resource.id}`)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium"
                          >
                            Details
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* View All Button */}
                {communityResources.length > 6 && (
                  <div className="text-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/academic-resources')}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-xl font-medium"
                    >
                      View All {communityResources.length} Resources
                    </motion.button>
                  </div>
                )}
              </>
            )}

            {/* Upload Resource Button */}
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/academic-resources/upload')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-3 mx-auto shadow-lg"
              >
                <FileUp className="w-5 h-5" />
                Share Your Academic Resource
              </motion.button>
              <p className="text-zinc-500 text-sm mt-3">Contribute to our community knowledge base</p>
            </div>
          </div>
        )}

        {/* Academic Navigation */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/chat-rooms')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg shadow-lg flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Peer Support Rooms
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/progress')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Research Data Tools
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                downloadCitation('apa');
                setTimeout(() => downloadCitation('mla'), 300);
                setTimeout(() => downloadCitation('chicago'), 600);
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download All Citations
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.print()}
              className="px-6 py-3 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-800 hover:to-zinc-900 text-white rounded-lg shadow-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Academic Content
            </motion.button>
          </div>
        </div>

        {/* Academic Disclaimer */}
        <div className="mt-10 p-4 bg-gray-100 rounded-xl border border-gray-200">
          <h4 className="text-lg font-bold text-gray-800 mb-2">📋 Academic Use Disclaimer</h4>
          <p className="text-gray-600 text-sm">
            This resource center provides evidence-based information for educational purposes. Content is compiled from 
            peer-reviewed journals, academic textbooks, and official health organization publications. Always consult 
            primary sources and conduct original research for academic work. For clinical decisions, consult qualified 
            healthcare professionals.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Peer-Reviewed Sources</span>
            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Academic Citations Provided</span>
            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Kenya-Specific Research</span>
            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Student-Focused Content</span>
            <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Downloadable Citations</span>
          </div>
        </div>
      </main>

      {/* Gentle Footer */}
      <footer className="relative z-10 mt-20 pt-8 pb-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-left">
              <h4 className="font-bold text-gray-800 mb-2">Kirinyaga Safespace Education Center</h4>
              <p className="text-gray-600 text-sm">Evidence-based mental health education</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-gray-500 text-sm">🇰🇪 Crisis: 0800 221 444</div>
              <div className="text-gray-500 text-sm">🇺🇸 Crisis: 988</div>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm mb-4">
            Built with care for mental health education • © {new Date().getFullYear()}
          </p>
          <p className="text-gray-400 text-xs">
            This educational content is not a substitute for professional medical advice. 
            Always consult qualified healthcare professionals for clinical decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
