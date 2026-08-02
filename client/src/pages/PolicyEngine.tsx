import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';

interface FirewallRule {
  id: number;
  name: string;
  type: 'Allow' | 'Deny' | 'Log';
  source: string;
  destination: string;
  port: string;
  protocol: string;
  priority: number;
  status: 'Active' | 'Inactive';
  lastModified: string;
}

export default function PolicyEngine() {
  const [rules, setRules] = useState<FirewallRule[]>([
    { id: 1, name: 'Allow HTTPS Traffic', type: 'Allow', source: 'Any', destination: 'Web Servers', port: '443', protocol: 'TCP', priority: 1, status: 'Active', lastModified: '2 days ago' },
    { id: 2, name: 'Block Telnet', type: 'Deny', source: 'Any', destination: 'Any', port: '23', protocol: 'TCP', priority: 2, status: 'Active', lastModified: '1 week ago' },
    { id: 3, name: 'Allow SSH Admin', type: 'Allow', source: 'Admin Network', destination: 'Servers', port: '22', protocol: 'TCP', priority: 3, status: 'Active', lastModified: '3 days ago' },
    { id: 4, name: 'Log DNS Queries', type: 'Log', source: 'Any', destination: 'DNS Servers', port: '53', protocol: 'UDP', priority: 4, status: 'Active', lastModified: '1 day ago' },
    { id: 5, name: 'Block P2P Traffic', type: 'Deny', source: 'Any', destination: 'Any', port: 'Any', protocol: 'Any', priority: 5, status: 'Inactive', lastModified: '5 days ago' },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Allow' as const,
    source: '',
    destination: '',
    port: '',
    protocol: 'TCP',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setRules(prev => prev.map(rule => ({
          ...rule,
          status: rule.status === 'Active' ? 'Inactive' : 'Active',
          lastModified: 'just now',
        })));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleAddRule = () => {
    if (formData.name && formData.source && formData.destination) {
      const newRule: FirewallRule = {
        id: Date.now(),
        ...formData,
        priority: rules.length + 1,
        status: 'Active',
        lastModified: 'just now',
      };
      setRules([...rules, newRule]);
      setFormData({ name: '', type: 'Allow', source: '', destination: '', port: '', protocol: 'TCP' });
      setShowCreateForm(false);
    }
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handlePriorityChange = (id: number, direction: 'up' | 'down') => {
    const index = rules.findIndex(r => r.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < rules.length - 1)) {
      const newRules = [...rules];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newRules[index].priority, newRules[swapIndex].priority] = [newRules[swapIndex].priority, newRules[index].priority];
      newRules.sort((a, b) => a.priority - b.priority);
      setRules(newRules);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Allow':
        return 'text-green-400 bg-green-400/10';
      case 'Deny':
        return 'text-red-400 bg-red-400/10';
      case 'Log':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-gray-400/10';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">Policy Engine</h1>
          <p className="text-gray-400">Firewall rules and security policies</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="neon-box px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-cyan-500/10 transition"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {/* Rule Creation Form */}
      {showCreateForm && (
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Create New Firewall Rule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
                placeholder="e.g., Allow HTTPS Traffic"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Action Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="Allow">Allow</option>
                <option value="Deny">Deny</option>
                <option value="Log">Log</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
                placeholder="e.g., Any, Admin Network"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Destination</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
                placeholder="e.g., Web Servers, Any"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Port</label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
                placeholder="e.g., 443, 22, Any"
              />
            </div>
            <div>
              <label className="block text-sm text-cyan-400 mb-2">Protocol</label>
              <select
                value={formData.protocol}
                onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                className="w-full bg-black border border-cyan-500/30 rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
                <option value="Any">Any</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddRule}
              className="px-4 py-2 bg-cyan-500 text-black rounded-sm font-bold hover:bg-cyan-400 transition"
            >
              Create Rule
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-cyan-500/30 text-cyan-400 rounded-sm hover:bg-cyan-500/10 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Firewall Rules List */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Firewall Rules ({rules.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/30">
                <th className="text-left py-2 text-cyan-400">Priority</th>
                <th className="text-left py-2 text-cyan-400">Rule Name</th>
                <th className="text-left py-2 text-cyan-400">Action</th>
                <th className="text-left py-2 text-cyan-400">Source</th>
                <th className="text-left py-2 text-cyan-400">Destination</th>
                <th className="text-left py-2 text-cyan-400">Port</th>
                <th className="text-left py-2 text-cyan-400">Protocol</th>
                <th className="text-left py-2 text-cyan-400">Status</th>
                <th className="text-left py-2 text-cyan-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, idx) => (
                <tr key={rule.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                  <td className="py-3 text-gray-300 font-bold">{rule.priority}</td>
                  <td className="py-3 text-gray-300">{rule.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getTypeColor(rule.type)}`}>
                      {rule.type}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{rule.source}</td>
                  <td className="py-3 text-gray-400">{rule.destination}</td>
                  <td className="py-3 text-gray-400">{rule.port}</td>
                  <td className="py-3 text-gray-400">{rule.protocol}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(rule.status)}`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => handlePriorityChange(rule.id, 'up')}
                      disabled={idx === 0}
                      className="text-xs px-2 py-1 border border-cyan-500/30 rounded hover:bg-cyan-500/10 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handlePriorityChange(rule.id, 'down')}
                      disabled={idx === rules.length - 1}
                      className="text-xs px-2 py-1 border border-cyan-500/30 rounded hover:bg-cyan-500/10 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-xs px-2 py-1 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
