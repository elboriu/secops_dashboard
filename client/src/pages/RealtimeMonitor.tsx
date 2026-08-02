import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wifi, Users, TrendingUp } from 'lucide-react';

interface Connection {
  id: number;
  source: string;
  destination: string;
  protocol: string;
  bandwidth: string;
  status: 'Active' | 'Idle' | 'Closed';
}

export default function RealtimeMonitor() {
  const [trafficData, setTrafficData] = useState([
    { time: '00:00', inbound: 1200, outbound: 800 },
    { time: '04:00', inbound: 1500, outbound: 900 },
    { time: '08:00', inbound: 1800, outbound: 1200 },
    { time: '12:00', inbound: 2200, outbound: 1500 },
    { time: '16:00', inbound: 1900, outbound: 1100 },
    { time: '20:00', inbound: 2100, outbound: 1400 },
    { time: '24:00', inbound: 2400, outbound: 1600 },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: 1, source: '192.168.1.100', destination: '8.8.8.8', protocol: 'TCP', bandwidth: '2.5 Mbps', status: 'Active' },
    { id: 2, source: '10.0.0.50', destination: '1.1.1.1', protocol: 'UDP', bandwidth: '1.8 Mbps', status: 'Active' },
    { id: 3, source: '172.16.0.25', destination: '8.8.4.4', protocol: 'TCP', bandwidth: '3.2 Mbps', status: 'Active' },
    { id: 4, source: '203.0.113.45', destination: '1.0.0.1', protocol: 'TCP', bandwidth: '0.9 Mbps', status: 'Idle' },
    { id: 5, source: '198.51.100.12', destination: '8.8.8.8', protocol: 'UDP', bandwidth: '1.2 Mbps', status: 'Active' },
  ]);

  const [bandwidthGauges, setBandwidthGauges] = useState({
    inbound: 65,
    outbound: 42,
    total: 53,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prev => {
        const newData = [...prev.slice(1)];
        const lastTime = parseInt(prev[prev.length - 1].time);
        const newTime = ((lastTime + 4) % 24).toString().padStart(2, '0') + ':00';
        newData.push({
          time: newTime,
          inbound: Math.floor(Math.random() * 2000 + 1000),
          outbound: Math.floor(Math.random() * 1500 + 500),
        });
        return newData;
      });

      setBandwidthGauges({
        inbound: Math.floor(Math.random() * 100),
        outbound: Math.floor(Math.random() * 100),
        total: Math.floor(Math.random() * 100),
      });

      if (Math.random() > 0.6) {
        setConnections(prev => {
          const statuses = ['Active', 'Idle', 'Closed'];
          return prev.map(conn => ({
            ...conn,
            status: statuses[Math.floor(Math.random() * statuses.length)] as any,
            bandwidth: `${(Math.random() * 4 + 0.5).toFixed(1)} Mbps`,
          }));
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-400 bg-green-400/10';
      case 'Idle':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Closed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold neon-text mb-2">Real-time Monitor</h1>
        <p className="text-gray-400">Live traffic flow and network activity</p>
      </div>

      {/* Bandwidth Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neon-box p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-cyan-400">Inbound Bandwidth</h3>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold neon-text mb-2">{bandwidthGauges.inbound}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full transition-all"
              style={{ width: `${bandwidthGauges.inbound}%` }}
            ></div>
          </div>
        </div>

        <div className="neon-box p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-cyan-400">Outbound Bandwidth</h3>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold neon-text mb-2">{bandwidthGauges.outbound}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-magenta-500 to-magenta-400 h-2 rounded-full transition-all"
              style={{ width: `${bandwidthGauges.outbound}%` }}
            ></div>
          </div>
        </div>

        <div className="neon-box p-6 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-cyan-400">Total Usage</h3>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold neon-text mb-2">{bandwidthGauges.total}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
              style={{ width: `${bandwidthGauges.total}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Traffic Flow Chart */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4">Live Traffic Flow</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff00ff' }} />
            <Legend />
            <Line type="monotone" dataKey="inbound" stroke="#00ffff" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="outbound" stroke="#ff00ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Active Connections Table */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Active Connections ({connections.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/30">
                <th className="text-left py-2 text-cyan-400">Source IP</th>
                <th className="text-left py-2 text-cyan-400">Destination IP</th>
                <th className="text-left py-2 text-cyan-400">Protocol</th>
                <th className="text-left py-2 text-cyan-400">Bandwidth</th>
                <th className="text-left py-2 text-cyan-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn) => (
                <tr key={conn.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                  <td className="py-3 text-gray-300">{conn.source}</td>
                  <td className="py-3 text-gray-300">{conn.destination}</td>
                  <td className="py-3 text-gray-300">{conn.protocol}</td>
                  <td className="py-3 text-cyan-400 font-mono">{conn.bandwidth}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(conn.status)}`}>
                      {conn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic Traffic Map Placeholder */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4">Geographic Traffic Distribution</h2>
        <div className="w-full h-64 bg-black/50 rounded flex items-center justify-center border border-cyan-500/20">
          <div className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <p className="text-gray-400">Global traffic map visualization</p>
            <p className="text-xs text-gray-500 mt-2">Real-time traffic from 47 countries</p>
          </div>
        </div>
      </div>
    </div>
  );
}
