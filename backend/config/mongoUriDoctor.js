/**
 * ==============================================================================
 * MongoDB URI Doctor & Auto-Repair Engine
 * Specifically designed to resolve common cloud deployment connection issues:
 * 1. Special characters in passwords not being URL-encoded (e.g., @, #, $, %, &, :)
 * 2. DNS SRV query failures on Render / Docker containers (querySrv ENOTFOUND)
 * 3. Missing database name in connection string
 * 4. Missing recommended connection query parameters (retryWrites, w, appName)
 * 5. Sanitized logging (prevents credentials leak in deployment build logs)
 * ==============================================================================
 */

const dns = require('dns');

/**
 * Configure Node.js DNS resolution to use high-reliability public DNS servers.
 * Render and Docker containers frequently fail SRV lookup for mongodb+srv://
 * due to restrictive internal DNS resolvers.
 */
function applyDnsFix() {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    return { success: true, message: 'Custom DNS servers (Google 8.8.8.8 / Cloudflare 1.1.1.1) applied.' };
  } catch (err) {
    return { success: false, message: `DNS fallback configuration error: ${err.message}` };
  }
}

/**
 * Analyzes and repairs a raw MongoDB connection string.
 * @param {string} rawUri - The MongoDB URI provided by the user / env variable.
 * @returns {object} { success, originalUri, repairedUri, sanitizedUri, issuesFound, fixesApplied }
 */
function diagnoseAndFix(rawUri) {
  const result = {
    isValid: false,
    originalUri: rawUri || '',
    repairedUri: '',
    sanitizedUri: '',
    issuesFound: [],
    fixesApplied: [],
  };

  if (!rawUri || typeof rawUri !== 'string') {
    result.issuesFound.push('MongoDB URI is empty or not provided.');
    return result;
  }

  const trimmed = rawUri.trim();

  // 1. Check Protocol
  const isSrv = trimmed.startsWith('mongodb+srv://');
  const isStandard = trimmed.startsWith('mongodb://');

  if (!isSrv && !isStandard) {
    result.issuesFound.push('URI does not start with valid protocol (mongodb+srv:// or mongodb://).');
    return result;
  }

  const protocol = isSrv ? 'mongodb+srv://' : 'mongodb://';
  let rest = trimmed.substring(protocol.length);

  // 2. Parse Credentials vs Hosts
  // Format: [username:password@]host[:port][/database][?options]
  const atIndex = rest.lastIndexOf('@');

  let userInfo = '';
  let hostAndRest = rest;

  if (atIndex !== -1) {
    userInfo = rest.substring(0, atIndex);
    hostAndRest = rest.substring(atIndex + 1);

    // Split username and password by first ':'
    const colonIndex = userInfo.indexOf(':');
    if (colonIndex !== -1) {
      let username = userInfo.substring(0, colonIndex);
      let password = userInfo.substring(colonIndex + 1);

      // Check if username or password contain unescaped characters
      const needsUserEncoding = username !== decodeURIComponent(username) || /[/:?#\[\]@!$&'()*+,;=]/.test(username);
      const needsPassEncoding = password !== decodeURIComponent(password) || /[/:?#\[\]@!$&'()*+,;=]/.test(password);

      if (needsUserEncoding || needsPassEncoding) {
        result.issuesFound.push('Credentials contain unencoded special characters (causes MongoParseError).');
        
        // Decode first if partially encoded, then strictly encodeURIComponent
        try {
          const rawUser = decodeURIComponent(username);
          const rawPass = decodeURIComponent(password);
          username = encodeURIComponent(rawUser);
          password = encodeURIComponent(rawPass);
          result.fixesApplied.push('URL-encoded special characters in username/password credentials.');
        } catch (e) {
          username = encodeURIComponent(username);
          password = encodeURIComponent(password);
          result.fixesApplied.push('URL-encoded raw credentials.');
        }
      }

      userInfo = `${username}:${password}`;
    }
  } else {
    result.issuesFound.push('No authentication credentials detected in URI.');
  }

  // 3. Parse Database name and Query parameters
  let hostPart = hostAndRest;
  let dbPart = '';
  let queryPart = '';

  const questionMarkIndex = hostAndRest.indexOf('?');
  if (questionMarkIndex !== -1) {
    queryPart = hostAndRest.substring(questionMarkIndex + 1);
    hostAndRest = hostAndRest.substring(0, questionMarkIndex);
  }

  const slashIndex = hostAndRest.indexOf('/');
  if (slashIndex !== -1) {
    hostPart = hostAndRest.substring(0, slashIndex);
    dbPart = hostAndRest.substring(slashIndex + 1);
  } else {
    hostPart = hostAndRest;
    dbPart = '';
  }

  // Check if DB name is missing
  if (!dbPart || dbPart === 'test') {
    result.issuesFound.push(dbPart === 'test' ? 'Default "test" database specified.' : 'Database name was missing in URI path.');
    dbPart = 'student_management_db';
    result.fixesApplied.push('Explicitly set target database to "student_management_db".');
  }

  // 4. Ensure optimal query parameters for cloud environments
  const queryParams = new URLSearchParams(queryPart);
  if (!queryParams.has('retryWrites')) {
    queryParams.set('retryWrites', 'true');
    result.fixesApplied.push('Added retryWrites=true for network fault tolerance.');
  }
  if (!queryParams.has('w')) {
    queryParams.set('w', 'majority');
    result.fixesApplied.push('Added write concern w=majority for data persistence.');
  }
  if (!queryParams.has('appName')) {
    queryParams.set('appName', 'StudentManagementSystem');
    result.fixesApplied.push('Added appName identifier for connection monitoring.');
  }

  // 5. Construct Repaired URI
  const repairedUserPart = userInfo ? `${userInfo}@` : '';
  const repairedQuery = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const repairedUri = `${protocol}${repairedUserPart}${hostPart}/${dbPart}${repairedQuery}`;

  // 6. Construct Sanitized URI (for safe logging without exposing password)
  let sanitizedUserPart = '';
  if (userInfo) {
    const colonIdx = userInfo.indexOf(':');
    const uName = colonIdx !== -1 ? userInfo.substring(0, colonIdx) : userInfo;
    sanitizedUserPart = `${uName}:******@`;
  }
  const sanitizedUri = `${protocol}${sanitizedUserPart}${hostPart}/${dbPart}${repairedQuery}`;

  result.isValid = true;
  result.repairedUri = repairedUri;
  result.sanitizedUri = sanitizedUri;

  return result;
}

module.exports = {
  applyDnsFix,
  diagnoseAndFix,
};
