import { UserManagementTable } from "./_components/user-management-table";
import { StatsCards } from "./_components/stats-cards";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage users and monitor system statistics
        </p>
      </div>

      <div className="space-y-8">
        {/* Statistics Cards */}
        <StatsCards />

        {/* User Management Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <UserManagementTable />
        </div>
      </div>
    </div>
  );
}
