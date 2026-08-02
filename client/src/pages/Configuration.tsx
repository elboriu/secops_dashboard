import { useState, useEffect } from 'react';
import { Settings, Bell, Link2, FileText, Save } from 'lucide-react';

interface AuditLog {
  id: number;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'Success' | 'Failed';
}

export default function Configuration() {
  const [activeTab, setActiveTab] = useState('system');
  const [settings, setSettings] = useState({
    systemName: 'SecOps Dashboard',
    timezone: 'UTC',
    logRetention: '90',
    autoBackup: true,
    maintenanceMode: false,
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    criticalOnly: false,
    dailyDigest: true,
    weeklyReport: true,
    slackIntegration: false,
  });

  const [integrations, setIntegrations] = useState({
    slack: { enabled: false, webhook: '' },
    siem: { enabled: true, endpoint: 'https://siem.example.com' },
    ticketing: { enabled: true, endpoint: 'https://tickets.example.com' },
    sso: { enabled: false, provider: 'SAML' },
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 1, user: 'admin', action: 'Updated firewall rule', resource: 'Rule #42', timestamp: '2 minutes ago', status: 'Success' },
    { id: 2, user: 'analyst1', action: 'Viewed threat details', resource: 'Threat #1024', timestamp: '5 minutes ago', status: 'Success' },
    { id: 3, user: 'admin', action: 'Modified user permissions', resource: 'User: analyst2', timestamp: '1 hour ago', status: 'Success' },
    { id: 4, user: 'viewer', action: 'Attempted policy edit', resource: 'Policy #5', timestamp: '2 hours ago', status: 'Failed' },
    { id: 5, user: 'operator', action: 'Exported analytics report', resource: 'Report: Daily', timestamp: '3 hours ago', status: 'Success' },
  ]);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const actions = ['Updated configuration', 'Viewed logs', 'Modified settings', 'Exported data'];
        const resources = ['Config', 'Settings', 'Policy', 'User'];
        const users = ['admin', 'analyst1', 'analyst2', 'viewer'];
        
        setAuditLogs(prev => [
          {
            id: Date.now(),
            user: users[Math.floor(Math.random() * users.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            resource: resources[Math.floor(Math.random() * resources.length)],
            timestamp: 'just now',
            status: Math.random() > 0.1 ? 'Success' : 'Failed',
          },
          ...prev.slice(0, 4),
        ]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getStatusColor = (status: string) => {
    return status === 'Success' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2">Configuration</h1>
        <p className="text-gray-400">System settings, notifications, and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cyan-500/30">
        {['system', 'notifications', 'integrations', 'audit'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold transition ${
              activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-cyan-400'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* System Settings */}
      {activeTab === 'system' && (
        <div className="neon-box p-6 rounded-sm space-y-4">
          <h2 className="text-lg font-bold neon-text flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cyan-400 mb-2">System Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="PST">PST</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Log Retention (days)</label>
              <input
                type="number"
                value={settings.logRetention}
                onChange={(e) => setSettings({ ...settings, logRetention: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-cyan-500/30">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Enable Automatic Backups</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-gray-300">Maintenance Mode</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-cyan-500 text-black rounded-sm font-bold hover:bg-cyan-400 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
            {saved && <span className="text-green-400 flex items-center">✓ Settings saved</span>}
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="neon-box p-6 rounded-sm space-y-4">
          <h2 className="text-lg font-bold neon-text flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </h2>

          <div className="space-y-3">
            {Object.entries(notifications).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer p-3 bg-black/50 rounded hover:bg-black/70">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-cyan-500 text-black rounded-sm font-bold hover:bg-cyan-400 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      )}

      {/* Integration Settings */}
      {activeTab === 'integrations' && (
        <div className="neon-box p-6 rounded-sm space-y-4">
          <h2 className="text-lg font-bold neon-text flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Integration Settings
          </h2>

          <div className="space-y-4">
            {Object.entries(integrations).map(([key, config]: any) => (
              <div key={key} className="p-4 bg-black/50 rounded border border-cyan-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-200 capitalize">{key}</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        setIntegrations({
                          ...integrations,
                          [key]: { ...config, enabled: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-400">{config.enabled ? 'Enabled' : 'Disabled'}</span>
                  </label>
                </div>
                {config.webhook && (
                  <input
                    type="text"
                    value={config.webhook}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        [key]: { ...config, webhook: e.target.value },
                      })
                    }
                    placeholder="Webhook URL"
                    className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-cyan-500"
                  />
                )}
                {config.endpoint && (
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        [key]: { ...config, endpoint: e.target.value },
                      })
                    }
                    placeholder="API Endpoint"
                    className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-cyan-500"
                  />
                )}
                {config.provider && (
                  <select
                    value={config.provider}
                    onChange={(e) =>
                      setIntegrations({
                        ...integrations,
                        [key]: { ...config, provider: e.target.value },
                      })
                    }
                    className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="SAML">SAML</option>
                    <option value="OAuth2">OAuth2</option>
                    <option value="LDAP">LDAP</option>
                  </select>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-cyan-500 text-black rounded-sm font-bold hover:bg-cyan-400 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Integrations
          </button>
        </div>
      )}

      {/* Audit Log */}
      {activeTab === 'audit' && (
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            Audit Log
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/30">
                  <th className="text-left py-2 text-cyan-400">User</th>
                  <th className="text-left py-2 text-cyan-400">Action</th>
                  <th className="text-left py-2 text-cyan-400">Resource</th>
                  <th className="text-left py-2 text-cyan-400">Status</th>
                  <th className="text-left py-2 text-cyan-400">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="py-3 text-gray-300 font-mono">{log.user}</td>
                    <td className="py-3 text-gray-300">{log.action}</td>
                    <td className="py-3 text-gray-400">{log.resource}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
