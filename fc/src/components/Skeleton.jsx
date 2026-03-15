// Base skeleton block
function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

// Dashboard: 3 summary cards + 2 pie chart placeholders
export function DashboardSkeleton() {
  return (
    <>
      <div className="skeleton-cards">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card">
            <Skeleton width={80} height={13} />
            <Skeleton width={140} height={36} radius={10} />
          </div>
        ))}
      </div>
      <div className="skeleton-charts">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton-chart">
            <Skeleton width={160} height={16} style={{ margin: '0 auto 20px' }} />
            <Skeleton width="100%" height={280} radius={16} />
          </div>
        ))}
      </div>
    </>
  );
}

// History: 4 summary cards + 1 bar chart placeholder
export function HistorySkeleton() {
  return (
    <>
      <div className="skeleton-cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <Skeleton width={80} height={13} />
            <Skeleton width={130} height={36} radius={10} />
          </div>
        ))}
      </div>
      <div className="dashboard__chart" style={{ maxWidth: '100%', marginTop: 32 }}>
        <Skeleton width="100%" height={360} radius={16} />
      </div>
    </>
  );
}

// Transaction list: 6 rows (Main / Income pages)
export function TransactionsSkeleton() {
  return (
    <ul className="skeleton-list">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <li key={i} className="skeleton-list-item">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="55%" height={14} />
            <Skeleton width="35%" height={12} />
          </div>
          <Skeleton width={80} height={22} radius={6} />
        </li>
      ))}
    </ul>
  );
}

// Sidebar categories: 4 pill-shaped rows
export function SidebarSkeleton() {
  return (
    <div style={{ padding: '8px 0' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton skeleton-sidebar-item" />
      ))}
    </div>
  );
}

export default Skeleton;
