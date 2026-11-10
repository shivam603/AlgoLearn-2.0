/**
 * AlgoLearn Progress Dashboard, Hexagon Skill Radar & Global Leaderboard Client
 */

(function () {
    'use strict';

    function esc(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderHexagonRadar(topicStats) {
        const container = document.getElementById('dash-skill-radar');
        if (!container) return;

        const entries = Object.entries(topicStats || {});
        if (!entries.length) {
            container.innerHTML = '<div class="text-muted small text-center py-4">No topic telemetry yet.</div>';
            return;
        }

        const cx = 165, cy = 145, maxR = 92;
        const n = entries.length;
        const angleFor = (i) => (-Math.PI / 2) + (i * 2 * Math.PI) / n;

        // Concentric guide rings (25%, 50%, 75%, 100%)
        const rings = [0.25, 0.5, 0.75, 1].map(scale => {
            const pts = entries.map((_, i) => {
                const a = angleFor(i);
                const x = cx + Math.cos(a) * maxR * scale;
                const y = cy + Math.sin(a) * maxR * scale;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');
            return `<polygon points="${pts}" fill="none" stroke="rgba(148,163,184,0.35)" stroke-width="1" />`;
        }).join('');

        // Axis spokes & short labels
        const shortName = {
            'Arrays & Hashing': 'Arrays',
            'Stack & Queue': 'Stack/Queue',
            'Searching': 'Searching',
            'Sorting & Intervals': 'Sorting',
            'Dynamic Programming': 'DP',
            'Graphs & Trees': 'Graphs/Trees'
        };

        const spokesAndLabels = entries.map(([name, val], i) => {
            const a = angleFor(i);
            const ex = cx + Math.cos(a) * maxR;
            const ey = cy + Math.sin(a) * maxR;
            const lx = cx + Math.cos(a) * (maxR + 24);
            const ly = cy + Math.sin(a) * (maxR + 20);
            const anchor = Math.abs(Math.cos(a)) < 0.25 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
            const label = shortName[name] || name;
            return `
                <line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="rgba(148,163,184,0.3)" stroke-width="1" />
                <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="currentColor" font-size="10.5" font-weight="700" text-anchor="${anchor}" dominant-baseline="middle">${esc(label)} (${Math.round(val)}%)</text>
            `;
        }).join('');

        // Value polygon
        const dataPts = entries.map(([, val], i) => {
            const pct = Math.max(0.1, Math.min(1, Number(val || 0) / 100));
            const a = angleFor(i);
            const x = cx + Math.cos(a) * maxR * pct;
            const y = cy + Math.sin(a) * maxR * pct;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');

        const dots = entries.map(([, val], i) => {
            const pct = Math.max(0.1, Math.min(1, Number(val || 0) / 100));
            const a = angleFor(i);
            const x = cx + Math.cos(a) * maxR * pct;
            const y = cy + Math.sin(a) * maxR * pct;
            return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#0ea5e9" stroke="#ffffff" stroke-width="1.5" />`;
        }).join('');

        container.innerHTML = `
            <svg viewBox="0 0 330 290" aria-label="DSA Topic Mastery Radar">
                ${rings}
                ${spokesAndLabels}
                <polygon points="${dataPts}" fill="rgba(14, 165, 233, 0.25)" stroke="#0ea5e9" stroke-width="2.2" />
                ${dots}
            </svg>
        `;
    }

    let allProblems = [];
    let currentDiff = 'All';
    let currentQuery = '';
    let currentProfile = null;

    function updateSolvedSummary() {
        const solvedSet = new Set(currentProfile?.solvedProblems || []);
        const total = allProblems.length || 100;
        const solvedEl = document.getElementById('stat-solved');
        const bdEl = document.getElementById('stat-solved-breakdown');
        if (solvedEl) solvedEl.textContent = `${solvedSet.size} / ${total}`;
        if (bdEl && allProblems.length) {
            const countDiff = (d) => {
                const sub = allProblems.filter(p => p.difficulty === d);
                const done = sub.filter(p => p.solved || solvedSet.has(p.id)).length;
                return `${done}/${sub.length}`;
            };
            bdEl.textContent = `E: ${countDiff('Easy')} · M: ${countDiff('Medium')} · H: ${countDiff('Hard')}`;
        }
    }

    function renderProfile(profile) {
        currentProfile = profile;
        const sec = document.getElementById('dash-profile-section');
        const guestBanner = document.getElementById('dash-guest-banner');
        if (!profile || !sec) {
            if (guestBanner) guestBanner.classList.remove('d-none');
            return;
        }
        guestBanner?.classList.add('d-none');
        sec.classList.remove('d-none');

        const avatar = document.getElementById('dash-avatar');
        const nameEl = document.getElementById('dash-fullname');
        const lvlEl = document.getElementById('dash-level-badge');
        const streakEl = document.getElementById('dash-streak-badge');
        const xpTotalEl = document.getElementById('dash-xp-total');
        const xpNextEl = document.getElementById('dash-xp-next');
        const xpBar = document.getElementById('dash-xp-bar');

        if (avatar) {
            avatar.src = profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.username || 'coder')}`;
        }
        if (nameEl) nameEl.textContent = profile.fullName || profile.username;
        if (lvlEl) lvlEl.textContent = `Level ${profile.level} • ${profile.levelTitle}`;
        if (streakEl) streakEl.innerHTML = `<i class="bi bi-fire"></i> ${profile.streakDays || 1} Day Streak`;
        if (xpTotalEl) xpTotalEl.textContent = `${profile.xp} XP`;
        if (xpNextEl) xpNextEl.textContent = `Next tier at ${profile.nextLevelXp} XP (${profile.progressPct}%)`;
        if (xpBar) xpBar.style.width = `${profile.progressPct}%`;

        updateSolvedSummary();
        document.getElementById('stat-duels').textContent = `${profile.duelsWon || 0} / ${profile.duelsPlayed || 0} Won`;
        document.getElementById('stat-quizzes').textContent = String(profile.quizzesCompleted || 0);
        document.getElementById('stat-langs').textContent = (profile.languagesUsed && profile.languagesUsed.length)
            ? profile.languagesUsed.map(l => l.toUpperCase()).join(', ')
            : 'Ready to code';

        renderHexagonRadar(profile.topicStats);

        const badgesGrid = document.getElementById('dash-badges-grid');
        const badgesSum = document.getElementById('dash-badges-summary');
        const badges = profile.badges || [];
        const earnedCount = badges.filter(b => b.earned).length;
        if (badgesSum) badgesSum.textContent = `${earnedCount} / ${badges.length} Earned`;

        if (badgesGrid) {
            badgesGrid.innerHTML = badges.map(b => `
                <div class="col-sm-6">
                    <div class="dash-badge-tile ${b.earned ? 'earned' : 'locked'}">
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge ${b.earned ? 'bg-info text-dark' : 'bg-secondary'} p-2 rounded-3">
                                <i class="bi ${esc(b.icon)} fs-6"></i>
                            </span>
                            <div>
                                <div class="fw-bold small">${esc(b.name)}</div>
                                <div class="text-muted-custom" style="font-size:0.7rem;">${b.earned ? 'Unlocked' : 'Locked'}</div>
                            </div>
                        </div>
                        <div class="small text-muted-custom" style="font-size:0.74rem;">${esc(b.desc)}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    function renderChecklist(problems) {
        if (problems) allProblems = problems;
        updateSolvedSummary();
        const box = document.getElementById('dash-problem-checklist');
        if (!box) return;
        const q = currentQuery.trim().toLowerCase();
        const filtered = allProblems.filter(p => {
            if (currentDiff !== 'All' && p.difficulty !== currentDiff) return false;
            if (q) {
                const hay = `#${p.leetcodeId || ''} ${p.title} ${p.topic} ${p.difficulty}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
        if (!filtered.length) {
            box.innerHTML = '<div class="text-muted small py-3 text-center">No matching problems found.</div>';
            return;
        }
        box.innerHTML = filtered.map(p => {
            const diffCls = p.difficulty === 'Easy' ? 'bg-success' : p.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger';
            const lc = p.leetcodeId ? `#${p.leetcodeId} ` : '';
            return `
                <div class="dash-problem-row">
                    <a href="codelab.html?mode=problems&problem=${encodeURIComponent(p.id)}" class="d-flex align-items-center gap-2 text-truncate text-decoration-none flex-grow-1" style="color:inherit; min-width:0;">
                        <i class="bi ${p.solved ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} fs-6 flex-shrink-0"></i>
                        <div class="text-truncate">
                            <div class="fw-bold small text-truncate">${lc}${esc(p.title)}</div>
                            <div class="text-muted-custom" style="font-size:0.69rem;">${esc(p.topic)} • ${esc(p.optimalTime)} • +${p.xpReward} XP</div>
                        </div>
                    </a>
                    <div class="d-flex align-items-center gap-1 flex-shrink-0">
                        <span class="badge ${diffCls}" style="font-size:0.66rem;">${esc(p.difficulty)}</span>
                        <a href="codelab.html?mode=problems&problem=${encodeURIComponent(p.id)}&view=visualizer" class="btn btn-xs btn-outline-info py-0 px-1" title="Visualize Algorithm" style="font-size:0.68rem;">
                            <i class="bi bi-bar-chart-fill"></i>
                        </a>
                        <a href="duel.html?problem=${encodeURIComponent(p.id)}" class="btn btn-xs btn-outline-warning py-0 px-1" title="1v1 Duel" style="font-size:0.68rem;">
                            <i class="bi bi-lightning-charge-fill"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    function bindChecklistFilters() {
        const tabs = document.getElementById('dash-diff-tabs');
        const search = document.getElementById('dash-problem-search');
        if (tabs) {
            tabs.querySelectorAll('button[data-diff]').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentDiff = btn.getAttribute('data-diff') || 'All';
                    tabs.querySelectorAll('button[data-diff]').forEach(b => {
                        const d = b.getAttribute('data-diff');
                        const active = d === currentDiff;
                        b.className = `btn btn-xs py-0 px-2 ${active ? 'btn-primary fw-bold' : (d === 'Easy' ? 'btn-outline-success' : d === 'Medium' ? 'btn-outline-warning' : d === 'Hard' ? 'btn-outline-danger' : 'btn-outline-primary')}`;
                    });
                    renderChecklist();
                });
            });
        }
        if (search) {
            search.addEventListener('input', (e) => {
                currentQuery = e.target.value || '';
                renderChecklist();
            });
        }
    }

    function renderLeaderboard(rows) {
        const tbody = document.getElementById('dash-leaderboard-body');
        if (!tbody) return;
        if (!rows || !rows.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center small text-muted py-3">No rankings yet.</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(r => {
            const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`;
            const avatar = r.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(r.username || 'u')}`;
            return `
                <tr class="${r.isCurrentUser ? 'dash-lb-me' : ''}">
                    <td class="fw-bold">${medal}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <img src="${esc(avatar)}" alt="" style="width:26px; height:26px; border-radius:50%; object-fit:cover; background:#0f172a;" />
                            <div>
                                <div class="fw-semibold small">${esc(r.fullName)} ${r.isCurrentUser ? '<span class="badge bg-info text-dark ms-1">You</span>' : ''}</div>
                                <div class="text-muted-custom" style="font-size:0.7rem;">@${esc(r.username)}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge-sky">Lv.${r.level} ${esc(r.levelTitle)}</span></td>
                    <td class="small fw-semibold"><i class="bi bi-fire text-warning"></i> ${r.streakDays}d</td>
                    <td class="small fw-semibold">${r.solvedCount}</td>
                    <td class="small">${r.duelsWon}</td>
                    <td class="fw-bold text-primary">${r.xp} XP</td>
                </tr>
            `;
        }).join('');
    }

    async function loadDashboardData() {
        const token = localStorage.getItem('algolearn_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const reqs = [
            fetch('/api/leaderboard', { headers }).then(r => r.json()).catch(() => null),
            fetch('/api/codelab/problems', { headers }).then(r => r.json()).catch(() => null),
            token ? fetch('/api/gamification/me', { headers }).then(r => r.ok ? r.json() : null).catch(() => null) : Promise.resolve(null)
        ];

        const [lbData, probData, meData] = await Promise.all(reqs);

        if (meData && meData.success && meData.profile) {
            renderProfile(meData.profile);
        } else {
            document.getElementById('dash-guest-banner')?.classList.remove('d-none');
        }

        if (probData && probData.success) {
            renderChecklist(probData.problems || []);
        }

        if (lbData && lbData.success) {
            renderLeaderboard(lbData.leaderboard || []);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        bindChecklistFilters();
        loadDashboardData();
    });
})();

