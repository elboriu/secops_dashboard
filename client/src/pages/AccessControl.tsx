import { useState, useEffect } from 'react';
import { Users, Lock, LogIn, ShieldBan, ShieldCheck, Plus, X } from 'lucide-react';
import { isValidIpOrCidr } from '@shared/ipValidation';

interface User {
  id: number;
  username: string;
  role: string;
  email: string;
  lastLogin: string;
  status: 'Active' | 'Inactive' | 'Locked';
}

interface Session {
  id: number;
  user: string;
  ip: string;
  device: string;
  loginTime: string;
  status: 'Active' | 'Idle' | 'Expired';
}

interface LoginAttempt {
  id: number;
  username: string;
  ip: string;
  result: 'Success' | 'Failed' | 'Blocked';
  timestamp: string;
}

export default function AccessControl() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'admin', role: 'Administrator', email: 'admin@secops.io', lastLogin: '2 minutes ago', status: 'Active' },
    { id: 2, username: 'analyst1', role: 'Security Analyst', email: 'analyst1@secops.io', lastLogin: '1 hour ago', status: 'Active' },
    { id: 3, username: 'analyst2', role: 'Security Analyst', email: 'analyst2@secops.io', lastLogin: '3 hours ago', status: 'Active' },
    { id: 4, username: 'viewer', role: 'Viewer', email: 'viewer@secops.io', lastLogin: '1 day ago', status: 'Inactive' },
    { id: 5, username: 'operator', role: 'Operator', email: 'operator@secops.io', lastLogin: 'Never', status: 'Locked' },
  ]);

  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, user: 'admin', ip: '192.168.1.100', device: 'Chrome on Windows', loginTime: '2 minutes ago', status: 'Active' },
    { id: 2, user: 'analyst1', ip: '10.0.0.50', device: 'Safari on macOS', loginTime: '1 hour ago', status: 'Active' },
    { id: 3, user: 'analyst2', ip: '172.16.0.25', device: 'Firefox on Linux', loginTime: '3 hours ago', status: 'Idle' },
    { id: 4, user: 'viewer', ip: '203.0.113.45', device: 'Chrome on Windows', loginTime: '1 day ago', status: 'Expired' },
  ]);

  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([
    { id: 1, username: 'admin', ip: '192.168.1.100', result: 'Success', timestamp: '2 minutes ago' },
    { id: 2, username: 'analyst1', ip: '10.0.0.50', result: 'Success', timestamp: '1 hour ago' },
    { id: 3, username: 'unknown', ip: '203.0.113.45', result: 'Failed', timestamp: '2 hours ago' },
    { id: 4, username: 'admin', ip: '198.51.100.12', result: 'Blocked', timestamp: '3 hours ago' },
    { id: 5, username: 'analyst2', ip: '172.16.0.25', result: 'Success', timestamp: '3 hours ago' },
  ]);

  const [permissionMatrix] = useState({
    Administrator: { view: true, create: true, edit: true, delete: true, export: true },
    'Security Analyst': { view: true, create: true, edit: true, delete: false, export: true },
    Operator: { view: true, create: false, edit: false, delete: false, export: false },
    Viewer: { view: true, create: false, edit: false, delete: false, export: false },
  });

  const [blacklist, setBlacklist] = useState(['203.45.67.89', '156.78.90.123', '110.23.45.67', '45.67.89.101']);
  const [whitelist, setWhitelist] = useState(['192.168.1.0/24', '10.0.0.50', '172.16.0.0/16']);
  const [ipValue, setIpValue] = useState('');
  const [listType, setListType] = useState<'blacklist' | 'whitelist'>('blacklist');
  const [ipError, setIpError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const results = ['Success', 'Failed', 'Blocked'];
        const usernames = ['admin', 'analyst1', 'analyst2', 'unknown', 'viewer'];
        const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45', '198.51.100.12'];

        setLoginAttempts(prev => [
          {
            id: Date.now(),
            username: usernames[Math.floor(Math.random() * usernames.length)],
            ip: ips[Math.floor(Math.random() * ips.length)],
            result: results[Math.floor(Math.random() * results.length)] as LoginAttempt['result'],
            timestamp: 'just now',
          },
          ...prev.slice(0, 4),
        ]);
      }

      if (Math.random() > 0.8) {
        setSessions(prev => prev.map(session => ({
          ...session,
          status: ['Active', 'Idle', 'Expired'][Math.floor(Math.random() * 3)] as Session['status'],
        })));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/10';
      case 'Idle': return 'text-yellow-400 bg-yellow-400/10';
      case 'Inactive': return 'text-gray-400 bg-gray-400/10';
      case 'Expired': return 'text-red-400 bg-red-400/10';
      case 'Locked': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Success': return 'text-green-400 bg-green-400/10';
      case 'Failed': return 'text-yellow-400 bg-yellow-400/10';
      case 'Blocked': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const addIpRule = () => {
    const normalizedIp = ipValue.trim();
    if (!isValidIpOrCidr(normalizedIp)) {
      setIpError('Enter a valid IPv4 address or CIDR range, for example 192.168.1.1 or 10.0.0.0/24.');
      return;
    }

    const targetList = listType === 'blacklist' ? blacklist : whitelist;
    if (targetList.includes(normalizedIp)) {
      setIpError('This address is already in the selected list.');
      return;
    }

    if (listType === 'blacklist') setBlacklist(prev => [normalizedIp, ...prev]);
    else setWhitelist(prev => [normalizedIp, ...prev]);
    setIpValue('');
    setIpError('');
  };

  const removeIpRule = (list: 'blacklist' | 'whitelist', ip: string) => {
    if (list === 'blacklist') setBlacklist(prev => prev.filter(item => item !== ip));
    else setWhitelist(prev => prev.filter(item => item !== ip));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2">Access Control</h1>
        <p className="text-gray-400">User management, permissions, sessions, and network access enforcement</p>
      </div>

      <div className="neon-box p-6 rounded-sm">
        <div className="flex flex-col gap-4 mb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold neon-text flex items-center gap-2"><ShieldBan className="w-5 h-5" /> IP Access Lists</h2>
            <p className="text-xs text-gray-500 mt-1">Control which IPv4 addresses and CIDR ranges can reach protected resources.</p>
          </div>
          <div className="flex items-center gap-1 p-1 border border-gray-800 bg-black/50 rounded-sm self-start">
            <button type="button" onClick={() => setListType('blacklist')} className={`px-3 py-2 text-xs font-bold rounded-sm transition-colors ${listType === 'blacklist' ? 'bg-red-500/20 text-red-300' : 'text-gray-500 hover:text-red-300'}`}>Blacklist ({blacklist.length})</button>
            <button type="button" onClick={() => setListType('whitelist')} className={`px-3 py-2 text-xs font-bold rounded-sm transition-colors ${listType === 'whitelist' ? 'bg-green-500/20 text-green-300' : 'text-gray-500 hover:text-green-300'}`}>Whitelist ({whitelist.length})</button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={ipValue} onChange={event => { setIpValue(event.target.value); setIpError(''); }} onKeyDown={event => { if (event.key === 'Enter') addIpRule(); }} placeholder="IP or CIDR (e.g. 192.168.1.1)" aria-label="IP or CIDR address" className="flex-1 bg-black/70 border border-cyan-500/40 px-3 py-2 text-sm text-cyan-100 placeholder:text-gray-600 rounded-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40" />
          <button type="button" onClick={addIpRule} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-400 text-cyan-300 text-sm font-bold hover:bg-cyan-400/20 transition-colors rounded-sm"><Plus className="w-4 h-4" /> Add</button>
        </div>
        {ipError && <p className="text-xs text-red-400 mt-2" role="alert">{ipError}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
          <div className="border border-red-500/40 bg-red-500/5 rounded-sm p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-red-300 flex items-center gap-2"><ShieldBan className="w-4 h-4" /> Blacklist</h3><span className="text-xs text-red-400">DENY</span></div>
            <div className="space-y-2">
              {blacklist.map(ip => <div key={ip} className="flex items-center justify-between gap-3 p-2 bg-black/50 border border-red-500/10 rounded-sm"><span className="font-mono text-sm text-gray-300">{ip}</span><button type="button" onClick={() => removeIpRule('blacklist', ip)} aria-label={`Remove ${ip} from blacklist`} className="text-gray-600 hover:text-red-300 transition-colors"><X className="w-4 h-4" /></button></div>)}
            </div>
          </div>
          <div className="border border-green-500/40 bg-green-500/5 rounded-sm p-4">
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-green-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Whitelist</h3><span className="text-xs text-green-400">ALLOW</span></div>
            <div className="space-y-2">
              {whitelist.map(ip => <div key={ip} className="flex items-center justify-between gap-3 p-2 bg-black/50 border border-green-500/10 rounded-sm"><span className="font-mono text-sm text-gray-300">{ip}</span><button type="button" onClick={() => removeIpRule('whitelist', ip)} aria-label={`Remove ${ip} from whitelist`} className="text-gray-600 hover:text-green-300 transition-colors"><X className="w-4 h-4" /></button></div>)}
            </div>
          </div>
        </div>
      </div>

      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> User & Role Management</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead><tr className="border-b border-cyan-500/30"><th className="text-left py-2 text-cyan-400">Username</th><th className="text-left py-2 text-cyan-400">Role</th><th className="text-left py-2 text-cyan-400">Email</th><th className="text-left py-2 text-cyan-400">Last Login</th><th className="text-left py-2 text-cyan-400">Status</th></tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900/50"><td className="py-3 text-gray-300 font-mono">{user.username}</td><td className="py-3 text-gray-300">{user.role}</td><td className="py-3 text-gray-400">{user.email}</td><td className="py-3 text-gray-400">{user.lastLogin}</td><td className="py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(user.status)}`}>{user.status}</span></td></tr>)}</tbody></table></div>
      </div>

      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4 flex items-center gap-2"><Lock className="w-5 h-5" /> Permission Matrix</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-cyan-500/30"><th className="text-left py-2 text-cyan-400">Role</th><th className="text-center py-2 text-cyan-400">View</th><th className="text-center py-2 text-cyan-400">Create</th><th className="text-center py-2 text-cyan-400">Edit</th><th className="text-center py-2 text-cyan-400">Delete</th><th className="text-center py-2 text-cyan-400">Export</th></tr></thead><tbody>{Object.entries(permissionMatrix).map(([role, perms]) => <tr key={role} className="border-b border-gray-800 hover:bg-gray-900/50"><td className="py-3 text-gray-300 font-bold">{role}</td>{(['view', 'create', 'edit', 'delete', 'export'] as const).map(permission => <td key={permission} className="py-3 text-center"><span className={perms[permission] ? 'text-green-400' : 'text-red-400'}>{perms[permission] ? '✓' : '✗'}</span></td>)}</tr>)}</tbody></table></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="neon-box p-6 rounded-sm"><h2 className="text-lg font-bold neon-text mb-4">Active Sessions</h2><div className="space-y-3 max-h-96 overflow-y-auto">{sessions.map(session => <div key={session.id} className="p-3 bg-black/50 rounded border-l-2 border-cyan-500"><div className="flex items-start justify-between mb-2"><div><p className="font-bold text-gray-200">{session.user}</p><p className="text-xs text-gray-400">{session.device}</p></div><span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(session.status)}`}>{session.status}</span></div><div className="flex items-center justify-between text-xs text-gray-400"><span className="font-mono">{session.ip}</span><span>{session.loginTime}</span></div></div>)}</div></div>
        <div className="neon-box p-6 rounded-sm"><h2 className="text-lg font-bold neon-text mb-4 flex items-center gap-2"><LogIn className="w-5 h-5" /> Login Attempts</h2><div className="space-y-3 max-h-96 overflow-y-auto">{loginAttempts.map(attempt => <div key={attempt.id} className="p-3 bg-black/50 rounded border-l-2 border-magenta-500"><div className="flex items-start justify-between mb-2"><div><p className="font-bold text-gray-200">{attempt.username}</p><p className="text-xs text-gray-400 font-mono">{attempt.ip}</p></div><span className={`px-2 py-1 rounded text-xs font-bold ${getResultColor(attempt.result)}`}>{attempt.result}</span></div><p className="text-xs text-gray-500">{attempt.timestamp}</p></div>)}</div></div>
      </div>
    </div>
  );
}
