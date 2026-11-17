// Clean Mock Database
class CampusVote {
    constructor() {
        this.serverElections = [];
        this.currentUser = null;
        this.selectedRole = null;
        this.chartInstances = {}; 

        this.findDOMElements();
        this.setupEventListeners();
        this.checkLoginSession();
    }

    findDOMElements() {
        this.views = {
            landing: document.getElementById('landing-view'),
            login: document.getElementById('login-view'),
            student: document.getElementById('student-view'),
            admin: document.getElementById('admin-view')
        };
        this.themeToggle = document.getElementById('theme-toggle');
        this.logoutBtn = document.getElementById('logout-btn');
        this.loginForm = document.getElementById('login-form');
        this.loginTitle = document.getElementById('login-title');
        this.loginError = document.getElementById('login-error');
        this.toastContainer = document.getElementById('toast-container');
        
        this.activeElectionsContainer = document.getElementById('active-elections-container');
        this.studentHistoryRows = document.getElementById('student-history-rows');
        this.studentSearch = document.getElementById('student-search');

        this.adminElectionRows = document.getElementById('admin-election-rows');
        this.electionModal = document.getElementById('election-modal');
        this.createElectionForm = document.getElementById('create-election-form');
        this.dynamicCandidatesList = document.getElementById('dynamic-candidates-list');
    }


    alertUser(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-bell"></i> <span>${message}</span>`;
        this.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    checkLoginSession() {
        const user = sessionStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.logoutBtn.classList.remove('hidden');
            this.showView(this.currentUser.role === 'admin' ? 'admin-view' : 'student-view');
        } else {
            this.showView('landing-view');
        }
    }

    async showView(viewId) {
    Object.values(this.views).forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');

    if (viewId === 'student-view') {
        await this.loadElectionsFromServer();
    }

    if (viewId === 'admin-view') {
        await this.loadElectionsFromServer();
        await this.renderAdminDashboard();
    }
}

    setupEventListeners() {
        // Theme button click
        this.themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('themePreference', isDark ? 'dark-mode' : 'light-mode');
            this.themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });

        // Navigation links
        document.querySelectorAll('.navigate-login').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedRole = e.currentTarget.getAttribute('data-role');
                this.loginTitle.innerText = this.selectedRole === 'admin' ? 'Sign in as Admin' : 'Sign in as Student';
                this.loginError.innerText = '';
                this.loginForm.reset();
                this.showView('login-view');
            });
        });

        document.querySelectorAll('.back-to-landing').forEach(btn => {
            btn.addEventListener('click', () => this.showView('landing-view'));
        });

       // Submit login form
this.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: userVal,
                password: passVal
            })
        });

        const data = await response.json();

        if (data.success && data.role === this.selectedRole) {

            this.currentUser = {
                id: data.userId,
                name: data.name,
                role: data.role
            };

            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            this.logoutBtn.classList.remove('hidden');

            this.alertUser(`Welcome back, ${data.name}!`, 'success');

            this.showView(data.role === 'admin' ? 'admin-view' : 'student-view');

        } else {
            this.loginError.innerText = "Wrong username or password! Please try again.";
        }

    } catch (error) {
        console.error(error);
        this.loginError.innerText = "Unable to connect to server. Please try again.";
    }
});

        // Log out button
        this.logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            this.currentUser = null;
            this.logoutBtn.classList.add('hidden');
            this.alertUser("Logged out successfully.");
            this.showView('landing-view');
        });

        // Student Dashboard Tabs toggle
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                e.currentTarget.classList.add('active');
                document.getElementById(e.currentTarget.getAttribute('data-tab')).classList.remove('hidden');
            });
        });

        this.studentSearch.addEventListener('input', () => this.renderStudentDashboard());

        // Admin Modal popup triggers
        document.getElementById('open-modal-btn').addEventListener('click', () => {
            this.dynamicCandidatesList.innerHTML = '';
            this.addNewCandidateInputRow();
            this.addNewCandidateInputRow();
            this.electionModal.classList.remove('hidden');
        });

        document.getElementById('close-modal-btn').addEventListener('click', () => this.electionModal.classList.add('hidden'));
        document.getElementById('add-candidate-row-btn').addEventListener('click', () => this.addNewCandidateInputRow());

        // Create new election form submission
        this.createElectionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('el-title').value.trim();
            const type = document.getElementById('el-type').value;

            const blocks = this.dynamicCandidatesList.querySelectorAll('.candidate-input-block');
            const candidates = Array.from(blocks).map((b, i) => ({
                id: `c_${Date.now()}_${i}`,
                name: b.querySelector('.c-name').value.trim(),
                manifesto: b.querySelector('.c-manifesto').value.trim(),
            }));

            const electionId = `e_${Date.now()}`;

