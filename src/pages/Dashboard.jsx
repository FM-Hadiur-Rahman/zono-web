
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">Total Employees: 12</div>
        <div className="card">Active Today: 8</div>
        <div className="card">Pending Alerts: 3</div>
      </div>
      <div className="card">
        <h2 className="text-lg font-medium mb-2">This Week</h2>
        <p className="text-slate-600">Mini overview of shifts and attendance. Replace with charts later.</p>
      </div>
    </div>
  )
}
