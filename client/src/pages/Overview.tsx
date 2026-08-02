import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Activity, Shield, Zap } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

interface ChartData {
  time: string;
  requests: number;
  risks: number;
}

export default function Overview() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Request Volume',
      value: '2.4M',
      change: '12.5% vs last period',
      icon: <Activity className="w-6 h-6" />,
      trend: 'up',
    },
    {
      title: 'High-Risk Request Ratio',
      value: '3.2%',
      change: '8.1% vs last period',
      icon: <AlertTriangle className="w-6 h-6" />,
      trend: 'down',
    },
    {
      title: 'Average Response Time',
      value: '135ms',
      change: '2.7% vs last period',
      icon: <Zap className="w-6 h-6" />,
      trend: 'down',
    },
    {
      title: 'Real-time QPS',
      value: '1,727',
      change: '1.3% vs last period',
      icon: <Shield className="w-6 h-6" />,
      trend: 'down',
    },
  ]);

  const [chartData, setChartData] = useState<ChartData[]>([
    { time: '00:00', requests: 2000, risks: 240 },
    { time: '04:00', requests: 3000, risks: 221 },
    { time: '08:00', requests: 2000, risks: 229 },
    { time: '12:00', requests: 2780, risks: 200 },
    { time: '16:00', requests: 1890, risks: 229 },
    { time: '20:00', requests: 2390, risks: 200 },
    { time: '24:00', requests: 3490, risks: 221 },
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Critical', message: 'Unusual traffic spike detected from 192.168.1.100', time: '2 minutes ago' },
    { id: 2, type: 'Warning', message: 'Multiple failed login attempts from 10.0.0.50', time: '5 minutes ago' },
    { id: 3, type: 'Info', message: 'Policy update deployed successfully', time: '15 minutes ago' },
    { id: 4, type: 'Critical', message: 'Potential DDoS attack detected', time: '1 hour ago' },
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const randomChange = (Math.random() - 0.5) * 2;
        return {
          ...metric,
          value: typeof metric.value === 'number' 
            ? Math.round(metric.value * (1 + randomChange * 0.05))
            : metric.value,
        };
      }));

      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const lastTime = parseInt(prev[prev.length - 1].time);
        const newTime = ((lastTime + 4) % 24).toString().padStart(2, '0') + ':00';
        newData.push({
          time: newTime,
          requests: Math.floor(Math.random() * 4000 + 1000),
          risks: Math.floor(Math.random() * 300 + 100),
        });
        return newData;
      });

      if (Math.random() > 0.7) {
        const alertTypes = ['Critical', 'Warning', 'Info'];
        const alertMessages = [
          'Unusual traffic spike detected',
          'Multiple failed login attempts',
          'Policy update deployed',
          'Potential DDoS attack detected',
          'Unauthorized access attempt blocked',
        ];
        setAlerts(prev => [
          {
            id: Date.now(),
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
            time: 'just now',
          },
          ...prev.slice(0, 3),
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold neon-text">Traffic Security Operations Dashboard</h1>
        <div className="flex items-center gap-2 px-4 py-2 neon-box">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm neon-text-cyan">Live</span>
        </div>
      </div>

      <p className="text-gray-400">Real-time monitoring and threat analysis for your infrastructure</p>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="neon-box p-6 rounded-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">{metric.title}</p>
                <p className="text-2xl font-bold neon-text">{metric.value}</p>
              </div>
              <div className="text-cyan-400">{metric.icon}</div>
            </div>
            <div className={`text-sm ${metric.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>
              {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Request Volume & Risk Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00ffff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRisks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff00ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ff00ff' }} />
              <Area type="monotone" dataKey="requests" stroke="#00ffff" fillOpacity={1} fill="url(#colorRequests)" />
              <Area type="monotone" dataKey="risks" stroke="#ff00ff" fillOpacity={1} fill="url(#colorRisks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="neon-box p-6 rounded-sm">
          <h2 className="text-lg font-bold neon-text mb-4">Recent Alerts</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 border-l-2 border-cyan-500 bg-black/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${
                      alert.type === 'Critical' ? 'text-red-400' :
                      alert.type === 'Warning' ? 'text-yellow-400' :
                      'text-cyan-400'
                    }`}>{alert.type}</p>
                    <p className="text-xs text-gray-300 mt-1">{alert.message}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
