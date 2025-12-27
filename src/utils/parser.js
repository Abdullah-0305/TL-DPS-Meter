// src/utils/parser.js

/**
 * Convertit le timestamp du log (ex: "20251206-23:26:21:396") en objet Date JS
 */
export const parseTimestamp = (timestampStr) => {
  if (!timestampStr) return null;
  // Format: YYYYMMDD-HH:mm:ss:SSS
  const year = parseInt(timestampStr.substring(0, 4));
  const month = parseInt(timestampStr.substring(4, 6)) - 1; // Les mois commencent à 0 en JS
  const day = parseInt(timestampStr.substring(6, 8));
  const hour = parseInt(timestampStr.substring(9, 11));
  const minute = parseInt(timestampStr.substring(12, 14));
  const second = parseInt(timestampStr.substring(15, 17));
  const ms = parseInt(timestampStr.substring(18, 21));

  return new Date(year, month, day, hour, minute, second, ms);
};

/**
 * Analyse une ligne de log CSV et retourne un objet structuré
 */
export const parseLogLine = (line) => {
  if (!line || line.trim() === '') return null;

  const parts = line.split(',');

  // On ignore les lignes qui ne sont pas des événements de combat complets
  if (parts.length < 5) return null;

  // Structure basée sur l'exemple :
  // 0: Timestamp, 1: Event, 2: Skill, 3: TargetID?, 4: Damage, ...
  
  const eventType = parts[1];
  
  // On ne s'intéresse qu'aux dégâts pour le moment
  if (eventType !== 'DamageDone') return null;

  return {
    timestamp: parseTimestamp(parts[0]),
    event: eventType,
    skillName: parts[2],
    targetId: parts[3],
    damage: parseInt(parts[4]) || 0,
    isCrit: parts[5] === '1',
    sourceName: parts[8], 
    targetName: parts[9]
  };
};
