document.addEventListener('DOMContentLoaded', () => {
  /******** Demo Credentials (hardcoded for front-end demo purposes) ********/
  const DEMO_USERNAME = 'admin';
  const DEMO_PASSWORD = 'football123';

  // Cached DOM elements
  const adminBtn = document.getElementById('adminBtn');
  const loginModal = document.getElementById('loginModal');
  const submitLogin = document.getElementById('submitLogin');
  const cancelLogin = document.getElementById('cancelLogin');
  const loginHelp = document.getElementById('loginHelp');

  const teamBtn = document.getElementById('teamBtn');
  const teamSignUpBtn = document.getElementById('teamSignUpBtn');
  const teamLoginModal = document.getElementById('teamLoginModal');
  const submitTeamLogin = document.getElementById('submitTeamLogin');
  const cancelTeamLogin = document.getElementById('cancelTeamLogin');
  const teamLoginHelp = document.getElementById('teamLoginHelp');

  // Sign-up modal elements
  const teamSignUpModal = document.getElementById('teamSignUpModal');
  const submitTeamSignUp = document.getElementById('submitTeamSignUp');
  const cancelTeamSignUp = document.getElementById('cancelTeamSignUp');
  const signTeamName = document.getElementById('signTeamName');
  const signUsername = document.getElementById('signUsername');
  const signPassword = document.getElementById('signPassword');
  const signPasswordConfirm = document.getElementById('signPasswordConfirm');
  const teamSignUpHelp = document.getElementById('teamSignUpHelp');

  const adminSection = document.getElementById('admin');
  const logoutBtn = document.getElementById('logoutBtn');

  const teamSection = document.getElementById('teamAdmin');
  const teamAdminName = document.getElementById('teamAdminName');
  const teamAdminUsername = document.getElementById('teamAdminUsername');
  const changeTeamPasswordBtn = document.getElementById('changeTeamPasswordBtn');
  const teamNewPassword = document.getElementById('teamNewPassword');
  const teamPlayerInput = document.getElementById('teamPlayerInput');
  const addTeamPlayerBtn = document.getElementById('addTeamPlayerBtn');
  const teamPlayersList = document.getElementById('teamPlayersList');

  const teamInput = document.getElementById('teamInput');
  const addTeamBtn = document.getElementById('addTeamBtn');
  const adminTeamsList = document.getElementById('adminTeamsList');
  const teamsList = document.getElementById('teamsList');

  const playerInput = document.getElementById('playerInput');
  const addPlayerBtn = document.getElementById('addPlayerBtn');
  const adminPlayersList = document.getElementById('adminPlayersList');
  const playersList = document.getElementById('playersList');
  const playerTeamSelect = document.getElementById('playerTeamSelect');
  // Additional player detail inputs (admin)
  const playerAge = document.getElementById('playerAge');
  const playerDob = document.getElementById('playerDob');
  const playerCountry = document.getElementById('playerCountry');
  const playerLanguage = document.getElementById('playerLanguage');
  // Team-specific player detail inputs
  const teamPlayerAge = document.getElementById('teamPlayerAge');
  const teamPlayerDob = document.getElementById('teamPlayerDob');
  const teamPlayerCountry = document.getElementById('teamPlayerCountry');
  const teamPlayerLanguage = document.getElementById('teamPlayerLanguage');

  const teamsCount = document.getElementById('teamsCount');
  const playersCount = document.getElementById('playersCount');

  let currentTeamId = null;

  // In-memory data structures (mirrors localStorage)
  let teams = [];
  let players = [];
  let isAdmin = false;

  // --- Local Storage helpers with server fallback ---
  async function loadState(){
    // Attempt to fetch server-side data first (if the Django API is available)
    try{
      const tResp = await fetch('/api/teams/');
      const pResp = await fetch('/api/players/');
      if(tResp.ok && pResp.ok){
        const serverTeams = await tResp.json();
        const serverPlayers = await pResp.json();
        // normalize ids as strings
        teams = serverTeams.map(t => ({ id: String(t.id), name: t.name, username: t.username, password: '' }));
        players = serverPlayers.map(p => ({ id: String(p.id), name: p.name, teamId: p.teamId || '', age: p.age || '', dob: p.dob || '', country: p.country || '', language: p.language || '' }));
        return;
      }
    }catch(e){
      // ignore and fallback to localStorage
    }

    // Fallback to localStorage seeded demo data
    const t = localStorage.getItem('ff_demo_teams');
    const p = localStorage.getItem('ff_demo_players');
    teams = t ? JSON.parse(t) : [
      {id:uid(), name:'Lions', username:'lions_admin', password:'lions123'},
      {id:uid(), name:'Tigers', username:'tigers_admin', password:'tigers123'},
      {id:uid(), name:'Eagles', username:'eagles_admin', password:'eagles123'}
    ];
    teams = teams.map(tt => ({...tt, username: tt.username || slug(tt.name) + '_admin', password: tt.password || 'team123'}));

    players = p ? JSON.parse(p) : [
      {id:uid(), name:'Alex Morgan', teamId:teams[0].id, age:30, dob:'1995-01-20', country:'USA', language:'English'},
      {id:uid(), name:'Chris Paul', teamId:teams[1].id, age:28, dob:'1997-05-14', country:'England', language:'English'},
      {id:uid(), name:'Sam Johnson', teamId:'', age:24, dob:'2001-11-03', country:'Australia', language:'English'}
    ];
    players = players.map(pp => ({...pp, age: pp.age || '', dob: pp.dob || '', country: pp.country || '', language: pp.language || ''}));
  }
  function saveState(){
    localStorage.setItem('ff_demo_teams', JSON.stringify(teams));
    localStorage.setItem('ff_demo_players', JSON.stringify(players));
  }

  // Utility: generate a short unique id
  function uid(){
    return Math.random().toString(36).slice(2,9);
  }

  // --- Rendering functions ---
  function renderCounts(){
    teamsCount.textContent = teams.length;
    playersCount.textContent = players.length;
  }

  function renderTeams(){
    teamsList.innerHTML = '';
    teams.forEach(t => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div><strong>${escapeHtml(t.name)}</strong><br><small class=\"small\">Team ID: ${t.id}</small></div>`;
      teamsList.appendChild(el);
    });

    adminTeamsList.innerHTML = '';
    teams.forEach(t => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div><strong>${escapeHtml(t.name)}</strong><small> • ${t.id}</small></div><div><button class=\"del\" data-id=\"${t.id}\">Delete</button> <button class=\"show-creds\" data-id=\"${t.id}\">Creds</button></div>`;
      adminTeamsList.appendChild(el);
    });

    playerTeamSelect.innerHTML = '<option value="">Unassigned</option>';
    teams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      playerTeamSelect.appendChild(opt);
    });

    adminTeamsList.querySelectorAll('.del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteTeam(id);
      });
    });

    adminTeamsList.querySelectorAll('.show-creds').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const team = teams.find(tt => tt.id === id);
        if(team) alert(`Credentials for ${team.name}\nUsername: ${team.username}\nPassword: ${team.password}`);
      });
    });
  }

  function renderPlayers(){
    playersList.innerHTML = '';
    players.forEach(p => {
      const teamName = teams.find(t => t.id === p.teamId)?.name || 'Unassigned';
      const details = [];
      if(p.age) details.push(`Age: ${escapeHtml(p.age)}`);
      if(p.dob) details.push(`DOB: ${escapeHtml(p.dob)}`);
      if(p.country) details.push(`${escapeHtml(p.country)}`);
      if(p.language) details.push(`${escapeHtml(p.language)}`);
      const detailsLine = details.length ? `<br><small class=\"small\">${details.join(' • ')}</small>` : '';
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div><strong>${escapeHtml(p.name)}</strong><br><small class=\"small\">${escapeHtml(teamName)}</small>${detailsLine}</div>`;
      playersList.appendChild(el);
    });

    adminPlayersList.innerHTML = '';
    players.forEach(p => {
      const teamName = teams.find(t => t.id === p.teamId)?.name || 'Unassigned';
      const details = [];
      if(p.age) details.push(`Age: ${escapeHtml(p.age)}`);
      if(p.dob) details.push(`DOB: ${escapeHtml(p.dob)}`);
      if(p.country) details.push(`${escapeHtml(p.country)}`);
      if(p.language) details.push(`${escapeHtml(p.language)}`);
      const detailsLine = details.length ? `<br><small class=\"small\">${details.join(' • ')}</small>` : '';
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div><strong>${escapeHtml(p.name)}</strong><small> • ${escapeHtml(teamName)}</small>${detailsLine}</div><div><button class=\"del\" data-id=\"${p.id}\">Delete</button></div>`;
      adminPlayersList.appendChild(el);
    });

    adminPlayersList.querySelectorAll('.del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deletePlayer(id);
      });
    });
  }

  // Escape HTML to avoid XSS from demo inputs
  function escapeHtml(str){
    return String(str).replace(/[&<>\"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
    })[s]);
  }

  // --- CRUD operations ---
  function addTeam(name){
    name = name && name.trim();
    if(!name) return alert('Team name is required');
    const username = slug(name) + '_admin';
    const password = 'team123';
    const t = {id:uid(), name, username, password};
    teams.push(t);
    saveState();
    renderTeams(); renderCounts();
    alert(`Team created.\nUsername: ${username}\nPassword: ${password}`);
  }

  function deleteTeam(id){
    if(!confirm('Delete this team? Players assigned will become Unassigned.')) return;
    teams = teams.filter(t => t.id !== id);
    players = players.map(p => p.teamId === id ? {...p, teamId:''} : p);
    if(currentTeamId === id) hideTeamDashboard();
    saveState(); renderTeams(); renderPlayers(); renderCounts();
  }

  function addPlayer(name, teamId, details = {}){
    name = name && name.trim();
    if(!name) return alert('Player name is required');
    const p = {
      id:uid(),
      name,
      teamId: teamId || '',
      age: details.age || '',
      dob: details.dob || '',
      country: details.country || '',
      language: details.language || ''
    };
    players.push(p);
    saveState(); renderPlayers(); renderCounts();
  }

  function deletePlayer(id){
    const player = players.find(p => p.id === id);
    if(!player) return;
    if(!confirm('Delete this player?')) return;
    if(!isAdmin && currentTeamId && player.teamId !== currentTeamId){
      alert('Not authorized to delete this player');
      return;
    }
    players = players.filter(p => p.id !== id);
    saveState(); renderPlayers(); renderCounts();
    if(currentTeamId) renderTeamPlayers();
  }

  // --- Auth / Modal handling ---
  function openLogin(){
    loginModal.classList.add('show');
    loginModal.setAttribute('aria-hidden', 'false');
    document.getElementById('username').focus();
  }
  function closeLogin(){
    loginModal.classList.remove('show');
    loginModal.setAttribute('aria-hidden', 'true');
    loginHelp.textContent = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  }

  function loginAttempt(){
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    if(u === DEMO_USERNAME && p === DEMO_PASSWORD){
      isAdmin = true;
      closeLogin();
      showAdmin();
    } else {
      loginHelp.textContent = 'Invalid credentials. Demo username: "admin" password: "football123"';
      loginHelp.style.color = 'var(--danger)';
    }
  }

  function showAdmin(){
    adminSection.classList.add('show');
    adminSection.setAttribute('aria-hidden', 'false');
    adminBtn.style.display = 'none';
    adminSection.scrollIntoView({behavior:'smooth'});
  }

  function logout(){
    isAdmin = false;
    adminSection.classList.remove('show');
    adminSection.setAttribute('aria-hidden', 'true');
    adminBtn.style.display = '';
  }

  function slug(str){
    return String(str).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  // --- TEAM AUTH & DASHBOARD ---
  function openTeamLogin(){
    teamLoginModal.classList.add('show');
    teamLoginModal.setAttribute('aria-hidden', 'false');
    document.getElementById('teamUsername').focus();
  }
  function closeTeamLogin(){
    teamLoginModal.classList.remove('show');
    teamLoginModal.setAttribute('aria-hidden', 'true');
    teamLoginHelp.textContent = '';
    document.getElementById('teamUsername').value = '';
    document.getElementById('teamPassword').value = '';
  }

  function openTeamSignUp(){
    teamSignUpModal.classList.add('show');
    teamSignUpModal.setAttribute('aria-hidden', 'false');
    signTeamName.focus();
  }
  function closeTeamSignUp(){
    teamSignUpModal.classList.remove('show');
    teamSignUpModal.setAttribute('aria-hidden', 'true');
    teamSignUpHelp.textContent = '';
    signTeamName.value = '';
    signUsername.value = '';
    signPassword.value = '';
    signPasswordConfirm.value = '';
  }

  function teamLoginAttempt(){
    const u = document.getElementById('teamUsername').value.trim();
    const p = document.getElementById('teamPassword').value;
    const match = teams.find(t => t.username === u && t.password === p);
    if(match){
      currentTeamId = match.id;
      closeTeamLogin();
      showTeamDashboard(match.id);
    } else {
      teamLoginHelp.textContent = 'Invalid credentials.';
      teamLoginHelp.style.color = 'var(--danger)';
    }
  }

  function teamSignUpAttempt(){
    const name = signTeamName.value && signTeamName.value.trim();
    const username = signUsername.value && signUsername.value.trim();
    const pass = signPassword.value || '';
    const pass2 = signPasswordConfirm.value || '';

    if(!name) return (teamSignUpHelp.textContent = 'Team name is required');
    if(!username) return (teamSignUpHelp.textContent = 'Username is required');
    if(pass.length < 6) return (teamSignUpHelp.textContent = 'Password must be at least 6 characters');
    if(pass !== pass2) return (teamSignUpHelp.textContent = 'Passwords do not match');
    if(teams.find(t => t.username.toLowerCase() === username.toLowerCase())) return (teamSignUpHelp.textContent = 'Username already taken');
    if(teams.find(t => t.name.toLowerCase() === name.toLowerCase())) return (teamSignUpHelp.textContent = 'Team name already exists');

    const t = {id:uid(), name, username, password: pass};
    teams.push(t);
    saveState();
    renderTeams(); renderCounts();
    alert('Team account created successfully. You are now logged in as the team.');
    currentTeamId = t.id;
    closeTeamSignUp();
    showTeamDashboard(t.id);
  }

  function showTeamDashboard(teamId){
    const team = teams.find(t => t.id === teamId);
    if(!team) return;
    teamSection.classList.add('show');
    teamSection.setAttribute('aria-hidden', 'false');
    teamAdminName.textContent = team.name;
    teamAdminUsername.textContent = team.username;
    teamBtn.style.display = 'none';
    renderTeamPlayers();
    teamSection.scrollIntoView({behavior:'smooth'});
  }

  function hideTeamDashboard(){
    currentTeamId = null;
    teamSection.classList.remove('show');
    teamSection.setAttribute('aria-hidden', 'true');
    teamBtn.style.display = '';
  }

  function renderTeamPlayers(){
    teamPlayersList.innerHTML = '';
    const teamPlayers = players.filter(p => p.teamId === currentTeamId);
    teamPlayers.forEach(p => {
      const details = [];
      if(p.age) details.push(`Age: ${escapeHtml(p.age)}`);
      if(p.dob) details.push(`DOB: ${escapeHtml(p.dob)}`);
      if(p.country) details.push(`${escapeHtml(p.country)}`);
      if(p.language) details.push(`${escapeHtml(p.language)}`);
      const detailsLine = details.length ? `<br><small class=\"small\">${details.join(' • ')}</small>` : '';
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div><strong>${escapeHtml(p.name)}</strong><br><small class=\"small\">${escapeHtml(p.id)}</small>${detailsLine}</div><div><button class=\"del\" data-id=\"${p.id}\">Delete</button></div>`;
      teamPlayersList.appendChild(el);
    });

    teamPlayersList.querySelectorAll('.del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deletePlayer(id);
      });
    });
  }

  function changeTeamPassword(newPass){
    if(!currentTeamId) return;
    if(!newPass) return alert('Password required');
    const team = teams.find(t => t.id === currentTeamId);
    team.password = newPass;
    saveState();
    alert('Password updated');
  }

  // --- Wiring up event listeners ---
  adminBtn.addEventListener('click', openLogin);
  cancelLogin.addEventListener('click', closeLogin);
  submitLogin.addEventListener('click', loginAttempt);
  document.getElementById('password').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') loginAttempt(); });
  document.getElementById('username').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') document.getElementById('password').focus(); });

  teamBtn.addEventListener('click', openTeamLogin);
  cancelTeamLogin.addEventListener('click', closeTeamLogin);
  submitTeamLogin.addEventListener('click', teamLoginAttempt);
  document.getElementById('teamPassword').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') teamLoginAttempt(); });
  document.getElementById('teamUsername').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') document.getElementById('teamPassword').focus(); });

  teamSignUpBtn.addEventListener('click', openTeamSignUp);
  cancelTeamSignUp.addEventListener('click', closeTeamSignUp);
  submitTeamSignUp.addEventListener('click', teamSignUpAttempt);
  document.getElementById('signPasswordConfirm').addEventListener('keyup', (e)=>{ if(e.key === 'Enter') teamSignUpAttempt(); });

  loginModal.addEventListener('click', (e)=>{ if(e.target === loginModal) closeLogin(); });
  teamLoginModal.addEventListener('click', (e)=>{ if(e.target === teamLoginModal) closeTeamLogin(); });
  teamSignUpModal.addEventListener('click', (e)=>{ if(e.target === teamSignUpModal) closeTeamSignUp(); });

  logoutBtn.addEventListener('click', () => { if(confirm('Logout?')) logout(); });
  teamLogoutBtn.addEventListener('click', () => { if(confirm('Logout?')) hideTeamDashboard(); });

  addTeamBtn.addEventListener('click', () => { addTeam(teamInput.value); teamInput.value=''; });
  addPlayerBtn.addEventListener('click', () => {
    addPlayer(playerInput.value, playerTeamSelect.value, {
      age: playerAge.value.trim(),
      dob: playerDob.value,
      country: playerCountry.value.trim(),
      language: playerLanguage.value.trim()
    });
    playerInput.value=''; playerTeamSelect.value=''; playerAge.value=''; playerDob.value=''; playerCountry.value=''; playerLanguage.value='';
  });

  changeTeamPasswordBtn.addEventListener('click', () => { changeTeamPassword(teamNewPassword.value.trim()); teamNewPassword.value=''; });
  addTeamPlayerBtn.addEventListener('click', () => { if(!currentTeamId) return alert('Not logged in as team'); addPlayer(teamPlayerInput.value, currentTeamId, {age: teamPlayerAge.value.trim(), dob: teamPlayerDob.value, country: teamPlayerCountry.value.trim(), language: teamPlayerLanguage.value.trim()}); teamPlayerInput.value=''; teamPlayerAge.value=''; teamPlayerDob.value=''; teamPlayerCountry.value=''; teamPlayerLanguage.value=''; renderTeamPlayers(); });

  teamInput.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') { addTeam(teamInput.value); teamInput.value=''; } });
  playerInput.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') {
    addPlayer(playerInput.value, playerTeamSelect.value, {age: playerAge.value.trim(), dob: playerDob.value, country: playerCountry.value.trim(), language: playerLanguage.value.trim()});
    playerInput.value=''; playerTeamSelect.value=''; playerAge.value=''; playerDob.value=''; playerCountry.value=''; playerLanguage.value='';
  } });

  teamPlayerInput.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') { if(!currentTeamId) return alert('Not logged in as team'); addPlayer(teamPlayerInput.value, currentTeamId, {age: teamPlayerAge.value.trim(), dob: teamPlayerDob.value, country: teamPlayerCountry.value.trim(), language: teamPlayerLanguage.value.trim()}); teamPlayerInput.value=''; teamPlayerAge.value=''; teamPlayerDob.value=''; teamPlayerCountry.value=''; teamPlayerLanguage.value=''; renderTeamPlayers(); } });

  teamPlayerLanguage.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') { if(!currentTeamId) return alert('Not logged in as team'); addPlayer(teamPlayerInput.value, currentTeamId, {age: teamPlayerAge.value.trim(), dob: teamPlayerDob.value, country: teamPlayerCountry.value.trim(), language: teamPlayerLanguage.value.trim()}); teamPlayerInput.value=''; teamPlayerAge.value=''; teamPlayerDob.value=''; teamPlayerCountry.value=''; teamPlayerLanguage.value=''; renderTeamPlayers(); } });
  playerLanguage.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') { addPlayer(playerInput.value, playerTeamSelect.value, {age: playerAge.value.trim(), dob: playerDob.value, country: playerCountry.value.trim(), language: playerLanguage.value.trim()}); playerInput.value=''; playerTeamSelect.value=''; playerAge.value=''; playerDob.value=''; playerCountry.value=''; playerLanguage.value=''; } });

  // --- Initialize ---
  async function init(){
    await loadState();
    renderTeams();
    renderPlayers();
    renderCounts();
  }

  init();
});