try {
    const electionResponse = await fetch('/api/elections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: electionId,
            title: title,
            type: type,
            status: 'upcoming',
            resultsPublished: false
        })
    });

    if (!electionResponse.ok) {
        throw new Error('Failed to create election');
    }

    for (const candidate of candidates) {
        const candidateResponse = await fetch('/api/candidates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: candidate.id,
                name: candidate.name,
                manifesto: candidate.manifesto,
                electionId: electionId
            })
        });

        if (!candidateResponse.ok) {
            throw new Error('Failed to add candidate');
        }
    }

    this.alertUser("New election setup created!", "success");
    this.electionModal.classList.add('hidden');
    this.createElectionForm.reset();

} catch (error) {
    console.error("Error creating election:", error);
    this.alertUser("Unable to create election.", "error");
}
        });
    }

    addNewCandidateInputRow() {
        const count = this.dynamicCandidatesList.children.length + 1;
        const block = document.createElement('div');
        block.className = 'candidate-input-block';
        block.innerHTML = `
            <h5>Candidate Name #${count}</h5>
            ${count > 2 ? `<button type="button" class="btn-delete-candidate"><i class="fas fa-trash"></i></button>` : ''}
            <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.4rem;">
                <input type="text" class="c-name" required placeholder="Enter candidate's full name">
                <input type="text" class="c-manifesto" required placeholder="What is their election promise/motto?">
            </div>
        `;
        if(count > 2) {
            block.querySelector('.btn-delete-candidate').addEventListener('click', () => block.remove());
        }
        this.dynamicCandidatesList.appendChild(block);
    }

    async loadElectionsFromServer() {
        
    try {
        const response = await fetch('/api/elections');

        if (!response.ok) {
            throw new Error('Failed to load elections');
        }

        const elections = await response.json();

        for (const election of elections) {
            const candidateResponse = await fetch(
                `/api/candidates/election/${election.id}`
            );

            if (!candidateResponse.ok) {
                throw new Error('Failed to load candidates');
            }

            election.candidates = await candidateResponse.json();
        }

        console.log("Elections from MySQL:", elections);

        this.serverElections = elections;

        this.renderStudentDashboard();

        return elections;

    } catch (error) {
        console.error("Error loading elections:", error);
        this.alertUser("Unable to load elections from server.", "error");
        return [];
    }
}
async loadCandidatesFromServer(electionId) {
    try {
        const response = await fetch(
            `/api/candidates/election/${electionId}`
        );

        if (!response.ok) {
            throw new Error('Failed to load candidates');
        }

        const candidates = await response.json();

        console.log("Candidates from MySQL:", candidates);

        return candidates;
    } catch (error) {
        console.error("Error loading candidates:", error);
        this.alertUser("Unable to load candidates from server.", "error");
        return [];
    }
}
async loadResultsFromServer(electionId) {
    try {
        const response = await fetch(
            `/api/votes/results/${electionId}`
        );

        if (!response.ok) {
            throw new Error('Failed to load results');
        }

        const results = await response.json();

        console.log("Results from MySQL:", results);

        return results;

    } catch (error) {
        console.error("Error loading results:", error);
        this.alertUser("Unable to load election results.", "error");
        return [];
    }
}


    /* RENDER STUDENT SCREEN */
    async renderStudentDashboard(){
        document.getElementById('student-name').innerText = this.currentUser.name;
        const query = this.studentSearch.value.toLowerCase();
        this.activeElectionsContainer.innerHTML = '';

        const historyResponse = await fetch(
    `/api/votes/history/${this.currentUser.id}`
);

const votingHistory = await historyResponse.json();

        const filteredList = this.serverElections.filter(e => 
    e.title.toLowerCase().includes(query)
);

        if (filteredList.length === 0) {
            this.activeElectionsContainer.innerHTML = `<p style="padding:1rem; color:var(--text-main);">No active elections found right now.</p>`;
            return;
        }
        const candidatesByElection = {};

await Promise.all(
    filteredList.map(async election => {
        candidatesByElection[election.id] =
            await this.loadCandidatesFromServer(election.id);
    })
);

filteredList.forEach(election => {

        
            const staticHasVoted = votingHistory.some(
    vote => vote.electionId === election.id
);

            const card = document.createElement('div');
            card.className = 'election-wrapper-card';

            let badge = `<span class="badge-status ${election.status === 'active' ? 'active' : 'completed'}">${election.status}</span>`;
            if (election.status === 'upcoming') badge = `<span class="badge-status" style="background:#ffeaa7; color:#d63031;">Not Started</span>`;

            let candidatesHTML = '';
            candidatesByElection[election.id].forEach(c => {
                let voteButton = '';
                if (election.status === 'active' && !staticHasVoted) {
                    voteButton = `<button class="btn btn-primary btn-vote" data-el="${election.id}" data-cand="${c.id}" data-name="${c.name}">Vote</button>`;
                }
                candidatesHTML += `
                    <div class="candidate-item">
                        <div class="candidate-avatar"><i class="fas fa-user"></i></div>
                        <div class="candidate-info">
                            <h5>${c.name}</h5>
                            <p>"${c.manifesto}"</p>
                        </div>
                        ${voteButton}
                    </div>
                `;
            });

            let resultsBlock = '';
            if (election.status === 'completed') {
                if (election.resultsPublished) {
                    resultsBlock = `<div class="chart-wrapper"><canvas id="c_std_${election.id}"></canvas></div>`;
                } else {
                    resultsBlock = `<p style="color:var(--danger); font-size:0.85rem; font-weight:700;"><i class="fas fa-lock"></i> Voting ended. Results are being calculated by teacher admin.</p>`;
                }
            } else if (staticHasVoted) {
                resultsBlock = `<p style="color:#00b894; font-weight:700;"><i class="fas fa-check-circle"></i> You have already voted in this election.</p>`;
            }

            card.innerHTML = `
                <div class="election-card-header">
                    <h4>${election.title}</h4>
                    <span class="election-badge">${election.type}</span>
                </div>
                ${badge}
                <div style="display:flex; flex-direction:column; gap:0.5rem; margin:1rem 0;">${candidatesHTML}</div>
                ${resultsBlock}
            `;
            this.activeElectionsContainer.appendChild(card);
            
            if (election.status === 'completed' && election.resultsPublished) {
                this.drawSimpleChart(`c_std_${election.id}`, election);
            }
        });

        // Click vote action listener
        document.querySelectorAll('.btn-vote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.processVote(
                    e.currentTarget.getAttribute('data-el'),
                    e.currentTarget.getAttribute('data-cand'),
                    e.currentTarget.getAttribute('data-name')
                );
            });
        });

        //Load voting history from backend
     this.loadVotingHistory();
}

