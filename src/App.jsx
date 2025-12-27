import { useState, useEffect, useRef, useMemo } from 'react'
import './App.css'

const parseLogLine = (line) => {
  const parts = line.split(',');
  if (parts.length < 10 || parts[1] !== 'DamageDone') return null;

  const timestampStr = parts[0];
  const year = timestampStr.substring(0, 4);
  const month = timestampStr.substring(4, 6);
  const day = timestampStr.substring(6, 8);
  const hour = timestampStr.substring(9, 11);
  const min = timestampStr.substring(12, 14);
  const sec = timestampStr.substring(15, 17);
  const ms = timestampStr.substring(18, 21);
  const timestamp = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}.${ms}`).getTime();

  return {
    timestamp,
    skillName: parts[2],
    damage: parseInt(parts[4], 10) || 0,
    isCrit: parts[5]?.trim() === '1',
    isPower: parts[6]?.trim() === '1',
  };
};

const updateHitStats = (stats, damage) => ({
  count: stats.count + 1,
  totalDamage: stats.totalDamage + damage,
  min: stats.min === Infinity ? damage : Math.min(stats.min, damage),
  max: Math.max(stats.max, damage)
});

function App() {
  const [activeFile, setActiveFile] = useState('En attente...');
  const [status, setStatus] = useState('Prêt');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(''); // État pour l'updater
  
  const [displayTotalDamage, setDisplayTotalDamage] = useState(0);
  const [displayDuration, setDisplayDuration] = useState(0);
  const [displaySkills, setDisplaySkills] = useState({});
  const [selectedSkillId, setSelectedSkillId] = useState(null);

  const skillsDataRef = useRef({});
  const totalDamageRef = useRef(0);
  const combatStartRef = useRef(null);
  const combatEndRef = useRef(null);
  const clickTimestampRef = useRef(0);
  const processedLinesRef = useRef(new Set());

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setSelectedSkillId(null); };
    window.addEventListener('keydown', handleEsc);

    const displayInterval = setInterval(() => {
      setDisplayTotalDamage(totalDamageRef.current);
      if (combatStartRef.current) {
        const dur = (combatEndRef.current - combatStartRef.current) / 1000;
        setDisplayDuration(dur > 0 ? dur : 0);
      }
      setDisplaySkills({ ...skillsDataRef.current });
    }, 100);

    if (window.electronAPI) {
      // Ecouteur de mise à jour
      window.electronAPI.onUpdateStatus((msg) => setUpdateStatus(msg));

      window.electronAPI.onLogFileChanged((fileName) => {
        setActiveFile(fileName);
        resetStats();
      });

      window.electronAPI.onNewLogLine((newLine) => {
        const data = parseLogLine(newLine);
        if (data && data.timestamp >= (clickTimestampRef.current - 500)) {
          const lineSignature = `${data.timestamp}-${data.skillName}-${data.damage}`;
          if (processedLinesRef.current.has(lineSignature)) return;
          processedLinesRef.current.add(lineSignature);

          const skillKey = data.skillName;
          if (!skillsDataRef.current[skillKey]) {
            skillsDataRef.current[skillKey] = {
              id: skillKey, name: data.skillName, totalDamage: 0, hits: 0, critHits: 0, powerHits: 0,
              normalStats: { count: 0, totalDamage: 0, min: Infinity, max: 0 },
              critStats: { count: 0, totalDamage: 0, min: Infinity, max: 0 },
              powerStats: { count: 0, totalDamage: 0, min: Infinity, max: 0 }
            };
          }

          const skill = skillsDataRef.current[skillKey];
          skill.totalDamage += data.damage;
          skill.hits += 1;
          if (data.isCrit) { skill.critHits += 1; skill.critStats = updateHitStats(skill.critStats, data.damage); }
          if (data.isPower) { skill.powerHits += 1; skill.powerStats = updateHitStats(skill.powerStats, data.damage); }
          if (!data.isCrit && !data.isPower) { skill.normalStats = updateHitStats(skill.normalStats, data.damage); }

          if (!combatStartRef.current) combatStartRef.current = data.timestamp;
          combatEndRef.current = data.timestamp;
          totalDamageRef.current += data.damage;
        }
      });
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      clearInterval(displayInterval);
    };
  }, []);

  const resetStats = () => {
    totalDamageRef.current = 0; skillsDataRef.current = {}; combatStartRef.current = null;
    combatEndRef.current = null; processedLinesRef.current.clear();
    setDisplayTotalDamage(0); setDisplayDuration(0); setDisplaySkills({}); setSelectedSkillId(null);
  };

  const sortedSkills = useMemo(() => {
    const safeDuration = displayDuration < 1 ? 1 : displayDuration;
    return Object.values(displaySkills).sort((a, b) => b.totalDamage - a.totalDamage).map((skill, index) => ({
      ...skill, rank: index + 1,
      ratio: displayTotalDamage > 0 ? ((skill.totalDamage / displayTotalDamage) * 100).toFixed(1) : 0,
      dps: Math.round(skill.totalDamage / safeDuration),
      critRate: skill.hits > 0 ? Math.round((skill.critHits / skill.hits) * 100) : 0,
      heavyRate: skill.hits > 0 ? Math.round((skill.powerHits / skill.hits) * 100) : 0
    }));
  }, [displaySkills, displayTotalDamage, displayDuration]);

  const selectedSkill = useMemo(() => sortedSkills.find(s => s.id === selectedSkillId) || null, [selectedSkillId, sortedSkills]);

  const toggleMonitoring = () => {
    if (isMonitoring) { window.electronAPI.stopMonitoring(); setIsMonitoring(false); setStatus('Pause'); }
    else { resetStats(); clickTimestampRef.current = Date.now(); window.electronAPI.startMonitoring(); setIsMonitoring(true); setStatus('En attente...'); }
  };

  const renderDetailSection = (title, stats) => {
    const avg = stats.count > 0 ? Math.round(stats.totalDamage / stats.count) : 0;
    return (
      <div className="detail-section">
        <h4>{title}</h4>
        <div className="detail-stat"><span className="label">Moyenne:</span> <span className="value">{avg.toLocaleString()}</span></div>
        <div className="detail-stat"><span className="label">Max:</span> <span className="value">{(stats.max || 0).toLocaleString()}</span></div>
        <div className="detail-stat"><span className="label">Min:</span> <span className="value">{stats.min === Infinity ? 0 : stats.min.toLocaleString()}</span></div>
        <div className="detail-stat"><span className="label">Coups:</span> <span className="value">{stats.count}</span></div>
      </div>
    );
  };

  return (
    <div className="container">
      {updateStatus && (
        <div style={{ backgroundColor: '#2c3e50', color: '#3498db', padding: '8px', textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #3498db' }}>
          🚀 {updateStatus}
        </div>
      )}
      <header className="header">
        <h1>⚔️ TL DPS Meter - v1.1.0 - Test </h1>
        <div className="file-info">{activeFile}</div>
        <div className={`status-badge ${isMonitoring ? 'active' : 'waiting'}`}>{status}</div>
      </header>

      <main className="dashboard">
        <div className="control-bar">
          <button className={`toggle-btn ${isMonitoring ? 'stop' : 'start'}`} onClick={toggleMonitoring}>
            {isMonitoring ? 'ARRÊTER LE SUIVI' : 'DÉMARRER LE SUIVI'}
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><h3>DPS</h3><div className="value">{Math.round(displayTotalDamage / (displayDuration || 1)).toLocaleString()}</div></div>
          <div className="stat-card"><h3>DÉGÂTS</h3><div className="value">{displayTotalDamage.toLocaleString()}</div></div>
          <div className="stat-card"><h3>TEMPS</h3><div className="value">{Math.floor(displayDuration / 60)}:{(Math.floor(displayDuration % 60)).toString().padStart(2, '0')}</div></div>
        </div>

        <div className="skills-section">
          <div className="skills-table-container">
            <table className="skills-table">
              <thead>
                <tr><th>#</th><th>Compétence</th><th>Dégâts</th><th>%</th><th>Coups</th><th>Crit%</th><th>Heavy%</th><th>DPS</th></tr>
              </thead>
              <tbody>
                {sortedSkills.map((skill) => (
                  <tr key={skill.id} onClick={() => setSelectedSkillId(skill.id)}>
                    <td>{skill.rank}</td>
                    <td className="skill-name-cell">
                      <div className="skill-progress-bar" style={{ width: `${skill.ratio}%` }}></div>
                      <span className="skill-name-text">{skill.name}</span>
                    </td>
                    <td>{skill.totalDamage.toLocaleString()}</td>
                    <td>{skill.ratio}%</td>
                    <td>{skill.hits}</td>
                    <td style={{color: skill.critRate > 50 ? 'var(--crit-color)' : 'inherit'}}>{skill.critRate}%</td>
                    <td style={{color: skill.heavyRate > 50 ? 'var(--success)' : 'inherit'}}>{skill.heavyRate}%</td>
                    <td>{skill.dps.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSkill && (
          <div className="modal-overlay" onClick={() => setSelectedSkillId(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setSelectedSkillId(null)}>×</button>
              <div className="modal-header"><h2>{selectedSkill.name}</h2><div className="badge">Rang #{selectedSkill.rank}</div></div>
              <div className="details-grid">
                <div className="detail-section main">
                  <h4>Général</h4>
                  <div className="detail-stat"><span className="label">Total:</span> <span className="value">{selectedSkill.totalDamage.toLocaleString()}</span></div>
                  <div className="detail-stat"><span className="label">DPS:</span> <span className="value">{selectedSkill.dps.toLocaleString()}</span></div>
                  <div className="detail-stat"><span className="label">Part:</span> <span className="value">{selectedSkill.ratio}%</span></div>
                </div>
                {renderDetailSection("Attaques Normales", selectedSkill.normalStats)}
                {renderDetailSection("Coups Critiques", selectedSkill.critStats)}
                {renderDetailSection("Heavy Attacks", selectedSkill.powerStats)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App