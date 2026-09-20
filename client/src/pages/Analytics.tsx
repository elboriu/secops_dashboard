import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Download } from 'lucide-react';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('24h');
  
  const [trafficData, setTrafficData] = useState([
    { hour: '00:00', traffic: 1200, blocked: 120 },
    { hour: '04:00', traffic: 1500, blocked: 150 },
    { hour: '08:00', traffic: 2000, blocked: 200 },
    { hour: '12:00', traffic: 2800, blocked: 280 },
    { hour: '16:00', traffic: 2200, blocked: 220 },
    { hour: '20:00', traffic: 2600, blocked: 260 },
    { hour: '24:00', traffic: 1900, blocked: 190 },
  ]);

  const [protocolData, setProtocolData] = useState([
    { name: 'TCP', value: 45 },
    { name: 'UDP', value: 28 },
    { name: 'ICMP', value: 15 },
    { name: 'Other', value: 12 },
  ]);

  const [topSources, setTopSources] = useState([
    { ip: '192.168.1.100', requests: 45230, percentage: 18.5 },
    { ip: '10.0.0.50', requests: 38920, percentage: 15.9 },
    { ip: '172.16.0.25', requests: 32150, percentage: 13.1 },
    { ip: '203.0.113.45', requests: 28640, percentage: 11.7 },
    { ip: '198.51.100.12', requests: 24580, percentage: 10.0 },
  ]);

  const [topDestinations, setTopDestinations] = useState([
    { ip: '8.8.8.8', requests: 52340, percentage: 21.4 },
    { ip: '1.1.1.1', requests: 41230, percentage: 16.8 },
    { ip: '8.8.4.4', requests: 35680, percentage: 14.6 },
    { ip: '1.0.0.1', requests: 28920, percentage: 11.8 },
    { ip: '208.67.222.222', requests: 22450, percentage: 9.2 },
  ]);

  const COLORS = ['#00ffff', '#ff00ff', '#ff0080', '#00ff80'];

  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prev => prev.map(item => ({
        ...item,
        traffic: item.traffic + Math.floor(Math.random() * 200 - 100),
        blocked: item.blocked + Math.floor(Math.random() * 50 - 25),
      })));

      setTopSources(prev => prev.map(item => ({
        ...item,
        requests: item.requests + Math.floor(Math.random() * 1000 - 500),
      })));

      setTopDestinations(prev => prev.map(item => ({
        ...item,
        requests: item.requests + Math.floor(Math.random() * 1000 - 500),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">Analytics</h1>
          <p className="text-gray-400">Traffic analytics and protocol distribution</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="neon-box px-4 py-2 rounded-sm bg-black text-cyan-400 border border-cyan-500/30"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="neon-box px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-cyan-500/10 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Traffic Analytics Chart */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4">Traffic Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="hour" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff00ff' }} />
            <Legend />
            <Bar dataKey="traffic" fill="#00ffff" isAnimationActive={false} />
            <Bar dataKey="blocked" fill="#ff00ff" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Protocol Distribution */}
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Protocol Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocolData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {protocolData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff00ff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Sources */}
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Top Sources</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topSources.map((source, idx) => (
              <div key={idx} className="p-3 bg-black/50 rounded border-l-2 border-cyan-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-300">{source.ip}</span>
                  <span className="text-xs text-cyan-400 font-bold">{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-1.5 rounded-full"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{source.requests.toLocaleString()} requests</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Top Destinations</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topDestinations.map((dest, idx) => (
              <div key={idx} className="p-3 bg-black/50 rounded border-l-2 border-magenta-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-gray-300">{dest.ip}</span>
                  <span className="text-xs text-magenta-400 font-bold">{dest.percentage}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-magenta-500 to-magenta-400 h-1.5 rounded-full"
                    style={{ width: `${dest.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{dest.requests.toLocaleString()} requests</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Traffic Table */}
      <div className="neon-box p-6 rounded-sm">
        <h2 className="text-lg font-bold neon-text mb-4">Hourly Traffic Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/30">
                <th className="text-left py-2 text-cyan-400">Time</th>
                <th className="text-left py-2 text-cyan-400">Total Requests</th>
                <th className="text-left py-2 text-cyan-400">Blocked</th>
                <th className="text-left py-2 text-cyan-400">Block Rate</th>
              </tr>
            </thead>
            <tbody>
              {trafficData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-800 hover:bg-gray-900/50">
                  <td className="py-3 text-gray-300">{item.hour}</td>
                  <td className="py-3 text-cyan-400 font-mono">{item.traffic.toLocaleString()}</td>
                  <td className="py-3 text-magenta-400 font-mono">{item.blocked.toLocaleString()}</td>
                  <td className="py-3 text-yellow-400">
                    {((item.blocked / item.traffic) * 100).toFixed(1)}%
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