async loadVotingHistory() {
    try {
        const response = await fetch(
            `/api/votes/history/${this.currentUser.id}`
        );

        if (!response.ok) {
            throw new Error('Failed to load voting history');
        }

        const history = await response.json();

        this.studentHistoryRows.innerHTML = '';

        if (history.length === 0) {
            this.studentHistoryRows.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        You haven't participated in any election runs yet.
                    </td>
                </tr>
            `;
            return;
        }

        history.forEach(vote => {
            const election = this.serverElections.find(
                e => e.id === vote.electionId
            );

            const votedDate = vote.votedAt
                ? new Date(vote.votedAt).toLocaleDateString()
                : 'N/A';

            this.studentHistoryRows.innerHTML += `
                <tr>
                    <td><strong>${election ? election.title : 'Unknown Election'}</strong></td>
                    <td>${election ? election.type : 'N/A'}</td>
                    <td><span class="badge-status completed">Submitted</span></td>
                    <td>Voted successfully on ${votedDate}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error loading voting history:", error);

        this.studentHistoryRows.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;">
                    Unable to load voting history.
                </td>
            </tr>
        `;
    }
}

async processVote(elId, candId, candName) {
    try {
        const response = await fetch('/api/votes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: this.currentUser.id,
                electionId: elId,
                candidateId: candId
            })
        });

        const data = await response.json();

        if (data.success) {
            this.alertUser("Your vote was submitted successfully! 👍", "success");

            await this.loadElectionsFromServer();
        } else {
            this.alertUser(data.message, "error");
        }

    } catch (error) {
        console.error("Error submitting vote:", error);
        this.alertUser("Unable to submit vote. Please try again.", "error");
    }
}
    /* RENDER ADMIN CONSOLE */

    async renderAdminDashboard() {

        const studentResponse = await fetch(
    '/api/students/count'
);

const studentData = await studentResponse.json();

const studentCount = studentData.count;
        
        const liveCount = this.serverElections.filter(e => e.status === 'active').length;
        
        const voterResponse = await fetch(
    '/api/votes/voters/count'
);

const voterData = await voterResponse.json();

const voterCount = voterData.count;

const turnoutPct = studentCount > 0
    ? Math.round((voterCount / studentCount) * 100)
    : 0;

        document.getElementById('metric-active').innerText = liveCount;
        document.getElementById('metric-turnout').innerText = `${turnoutPct}%`;
        document.getElementById('metric-voters').innerText = studentCount;

        this.adminElectionRows.innerHTML = '';
        this.serverElections.forEach((el) => {
            const tr = document.createElement('tr');
            
            let badge = `<span class="badge-status completed">${el.status}</span>`;
            if (el.status === 'active') badge = `<span class="badge-status active">Live</span>`;
            if (el.status === 'upcoming') badge = `<span class="badge-status" style="background:#ffeaa7; color:#d63031;">Staged</span>`;

            let toggleStateBtn = '';
            if (el.status === 'upcoming') {
                toggleStateBtn = `<button class="btn btn-primary btn-sm btn-state" data-id="${el.id}" data-next="active"><i class="fas fa-play"></i> Start</button>`;
            } else if (el.status === 'active') {
                toggleStateBtn = `<button class="btn btn-sm btn-state" style="background-color:var(--danger); color:white;" data-id="${el.id}" data-next="completed"><i class="fas fa-stop"></i> End</button>`;
            } else {
                toggleStateBtn = `<span style="color:#b2bec3; font-size:0.85rem;">Archived</span>`;
            }

            let viewResultsToggle = 'N/A';
            if (el.status === 'completed') {
                viewResultsToggle = el.resultsPublished
                    ? `<button class="btn btn-outline btn-sm btn-publish" data-id="${el.id}" data-action="hide"><i class="fas fa-eye-slash"></i> Hide</button>`
                    : `<button class="btn btn-primary btn-sm btn-publish" data-id="${el.id}" data-action="show"><i class="fas fa-eye"></i> Publish</button>`;
            }

            let nameColHTML = `<div><strong>${el.title}</strong></div>`;
            if(el.status === 'completed' && el.resultsPublished) {
                nameColHTML += `<div class="chart-wrapper" style="max-width:240px;"><canvas id="c_adm_${el.id}"></canvas></div>`;
            }

            tr.innerHTML = `
                <td>${nameColHTML}</td>
                <td>${el.type}</td>
                <td>${el.candidates.length} Profiles</td>
                <td>${badge}</td>
                <td>${toggleStateBtn}</td>
                <td>${viewResultsToggle}</td>
            `;
            this.adminElectionRows.appendChild(tr);
            
            if(el.status === 'completed' && el.resultsPublished) {
                this.drawSimpleChart(`c_adm_${el.id}`, el);
            }
        });

        // Attach buttons handlers for phase modifiers
        document.querySelectorAll('.btn-state').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const state = e.currentTarget.getAttribute('data-next');

        try {
            const response = await fetch(
                `/api/elections/${id}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: state
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update election status');
            }

            this.alertUser(`Election is now ${state}!`, 'success');

            await this.loadElectionsFromServer();
            this.renderAdminDashboard();

        } catch (error) {
            console.error("Error updating election status:", error);
            this.alertUser("Unable to update election status.", "error");
        }
    });
});

        document.querySelectorAll('.btn-publish').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const action = e.currentTarget.getAttribute('data-action');

        try {
            const response = await fetch(
                `/api/elections/${id}/results`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        published: action === 'show'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update results visibility');
            }

            this.alertUser(
                action === 'show'
                    ? "Results are now public!"
                    : "Results hidden.",
                "success"
            );

            await this.loadElectionsFromServer();
            this.renderAdminDashboard();

        } catch (error) {
            console.error("Error updating results visibility:", error);
            this.alertUser(
                "Unable to update results visibility.",
                "error"
            );
        }
    });
});
    }

    /* CHART DRAWER METHOD */
    async drawSimpleChart(canvasId, election) {
    setTimeout(async () => {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        const results = await this.loadResultsFromServer(election.id);

        const labels = results.map(result => result[1]);
        const data = results.map(result => result[2]);

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: '#a29bfe',
                    borderColor: '#6c5ce7',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }, 5);
}
}

// Kickstart script execution context
document.addEventListener('DOMContentLoaded', () => {
    window.CampusVoteInstance = new CampusVote();
});