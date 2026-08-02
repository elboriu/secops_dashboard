import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertTriangle, Shield } from 'lucide-react';

interface Threat {
  id: number;
  source: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  details: string;
}

export default function SecurityCenter() {
  const [threats, setThreats] = useState<Threat[]>([
    { id: 1, source: '192.168.1.100', type: 'SQL Injection', severity: 'Critical', timestamp: '2 min ago', details: 'Attempted SQL injection in login form' },
    { id: 2, source: '10.0.0.50', type: 'Brute Force', severity: 'High', timestamp: '5 min ago', details: '150+ failed login attempts detected' },
    { id: 3, source: '172.16.0.25', type: 'XSS Attack', severity: 'High', timestamp: '12 min ago', details: 'Cross-site scripting payload detected' },
    { id: 4, source: '203.0.113.45', type: 'Port Scan', severity: 'Medium', timestamp: '18 min ago', details: 'Network reconnaissance activity' },
    { id: 5, source: '198.51.100.12', type: 'DDoS', severity: 'Critical', timestamp: '25 min ago', details: 'Distributed denial of service attack' },
  ]);

  const [attackData, setAttackData] = useState([
    { name: 'SQL Injection', value: 35 },
    { name: 'Brute Force', value: 28 },
    { name: 'XSS Attack', value: 18 },
    { name: 'DDoS', value: 12 },
    { name: 'Port Scan', value: 7 },
  ]);

  const COLORS = ['#ff00ff', '#00ffff', '#ff0080', '#00ff80', '#ff8000'];

  useEffect(() => {
    const interval = setInterval(() => {
      setThreats(prev => {
        const newThreat: Threat = {
          id: Date.now(),
          source: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
          type: ['SQL Injection', 'Brute Force', 'XSS Attack', 'DDoS', 'Port Scan'][Math.floor(Math.random() * 5)],
          severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)] as any,
          timestamp: 'just now',
          details: 'New threat detected',
        };
        return [newThreat, ...prev.slice(0, 4)];
      });

      setAttackData(prev => prev.map(item => ({
        ...item,
        value: item.value + Math.floor(Math.random() * 5 - 2),
      })));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-500 bg-red-500/10';
      case 'High':
        return 'text-orange-500 bg-orange-500/10';
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'Low':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2">Security Center</h1>
        <p className="text-gray-400">Threat intelligence and attack analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attack Type Breakdown */}
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Attack Type Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attackData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attackData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff00ff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Intelligence Table */}
        <div className="lg:col-span-2 neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Threat Intelligence</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/30">
                  <th className="text-left py-2 text-cyan-400">Source IP</th>
                  <th className="text-left py-2 text-cyan-400">Type</th>
                  <th className="text-left py-2 text-cyan-400">Severity</th>
                  <th className="text-left py-2 text-cyan-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((threat) => (
                  <tr key={threat.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="py-3 text-gray-300">{threat.source}</td>
                    <td className="py-3 text-gray-300">{threat.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{threat.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Threat Detail Panel */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4">Threat Details</h2>
        {threats.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-black/50 rounded">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold neon-text mb-2">{threats[0].type} Attack</h3>
                <p className="text-gray-300 mb-2">Source: {threats[0].source}</p>
                <p className="text-gray-400 text-sm mb-2">{threats[0].details}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${getSeverityColor(threats[0].severity)}`}>
                    {threats[0].severity}
                  </span>
                  <span className="text-gray-500 text-xs">{threats[0].timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
