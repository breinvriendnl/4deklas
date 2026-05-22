/**
 * 4deklas Demo — gedeelde staat via localStorage
 * Geen backend nodig. Werkt volledig in de browser.
 */
const SF = (() => {
  const KEY = 'sf_demo_v2';

  const INITIAL = {
    school: { name: 'De Regenboogschool', location: 'Amsterdam-Noord' },
    users: [
      { id: 1, name: 'Directeur', username: 'directeur', password: 'admin2025', role: 'director' }
    ],
    next_user_id: 2,
    projects: [
      { id: 1, title: 'Nieuwe laptops voor klas 7 en 8', description: 'We willen 15 laptops aanschaffen zodat elke leerling zelfstandig kan werken aan taal, rekenen en programmeren.', goal: 300000, collected: 47500, status: 'active', end_date: null },
      { id: 2, title: 'Nieuw avontuurlijk schoolplein', description: 'Een veilig en uitdagend schoolplein met klimtoestellen, een moestuin en groene speelruimte voor alle groepen.', goal: 1500000, collected: 312000, status: 'active', end_date: null },
      { id: 3, title: 'Muziekinstrumenten', description: 'Gitaren, keyboards en percussie voor het nieuwe muziekprogramma dat volgend schooljaar start.', goal: 250000, collected: 189000, status: 'active', end_date: null }
    ],
    donations: [
      { id: 1, project_id: 1, donor_name: 'Marieke de Vries', company_name: null, visibility: 'named', amount: 2500, platform_fee: 188, net_amount: 2312, message: 'Succes met de laptops!', created_at: '2025-05-18T10:23:00Z' },
      { id: 2, project_id: 2, donor_name: 'Jan Bakker', company_name: null, visibility: 'named', amount: 5000, platform_fee: 375, net_amount: 4625, message: '', created_at: '2025-05-17T14:05:00Z' },
      { id: 3, project_id: 3, donor_name: null, company_name: null, visibility: 'anonymous', amount: 1000, platform_fee: 75, net_amount: 925, message: 'Mooi initiatief!', created_at: '2025-05-16T09:40:00Z' },
      { id: 4, project_id: 1, donor_name: 'Familie Smit', company_name: null, visibility: 'named', amount: 10000, platform_fee: 750, net_amount: 9250, message: 'Onze kinderen zitten op deze school.', created_at: '2025-05-15T16:12:00Z' },
      { id: 5, project_id: 2, donor_name: null, company_name: 'Buurtsupermarkt De Hoek', visibility: 'company', amount: 25000, platform_fee: 1875, net_amount: 23125, message: 'Graag gedaan — investering in de buurt!', created_at: '2025-05-14T11:30:00Z' }
    ],
    next_donation_id: 6,
    next_project_id: 4
  };

  // Controleer en sluit projecten op basis van datum of behaald doel
  function checkAndCloseProjects(state) {
    const today = new Date().toISOString().split('T')[0];
    state.projects.forEach(p => {
      if (p.status === 'closed') return;
      if (p.collected >= p.goal) {
        p.status = 'achieved';
      } else if (p.end_date && p.end_date < today) {
        p.status = 'closed';
      }
    });
    return state;
  }

  function get() {
    try {
      const raw = localStorage.getItem(KEY);
      const state = raw ? JSON.parse(raw) : structuredClone(INITIAL);
      // Zorg dat users altijd aanwezig is (backward-compat met oude localStorage)
      if (!state.users || state.users.length === 0) {
        state.users = structuredClone(INITIAL.users);
        state.next_user_id = state.next_user_id || INITIAL.next_user_id;
      }
      return checkAndCloseProjects(state);
    } catch {
      return structuredClone(INITIAL);
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  function donate(projectId, amountEuros, donorName, companyName, message, visibility, frequency) {
    const state = get();
    const amount = Math.round(amountEuros * 100);
    const platform_fee = Math.round(amount * 0.02);
    const net_amount = amount - platform_fee;

    // Weiger donatie als project niet actief is (tenzij algemene donatie id=0)
    if (projectId !== 0) {
      const project = state.projects.find(p => p.id === projectId);
      if (!project || project.status !== 'active') {
        return { error: 'Dit project accepteert geen donaties meer.' };
      }
      project.collected += amount;
      checkAndCloseProjects(state);
    }

    const donation = {
      id: state.next_donation_id++,
      project_id: projectId,
      donor_name: (visibility === 'anonymous' || visibility === 'hidden') ? null : (donorName || null),
      company_name: visibility === 'company' ? (companyName || null) : null,
      visibility: visibility || 'named',
      frequency: frequency || 'once',
      amount, platform_fee, net_amount,
      message: message || '',
      created_at: new Date().toISOString()
    };

    state.donations.unshift(donation);
    save(state);

    const project = projectId === 0 ? null : state.projects.find(p => p.id === projectId);
    return { donation, project };
  }

  function addProject(title, description, goalEuros, endDate) {
    const state = get();
    const project = {
      id: state.next_project_id++,
      title,
      description: description || '',
      goal: Math.round(goalEuros * 100),
      collected: 0,
      status: 'active',
      end_date: endDate || null
    };
    state.projects.push(project);
    save(state);
    return project;
  }

  function closeProject(id) {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (project) {
      project.status = 'closed';
      save(state);
    }
  }

  function reopenProject(id) {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (project) {
      project.status = 'active';
      save(state);
    }
  }

  function deleteProject(id) {
    const state = get();
    const project = state.projects.find(p => p.id === id);
    if (!project) return { error: 'Project niet gevonden.' };
    if (project.collected > 0) {
      return { error: 'has_donations', collected: project.collected };
    }
    state.projects = state.projects.filter(p => p.id !== id);
    save(state);
    return { success: true };
  }

  function forceDeleteProject(id) {
    const state = get();
    state.projects = state.projects.filter(p => p.id !== id);
    save(state);
    return { success: true };
  }

  function euro(centen) {
    return '€ ' + (centen / 100).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function pct(collected, goal) {
    return Math.min(100, Math.round((collected / goal) * 100));
  }

  function timeAgo(iso) {
    const diff = Math.round((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return 'zojuist';
    if (diff < 3600) return Math.floor(diff / 60) + ' min geleden';
    if (diff < 86400) return Math.floor(diff / 3600) + ' uur geleden';
    return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  }

  function authenticate(password) {
    const state = get();
    const users = state.users && state.users.length > 0
      ? state.users
      : INITIAL.users;
    return users.find(u => u.password === password) || null;
  }

  function getUsers() {
    return get().users || [];
  }

  function addUser(name, username, password) {
    const state = get();
    const users = state.users || [];
    if (users.find(u => u.username === username)) {
      return { error: 'Deze gebruikersnaam is al in gebruik.' };
    }
    const nonDirectors = users.filter(u => u.role !== 'director');
    if (nonDirectors.length >= 5) {
      return { error: 'Maximum van 5 gebruikers bereikt.' };
    }
    const user = { id: state.next_user_id++, name, username, password, role: 'user' };
    state.users.push(user);
    save(state);
    return { success: true, user };
  }

  function deleteUser(id) {
    const state = get();
    const user = (state.users || []).find(u => u.id === id);
    if (!user) return { error: 'Gebruiker niet gevonden.' };
    if (user.role === 'director') return { error: 'De directeur kan niet worden verwijderd.' };
    state.users = state.users.filter(u => u.id !== id);
    save(state);
    return { success: true };
  }

  function statusLabel(status) {
    return { active: 'Actief', achieved: 'Doel bereikt', closed: 'Gesloten' }[status] || status;
  }

  function visibilityLabel(v) {
    return { named: 'Op naam', company: 'Bedrijf', anonymous: 'Anoniem', hidden: 'Verborgen' }[v] || v;
  }

  return { get, save, reset, donate, addProject, closeProject, reopenProject, deleteProject, forceDeleteProject, authenticate, getUsers, addUser, deleteUser, euro, pct, timeAgo, statusLabel, visibilityLabel };
})();
