import { Link } from "react-router-dom";
import { mockTenants } from "../data/mockTenants.js";

export default function Tenants() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tenants</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-600">
              <th className="py-2">Name</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Status</th>
              <th className="py-2">Locations</th>
              <th className="py-2">Owner</th>
              <th className="py-2 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockTenants.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="py-2">{t.name}</td>
                <td className="py-2">{t.plan}</td>
                <td className="py-2 capitalize">{t.status}</td>
                <td className="py-2">{t.locations}</td>
                <td className="py-2">{t.ownerEmail}</td>
                <td className="py-2">
                  <Link
                    className="text-blue-600 hover:underline"
                    to={`/admin/tenants/${t.id}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
