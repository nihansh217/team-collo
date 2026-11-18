console.log('MAIN JS STARTED');
import './styles.css';
import {
  ApiError,
  clearToken,
  getMe,
  getToken,
  login as apiLogin,
  register as apiRegister,
  setToken,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  getUsers,
  createTask,
  updateTask,
  deleteTask,
} from './api.js';
const icon = (name, size = 18, className = '') => `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const ROLE_LABELS = {
  student: 'Student',
  project_leader: 'Project Leader',
  mentor: 'Faculty / Mentor',
  faculty: 'Faculty / Mentor',
  admin: 'Admin',
};

function displayRole(role) {
  if (!role) return 'Student';
  return ROLE_LABELS[String(role).toLowerCase()] || role;
}

function firstNameFrom(fullName) {
  const part = String(fullName || '').trim().split(/\s+/)[0];
  return part || 'there';
}

function currentPerson() {
  const user = state.currentUser;
  if (!user) {
    return { name: '', initials: 'ST', color: 'violet', role: 'Student', department: '', skills: [], availability: 'High' };
  }
  return {
    name: user.full_name || '',
    initials: user.initials || initials(user.full_name || ''),
    color: user.avatar_color || 'violet',
    role: displayRole(user.role),
    department: user.department || '',
    bio: user.bio || '',
    skills: Array.isArray(user.skills) ? user.skills : [],
    availability: user.availability || 'high',
  };
}

function applyAuthenticatedUser(user) {
  state.currentUser = user;
  state.role = displayRole(user.role);
  state.session = 'ready';
  state.authError = '';
  state.authBusy = false;
}

const members = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', color: 'violet', role: 'Project Leader', department: 'Computer Science', skills: ['React', 'Product thinking', 'Research'], availability: 'High', fit: 96, status: 'online', note: 'Owns the product direction and weekly rituals.' },
  { id: 'liam', name: 'Liam Okafor', initials: 'LO', color: 'blue', role: 'Frontend engineer', department: 'Software Engineering', skills: ['React', 'TypeScript', 'Accessibility'], availability: 'Medium', fit: 91, status: 'online', note: 'Strong builder with a sharp eye for interaction detail.' },
  { id: 'sophia', name: 'Sophia Martinez', initials: 'SM', color: 'orange', role: 'UX researcher', department: 'Human Computer Interaction', skills: ['User research', 'Figma', 'Synthesis'], availability: 'High', fit: 88, status: 'online', note: 'Translates messy feedback into clear product signals.' },
  { id: 'noah', name: 'Noah Williams', initials: 'NW', color: 'green', role: 'Data scientist', department: 'Data & AI', skills: ['Python', 'ML', 'Analytics'], availability: 'Medium', fit: 84, status: 'away', note: 'Building the recommendation model and health scoring.' },
  { id: 'aisha', name: 'Aisha Rahman', initials: 'AR', color: 'pink', role: 'Backend engineer', department: 'Software Engineering', skills: ['Python', 'FastAPI', 'Postgres'], availability: 'High', fit: 82, status: 'online', note: 'The calm, reliable force behind service integration.' },
  { id: 'ethan', name: 'Ethan Brooks', initials: 'EB', color: 'slate', role: 'Content strategist', department: 'Communications', skills: ['Content design', 'Storytelling', 'Research'], availability: 'Low', fit: 71, status: 'offline', note: 'Available for the launch story once the product is stable.' },
];

const projects = [
  {
    id: 'edusync', name: 'EduSync Campus', eyebrow: 'CAPSTONE / PRODUCT STUDIO', color: '#6d5dfb', status: 'On track', progress: 68, due: 'Nov 18, 2026', members: 8, health: 92,
    summary: 'A peer learning platform that helps students find the right study team before the first session.',
    milestone: 'Usability study', milestoneDate: 'Oct 28', next: 'Close 4 interview notes', skills: ['Product', 'Research', 'React', 'Data'],
    tasks: [
      { id: 1, title: 'Synthesize interview notes', owner: 'Sophia Martinez', initials: 'SM', color: 'orange', priority: 'High', due: 'Today', status: 'In progress', category: 'Research' },
      { id: 2, title: 'Ship team match score v2', owner: 'Noah Williams', initials: 'NW', color: 'green', priority: 'High', due: 'Tomorrow', status: 'In review', category: 'AI layer' },
      { id: 3, title: 'Polish onboarding flow', owner: 'Liam Okafor', initials: 'LO', color: 'blue', priority: 'Medium', due: 'Oct 25', status: 'In progress', category: 'Design' },
      { id: 4, title: 'Draft launch narrative', owner: 'Ethan Brooks', initials: 'EB', color: 'slate', priority: 'Low', due: 'Oct 29', status: 'Not started', category: 'Content' },
      { id: 5, title: 'Review API permission model', owner: 'Aisha Rahman', initials: 'AR', color: 'pink', priority: 'Medium', due: 'Oct 30', status: 'Done', category: 'Platform' },
    ],
    milestones: [{ name: 'Discovery sprint', date: 'Oct 12', progress: 100, status: 'Complete' }, { name: 'Usability study', date: 'Oct 28', progress: 74, status: 'In flight' }, { name: 'Beta cohort', date: 'Nov 08', progress: 32, status: 'Preparing' }, { name: 'Campus launch', date: 'Nov 18', progress: 0, status: 'Upcoming' }]
  },
  {
    id: 'greenhouse', name: 'Greenhouse Sensors', eyebrow: 'RESEARCH LAB / IOT', color: '#20a77a', status: 'Needs attention', progress: 44, due: 'Dec 04, 2026', members: 5, health: 71,
    summary: 'A low-cost sensor network that helps campus greenhouses reduce water waste.',
    milestone: 'Sensor pilot', milestoneDate: 'Nov 04', next: 'Resolve battery variance', skills: ['IoT', 'Python', 'Hardware', 'Research'],
    tasks: [{ id: 6, title: 'Calibrate sensor batch B', owner: 'Noah Williams', initials: 'NW', color: 'green', priority: 'High', due: 'Today', status: 'Blocked', category: 'Hardware' }, { id: 7, title: 'Map greenhouse zones', owner: 'Maya Chen', initials: 'MC', color: 'violet', priority: 'Medium', due: 'Oct 30', status: 'In progress', category: 'Research' }, { id: 8, title: 'Prepare field study brief', owner: 'Sophia Martinez', initials: 'SM', color: 'orange', priority: 'Medium', due: 'Nov 02', status: 'Not started', category: 'Research' }],
    milestones: [{ name: 'Bench test', date: 'Oct 20', progress: 100, status: 'Complete' }, { name: 'Sensor pilot', date: 'Nov 04', progress: 44, status: 'At risk' }, { name: 'Impact report', date: 'Nov 24', progress: 0, status: 'Upcoming' }]
  },
  {
    id: 'accesslab', name: 'AccessLab', eyebrow: 'COMMUNITY / SERVICE DESIGN', color: '#eb8a48', status: 'On track', progress: 81, due: 'Nov 02, 2026', members: 6, health: 88,
    summary: 'A student-led accessibility audit toolkit for campus clubs and events.',
    milestone: 'Pilot toolkit', milestoneDate: 'Oct 24', next: 'Share audit checklist', skills: ['Accessibility', 'Service design', 'Content'],
    tasks: [{ id: 9, title: 'Review WCAG checklist', owner: 'Liam Okafor', initials: 'LO', color: 'blue', priority: 'High', due: 'Today', status: 'Done', category: 'Audit' }, { id: 10, title: 'Interview club leads', owner: 'Sophia Martinez', initials: 'SM', color: 'orange', priority: 'Medium', due: 'Oct 23', status: 'In progress', category: 'Research' }, { id: 11, title: 'Package toolkit v1', owner: 'Ethan Brooks', initials: 'EB', color: 'slate', priority: 'Medium', due: 'Oct 26', status: 'In progress', category: 'Content' }],
    milestones: [{ name: 'Audit framework', date: 'Oct 14', progress: 100, status: 'Complete' }, { name: 'Pilot toolkit', date: 'Oct 24', progress: 86, status: 'In flight' }, { name: 'Open release', date: 'Nov 02', progress: 20, status: 'Preparing' }]
  }
];
function mapApiProject(apiProject) {
  const statusMap = {
    on_track: 'On track',
    at_risk: 'At risk',
    delayed: 'Delayed',
    completed: 'Completed',
  };

  return {
    id: apiProject.id,
    name: apiProject.name,
    eyebrow: apiProject.eyebrow || 'STUDENT PROJECT',
    summary: apiProject.summary || 'No project description added yet.',
    color: apiProject.color || '#6d5dfb',
    status: statusMap[apiProject.status] || apiProject.status || 'On track',
    progress: apiProject.progress ?? 0,
    health: apiProject.health_score ?? 0,
    due: apiProject.due_date || 'Not set',
    members: 1,
    milestone: apiProject.milestone_name || 'No milestone added',
    milestoneDate: apiProject.milestone_date || 'Not set',
    next: 'No upcoming tasks',
    skills: [],
    tasks: [],
    milestones: [],
  };
}


async function loadProjects() {
  try {
    const apiProjects = await getProjects();

    if (Array.isArray(apiProjects)) {
      // Replace demo projects with database projects
      projects.splice(
        0,
        projects.length,
        ...apiProjects.map(mapApiProject)
      );

      // Update the selected project
      if (projects.length > 0) {
        if (!projects.some(p => p.id === state.projectId)) {
          state.projectId = projects[0].id;
        }
      } else {
        state.projectId = null;
      }

      persist();
      const selectedProject = projects.find(
        p => p.id === state.projectId
      );
      
      if (selectedProject) {
        await loadTasks(selectedProject);
      }
      
      await loadUsers();

      console.log('Projects loaded from PostgreSQL:', apiProjects);
    }
  } catch (error) {
    console.error('Could not load database projects:', error);
  }
}

async function loadTasks(project) {
  if (!project) return;

  try {
    const apiTasks = await getTasks(project.id);

    if (!Array.isArray(apiTasks)) return;

    const statusMap = {
      todo: 'Not started',
      in_progress: 'In progress',
      in_review: 'In review',
      blocked: 'Blocked',
      done: 'Done',
    };

    project.tasks = apiTasks.map(task => ({
      id: task.id,
      title: task.title,
      owner: 'Unassigned',
      initials: '?',
      color: 'violet',
      priority: task.priority
        ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
        : 'Medium',
      due: task.due_date
        ? new Date(task.due_date).toLocaleDateString()
        : 'No due date',
      status: statusMap[task.status] || task.status,
      category: task.category || 'General',
    }));

    persist();

    console.log('Tasks loaded from PostgreSQL:', apiTasks);
  } catch (error) {
    console.error('Could not load database tasks:', error);
    setToast('Could not load tasks');
  }
}

async function loadUsers() {
  try {
    const apiUsers = await getUsers();

    if (!Array.isArray(apiUsers)) return;

    members.splice(
      0,
      members.length,
      ...apiUsers.map(user => ({
        id: user.id,
        name: user.full_name,
        initials: user.initials || '?',
        email: user.email,
        color: user.avatar_color || 'violet',
        skills: user.skills || [],
      }))
    );

    console.log('Users loaded from PostgreSQL:', apiUsers);
  } catch (error) {
    console.error('Could not load database users:', error);
  }
}

const notifications = [
  { id: 1, kind: 'AI insight', title: 'Team-fit signal improved', body: 'Noah is now a strong match for the data milestone.', time: '8 min ago', color: 'violet', unread: true },
  { id: 2, kind: 'Task update', title: 'Sophia completed 3 interview notes', body: 'The usability study is now 74% complete.', time: '34 min ago', color: 'green', unread: true },
  { id: 3, kind: 'Mention', title: 'Liam mentioned you in #product', body: '“Can we review the onboarding empty state?”', time: '1 hr ago', color: 'blue', unread: false },
  { id: 4, kind: 'Deadline', title: '2 tasks due this week', body: 'Keep the EduSync beta cohort on track.', time: '3 hr ago', color: 'orange', unread: false },
];

const STORAGE_KEY = 'teamforge-prototype-v1';
const savedState = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } })();
if (Array.isArray(savedState.projects)) savedState.projects.forEach((savedProject) => { const project = projects.find((item) => item.id === savedProject.id); if (project && Array.isArray(savedProject.tasks)) project.tasks = savedProject.tasks; });
const state = { view: 'command', projectId: 'edusync', role: 'Student', taskFilter: 'All', taskSearch: '', projectSearch: '', memberFilter: 'All', modal: null, toast: null, aiNote: 'Your team is moving faster than the baseline. Close the research loop today and the beta cohort is likely to land 2 days early.', chatChannel: 'product', mobileNavOpen: false, chatMessages: [], ...savedState, modal: null, toast: null, mobileNavOpen: false, session: 'loading', authMode: 'login', authError: '', authBusy: false, currentUser: null, authEmail: '', authName: '', authDepartment: '' };
const persist = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ view: state.view, projectId: state.projectId, role: state.role, taskFilter: state.taskFilter, taskSearch: state.taskSearch, projectSearch: state.projectSearch, memberFilter: state.memberFilter, aiNote: state.aiNote, chatChannel: state.chatChannel, chatMessages: state.chatMessages, projects: projects.map((project) => ({ id: project.id, tasks: project.tasks })) })); } catch { /* local persistence is best-effort in private browsing */ } };

const getProject = () => projects.find((project) => project.id === state.projectId) || projects[0];
const initials = (name) => name.split(' ').map((part) => part[0]).slice(0, 2).join('');
const avatar = (person, size = 'small') => `<span class="avatar ${size} ${person.color || 'violet'}">${person.initials || initials(person.name)}</span>`;
const statusClass = (value) => value.toLowerCase().replace(/\s+/g, '-');

function render() {
  console.log('RENDER FUNCTION CALLED', state.session);
  const root = document.querySelector('#app');
  if (state.session !== 'ready') {
    root.innerHTML = `${authMarkup()}${state.toast ? `<div class="toast"><span class="toast-icon">${icon('check', 15)}</span>${state.toast}</div>` : ''}`;
    return;
  }
  root.innerHTML = `<div class="app-shell"><aside class="sidebar ${state.mobileNavOpen ? 'mobile-open' : ''}">${sidebarMarkup()}</aside>${state.mobileNavOpen ? '<div class="mobile-scrim" data-action="toggle-mobile-nav"></div>' : ''}<main class="main-shell"><header class="topbar">${topbarMarkup()}</header><div class="workspace">${workspaceMarkup()}</div></main>${state.modal ? modalMarkup() : ''}${state.toast ? `<div class="toast"><span class="toast-icon">${icon('check', 15)}</span>${state.toast}</div>` : ''}</div>`;
}

function authMarkup() {
  const loading = state.session === 'loading';
  const register = state.authMode === 'register';
  const error = state.authError ? `<div class="auth-error" role="alert">${icon('alert', 15)}<span>${escapeHtml(state.authError)}</span></div>` : '';
  if (loading) {
    return `<div class="auth-screen"><div class="auth-panel"><div class="brand"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>team<span>forge</span></span></div><span class="eyebrow">SESSION</span><h1>Restoring your workspace</h1><p>Checking your signed-in session with Team COLLO.</p><div class="auth-loading">Connecting…</div></div></div>`;
  }
  return `<div class="auth-screen"><div class="auth-panel"><div class="brand"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>team<span>forge</span></span></div>
    <span class="eyebrow">${register ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</span>
    <h1>${register ? 'Join the workspace.' : 'Sign in to Team COLLO.'}</h1>
    <p>${register ? 'Create a student account to keep your profile, availability, and team-fit signals in one place.' : 'Use your campus email to return to the command center, projects, and team workspace.'}</p>
    <div class="auth-tabs">
      <button type="button" class="${register ? '' : 'active'}" data-action="set-auth-mode" data-mode="login">Sign in</button>
      <button type="button" class="${register ? 'active' : ''}" data-action="set-auth-mode" data-mode="register">Create account</button>
    </div>
    ${error}
    <form id="auth-form" class="auth-form">
      ${register ? `<label>Full name<input name="name" autocomplete="name" placeholder="Maya Chen" required maxlength="100" value="${escapeHtml(state.authName)}" /></label>` : ''}
      <label>Email<input name="email" type="email" autocomplete="email" placeholder="you@university.edu" required maxlength="255" value="${escapeHtml(state.authEmail)}" /></label>
      <label>Password<input name="password" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" placeholder="${register ? 'At least 8 characters' : 'Your password'}" required minlength="${register ? '8' : '1'}" maxlength="128" /></label>
      ${register ? `<label>Department <span>(optional)</span><input name="department" autocomplete="organization-title" placeholder="Computer Science" maxlength="100" value="${escapeHtml(state.authDepartment)}" /></label>` : ''}
      <button type="submit" class="primary-button auth-submit" ${state.authBusy ? 'disabled' : ''}>${state.authBusy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    </form>
    <p class="auth-footnote">${register ? 'Already have an account?' : 'New here?'} <button type="button" class="text-button" data-action="set-auth-mode" data-mode="${register ? 'login' : 'register'}">${register ? 'Sign in' : 'Create an account'}</button></p>
  </div></div>`;
}

function sidebarMarkup() {
  const nav = [
    ['command', 'grid', 'Command center'], ['projects', 'folder', 'Projects'], ['team', 'users', 'Team workspace'], ['tasks', 'check', 'Tasks & milestones'], ['chat', 'chat', 'Chat & discussions'], ['analytics', 'chart', 'Analytics'],
  ];
  return `<div class="brand"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span>team<span>forge</span></span></div>
    <div class="workspace-label">WORKSPACE <button class="icon-button tiny" data-action="open-modal" data-modal="create-project" title="Create project">${icon('plus', 14)}</button></div>
    <button class="project-switcher" data-action="open-modal" data-modal="project"><span class="project-dot" style="background:${getProject().color}"></span><span class="project-switcher-text"><strong>${getProject().name}</strong><small>Project space</small></span>${icon('chevron', 15)}</button>
    <nav class="nav-list">${nav.map(([view, ico, label]) => `<button class="nav-item ${state.view === view ? 'active' : ''}" data-view="${view}">${icon(ico, 18)}<span>${label}</span>${view === 'tasks' ? '<b class="nav-count">5</b>' : ''}</button>`).join('')}</nav>
    <div class="sidebar-spacer"></div>
    <div class="ai-sidebar-card"><div class="ai-orb">${icon('spark', 18)}</div><strong>AI co-pilot</strong><p>Ask for a team, plan a milestone, or spot a risk.</p><button data-action="ai" class="text-button">Open co-pilot ${icon('arrow', 14)}</button></div>
    <nav class="nav-list lower-nav"><button class="nav-item ${state.view === 'profile' ? 'active' : ''}" data-view="profile">${icon('user', 18)}<span>My profile</span></button><button class="nav-item" data-action="open-modal" data-modal="help">${icon('alert', 18)}<span>Help center</span></button></nav>
    <div class="sidebar-user">${avatar(currentPerson(), 'medium')}<span><strong>${escapeHtml(currentPerson().name)}</strong><small>${escapeHtml(currentPerson().role)}</small></span><button class="icon-button tiny" data-action="logout" title="Sign out" aria-label="Sign out">${icon('lock', 16)}</button></div>`;
}

function topbarMarkup() {
  const unread = notifications.filter((item) => item.unread).length;
  return `<button class="mobile-menu icon-button" data-action="toggle-mobile-nav" aria-label="Open navigation">${icon('menu', 19)}</button><div class="crumbs"><span>Workspace</span>${icon('chevron', 14)}<strong>${state.view === 'command' ? 'Command center' : viewLabel(state.view)}</strong></div><div class="topbar-actions"><label class="search-field">${icon('search', 17)}<input id="global-search" value="${state.taskSearch}" placeholder="Search anything" /></label><button class="icon-button notification-button" data-action="toggle-notifications" aria-label="Notifications">${icon('bell', 19)}${unread ? `<b>${unread}</b>` : ''}</button><div class="role-select"><span class="role-dot"></span><select id="role-select"><option ${state.role === 'Project Leader' ? 'selected' : ''}>Project Leader</option><option ${state.role === 'Student' ? 'selected' : ''}>Student</option><option ${state.role === 'Faculty / Mentor' ? 'selected' : ''}>Faculty / Mentor</option><option ${state.role === 'Admin' ? 'selected' : ''}>Admin</option></select>${icon('chevron', 13)}</div></div>${state.notificationsOpen ? notificationsMarkup() : ''}`;
}

function notificationsMarkup() {
  return `<div class="notification-popover"><div class="popover-heading"><div><span class="eyebrow">INBOX</span><h3>Notifications</h3></div><button class="icon-button tiny" data-action="toggle-notifications">${icon('close', 15)}</button></div>${notifications.map((note) => `<button class="notification-item ${note.unread ? 'unread' : ''}" data-action="read-notification" data-id="${note.id}"><span class="notification-icon ${note.color}">${icon(note.kind === 'AI insight' ? 'spark' : note.kind === 'Task update' ? 'check' : note.kind === 'Mention' ? 'chat' : 'clock', 15)}</span><span><strong>${note.title}</strong><small>${note.body}</small><em>${note.time}</em></span></button>`).join('')}<button class="popover-footer" data-action="mark-all-read">Mark all as read ${icon('arrow', 14)}</button></div>`;
}

function workspaceMarkup() {
  return `<section class="page-head"><div><span class="eyebrow">${state.role.toUpperCase()} · OCTOBER 21, 2026</span><h1>${state.view === 'command' ? greeting() : viewLabel(state.view)}</h1><p>${pageSubtitle()}</p></div><div class="page-actions"><button class="secondary-button" data-action="open-modal" data-modal="invite">${icon('users', 16)} Invite</button><button class="primary-button" data-action="open-modal" data-modal="task">${icon('plus', 16)} Add task</button></div></section>${state.view === 'command' ? dashboardMarkup() : viewMarkup()}`;
}

function greeting() {
  const name = escapeHtml(firstNameFrom(currentPerson().name));
  if (state.role === 'Student') return `Make your next move count, ${name}.`;
  if (state.role === 'Faculty / Mentor') return `Good morning, ${name}. Here is your cohort pulse.`;
  if (state.role === 'Admin') return 'Platform pulse, at a glance.';
  return `Good morning, ${name}.`;
}

function pageSubtitle() {
  const copy = { command: 'A clear read on your people, projects, and the work that matters next.', projects: 'Keep every project moving with one shared source of truth.', team: 'Build a balanced team around the skills this project needs.', tasks: 'Turn priorities into visible progress, without losing the why.', chat: 'The conversation layer for decisions, context, and momentum.', analytics: 'Signals for project health, workload, and team performance.', profile: 'Keep your strengths, interests, and availability visible to the right teams.' };
  return copy[state.view] || copy.command;
}

function dashboardMarkup() {
  const project = getProject();
  console.log('TASK PROJECT ID:', project?.id);
  const done = project.tasks.filter((task) => task.status === 'Done').length;
  return `<div class="hero-grid"><div class="hero-card" style="--accent:${project.color}"><div class="hero-top"><span class="status-pill on-track"><span></span>${project.status}</span><button class="ghost-icon" data-action="open-project">${icon('more', 18)}</button></div><div class="hero-body"><div><span class="eyebrow">CURRENT PROJECT · ${project.eyebrow}</span><h2>${project.name}</h2><p>${project.summary}</p><button class="link-button" data-action="open-project">Open project ${icon('arrow', 15)}</button></div><div class="progress-ring" style="--progress:${project.progress * 3.6}deg"><strong>${project.progress}%</strong><span>complete</span></div></div><div class="hero-bottom"><span>${icon('calendar', 15)} Due ${project.due}</span><span>${icon('users', 15)} ${project.members} active members</span><span>${icon('flag', 15)} Next: ${project.next}</span></div></div><div class="ai-briefing"><div class="ai-briefing-head"><span class="ai-orb small">${icon('spark', 15)}</span><span><span class="eyebrow">AI BRIEFING</span><strong>Turn the signal into the next move.</strong></span><span class="live-dot">LIVE</span></div><p>${state.aiNote}</p><div class="insight-row"><span class="insight-chip positive">${icon('chart', 14)} +18% velocity</span><span class="insight-chip warning">${icon('alert', 14)} 1 skill gap</span></div><div class="ai-actions"><button class="ai-action" data-action="ai" data-ai="match">${icon('users', 15)} Improve team fit</button><button class="ai-action" data-action="ai" data-ai="plan">${icon('calendar', 15)} Plan next milestone</button></div></div></div>
    <div class="stat-grid"><div class="stat-card"><div class="stat-label">PROJECT HEALTH <span class="signal healthy">GOOD</span></div><div class="stat-value">${project.health}<small>/100</small></div><div class="stat-foot"><span class="trend up">↗ 6.4%</span><span>vs. last week</span></div></div><div class="stat-card"><div class="stat-label">OPEN TASKS <span class="stat-icon violet">${icon('check', 15)}</span></div><div class="stat-value">${project.tasks.filter((t) => t.status !== 'Done').length}<small> active</small></div><div class="stat-foot"><span class="trend up">${done} done</span><span>this sprint</span></div></div><div class="stat-card"><div class="stat-label">TEAM FIT <span class="stat-icon blue">${icon('users', 15)}</span></div><div class="stat-value">89<small>% avg</small></div><div class="stat-foot"><span class="trend up">↗ 3.2%</span><span>AI compatibility</span></div></div><div class="stat-card"><div class="stat-label">NEXT MILESTONE <span class="stat-icon orange">${icon('flag', 15)}</span></div><div class="stat-value date-value">${project.milestoneDate}</div><div class="stat-foot"><span class="trend neutral">12 days</span><span>${project.milestone}</span></div></div></div>
    <div class="content-grid"><section class="panel work-panel"><div class="panel-heading"><div><span class="eyebrow">WORKSTREAM</span><h3>What needs your attention</h3></div><button class="text-button" data-view="tasks">View all tasks ${icon('arrow', 14)}</button></div><div class="task-tabs"><button class="${state.taskFilter === 'All' ? 'active' : ''}" data-filter="All">All <b>${project.tasks.length}</b></button><button class="${state.taskFilter === 'My tasks' ? 'active' : ''}" data-filter="My tasks">My tasks <b>2</b></button><button class="${state.taskFilter === 'At risk' ? 'active' : ''}" data-filter="At risk">At risk <b>1</b></button></div><div class="task-list">${taskListMarkup(project.tasks.slice(0, 4))}</div></section><section class="panel pulse-panel"><div class="panel-heading"><div><span class="eyebrow">TEAM PULSE</span><h3>People behind the progress</h3></div><button class="icon-button tiny" data-view="team">${icon('arrow', 16)}</button></div><div class="member-stack">${members.slice(0, 5).map((person) => `<div class="member-row">${avatar(person, 'medium')}<span><strong>${person.name}</strong><small>${person.role}</small></span><span class="presence ${person.status}"></span><b class="fit-score">${person.fit}%</b></div>`).join('')}</div><div class="pulse-footer"><span><i class="presence online"></i> 4 online now</span><button class="link-button" data-view="team">Open workspace ${icon('arrow', 14)}</button></div></section></div>
    <div class="bottom-grid"><section class="panel timeline-panel"><div class="panel-heading"><div><span class="eyebrow">MILESTONES</span><h3>Project runway</h3></div><button class="icon-button tiny" data-action="open-modal" data-modal="milestone">${icon('plus', 16)}</button></div><div class="milestone-track">${project.milestones.map((milestone, index) => `<div class="milestone ${milestone.progress === 100 ? 'complete' : milestone.progress > 0 ? 'current' : ''}"><div class="milestone-dot">${milestone.progress === 100 ? icon('check', 12) : index + 1}</div><div class="milestone-copy"><strong>${milestone.name}</strong><span>${milestone.date} · ${milestone.status}</span></div><div class="milestone-bar"><i style="width:${milestone.progress}%"></i></div></div>`).join('')}</div></section><section class="panel signals-panel"><div class="panel-heading"><div><span class="eyebrow">SIGNALS</span><h3>Small wins, visible</h3></div>${icon('spark', 19, 'panel-spark')}</div><div class="signal-row"><span class="signal-emoji violet">${icon('spark', 15)}</span><p><strong>Team fit is improving</strong><small>One new match lifted compatibility by 4 points.</small></p><span class="signal-time">8m</span></div><div class="signal-row"><span class="signal-emoji green">${icon('check', 15)}</span><p><strong>Research loop is closing</strong><small>3 interview notes moved to synthesis.</small></p><span class="signal-time">34m</span></div><div class="signal-row"><span class="signal-emoji orange">${icon('clock', 15)}</span><p><strong>Deadline is approaching</strong><small>Two tasks need an owner by Friday.</small></p><span class="signal-time">3h</span></div></section></div>`;
}

function taskListMarkup(tasks) {
  const visible = tasks.filter((task) => state.taskFilter === 'All' || (state.taskFilter === 'My tasks' && ['Liam Okafor', 'Maya Chen'].includes(task.owner)) || (state.taskFilter === 'At risk' && ['Blocked', 'In review'].includes(task.status)));
  if (!visible.length) return '<div class="empty-state">No tasks match this view.</div>';
  return visible.filter((task) => !state.taskSearch || `${task.title} ${task.owner} ${task.category}`.toLowerCase().includes(state.taskSearch.toLowerCase())).map((task) => `<div class="task-row"><button class="task-check ${task.status === 'Done' ? 'done' : ''}" data-action="toggle-task" data-id="${task.id}" aria-label="Toggle task status">${task.status === 'Done' ? icon('check', 13) : ''}</button><span class="task-name"><strong>${task.title}</strong><small>${task.category} · ${task.owner}</small></span><span class="priority ${task.priority.toLowerCase()}">${task.priority}</span><span class="task-due ${task.due === 'Today' ? 'today' : ''}">${icon('clock', 13)} ${task.due}</span><span class="status-pill ${statusClass(task.status)}"><span></span>${task.status}</span>${avatar({ initials: task.initials, color: task.color }, 'small')}</div>`).join('');
}

function viewMarkup() {
  if (state.view === 'projects') return projectsMarkup();
  if (state.view === 'team') return teamMarkup();
  if (state.view === 'tasks') return tasksMarkup();
  if (state.view === 'chat') return chatMarkup();
  if (state.view === 'analytics') return analyticsMarkup();
  if (state.view === 'profile') return profileMarkup();
  return dashboardMarkup();
}

function projectsMarkup() {
  const query = state.projectSearch.trim().toLowerCase();

  const visibleProjects = projects.filter((project) =>
    !query ||
    `${project.name} ${project.eyebrow} ${project.summary}`
      .toLowerCase()
      .includes(query)
  );

  return `
    <div class="projects-toolbar">
      <label class="wide-search">
        ${icon('search', 16)}
        <input id="project-search" value="${state.projectSearch}" placeholder="Search projects" />
      </label>
      <div class="filter-buttons">
        <button class="filter-button active">All projects ${icon('chevron', 14)}</button>
        <button class="filter-button">${icon('filter', 15)} Filters</button>
      </div>
    </div>

    <div class="project-cards">
      ${visibleProjects.length
        ? visibleProjects.map((project) => `
          <article class="project-card">
            <div class="project-card-top">
              <span class="project-icon" style="color:${project.color};background:${project.color}18">
                ${icon('folder', 20)}
              </span>
              <span class="status-pill ${statusClass(project.status)}">
                <span></span>${project.status}
              </span>
            </div>

            <span class="eyebrow">${project.eyebrow}</span>
            <h3>${project.name}</h3>
            <p>${project.summary}</p>

            <div class="project-metric">
              <span>Progress <b>${project.progress}%</b></span>
              <div class="mini-progress">
                <i style="width:${project.progress}%;background:${project.color}"></i>
              </div>
            </div>

            <div class="project-card-bottom">
              <span class="avatar-stack">
                ${members.slice(0, Math.min(project.members, 4)).map((person) => avatar(person, 'tiny')).join('')}
                <b>+${Math.max(project.members - 4, 2)}</b>
              </span>

              <div class="project-card-actions">
                <button class="link-button" data-action="edit-project" data-id="${project.id}">
                  Edit
                </button>
             <button class="link-button" data-action="delete-project" data-id="${project.id}">
                Delete
                </button>
                <button class="link-button" data-action="switch-project" data-id="${project.id}">
                  Open workspace ${icon('arrow', 14)}
                </button>
              </div>
            </div>
          </article>
        `).join('')
        : '<div class="empty-state">No projects match that search.</div>'
      }
    </div>

    <section class="panel project-table-panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">PROJECT SIGNALS</span>
          <h3>Portfolio at a glance</h3>
        </div>
        <button class="primary-button compact" data-action="ai" data-ai="portfolio">
          ${icon('spark', 15)} Ask AI to review
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Health</th>
              <th>Next milestone</th>
              <th>Members</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            ${visibleProjects.map((project) => `
              <tr>
                <td>
                  <span class="table-project">
                    <i style="background:${project.color}"></i>
                    <strong>${project.name}</strong>
                  </span>
                </td>
                <td>
                  <span class="health-number ${project.health > 85 ? 'good' : 'warn'}">${project.health}</span>
                  <div class="health-bar"><i style="width:${project.health}%"></i></div>
                </td>
                <td>${project.milestone} <small>${project.milestoneDate}</small></td>
                <td>${project.members} people</td>
                <td>Today, 9:42 AM</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function teamMarkup() {
  const current = getProject();
  const filtered = members.filter((person) => state.memberFilter === 'All' || person.department === state.memberFilter || person.availability === state.memberFilter);
  return `<div class="team-hero"><div><span class="eyebrow">AI TEAM FORMATION</span><h2>Build the team ${icon('spark', 20, 'inline-spark')}</h2><p>EduSync needs one more data voice and a little more research coverage before the next milestone.</p></div><button class="primary-button" data-action="ai" data-ai="recommend">${icon('spark', 16)} Generate recommendations</button></div><div class="team-grid"><section class="panel match-panel"><div class="panel-heading"><div><span class="eyebrow">RECOMMENDED FOR ${current.name.toUpperCase()}</span><h3>Strongest team-fit signals</h3></div><span class="ai-score">AI confidence 94%</span></div><div class="match-list">${members.slice(1, 5).map((person, index) => `<div class="match-row"><div class="match-rank">0${index + 1}</div>${avatar(person, 'large')}<div class="match-person"><strong>${person.name}</strong><span>${person.role} · ${person.department}</span><div class="skill-tags">${person.skills.slice(0, 3).map((skill) => `<b>${skill}</b>`).join('')}</div></div><div class="match-score"><strong>${person.fit}%</strong><span>match</span><div class="score-bar"><i style="width:${person.fit}%"></i></div></div><button class="icon-button tiny" data-action="ai" data-ai="invite">${icon('plus', 15)}</button></div>`).join('')}</div></section><section class="panel gap-panel"><div class="panel-heading"><div><span class="eyebrow">SKILL COVERAGE</span><h3>Where the team is thin</h3></div>${icon('alert', 19, 'panel-spark warning-icon')}</div>${[['Data storytelling', 42, 'Needs a voice'], ['User research', 82, 'Healthy'], ['Backend systems', 66, 'Covered'], ['Product strategy', 94, 'Strong']].map(([name, pct, label]) => `<div class="coverage-row"><div><span>${name}</span><b>${pct}%</b></div><div class="coverage-bar"><i style="width:${pct}%"></i></div><small class="${pct < 60 ? 'warning-text' : ''}">${label}</small></div>`).join('')}<button class="outline-button full" data-action="ai" data-ai="gap">Close skill gap ${icon('arrow', 14)}</button></section></div><section class="panel members-panel"><div class="panel-heading"><div><span class="eyebrow">ALL MEMBERS · ${members.length}</span><h3>People in your orbit</h3></div><div class="filter-buttons"><button class="filter-button active" data-member-filter="All">All</button><button class="filter-button" data-member-filter="High">High availability</button><button class="filter-button" data-member-filter="Software Engineering">Engineering</button></div></div><div class="member-directory">${filtered.map((person) => `<div class="directory-card">${avatar(person, 'large')}<div><strong>${person.name}</strong><span>${person.role}</span><small>${person.department}</small></div><div class="directory-fit"><b>${person.fit}%</b><span>fit</span></div><button class="icon-button tiny">${icon('more', 15)}</button></div>`).join('')}</div></section>`;
}

function tasksMarkup() {
  const project = getProject();
  return `<div class="task-overview-row"><div class="task-summary"><span class="eyebrow">SPRINT 04 · ${project.name.toUpperCase()}</span><h2>Keep the work legible.</h2><div class="sprint-progress"><i style="width:${project.progress}%"></i></div><span><b>${project.progress}%</b> of sprint complete · 6 days remaining</span></div><div class="task-summary-actions"><button class="secondary-button" data-action="ai" data-ai="allocate">${icon('spark', 16)} Balance workload</button><button class="primary-button" data-action="open-modal" data-modal="task">${icon('plus', 16)} Add task</button></div></div><div class="task-controls"><div class="task-tabs"><button class="${state.taskFilter === 'All' ? 'active' : ''}" data-filter="All">All tasks <b>${project.tasks.length}</b></button><button class="${state.taskFilter === 'My tasks' ? 'active' : ''}" data-filter="My tasks">My tasks <b>2</b></button><button class="${state.taskFilter === 'At risk' ? 'active' : ''}" data-filter="At risk">At risk <b>1</b></button></div><label class="wide-search">${icon('search', 16)}<input id="task-search" value="${state.taskSearch}" placeholder="Search tasks or people" /></label></div><section class="panel task-table-panel"><div class="table-wrap"><table><thead><tr><th>Task</th><th>Owner</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>${project.tasks.filter((task) => state.taskFilter === 'All' || (state.taskFilter === 'My tasks' && ['Liam Okafor', 'Maya Chen'].includes(task.owner)) || (state.taskFilter === 'At risk' && ['Blocked', 'In review'].includes(task.status))).filter((task) => !state.taskSearch || `${task.title} ${task.owner}`.toLowerCase().includes(state.taskSearch.toLowerCase())).map((task) => `<tr><td><button class="table-check ${task.status === 'Done' ? 'done' : ''}" data-action="toggle-task" data-id="${task.id}">${task.status === 'Done' ? icon('check', 12) : ''}</button><strong>${task.title}</strong><small>${task.category}</small></td><td><span class="table-owner">${avatar({ initials: task.initials, color: task.color }, 'tiny')}${task.owner}</span></td><td><span class="priority ${task.priority.toLowerCase()}">${task.priority}</span></td><td><span class="task-due ${task.due === 'Today' ? 'today' : ''}">${icon('clock', 13)}${task.due}</span></td><td><span class="status-pill ${statusClass(task.status)}"><span></span>${task.status}</span></td><td><button class="icon-button tiny">${icon('more', 16)}</button></td></tr>`).join('')}</tbody></table></div></section>`;
}

function chatMarkup() {
  return `<div class="chat-layout"><aside class="chat-channels panel"><div class="panel-heading"><div><span class="eyebrow">COLLABORATION</span><h3>Channels</h3></div><button class="icon-button tiny" data-action="open-modal" data-modal="channel">${icon('plus', 15)}</button></div><div class="channel-list"><button class="channel-item active" data-channel="product"><span>#</span><strong>product</strong><b>4</b></button><button class="channel-item" data-channel="research"><span>#</span><strong>research</strong></button><button class="channel-item" data-channel="random"><span>#</span><strong>random</strong></button></div><div class="chat-dm"><span class="eyebrow">DIRECT MESSAGES</span>${members.slice(1, 4).map((person) => `<button class="dm-item">${avatar(person, 'tiny')}<span>${person.name}</span><i class="presence ${person.status}"></i></button>`).join('')}</div></aside><section class="chat-thread panel"><div class="chat-header"><div><span class="eyebrow">CHANNEL</span><h3># ${state.chatChannel}</h3><p>Product direction, decisions, and the details that keep the team in sync.</p></div><div class="avatar-stack">${members.slice(0, 5).map((person) => avatar(person, 'tiny')).join('')}</div></div><div class="thread-messages"><div class="date-divider"><span>Today</span></div>${chatMessages().map((message) => `<div class="message"><div>${avatar(message.person, 'medium')}</div><div class="message-content"><div><strong>${message.person.name}</strong><span>${message.time}</span></div><p>${message.text}</p>${message.reaction ? `<span class="reaction">${icon('check', 12)} ${message.reaction}</span>` : ''}</div></div>`).join('')}</div><div class="message-composer"><button class="icon-button tiny">${icon('plus', 16)}</button><input placeholder="Message #${state.chatChannel}" /><button class="send-button" data-action="send-message">${icon('send', 16)}</button></div></section><aside class="chat-context panel"><span class="eyebrow">CHANNEL CONTEXT</span><h3>What is moving</h3><div class="context-stat"><span class="context-icon violet">${icon('flag', 16)}</span><span><strong>Usability study</strong><small>74% complete</small></span></div><div class="context-stat"><span class="context-icon orange">${icon('clock', 16)}</span><span><strong>2 decisions needed</strong><small>Before Friday</small></span></div><div class="context-stat"><span class="context-icon green">${icon('check', 16)}</span><span><strong>4 people online</strong><small>Ready to help</small></span></div><button class="outline-button full" data-view="tasks">Open related tasks ${icon('arrow', 14)}</button></aside></div>`;
}

function chatMessages() {
  return [
    { person: members[2], time: '9:18 AM', text: 'I grouped the interviews into three themes. The biggest unlock is that students want the match explanation, not just the score.', reaction: '3' },
    { person: members[1], time: '9:31 AM', text: 'That tracks with the empty state we saw yesterday. I can add a “Why this team?” panel to the onboarding flow today.' },
    { person: members[0], time: '9:42 AM', text: 'Perfect. Let’s make that the next milestone slice. Noah, can we show the top two reasons behind the score in v2?' },
    { person: members[3], time: '9:47 AM', text: 'Yes — I’ll expose the feature weights and keep the language human. I’ll drop a sample in the thread after lunch.' },
    ...(state.chatMessages || []),
  ];
}

function analyticsMarkup() {
  return `<div class="analytics-kpis"><div class="analytics-kpi"><span class="eyebrow">PORTFOLIO HEALTH</span><strong>84<span>/100</span></strong><small><b class="trend up">↗ 8.6%</b> vs. last month</small></div><div class="analytics-kpi"><span class="eyebrow">AVG. TEAM FIT</span><strong>89<span>%</span></strong><small><b class="trend up">↗ 4.1%</b> AI compatibility</small></div><div class="analytics-kpi"><span class="eyebrow">TASK VELOCITY</span><strong>32<span>/wk</span></strong><small><b class="trend up">↗ 12.3%</b> work completed</small></div><div class="analytics-kpi"><span class="eyebrow">RISKS DETECTED</span><strong>03</strong><small><b class="trend neutral">— 2</b> from last week</small></div></div><div class="analytics-grid"><section class="panel chart-panel"><div class="panel-heading"><div><span class="eyebrow">PROJECT HEALTH</span><h3>Portfolio momentum</h3></div><button class="filter-button">Last 30 days ${icon('chevron', 13)}</button></div><div class="line-chart"><div class="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div class="chart-body"><div class="chart-grid-lines"><i></i><i></i><i></i><i></i><i></i></div><svg viewBox="0 0 600 200" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6d5dfb" stop-opacity=".24"/><stop offset="1" stop-color="#6d5dfb" stop-opacity="0"/></linearGradient></defs><path class="chart-area" d="M0 164 C42 153 60 152 92 142 S144 150 178 120 S230 112 265 122 S316 84 351 92 S398 65 430 76 S480 49 520 56 S558 32 600 22 V200 H0Z"/><path class="chart-line" d="M0 164 C42 153 60 152 92 142 S144 150 178 120 S230 112 265 122 S316 84 351 92 S398 65 430 76 S480 49 520 56 S558 32 600 22"/></svg><div class="chart-x"><span>Sep 22</span><span>Sep 29</span><span>Oct 06</span><span>Oct 13</span><span>Oct 20</span></div></div></div></section><section class="panel workload-panel"><div class="panel-heading"><div><span class="eyebrow">WORKLOAD BALANCE</span><h3>Who has room to help</h3></div>${icon('users', 19, 'panel-spark')}</div>${members.slice(0, 5).map((person, index) => `<div class="workload-row">${avatar(person, 'tiny')}<span>${person.name.split(' ')[0]}</span><div class="workload-bar"><i style="width:${[78, 62, 54, 42, 32][index]}%;background:${index === 0 ? '#eb8a48' : '#6d5dfb'}"></i></div><b>${[78, 62, 54, 42, 32][index]}%</b></div>`).join('')}<button class="outline-button full" data-action="ai" data-ai="allocate">Suggest reallocations ${icon('arrow', 14)}</button></section><section class="panel breakdown-panel"><div class="panel-heading"><div><span class="eyebrow">MILESTONE COMPLETION</span><h3>Across projects</h3></div><button class="text-button" data-view="projects">View projects ${icon('arrow', 14)}</button></div>${projects.map((project) => `<div class="breakdown-row"><span class="breakdown-label"><i style="background:${project.color}"></i>${project.name}</span><div class="mini-progress"><i style="width:${project.progress}%;background:${project.color}"></i></div><b>${project.progress}%</b></div>`).join('')}</section><section class="panel ai-health-panel"><div class="panel-heading"><div><span class="eyebrow">AI HEALTH CHECK</span><h3>Signals worth acting on</h3></div><span class="ai-score">Updated now</span></div><div class="health-alert"><span class="signal-emoji orange">${icon('alert', 15)}</span><div><strong>Research bottleneck</strong><p>EduSync could lose 1.5 days if synthesis stays with one owner.</p></div><button class="link-button" data-action="ai" data-ai="allocate">Fix ${icon('arrow', 14)}</button></div><div class="health-alert"><span class="signal-emoji green">${icon('check', 15)}</span><div><strong>Strong momentum</strong><p>AccessLab is tracking 6 days ahead of its original plan.</p></div><button class="link-button" data-action="open-project" data-id="accesslab">View ${icon('arrow', 14)}</button></div></section></div>`;
}

function profileMarkup() {
  const person = currentPerson();
  const availability = String(person.availability || 'high').toLowerCase();
  const bio = person.bio || 'Keep your strengths, interests, and availability visible to the right teams.';
  const skillTags = person.skills.length
    ? person.skills.map((skill) => `<span>${escapeHtml(skill)} <button type="button">×</button></span>`).join('')
    : '';
  return `<div class="profile-layout"><section class="panel profile-card"><div class="profile-cover"></div><div class="profile-card-body"><div class="profile-avatar">${avatar(person, 'huge')}<button class="avatar-edit">${icon('edit', 14)}</button></div><span class="eyebrow">${escapeHtml(person.role.toUpperCase())}${person.department ? ` · ${escapeHtml(person.department.toUpperCase())}` : ''}</span><h2>${escapeHtml(person.name)}</h2><p>${escapeHtml(bio)}</p><div class="profile-stats"><span><b>04</b><small>projects</small></span><span><b>12</b><small>teams joined</small></span><span><b>96%</b><small>team fit</small></span></div></div></section><section class="panel form-panel"><div class="panel-heading"><div><span class="eyebrow">PROFILE SIGNALS</span><h3>Make your strengths findable</h3></div><button class="primary-button compact" data-action="save-profile">Save changes</button></div><div class="form-grid"><label>Full name<input value="${escapeHtml(person.name)}" /></label><label>Role<select><option ${person.role === 'Project Leader' ? 'selected' : ''}>Project Leader</option><option ${person.role === 'Student' ? 'selected' : ''}>Student</option><option ${person.role === 'Faculty / Mentor' ? 'selected' : ''}>Faculty / Mentor</option></select></label><label class="full-field">About you<textarea>${escapeHtml(bio)}</textarea></label><label>Availability<select><option ${availability === 'high' ? 'selected' : ''}>High — open to a new project</option><option ${availability === 'medium' ? 'selected' : ''}>Medium — selective</option><option ${availability === 'low' ? 'selected' : ''}>Low — focused</option></select></label><label>Preferred team size<select><option>4–6 people</option><option>2–4 people</option><option>6–8 people</option></select></label></div><div class="field-section"><span class="field-label">Skills & interests</span><div class="editable-tags">${skillTags}<button class="add-tag">${icon('plus', 13)} Add skill</button></div></div><div class="profile-note"><span class="ai-orb small">${icon('spark', 15)}</span><p><strong>AI profile note</strong><br />Your profile is visible to matching teams. Adding one more skill could improve your recommended team matches.</p><button class="text-button" data-action="ai" data-ai="profile">Improve profile ${icon('arrow', 14)}</button></div></section></div>`;
}

function modalMarkup() {
  const type = state.modal;

  const editingProject = type === 'edit-project'
    ? projects.find(p => p.id === state.editingProjectId)
    : null;

  const title =
    type === 'task' ? 'Add a task' :
    type === 'project' ? 'Switch project' :
    type === 'create-project' ? 'Create a project' :
    type === 'invite' ? 'Invite collaborators' :
    type === 'milestone' ? 'Add milestone' :
    type === 'channel' ? 'Create a channel' :
    'Help center';

  // Switch Project Modal
  if (type === 'project') {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal project-modal" data-stop>
          <div class="modal-heading">
            <div>
              <span class="eyebrow">PROJECT SPACE</span>
              <h2>Switch your workspace</h2>
            </div>
            <button class="icon-button tiny" data-action="close-modal">
              ${icon('close', 16)}
            </button>
          </div>

          <div class="modal-project-list">
            ${projects.map(project => `
              <button class="modal-project ${project.id === state.projectId ? 'selected' : ''}"
                data-action="switch-project" data-id="${project.id}">
                <span class="project-icon"
                  style="color:${project.color};background:${project.color}18">
                  ${icon('folder', 19)}
                </span>
                <span>
                  <strong>${project.name}</strong>
                  <small>${project.eyebrow} · ${project.progress}% complete</small>
                </span>
                ${project.id === state.projectId ? icon('check', 17) : icon('arrow', 15)}
              </button>
            `).join('')}
          </div>

          <button class="outline-button full" data-action="close-modal">
            Keep current project
          </button>
        </div>
      </div>
    `;
  }

  // Create and Edit Project Modal
if (type === 'create-project' || type === 'edit-project') {
  const isEditing = type === 'edit-project';

  const statusValue = {
    'On track': 'on_track',
    'At risk': 'at_risk',
    'Delayed': 'delayed',
    'Completed': 'completed'
  };

  return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal" data-stop>
        <div class="modal-heading">
          <div>
            <span class="eyebrow">${isEditing ? 'EDIT PROJECT' : 'NEW PROJECT'}</span>
            <h2>${isEditing ? 'Edit project' : 'Create a project'}</h2>
          </div>
          <button class="icon-button tiny" data-action="close-modal">
            ${icon('close', 16)}
          </button>
        </div>

        <form id="modal-form" class="form-grid">
          <label class="full-field">
            Project name
            <input name="name"
              value="${isEditing ? editingProject?.name || '' : ''}"
              placeholder="e.g. AI Campus Assistant" required />
          </label>

          <label class="full-field">
            Short description
            <textarea name="summary"
              placeholder="What is this project about?"
              required>${isEditing ? editingProject?.summary || '' : ''}</textarea>
          </label>

          <label>
            Project category
            <input name="eyebrow"
              value="${isEditing ? editingProject?.eyebrow || '' : ''}"
              placeholder="e.g. AI / RESEARCH" />
          </label>

          <label>
            Deadline
            <input name="due_date" type="date"
              value="${isEditing && editingProject?.due !== 'Not set' ? editingProject?.due || '' : ''}" />
          </label>

          <label>
            Project status
            <select name="status">
              <option value="on_track" ${(isEditing ? statusValue[editingProject?.status] : 'on_track') === 'on_track' ? 'selected' : ''}>On track</option>
              <option value="at_risk" ${(isEditing ? statusValue[editingProject?.status] : '') === 'at_risk' ? 'selected' : ''}>At risk</option>
              <option value="delayed" ${(isEditing ? statusValue[editingProject?.status] : '') === 'delayed' ? 'selected' : ''}>Delayed</option>
              <option value="completed" ${(isEditing ? statusValue[editingProject?.status] : '') === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </label>

          <div class="modal-actions full-field">
            <button type="button" class="secondary-button" data-action="close-modal">
              Cancel
            </button>
            <button type="submit" class="primary-button">
              ${isEditing ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
  // Help Modal
  if (type === 'help') {
    return `
      <div class="modal-backdrop" data-action="close-modal">
        <div class="modal" data-stop>
          <div class="modal-heading">
            <div>
              <span class="eyebrow">TEAMFORGE GUIDE</span>
              <h2>What can AI help with?</h2>
            </div>
            <button class="icon-button tiny" data-action="close-modal">
              ${icon('close', 16)}
            </button>
          </div>
          <div class="help-list">
            <button data-action="ai" data-ai="match">
              <span class="help-icon violet">${icon('users', 17)}</span>
              <span><strong>Build a balanced team</strong><small>Match people to project skills, availability, and working style.</small></span>
              ${icon('arrow', 15)}
            </button>
            <button data-action="ai" data-ai="plan">
              <span class="help-icon blue">${icon('calendar', 17)}</span>
              <span><strong>Plan a milestone</strong><small>Turn a goal into a realistic sequence of next steps.</small></span>
              ${icon('arrow', 15)}
            </button>
            <button data-action="ai" data-ai="risk">
              <span class="help-icon orange">${icon('alert', 17)}</span>
              <span><strong>Spot a risk early</strong><small>See delays and workload issues before they become blockers.</small></span>
              ${icon('arrow', 15)}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Existing Task, Invite, Milestone and Channel Modals
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <div class="modal" data-stop>
        <div class="modal-heading">
          <div>
            <span class="eyebrow">${type === 'task' ? 'TASK MANAGEMENT' : 'WORKSPACE SETUP'}</span>
            <h2>${title}</h2>
          </div>
          <button class="icon-button tiny" data-action="close-modal">
            ${icon('close', 16)}
          </button>
        </div>

        <form id="modal-form" class="form-grid">
          <label>
            ${type === 'task' ? 'Task title' : type === 'invite' ? 'Email or name' : type === 'milestone' ? 'Milestone name' : 'Channel name'}
            <input name="title" placeholder="Type here..." required />
          </label>

          ${type === 'task' ? `
            <label>Owner
              <select name="owner">
                ${members.map(person => `<option>${person.name}</option>`).join('')}
              </select>
            </label>
            <label>Priority
              <select name="priority">
                <option>Medium</option>
                <option>High</option>
                <option>Low</option>
              </select>
            </label>
            <label>Due date
              <input name="due" type="date" />
            </label>
            <label class="full-field">Description
              <textarea name="description" placeholder="Add context for the team..."></textarea>
            </label>
          ` : type === 'invite' ? `
            <label>Role
              <select>
                <option>Contributor</option>
                <option>Project Leader</option>
                <option>Faculty / Mentor</option>
              </select>
            </label>
          ` : `
            <label class="full-field">Notes
              <textarea placeholder="Add context..."></textarea>
            </label>
          `}

          <div class="modal-actions">
            <button type="button" class="secondary-button" data-action="close-modal">Cancel</button>
            <button type="submit" class="primary-button">
              ${type === 'invite' ? 'Send invite' : type === 'task' ? 'Create task' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function viewLabel(view) { return ({ projects: 'Projects', team: 'Team workspace', tasks: 'Tasks & milestones', chat: 'Chat & discussions', analytics: 'Analytics', profile: 'My profile' })[view] || 'Command center'; }
function setToast(message) { state.toast = message; render(); window.clearTimeout(window.__toastTimer); window.__toastTimer = window.setTimeout(() => { state.toast = null; render(); }, 3200); }

async function handleClick(event) {
      const stop = event.target.closest('[data-stop]');
    const clickedAction = event.target.closest('[data-action]');
  
    // Ignore clicks inside the modal unless they target an actual modal button.
    if (stop && (!clickedAction || !stop.contains(clickedAction))) return;
  const viewTarget = event.target.closest('[data-view]');
  if (viewTarget) { state.view = viewTarget.dataset.view; state.notificationsOpen = false; state.mobileNavOpen = false; persist(); render(); return; }
  const filter = event.target.closest('[data-filter]');
  if (filter) { state.taskFilter = filter.dataset.filter; persist(); render(); return; }
  const memberFilter = event.target.closest('[data-member-filter]');
  if (memberFilter) { state.memberFilter = memberFilter.dataset.memberFilter; persist(); render(); return; }
  const channel = event.target.closest('[data-channel]');
  if (channel) { state.chatChannel = channel.dataset.channel; persist(); render(); return; }
  const action = event.target.closest('[data-action]');
  if (!action) return;
  const type = action.dataset.action;

  // DELETE PROJECT
  if (type === 'delete-project') {
    const projectId = action.dataset.id;
    const project = projects.find(p => p.id === projectId);

    if (!project) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteProject(projectId);

      projects.splice(
        projects.findIndex(p => p.id === projectId),
        1
      );

      if (state.projectId === projectId) {
        state.projectId = projects.length > 0 ? projects[0].id : null;
      }

      state.modal = null;
      persist();
      render();

      setToast('Project deleted successfully!');
    } catch (error) {
      console.error('Project deletion failed:', error);
      setToast(error.message || 'Could not delete project');
    }

    return;
  }

  if (type === 'toggle-mobile-nav') { state.mobileNavOpen = !state.mobileNavOpen; render(); return; }
  if (type === 'toggle-notifications') { state.notificationsOpen = !state.notificationsOpen; render(); return; }
  if (type === 'mark-all-read') { notifications.forEach((note) => note.unread = false); state.notificationsOpen = false; render(); return; }
  if (type === 'read-notification') { const note = notifications.find((item) => item.id === Number(action.dataset.id)); if (note) note.unread = false; setToast('Notification marked as read'); return; }
  if (type === 'toggle-task') { const task = getProject().tasks.find((item) => item.id === Number(action.dataset.id)); if (task) { task.status = task.status === 'Done' ? 'In progress' : 'Done'; persist(); setToast(task.status === 'Done' ? 'Task marked complete' : 'Task reopened'); } return; }
  if (type === 'edit-project') {
    state.editingProjectId = action.dataset.id;
    state.modal = 'edit-project';
    render();
    return;
  }
  if (type === 'open-project') { if (action.dataset.id) state.projectId = action.dataset.id; state.modal = 'project'; render(); return; }
  if (type === 'switch-project') { state.projectId = action.dataset.id; state.modal = null; state.view = 'command'; persist(); setToast(`Switched to ${getProject().name}`); return; }
  if (type === 'open-modal') { state.modal = action.dataset.modal; render(); return; }
  if (type === 'close-modal') { state.modal = null; render(); return; }
  if (type === 'set-auth-mode') { state.authMode = action.dataset.mode; state.authError = ''; render(); return; }
  if (type === 'logout') { logout(); return; }
  if (type === 'save-profile') { setToast('Profile changes saved'); return; }
  if (type === 'send-message') { const composer = action.closest('.message-composer'); const input = composer?.querySelector('input'); const text = input?.value.trim(); if (!text) { setToast('Type a message first'); return; } state.chatMessages = [...(state.chatMessages || []), { person: currentPerson(), time: 'Just now', text }]; persist(); setToast('Message added to the channel'); return; }
  if (type === 'ai') {
    const aiCopy = { match: 'AI mapped the team against the milestone and found one stronger research pairing.', plan: 'AI drafted a 3-step plan for the usability study. The first move is ready to assign.', portfolio: 'AI reviewed the portfolio. EduSync is leading momentum; Greenhouse Sensors needs a battery decision.', recommend: '4 recommended matches are ready. Noah and Sophia are the strongest next additions.', invite: 'Invite drafted — the collaborator will see the project context and skill gap.', gap: 'AI found a content strategist with 78% fit to close the data storytelling gap.', allocate: 'Workload balanced: Sophia gets support on synthesis and the deadline risk drops to low.', profile: 'Suggested skill: facilitation. Adding it could improve team recommendations by 6%.', risk: 'AI found one medium-risk dependency: the interview synthesis owner is a single point of failure.' };
    state.modal = null; state.aiNote = aiCopy[action.dataset.ai] || 'AI is reviewing the workspace and will surface the next best move.'; persist(); setToast('AI insight updated'); return;
  }
}

function handleChange(event) {
  if (event.target.id === 'role-select') { state.role = event.target.value; persist(); render(); }
}
function handleInput(event) {
  if (event.target.id === 'global-search' || event.target.id === 'task-search') { state.taskSearch = event.target.value; persist(); if (event.target.id === 'task-search') { const cursor = event.target.selectionStart; render(); const next = document.querySelector('#task-search'); if (next) { next.focus(); next.setSelectionRange(cursor, cursor); } } }
  if (event.target.id === 'project-search') { state.projectSearch = event.target.value; persist(); const cursor = event.target.selectionStart; render(); const next = document.querySelector('#project-search'); if (next) { next.focus(); next.setSelectionRange(cursor, cursor); } }
}
function handleKeydown(event) { if (event.key === 'Enter' && event.target.id === 'global-search' && event.target.value.trim()) { state.taskSearch = event.target.value.trim(); state.view = 'tasks'; persist(); render(); } }
async function handleSubmit(event) {
  
  // Handle login and registration
  if (event.target.id === 'auth-form') {
    event.preventDefault();
    submitAuth(event.target);
    return;
  }

  // Handle other modal forms
  if (event.target.id !== 'modal-form') return;

  event.preventDefault();

  const data = new FormData(event.target);
  const modalType = state.modal;
  // EDIT PROJECT
if (modalType === 'edit-project') {
  const projectId = state.editingProjectId;
  const name = data.get('name')?.trim();

  if (!name) {
    setToast('Please enter a project name');
    return;
  }

  const payload = {
    name: name,
    eyebrow: data.get('eyebrow')?.trim() || 'STUDENT PROJECT',
    summary: data.get('summary')?.trim() || '',
    status: data.get('status') || 'on_track',
    due_date: data.get('due_date') || null
  };

  try {
    const updatedProject = await updateProject(projectId, payload);
    const mappedProject = mapApiProject(updatedProject);

    const index = projects.findIndex(p => p.id === projectId);

    if (index !== -1) {
      projects[index] = mappedProject;
    }

    state.modal = null;
    state.editingProjectId = null;

    persist();
    render();
    setToast('Project updated successfully!');
  } catch (error) {
    console.error('Project update failed:', error);
    setToast(error.message || 'Could not update project');
  }

  return;
}

  // CREATE PROJECT
  if (modalType === 'create-project') {
    const name = data.get('name')?.trim();

    if (!name) {
      setToast('Please enter a project name');
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-5);

    const payload = {
      name: name,
      slug: slug,
      eyebrow: data.get('eyebrow')?.trim() || 'STUDENT PROJECT',
      summary: data.get('summary')?.trim() || '',
      color: '#6d5dfb',
      status: data.get('status') || 'on_track',
      progress: 0,
      health_score: 100,
      milestone_name: 'Project kickoff',
      milestone_date: null,
      due_date: data.get('due_date') || null
    };

    try {
      const createdProject = await createProject(payload);

      const newProject = mapApiProject(createdProject);

      projects.push(newProject);

      state.projectId = newProject.id;
      state.modal = null;
      state.view = 'command';

      persist();
      render();

      setToast('Project created successfully!');
    } catch (error) {
      console.error('Project creation failed:', error);
      setToast(error.message || 'Could not create project');
    }

    return;
  }

  // CREATE TASK
if (modalType === 'task' && data.get('title')) {
  const project = getProject();

  if (!project) {
    setToast('Please select a project first');
    return;
  }

  const statusMap = {
    'Not started': 'todo',
    'In progress': 'in_progress',
    'In review': 'in_review',
    'Blocked': 'blocked',
    'Done': 'done',
  };

  const selectedOwner = data.get('owner');

  const payload = {
    project_id: project.id,
    title: data.get('title').trim(),
    description: '',
    status: 'todo',
    priority: (data.get('priority') || 'medium').toLowerCase(),
    category: 'New task',
    due_date: null,
  };

  try {
    const createdTask = await createTask(payload);

    project.tasks.unshift({
      id: createdTask.id,
      title: createdTask.title,
      owner: selectedOwner || 'Unassigned',
      initials: selectedOwner ? initials(selectedOwner) : '?',
      color: members.find(
        person => person.name === selectedOwner
      )?.color || 'violet',
      priority: createdTask.priority.charAt(0).toUpperCase()
        + createdTask.priority.slice(1),
      due: 'No due date',
      status: 'Not started',
      category: createdTask.category || 'New task',
    });

    state.modal = null;
    persist();
    render();

    setToast('Task created successfully!');
  } catch (error) {
    console.error('Task creation failed:', error);
    setToast(error.message || 'Could not create task');
  }

  return;
}
}
function validateAuthForm(form) {
  const data = new FormData(form);
  const email = String(data.get('email') || '').trim();
  const password = String(data.get('password') || '');
  const name = String(data.get('name') || '').trim();
  const department = String(data.get('department') || '').trim();
  if (state.authMode === 'register' && !name) return { error: 'Name is required.' };
  if (!email) return { error: 'Email is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (!password) return { error: 'Password is required.' };
  if (state.authMode === 'register' && password.length < 8) return { error: 'Password must be at least 8 characters.' };
  return {
    payload: {
      email: email.toLowerCase(),
      password,
      name,
      department,
    },
  };
}

async function submitAuth(form) {
  if (state.authBusy) return;
  const { error, payload } = validateAuthForm(form);
  state.authEmail = payload?.email || String(new FormData(form).get('email') || '').trim();
  state.authName = payload?.name || String(new FormData(form).get('name') || '').trim();
  state.authDepartment = payload?.department || String(new FormData(form).get('department') || '').trim();
  if (error) {
    state.authError = error;
    render();
    return;
  }

  state.authBusy = true;
  state.authError = '';
  render();

  try {
    if (state.authMode === 'register') {
      const body = { name: payload.name, email: payload.email, password: payload.password };
      if (payload.department) body.department = payload.department;
      await apiRegister(body);
    }

    const tokenResponse = await apiLogin({ email: payload.email, password: payload.password });
    if (!tokenResponse?.access_token) {
      throw new ApiError('Sign-in succeeded without an access token. Please try again.');
    }
    setToken(tokenResponse.access_token);
    applyAuthenticatedUser(tokenResponse.user);
    persist();
    setToast(state.authMode === 'register' ? 'Account created. Welcome in.' : `Welcome back, ${firstNameFrom(tokenResponse.user.full_name)}.`);
  } catch (err) {
    state.authBusy = false;
    state.authError = err instanceof ApiError ? err.message : 'Unable to authenticate. Please try again.';
    render();
  }
}

function logout() {
  clearToken();
  state.currentUser = null;
  state.session = 'guest';
  state.authMode = 'login';
  state.authError = '';
  state.authBusy = false;
  state.modal = null;
  state.notificationsOpen = false;
  state.mobileNavOpen = false;
  render();
}

async function restoreSession() {
  if (!getToken()) {
    state.session = 'guest';
    render();
    return;
  }

  state.session = 'loading';
  render();

  try {
    const user = await getMe();

    applyAuthenticatedUser(user);

    // Load projects belonging to the logged-in user
    await loadProjects();

    persist();
    render();

  } catch (err) {
    clearToken();
    state.currentUser = null;
    state.session = 'guest';
    state.authMode = 'login';
    state.authError = err instanceof ApiError && err.status === 0
      ? err.message
      : 'Your session expired. Please sign in again.';

    render();
  }
}
document.querySelector('#app').addEventListener('click', handleClick);
document.querySelector('#app').addEventListener('change', handleChange);
document.querySelector('#app').addEventListener('input', handleInput);
document.querySelector('#app').addEventListener('submit', handleSubmit);
document.querySelector('#app').addEventListener('keydown', handleKeydown);
console.log('TEAM COLLO MAIN.JS LOADED');
restoreSession();
