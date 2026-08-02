import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

interface Vulnerability {
  id: number;
  name: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedSystems: number;
  remediationStatus: 'Pending' | 'In Progress' | 'Resolved';
  discoveredDate: string;
}

export default function RiskManagement() {
  const [riskScore, setRiskScore] = useState(72);
  
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([
    { id: 1, name: 'Unpatched OpenSSL', priority: 'Critical', affectedSystems: 12, remediationStatus: 'In Progress', discoveredDate: '2 days ago' },
    { id: 2, name: 'Weak Password Policy', priority: 'High', affectedSystems: 45, remediationStatus: 'Pending', discoveredDate: '5 days ago' },
    { id: 3, name: 'SQL Injection Vulnerability', priority: 'Critical', affectedSystems: 3, remediationStatus: 'In Progress', discoveredDate: '1 day ago' },
    { id: 4, name: 'Outdated Framework', priority: 'Medium', affectedSystems: 8, remediationStatus: 'Pending', discoveredDate: '1 week ago' },
    { id: 5, name: 'Missing Encryption', priority: 'High', affectedSystems: 15, remediationStatus: 'Resolved', discoveredDate: '3 days ago' },
  ]);

  const [riskTrend, setRiskTrend] = useState([
    { date: 'Day 1', score: 65 },
    { date: 'Day 2', score: 68 },
    { date: 'Day 3', score: 70 },
    { date: 'Day 4', score: 69 },
    { date: 'Day 5', score: 71 },
    { date: 'Day 6', score: 72 },
    { date: 'Day 7', score: 72 },
  ]);

  const [remediationData, setRemediationData] = useState([
    { status: 'Resolved', count: 8 },
    { status: 'In Progress', count: 5 },
    { status: 'Pending', count: 12 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore(prev => {
        const change = Math.floor(Math.random() * 5 - 2);
        return Math.max(0, Math.min(100, prev + change));
      });

      setRiskTrend(prev => {
        const newData = [...prev.slice(1)];
        const lastScore = prev[prev.length - 1].score;
        const change = Math.floor(Math.random() * 5 - 2);
        newData.push({
          date: `Day ${prev.length + 1}`,
          score: Math.max(0, Math.min(100, lastScore + change)),
        });
        return newData;
      });

      if (Math.random() > 0.7) {
        setVulnerabilities(prev => prev.map((vuln, idx) => {
          if (idx === 0) {
            const statuses = ['Pending', 'In Progress', 'Resolved'];
            return {
              ...vuln,
              remediationStatus: statuses[Math.floor(Math.random() * statuses.length)] as any,
            };
          }
          return vuln;
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'text-green-400 bg-green-400/10';
      case 'In Progress':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Pending':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2">Risk Management</h1>
        <p className="text-gray-400">Vulnerability tracking and remediation status</p>
      </div>

      {/* Risk Score Indicator */}
      <div className="neon-box p-6 rounded-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold neon-text">Overall Risk Score</h2>
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="text-5xl font-bold neon-text mb-2">{riskScore}</div>
            <p className="text-gray-400 text-sm">Out of 100 - {riskScore > 70 ? 'High Risk' : riskScore > 40 ? 'Medium Risk' : 'Low Risk'}</p>
          </div>
          <div className="w-32 h-32 rounded-full border-4 border-cyan-500 flex items-center justify-center relative">
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-magenta-500 border-r-magenta-500"
              style={{
                transform: `rotate(${(riskScore / 100) * 360}deg)`,
                transition: 'transform 0.5s ease',
              }}
            ></div>
            <div className="text-center">
              <div className="text-2xl font-bold neon-text">{riskScore}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4">Risk Score Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={riskTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff00ff' }} />
            <Line type="monotone" dataKey="score" stroke="#ff00ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vulnerability List */}
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Vulnerabilities</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="p-3 border-l-2 border-cyan-500 bg-black/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-200">{vuln.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(vuln.priority)}`}>
                    {vuln.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{vuln.affectedSystems} systems affected</span>
                  <span>{vuln.discoveredDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remediation Status */}
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Remediation Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={remediationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="status" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff00ff' }} />
              <Bar dataKey="count" fill="#00ffff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Remediation Tracking */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Remediation Tracking
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/30">
                <th className="text-left py-2 text-cyan-400">Vulnerability</th>
                <th className="text-left py-2 text-cyan-400">Priority</th>
                <th className="text-left py-2 text-cyan-400">Status</th>
                <th className="text-left py-2 text-cyan-400">Progress</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map((vuln) => (
                <tr key={vuln.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                  <td className="py-3 text-gray-300">{vuln.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(vuln.priority)}`}>
                      {vuln.priority}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(vuln.remediationStatus)}`}>
                      {vuln.remediationStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="w-24 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full"
                        style={{
                          width: vuln.remediationStatus === 'Resolved' ? '100%' : vuln.remediationStatus === 'In Progress' ? '60%' : '20%',
                        }}
                      ></div>
                    </div>
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
