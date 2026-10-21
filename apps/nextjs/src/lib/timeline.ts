export interface Person {
  name: string;
  // GitHub username, when it differs from the name shown.
  login?: string;
  avatar: string;
  href?: string;
  // Shown beside the name, such as "founder" or "mentor".
  role?: string;
}

export interface Milestone {
  // A month name, or a phrase when the exact month is unknown.
  when?: string;
  title: string;
  description: string;
  people?: Person[];
  tags?: string[];
  link?: Link;
}

export interface Link {
  label: string;
  href: string;
}

export interface TimelineYear {
  year: number;
  milestones: Milestone[];
}

export interface MilestoneSource extends Milestone {
  repo?: string;
}

export interface TimelineSource {
  year: number;
  milestones: MilestoneSource[];
}

export const avatar = (login: string) =>
  `https://avatars.githubusercontent.com/${login}?s=80`;

export const github = (login: string, role?: string): Person => ({
  name: login,
  avatar: avatar(login),
  href: `https://github.com/${login}`,
  role,
});

// The /team page timeline, oldest first.
export const timeline: TimelineSource[] = [
  {
    year: 2021,
    milestones: [
      {
        when: 'Humble beginnings',
        title: 'Manipal OSF is founded',
        description:
          'Karthik Prabhu (karth123) founded the organisation with dhzdhd as co-founder, alongside other volunteers, to establish a collective of student material and promote open-source culture in Manipal.',
        people: [
          {
            name: 'Karthik Prabhu',
            login: 'karth123',
            avatar: avatar('karth123'),
            href: '/authors/karthik-prabhu',
            role: 'founder',
          },
          github('dhzdhd', 'co-founder'),
        ],
        tags: ['founding'],
      },
      {
        title: 'OSF bot',
        repo: 'bot',
        description:
          'One of the organisation’s first projects: a community Discord bot built for and used in the OSF server.',
        tags: ['projects'],
      },
    ],
  },
  {
    year: 2022,
    milestones: [
      {
        title: 'The website',
        repo: 'website',
        description:
          'The official website for Manipal OSF, built and maintained by student contributors and still growing today.',
        tags: ['projects'],
      },
    ],
  },
  {
    year: 2025,
    milestones: [
      {
        when: 'April',
        title: 'The New Wind',
        description:
          'PranavU was invited by dhzdhd and nominated for being the current owner of OSF.',
        people: [github('PranavU-Coder')],
        tags: ['community'],
      },
      {
        title: 'attendance_tracker',
        repo: 'attendance_tracker',
        description:
          'A website for tracking attendance daily without waiting for SLCM updates. The project was later abandoned and archived.',
        tags: ['projects', 'abandoned'],
      },
      {
        title: 'BooleanOutputParser',
        repo: 'persistBool',
        description:
          'An attempt at improving the BooleanOutputParser feature of the LangChain module, abandoned and archived the same month.',
        tags: ['projects', 'abandoned'],
        people: [github('karth123', 'mentor')],
      },
    ],
  },
  {
    year: 2026,
    milestones: [
      {
        title: 'PyPlatez',
        repo: 'PyPlatez',
        description:
          'A “minimalist” Python starter project template for kicking off new projects with sensible defaults.',
        tags: ['projects'],
      },
      {
        when: 'Now',
        title: 'Reinvigorating Manipal OSF',
        description:
          'The organisation’s current owner is working to reinvigorate Manipal OSF through the Neuarbeite scheme, a renovation of the organisation that can be found in the GitHub org’s discussions.',
        tags: ['updates'],
        link: {
          label: 'Neuarbeite scheme discussion',
          href: 'https://github.com/orgs/Manipal-OSF/discussions/5',
        },
      },
    ],
  },
];
